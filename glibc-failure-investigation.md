# Glibc Failure Investigation — lfs-automated (local WSL build)

**Scope:** why the local LFS build stopped during the Glibc stage on 2026‑10‑21 (VM clock ~00:09–00:10). Read-only investigation; **nothing modified, nothing run, nothing deployed.**

---

## TL;DR — the story in three sentences

The build script `lfs-chapter5-real.sh` runs with `set -euo pipefail` (any failing command = instant script death). During the Glibc step, the `patch` command found the Glibc source directory **already patched** (left behind by an earlier attempt) and, per GNU patch's documented rules, exited with status **1** — which would have aborted the build through `set -e` anyway. At that same moment the **whole WSL session was killed from the outside** (no OOM, no kernel panic, no Windows event logged — timing matches a ~17‑minute lifetime cap of whatever launched it), so the runner's own failure handler (`FATAL` message + `STATUS_FAILED_CH5_1` marker) never executed, leaving Firestore and the UI frozen at `RUNNING 50% glibc`.

Two separate defects, layered:

| Layer | What | Effect |
|---|---|---|
| **A. Outer kill (environment)** | The entire WSL session was terminated ~17 min into the run, exactly while the script was mid-transition after the failed patch | No error message, no `FATAL`, no status marker; WSL idled to "Stopped" |
| **B. Stale-directory bug (script defect)** | A leftover, previously-patched `glibc-2.38/` from an earlier attempt was reused instead of re-extracted; re-patching it fails by definition | Even **without** the outer kill, this Glibc step was already structurally doomed — the next `set -e` step (patch exit 1) would abort the script seconds later |

Neither cause is "Glibc is hard to compile". The compiler never even started for Glibc.

---

## Timeline (VM clock, `+0200`, from the kernels/logs themselves)

| VM time | Event | Evidence |
|---|---|---|
| earlier Oct 20 ~18:00–18:02 | An earlier attempt ran Glibc: patched + configured it, leaving `glibc-2.38/build/` and patched files behind, then died with no cleanup | `build/Makefile` mtime Oct 20 **18:00**, dir Oct 20 **18:02** |
| 23:49:50 | WSL VM (re)booted — the session the failed build ran in | `/var/log/kern.log` "Kernel command line" entry |
| 23:53:07 | `wsl-build-runner.sh` started (banner: 2 cores... "5 GB RAM", `MAKEFLAGS=-j4`) | `local-build.log` line 1 |
| 23:53:–00:0x | Binutils pass 1 (**marked** in `.build_progress`), GCC pass 1 (built, **not marked**), staged sources; kernel headers copied | `.build_progress` = `binutils-pass1`; `/mnt/lfs/tools` mtimes |
| ~00:09 | Linux API headers installed to `/mnt/lfs/usr/include` | log "Installed headers to:", dir listing |
| 00:09:48 | "Building Glibc..."; lib64 symlinks; `patch -Np1 -i ../glibc-2.38-fhs-1.patch` prints 5 × "Reversed (or previously applied) patch detected! Skipping patch." + 5 `.rej` files — **last output ever** | log lines 14946–14963; `.rej` mtimes |
| 00:09:48–00:10:14 (W-clock) | `patch` exits **1** (per its manpage rule) → `set -e` → chapter 5 script exits instantly → runner line 60 `sync_log` copies the final log (Windows log mtime 00:10:14), then everything is killed before the runner's `FATAL`/marker lines can be written | `FATAL` count in runner log = **0**; `/mnt/lfs/.runner-exit` **missing** |
| ~00:10→00:19 | WSL VM idle → distro shows **Stopped** | `wsl -l -v`; no compiler processes |
| (host side) | Windows System & Application event logs in that window: **empty** (only Chrome noise). No OOM in persistent syslog; no panic/hung-task in kern.log; `free`/`df` healthy | event queries; `grep -ciE 'oom|panic' /var/log/*` = 0; `df` 951 G free |

