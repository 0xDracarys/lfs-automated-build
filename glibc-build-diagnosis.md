# Glibc Build Diagnosis — lfs-automated (local WSL build path)

**Date:** 2026‑10‑21 (fresh re-verification ~14:00 after the server restart)
**Scope:** local build path only (`wsl-build-runner.sh` → `lfs-chapter5-real.sh` → `build_glibc()`). Investigation only — **no files modified, nothing deleted, no WSL distribution touched, `LFS-Fixed` untouched, no Google Cloud action, no full build started, no secrets printed.**
**Companion report:** `glibc-failure-investigation.md` (earlier; evidence details shared — this file is the actual diagnosis in the requested format).

---

## 0. Post-restart state check (fresh evidence, read-only)

| Check | Result |
|---|---|
| Builder still alive? | **No.** No `make`/`gcc`/`ld`/`patch`/runner processes exist in WSL Ubuntu (process list is empty of build activity). The VM had been fully stopped; my probe call booted it fresh ("up 0 minutes"). |
| `lfs-output/local-build.log` still receiving lines? | **No.** Frozen at exactly **2,584,663 bytes** (Windows mtime 12:10:14 AM; the identical-size `/root/lfs-build.log` inside the VM at 00:09:48 VM-clock). Same final line as at death — nothing appended since. |
| Firestore watcher (PID 9768)? | **Gone** (its 5‑hour poll cap expired ~05:00; no replacement running). Nothing monitors the build log anymore. |
| `/mnt/lfs/.runner-exit`? | **Still missing** — the build still has no success/failure verdict. |
| `/mnt/lfs` state | Unchanged since death: `tools/`, `lib64/`, `sources/` (mtimes 00:09). `LFS-Fixed` not touched. |

Conclusion: the failure state is **preserved and undisturbed** — all earlier evidence remains valid.

---

## 1. The required diagnosis fields

### Last successful command
`cp -rv usr/include/* "$LFS/usr/include/"` — the Linux API headers install inside `install_linux_headers()` (chapter‑5 script, line 319), logged ~00:09 ("Installed headers to: /mnt/lfs/usr/include"). Immediately after it, the two `ln -sfv` lib‑loader symlinks also succeeded (log lines 14947–14948).

### First failed command or missing command
**`patch -Np1 -i ../glibc-2.38-fhs-1.patch`** (`lfs-chapter5-real.sh`, line 353).
It *ran* but **failed** — all 5 hunks were rejected as "Reversed (or previously applied)" (the tree was stale), and per GNU patch 2.7.6's own rules ("exit status 1 if some hunks cannot be applied", and skipped hunks are not applied) it exits **1**, which `set -euo pipefail` (line 8) turns into an instant abort of the whole script.
The **first missing command** (next expected line that never appeared): `mkdir -v build` (line 357). Then `../configure`, `make -j4`, `make DESTDIR=$LFS install` — none ever ran.

### Exact error message
No error line was ever written — the runner's `FATAL …` handler never executed (it was killed mid-flight; grep for `FATAL` in the runner log = **0**). The only recorded output of the failing command (its symptom, repeated for each of the 5 files, last occurrence being the final log line):

```
Reversed (or previously applied) patch detected!  Skipping patch.
1 out of 1 hunk ignored -- saving rejects to file sysdeps/unix/sysv/linux/paths.h.rej
```

(Reject files actually written: `Makeconfig.rej`, `nscd/nscd.h.rej`, `nss/db-Makefile.rej`, `sysdeps/generic/paths.h.rej`, `sysdeps/unix/sysv/linux/paths.h.rej`.)

### Exit code
- **Recorded anywhere: none.** No `FATAL` line, no `.runner-exit` marker, no job verdict — the process tree was killed in the instant between the runner's `sync_log` (the 00:10:14 copy that produced the frozen Windows log) and its own failure handler.
- **Determined from evidence: `patch` → 1** ⇒ chapter‑5 script exits **1** (via `set -e`) ⇒ the runner *would* have logged `FATAL lfs-chapter5-real.sh exit=1` and written marker `STATUS_FAILED_CH5_1`. The kill stopped that from happening by milliseconds.
- The launcher/WSL session itself terminated on the host side (no observable exit code).

### Last log line
`1 out of 1 hunk ignored -- saving rejects to file sysdeps/unix/sysv/linux/paths.h.rej` (log line 14963).

### Whether the process crashed, exited, or waited
**The chapter‑5 script was in the act of exiting (killed mid-exit) — and the whole WSL session was then terminated from outside.** Not a crash and not a wait:
- No OOM, no kernel panic, no hung task in the persistent `/var/log/kern.log` or `/var/log/syslog` for the build session (VM boot at 23:49:50, per kernel "command line" entries; probes today show only *my own* fresh boots at 14:04).
- No interactive prompt was possible (`patch -N` cannot prompt on reversed hunks; nothing else prompts).
- Windows System/Application event logs in the window: **empty** (only Chrome noise); no Hyper‑V compute crash entries.
- Resources were healthy (see item 11 below).
- Timing signature: whole run lived 23:53:07 → ~00:10 (≈17 min 07 s) and died in the same millisecond window as the script's forced exit — the classic signature of a **host-side teardown** (a command/session cap on whatever launched the runner), after which the idling VM stopped.

