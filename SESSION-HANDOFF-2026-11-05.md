# Session handoff — 2026-11-05 (demo stabilization day)

The demo guest is `LFS-Goal-Test6`, running, healthy, and alone. Enter it with:

```powershell
wsl -d LFS-Goal-Test6 -u root --exec bash --login
```

Verify it any time with `.\Check-DemoHealth.ps1 -Guest LFS-Goal-Test6` (want 18/18).

## Demo state (end of day, all verified)

- Guest: `LFS-Goal-Test6` (LFS 12.0 custom userland, WSL2 host kernel), root shell,
  Dracarys banner on every entry path (login, bare `wsl -d`, ssh).
- Toolchain: gcc 13.2.0 + make, `x86_64-lfs-linux-gnu` triplet, compile/link/run OK.
  Bash 5.2.15 rebuilt with readline (arrow keys/history work); triplet preserved.
- All 5 practice targets UP and reachable from BOTH the guest and Windows browsers:
  Juice Shop :3000 (200), DVWA :80 (302), WebGoat :8080 (302),
  WebWolf :9090 (302), MariaDB :3307 (OPEN), plus sshd :22 from Windows.
- Start everything: `demo-up`. Status: `demo-status`. Guide: `howto`.
- Import source of record: `lfs-output/goal-builds/goal-20261104-build1/`
  `lfs-system-goal-20261104-build1-r2.tar.gz` (5459630080 bytes) — re-export of
  this stabilized guest. Fresh-import tested twice, 18/18 both times.
  Original build tarballs kept untouched next to it.

## What was done today (in order)

1. **Resumed prior session** (had ended: commit `e43f6c5` pushed, Test6 demo-ready).
   All WSL guests were Stopped, so cold-started Test6 and re-verified the run-sheet.
2. **Committee-proofing audit** (~150-command sweep): found bash had no readline,
   no python/vim/man/users, Java/node/hidden runtimes off PATH, sshd unable to
   start (no privsep user/host keys), missing /etc files (os-release, services…).
3. **Phase A applied** (`harden-committee-box.sh config`): symlinks, /etc files,
   `demo-up`/`demo-status`/`howto`, honest `reboot`/`systemctl` explainers,
   sshd host keys + start, ssh key auth from Windows (`~/.ssh/lfs_demo`).
4. **Started, then STOPPED, a source-build phase** (python, vim partial, man-db,
   shadow, sudo…): user redirected — stabilize existing features only, add
   nothing the thesis doesn't promise. Surviving pieces: readline libs + vim
   binary (installed, invisible unless invoked), and the bash fix below.
5. **Fixed guest bash** (`fix-guest-bash.sh`, durable): readline-linked rebuild
   with explicit `x86_64-lfs-linux-gnu` triplet; verified via `ldd`, `--version`,
   and `bind -v` over an ssh PTY.
6. **Trimmed `howto`** to promises only (dropped python/man/demo-user claims).
7. **Re-exported r2**, proved fresh import (config → demo-up → 12/12, later 18/18).
8. **Tarball focus** (user: forget ISO, the tarball must "just work"):
   - FOUND + FIXED: WebGoat/WebWolf unreachable from Windows — Java bound
     IPv6-mapped localhost, which the WSL relay ignores. Added
     `-Djava.net.preferIPv4Stack=true` in `lfs-vulnbox.sh` AND the live guest.
     All targets now answer from Windows browsers.
   - Bare `wsl -d` entry fixed (`/root/.bashrc` env + single-banner guard).
   - `demo-up` creates `/run/sshd` itself (post-import is config → demo-up).
   - Health check extended to 18 (added Windows-side probes = regression test).
   - Re-exported r2 with all fixes, re-tested fresh import 18/18, restored Test6.
9. **ISO**: user said park it. Mount-checked read-only (has `boot/initramfs.img`,
   `vmlinuz-6.4.12`), dismounted. No live boot ever run (no hypervisor) — future work.
10. **Cleanup**: unregistered + deleted goal-wsl Test/Test2–Test5 (~27 GB),
    deleted root `lfs-*-toolchain*.tar.gz` + `lfs-system.tar.gz` (~1.1 GB),
    deleted ~60 `lfs-output/goal-*.sh` one-off probes. See "left alone" below.

## Decisions / rules set today

- No new promised features (no python/man/multi-user/sudo in the demo story).
- ISO deprioritized; tarball → WSL → terminal is the demo path.
- Never commit/push without an explicit ask (still uncommitted — see below).