---

## Answers to the 14 inspection points (simple language)

1. **Last 200 lines of `lfs-output/local-build.log`:** they end with five Glibc files being patched, each skipped as "Reversed (or previously applied)…", saving 5 `.rej` reject files. Nothing follows — no `mkdir`, no `configure`, no compile output.
2. **Exact script running at the Glibc stage:** `lfs-chapter5-real.sh` (function `build_glibc()`, lines 331–387), launched by the temp-folder wrapper `wsl-build-runner.sh` (`bash lfs-chapter5-real.sh >>"$LOG" 2>&1` at its line 59).
3. **Commands in the Glibc section** (as written): extract torball (only if the dir doesn't exist) → `mkdir lib64` + 2 `ln -sfv` symlinks → `patch -Np1 -i ../glibc-2.38-fhs-1.patch` → `rm -rf build` / `mkdir build` → write `configparms` → `../configure` (6 flags) → `make -j4` → `make DESTDIR=$LFS install` → `sed` fix for `ldd` → verification `ls` → `rm -rf glibc-2.38` cleanup. **The log proves execution stopped at the `patch` step** — `mkdir` and everything after never happened.
4. **set -e / set -x / trap:** `lfs-chapter5-real.sh` has `set -euo pipefail` (line 8) — any failing command kills the script instantly. The runner wrapper has only `set -u`. **No `set -x`, and no `trap ... EXIT/ERR` anywhere** — a kill or failure leaves no marker, which is exactly what we observed.
5. **Waiting for user input?** No. GNU patch 2.7.6 with `-N` does not ask questions on reversed hunks (verified in its behaviour and manpage). `configure`/`make` are non-interactive. There is a `sleep 5` (a timed pause, not an input wait) in the resource check, but that ran before the toolchain phase.
6. **Can any patch command fail silently?** Its messages go to the log (the 5 skip messages are visible), so not *silent* to the log — but there is **no explicit handling of its exit code** (no `|| { echo …; exit 1; }` and no trap). Under `set -e` the script dies with no human-friendly explanation. Per the manpage: *"exit status is 0 if all hunks are applied successfully, 1 if some hunks cannot be applied"* — a skipped "reversely applied" hunk means exit 1.
7. **Errors written to another log?** No. Everything (stdout+stderr merged) goes to `/root/lfs-build.log`, which gets copied to `lfs-output/local-build.log` only at certain sync points. There is no separate error log and the tail-copy synced *exactly* before the death, so the runner's failure message never made it anywhere.
8. **Does the Glibc source directory still exist?** Yes — `/mnt/lfs/sources/glibc-2.38/` is a **stale** copy: it contains the 5 `.rej` files (00:09 today) **and** a fully-configured-but-never-finished `build/` directory from the **18:00 attempt yesterday** (`build/Makefile`, `Versions.all`, mtimes Oct 20 18:00/18:02). The runner's "clean previous build residue" step only wipes `/mnt/lfs` *top level*, not inside `sources/` — so this stale copy survived from attempt to attempt.
9. **Expected patch files exist?** Yes — `glibc-2.38-fhs-1.patch` (2.8 KB) is present in `/mnt/lfs/sources/`.
10. **Version match?** Yes — `glibc-2.38.tar.xz` (18.9 MB, staged Oct 20 17:25) with the LFS 12.0 patch for 2.38; the patch found all 5 target files (that's why each printed "patching file …"). The combination is correct; the *state* of the tree was not clean.
11. **Why WSL stopped — shell exit, crash, or close?** It was **terminated from outside**, not crashed: kernel log for that boot shows **no OOM, no panic, no hung tasks**; Windows event logs are empty in that window; memory (6 GB cap) and disk (951 G free) were healthy; and the process tree died in the same millisecond window as the script's forced exit. The most consistent explanation: the **launcher's lifetime ended ~17 min 07 s after start** (a session/command timeout at the host), which tears down the WSL console session (and its process tree), after which the idle VM stops. Post-mortem certainty: no crash; external stop.
12. **Timeout / kill?** No `timeout`/`ulimit`/`nice` in any script; `.wslconfig` is `memory=6GB, swap=24GB, processors=6` (generous). The run's exact 17‑min-07‑s lifetime points to a host-side cap rather than anything inside the build.
13. **Disk & memory?** Both fine: VM disk 1007 G with 951 G free; memory 5–6 G with 4 G free at probe time; swap 24 G. The resource self-check even logged no warnings. Resources were **not** the cause.
14. **Can Glibc run alone?** Yes. The script defines `build_glibc()` as a standalone function and is safe to `source` (`main()` only runs when executed directly — line 509). A Glibc-only test needs: (a) the environment from `init-lfs-env.sh`, (b) the stale `glibc-2.38/` directory removed so a fresh extraction happens, then (c) call `build_glibc`. Expected cost: ~10–25 min — versus the 4‑hour full pipeline. (Note: `build_gcc_pass1` has no `mark_package_complete` call, so a resume re-does GCC pass 1 — harmless but adds minutes.)

---

## Required report fields

### Last successful command
`Linux API headers install` — `cp -rv usr/include/* "$LFS/usr/include/"` in `install_linux_headers()` (chapter 5 script line 319), logged at ~00:09 ("Installed headers to: /mnt/lfs/usr/include" + full directory listing). Immediately after, `ln -sfv ../lib/ld-linux-x86-64.so.2` (the two lib64 symlink lines, log lines 14947–14948).

### First failed or missing command
`patch -Np1 -i ../glibc-2.38-fhs-1.patch` (`lfs-chapter5-real.sh` line 353) — it *ran* but **failed** (exit 1 per patch's rules, because all 5 hunks were already applied on the stale tree). The next expected command, `mkdir -v build` (line 357), is **missing** from the log — nothing between the patch exit and the kill was ever executed.

### Exact error message, if available
No explicit "error" string was ever printed to the log for this event (the runner's `FATAL` line was cut off by the kill). The closest recorded signals:

```
Reversed (or previously applied) patch detected!  Skipping patch.   ×5
1 out of 1 hunk ignored -- saving rejects to file <...>.rej          ×5
```

(Historical side-note: an unrelated *older* log from January on the same machine shows a different failure mode — `bash` resolving to the WSL stub and exiting with `execvpe(/bin/bash) failed`. That one is fixed by the current WSL-fallback design and is not tonight's issue.)

### Whether the script stopped, crashed, or waited
**Stopped (killed), not crashed, not waiting.** No OOM/panic/segfault of the build processes in kernel or system logs; no interactive prompt was pending (patch `-N` can't prompt on reversed hunks; nothing else can); the whole session vanished without executing the next line's output or the failure handler — the signature of an external termination of the WSL session at that instant.

### Whether the Glibc step can be tested separately
**Yes** — `build_glibc()` is a self-contained function; with `init-lfs-env.sh` sourced it can be invoked in isolation (with the stale directory removed first). ~10–25 minutes, no cloud, no restart of earlier chapters (binutils-pass1 is checkpointed; headers are already in `/mnt/lfs/usr/include` and get re-verified by configure flags anyway).

### Smallest safe fix (proposal only — **not applied**, per instructions)
Two one-liners, in order of necessity:

1. **Remove the stale tree before patching** — in `build_glibc()`, force a clean slate (e.g. change the guard `if [ ! -d "glibc-2.38" ]` to *always* `rm -rf glibc-2.38 && tar -xf glibc-2.38.tar.xz`, or run `rm -rf /mnt/lfs/sources/glibc-2.38` before relaunch). This removes the guaranteed patch failure on rerun.
2. **Make failure loud** (optional but strongly recommended): add `trap 'echo "STATUS_FAILED_ABORT" > /mnt/lfs/.runner-exit' EXIT` (and/or `set -E` + `trap ... ERR`) in `wsl-build-runner.sh`, and check `patch`'s exit explicitly with a clear message. Any future kill/stall will then flip Firestore to `FAILED` instead of a forever-`RUNNING` freeze.

### How we will test the fix (plan — not executed yet)
1. Confirm prerequisites once: WSL Ubuntu up, `/mnt/lfs/sources/*` staged, headers installed (verify `/mnt/lfs/usr/include/linux` exists — it does).
2. Delete the stale directory: `rm -rf /mnt/lfs/sources/glibc-2.38` (read-only today; will ask before doing it).
3. Launch a **Glibc-only run**: source `init-lfs-env.sh`, then `source lfs-chapter5-real.sh && build_glibc` — watch the log for: `configure` checks → `make` progress → `ls -la $LFS/lib` verification line.
4. Success criterion: `build_glibc` completes (log shows the verification listing + "Building Glibc" function returning cleanly) in ~10–25 min via a **background** launch with no timeout pressure, and `.runner-exit`/Firestore correctly transitions when the pipeline resumes normally (or a new safe test wrapper highlights completion).
5. If Glibc passes, run the remainder in the same isolated way (`build_libstdcxx`, then the minimal-system phase) — again without re-running the 4-hour whole pipeline from zero.

---

## Evidence index (where each fact comes from)

| Fact | Location |
|---|---|
| Runner banner (start time, resources) | `lfs-output/local-build.log` line 1 |
| Last Glibc lines / section slice | same log, lines 14946–14963 (via `awk` slice of `/root/lfs-build.log`) |
| Runner wrapper, `set -u`, stage flow, marker logic | `Temp\opencode\wsl-build-runner.sh` lines 5, 59–66 |
| `set -euo pipefail`, `build_glibc()` commands | `lfs-chapter5-real.sh` lines 8, 331–387 |
| patch exit rule | `man patch` (GNU patch 2.7.6, run in the VM): "1 if some hunks cannot be applied" |
| Stale `build/` proof | `/mnt/lfs/sources/glibc-2.38/build/` mtimes Oct 20 18:00/18:02 |
| `.rej` ×5 existence | `find /mnt/lfs/sources/glibc-2.38 -name '*.rej'` |
| Progress checkpoint | `/mnt/lfs/.build_progress` = `binutils-pass1` |
| No FATAL/complete written | `grep -c FATAL /root/lfs-build.log` = 0; no "toolchain complete" |
| Missing `.runner-exit` | `ls /mnt/lfs/.runner-exit` → No such file |
| No OOM / panic | persistent `/var/log/syslog`, `/var/log/kern.log`, fresh `dmesg` — zero matches for `oom|out of memory|panic|hung_task` related to the build |
| Host-side silence | Windows System/Application events 00:05–00:25 → none (only Chrome); no Hyper-V-Compute/WSL crash channel entries |
| Disk/memory health | `df -h` (951 G free), `free -g` (5–6 G), `C:\Users\Chintu\.wslconfig` (6 GB RAM, 24 GB swap, 6 cores) |
| WSL boot timing | `/var/log/kern.log` "Kernel command line" boot stamps (23:49:50 boot = the build session) |
| Identified build ID context (from prior phase) | Firestore doc `7hyDLDipTBVAzObyzRRT` (status RUNNING 50% glibc — frozen by design flaw B, + missing marker) |

**Not modified:** no repo files, no build scripts, no app code; nothing deployed to Google Cloud; nothing deleted; no 4‑hour build re-run; no secrets printed. (Two earlier read-only *probe scripts* were created inside the OpenCode temp folder, outside the repo — `glibc-probe.sh`, `glibc-probe2.sh`, `glibc-probe3.sh` — used solely for the quoted diagnostics above.)