### Whether the problem is source code, patching, compiler, disk/memory, WSL, or status handling
**Layered — the primary guess: WSL (external termination); with two real defects underneath:**

| # | Category | Role |
|---|---|---|
| 1 | **WSL (environment)** | **Primary for the silence.** The entire session was killed from outside mid-exit; that's why no verdict, no marker, "RUNNING 50%" frozen. |
| 2 | **Patching (stale‑state script defect)** | **Guaranteed the failure anyway.** `build_glibc()` refuses to re-extract if `glibc-2.38/` exists (`if [ ! -d ]`), and the runner's cleanup only wipes `/mnt/lfs` top level — `sources/` survives. A leftover *already-patched and already-configured* tree (from an earlier attempt at VM‑time 18:00: `build/Makefile`, `Versions.all`) makes the fhs patch reject all 5 hunks → exit 1 → abort. Even with no kill, this build was structurally doomed seconds later. |
| 3 | **Status handling** | No `trap`/marker anywhere; failure handler never ran. Result: Firestore doc `7hyDLDipTBVAzObyzRRT` shows RUNNING 50% forever. |

**Not** source code (glibc‑2.38 verified — see item 7), **not** compiler (never started), **not** disk/memory (item 11).

### Smallest safe fix
**Force a fresh Glibc extraction before the patch** — one action, no other changes:
- Before rerunning Glibc: `rm -rf /mnt/lfs/sources/glibc-2.38` (the folder is regenerable from the staged `glibc-2.38.tar.xz`, which stays).
- The durable one-line script change (for later, needs permission): in `build_glibc()`, replace the `if [ ! -d "glibc-2.38" ]` extract-guard with an unconditional **remove + re-extract**, so stale state can never recur.
- Recommended companion (also later): an `EXIT` trap in `wsl-build-runner.sh` writing `.runner-exit`, so any future kill/stall flips the verdict to FAILED instead of a forever-RUNNING freeze.

### Exact test for the fix
Run **only** `build_glibc` in isolation (no earlier phases repeat), fully detached so a terminal teardown can't kill it again:

```bash
# Step 1 — start (needs VM up; repo path on /mnt/c is accessible in WSL)
wsl -d Ubuntu -u root -- bash /mnt/c/Users/Chintu/AppData/Local/Temp/opencode/glibc-test-launch.sh

# Step 2 — monitor from time to time
wsl -d Ubuntu -u root -- bash -c 'tail -5 /root/glibc-test.log; ls /root/glibc-test-result 2>/dev/null'
```

(glibc-test-launch.sh does: source `init-lfs-env.sh` → `export LFS_SRC=/mnt/lfs/sources` → `cd $LFS_SRC` → `rm -rf glibc-2.38` → start a detached `setsid nohup` job that sources `lfs-chapter5-real.sh` and runs `build_glibc`, logging to `/root/glibc-test.log`, success marker `/root/glibc-test-result`, with `</dev/null`.)

**Expected watch-points / success criteria:**
1. Log shows "🔨 Building Glibc...", the 2 lib64 symlinks, then `patching file …` **without** any "Reversed…Skipping" line (fresh tree ⇒ patch applies cleanly, rc 0).
2. `mkdir -v build` line appears (the previously-missing command), then ~32 `checking …` configure lines, then `make -j4` compile output for some minutes.
3. Install + the two-file verification listing, then the function returns; `/root/glibc-test-result` contains `GLIBC_TEST_OK`.
**Failure criterion:** any compile error at this point = a *real* Glibc/toolchain problem to look at next (valuable information either way).
**Cost:** ~10–25 min on this machine; no cloud, no restart of earlier chapters.

---

## 2. Answers to the 13 inspection points (with evidence)