## Uncommitted repo changes (say the word to commit)

- Modified: `thesis-demo-runsheet.md` (r2 row, import flow, browser note),
  `lfs-vulnbox.sh` (IPv4 flag ×2), `lfs-output/.../manifest.json` (r2 entry, ignored path).
- New: `Check-DemoHealth.ps1`, `fix-guest-bash.sh`, `harden-committee-box.sh`,
  this file.
- New artifact (ignored path): `.../goal-20261104-build1/*-r2.tar.gz`.
- Guest-local safety: `lfs-output/goal-wsl/LFS-Goal-Test6/ext4.pre-committee-20261105.vhdx`
  (pre-change disk backup), `/bin/bash.pre-committee` in-guest.

## Recovery (if the demo guest breaks)

- Re-import from r2 (3 commands — full flow in `thesis-demo-runsheet.md`,
  "Fresh import" section), or restore the pre-committee vhdx over `ext4.vhdx`
  while Test6 is terminated.

## Left alone on purpose (cleanup candidates for later)

- Other stopped LFS guests outside goal-wsl (Pretty, Check-Labs*, MyLFS, Mine,
  hacklab, Fixed, CloudCheck, ThesisDemo, Test-2026…): not provably junk —
  ThesisDemo/personal ones especially. Plus Ubuntu + docker-desktop (yours).
- `gcloud-builds-downloads/` (0.55 GB), `brag-output/` (0.62 GB): small, unknown.
- Old tracked `.ps1`/`.sh` at root: repo history, tiny, untouched.
- `lfs-output/preflight.sh`, `prep-ubuntu.sh`: kept (not one-off `goal-*` probes).

## Future-work framing (for the thesis / committee)

- Live ISO boot (built + media-verified, never booted — no hypervisor here).
- Deep in-app testing of each target's lessons/modules (serving verified throughout).
- Comfort extensions: package manager (none by design), multi-user, man pages.
- Web platform polish was not part of this pass.

## How to continue next session

1. `wsl --list --verbose` (expect only Test6 Running) + `demo-status`.
2. `.\Check-DemoHealth.ps1 -Guest LFS-Goal-Test6` (expect 20/20).
3. Read this file + `thesis-demo-runsheet.md`; check `git status`.

## Night session appendix (same day, ~22:00–23:00)

Class postponed, so a full adversarial fire drill ran. New fixes (all in
guest + repo source + re-exported r2, now 5522145280 bytes):

- **git https was broken** (`git-remote-https` missing) → rebuilt git 2.43.0
  with curl (`fix-guest-git.sh`). Proven: cloned + built + ran toybox.
- **DVWA was fully broken, now fully works**: PHP lacked mysqli AND pdo
  (`fix-guest-php.sh` rebuilds 8.2.13 with both via mysqlnd, bootstraps
  pkg-config); `db_port` sed in `lfs-vulnbox.sh` missed (upstream spacing
  changed) → fixed tolerant + live config set to 3307; `dvwa` DB user never
  existed → `vulnbox-start` now ensures it idempotently; production php.ini
  installed (warnings no longer break headers). Proven end to end: setup →
  admin login → home → SQLi `id=1` returns admin/admin → XSS reflects.
  Database ships SEEDED in r2; DVWA opens at security *impossible* (switch
  to *low* for classic demos — noted in run-sheet).
- Guest clock set to CET via `TZ` in `/etc/profile` (no tzdata needed).
- Health check grew to 20 (git-https helper + real DVWA login flow).
- Verified: fresh import 20/20, Test6 20/20 after cold cycle + restore.
- New uncommitted file: `fix-guest-git.sh`, `fix-guest-php.sh` (repo also
  gained the `lfs-vulnbox.sh` DVWA fixes). Commit still awaiting explicit ask.

## Late-night appendix (same day, ~23:00)

- **mysqld double-start**: re-running `demo-up`/`vulnbox-start` spawned a
  second mysqld that lingered portless on the same datadir. Guarded with
  `port_open 3307 ||` (repo `lfs-vulnbox.sh` + live guest). Proven: double
  `demo-up` → still 1 mysqld, 20/20.
- r2 re-exported again (now 5522176000 bytes), 4th fresh-import test 20/20.
- Pushed: `f3e97c6` (README refresh + all stabilization) and the mysqld-guard
  follow-up — `main` is up to date on origin.