1. **Currently running build alive?** No — zero build processes; VM was stopped until my probe booted it (read-only); nothing resumed after the server restart.
2. **Log still growing?** No — both copies frozen at 2,584,663 bytes; last write 00:09:48 VM ≈ 00:10:14 Windows. Watcher gone (cap expired ~05:00).
3. **Exact script/command at Glibc:** `wsl-build-runner.sh` (temp folder; `set -u`; phase 4) runs `bash lfs-chapter5-real.sh >>"$LOG" 2>&1`; within it, `build_glibc()` (lines 331–387): extract-if-absent → 2 lib64 symlinks → `patch -Np1 -i ../glibc-2.38-fhs-1.patch` → *(never reached)* `rm -rf build` / `mkdir -v build` / configparms / `../configure` / `make -j4` / `make DESTDIR=$LFS install` / `sed` ldd fix / verification / cleanup.
4. **Final 200 lines:** end with the 5-file "Reversed… Skipping patch … saving rejects" sequence (log lines 14946–14963). Nothing after. Re-verified today — unchanged.
5. **Builder exit status available?** No — never recorded (no `FATAL`, no marker, no surviving shell). Determined indirectly: chapter‑5 exit would have been 1 (patch under `set -e`).
6. **Glibc source dir exists?** Yes — `/mnt/lfs/sources/glibc-2.38`, **stale**: contains the 5 new `.rej` files (00:09) plus a leftover **configured build directory from an earlier attempt** (`build/Makefile`, mtime 18:00/18:02 the previous evening). The runner's cleanup preserves `sources/`, and the script's `if [ ! -d ]` guard skipped re-extraction — proven by the "Reversed (or previously applied)" outcomes.
7. **Glibc source version:** glibc‑2.38 — tarball's top-level dir is `glibc-2.38/`; the tree's own `csu/version.h` says `#define VERSION "2.38"`; tarball staged Oct 20 17:25.
8. **Patches match that version?** Yes — exactly one Glibc patch is used: `glibc-2.38-fhs-1.patch` (LFS 12.0 path set for 2.38, dated Aug 31 2023; headers `a/…` → `b/…` suit `-p1`). It *found* all 5 of its target files inside the tree (each printed "patching file …"), so the version/layout match. The failure was tree **state**, not version mismatch.
9. **Did patch/make/compiler fail?** `patch`: failed (5 hunks skipped ⇒ exit 1 by its documented rules; `.rej` files written — its picture of the tree was already-patched). `make`/compiler: never started (no output, no processes). No other failure recorded anywhere.
10. **Script waits for input?** No — `patch -N` can't prompt on reversed hunks; configure/make are non-interactive; the only pause is the earlier `sleep 5` resource-check (already passed before chapter 5). The frozen log proves it wasn't waiting — the next line simply never came.
11. **Disk/memory:** healthy — VM disk 1007 G total / **951 G free**; `.wslconfig` = memory 6 GB, swap 24 GB, processors 6; ~4–5 GB RAM free at probe; swap untouched. Not resource-related.
12. **WSL stopped normally / crashed / terminated?** **Terminated from outside.** Persistent kernel/system logs for the build-session boot (23:49:50): zero OOM/panic/hung-task/oops entries for the build episode. Windows System + Application event logs in the window: empty (Chrome noise only); no Hyper‑V compute/WSL crash channels present. Combined with the ms-precise timing at the script's exit point: host-side teardown (most consistent: a ~17‑minute cap on the launching command/session), then the idling VM stopped.
13. **Glibc resumable without repeating earlier phases?** **Yes.** `build_glibc()` is standalone and the environment is fully recreatable: source `init-lfs-env.sh` (sets `LFS=/mnt/lfs`, `LFS_TGT=x86_64-lfs-linux-gnu`, prepends `tools/bin` to PATH, non-destructive `mkdir -p` only) + `export LFS_SRC=/mnt/lfs/sources`, then call it. Nothing before Glibc needs re-running (headers already installed at `/mnt/lfs/usr/include`; `tools/` intact; checkpoint file `.build_progress` = `binutils-pass1`). Caveat: gcc‑pass1 has no checkpoint marker in the script, but an isolated `build_glibc` call bypasses the chapter‑5 package loop entirely.

---

## 3. What was *not* done (per instructions)

No repo/build-script/app files modified; `/mnt/lfs` not deleted; no WSL distribution deleted or created; `LFS-Fixed` untouched; no Google Cloud deployment or resource creation; no full build started; no secrets printed. Only read-only probes were executed, plus three diagnostic scripts inside the OpenCode temp folder (outside the repo).

---

## 4. Recommendation — exactly one next step

### **A. Run an isolated Glibc test**

Why A and not the others (one sentence each):
- **A** — ~10–25 min, repeats nothing, changes no repo file, proves whether Glibc itself compiles here, and *is* the test of the smallest fix (fresh extraction before patch). It needs one go-ahead because its precondition is deleting the one regenerable folder `sources/glibc-2.38` inside the VM (the `.tar.xz` stays; this is neither `/mnt/lfs` nor a WSL distribution).
- **B** (fix script first) — premature: we've never yet seen Glibc compile, so a blind fix risks a second unknown failure right after the patch; the one-line script hardening becomes low-risk follow-up once A passes.
- **C** (resume from Glibc) — inside the full flow it re-hits the stale-tree patch failure and a longer feedback loop.
- **D** (rebuild from beginning) — wastes hours and *still* re-hits the same stale folder, since the runner's cleanup preserves `sources/`.
- **E** (stop for more info) — unnecessary: the evidence is complete

**Not performed yet** — awaiting your go-ahead.
