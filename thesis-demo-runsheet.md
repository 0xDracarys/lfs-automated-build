# Thesis Demo Run-Sheet — build `goal-20261104-build1` (guest `LFS-Goal-Test6`)

Every output below is real, captured from this machine on 2026-11-05 from a
fresh import of the final artifacts. Total demo time: ~5 minutes.

**Entry line (from PowerShell):**
```powershell
wsl -d LFS-Goal-Test6 -u root --exec bash --login
```
Use this exact line: a bare `wsl -d` entry skips `/etc/profile` (no banner,
inherited `en_US.UTF-8` that the minimal root does not ship). The login shell
prints the banner and sets a clean `LANG=C`. Nothing on the Windows side changes.

**Golden rule — one guest at a time:** on this machine a port bound in one
running LFS guest answers in every other running LFS guest (measured today:
`Test6` showed all ports open with zero local processes while `Test4` ran).
Before the demo, terminate every other LFS guest:
```powershell
wsl --terminate LFS-Goal-Test4; wsl --terminate LFS-Goal-Test5
```
(`Test4`/`Test5` are superseded test imports of older snapshots; `Test6` is the
final image. If the machine rebooted overnight, just enter `Test6` and run
`vulnbox-start` — cold start to all-up takes ~2 minutes, verified.)

---

## 1. Banner on entry ✅

The login shell prints the Dracarys banner with live system data (memory line
proves `/proc` + `free` work — both were broken in October):

```text
        .--.
       |o_o |    Linux From Scratch 12.0
       |:_/ |    Cloud-Built Custom System
      //   \ \
     (|     | )   ✓ Built by Sam's LFS Pipeline
    / ._   _. \
    \___)=(___/

  Dracarys
  ──────────────────────────
  OS        LFS 12.0 (Custom)
  Kernel    6.18.54.1-microsoft-standard-WSL2
  Arch      x86_64
  Shell     Bash 5.2.15(1)-release
  GCC       13.2.0
  CPU       AMD Ryzen 5 5600X 6-Core Processor (6 cores)
  Memory    9379 MB free / 11964 MB total
  Packages  326 (in /usr/bin)
```

## 2. Root inside the LFS userland ✅

```bash
whoami
id
```
```text
root
uid=0(root) gid=0(root) groups=0(root)
```

## 3. Complete LFS filesystem ✅

```bash
ls /
```
```text
bin  boot  build-logs  build-metadata-goal-20261104-build1.txt  dev  etc
init  lib  lib64  lost+found  mnt  opt  proc  root  run  sbin
sys  tmp  tools  usr  var
```

## 4. Bash and GCC are LFS-built ✅

```bash
/bin/bash --version | head -1
gcc --version | head -1
gcc -dumpmachine
```
```text
GNU bash, version 5.2.15(1)-release (x86_64-lfs-linux-gnu)
gcc (GCC) 13.2.0
x86_64-lfs-linux-gnu
```
Say: *the `x86_64-lfs-linux-gnu` triplet is our build — a distro toolchain
would say `x86_64-pc-linux-gnu`.*

## 5. Compile, link, and run a C program ✅ (was broken in October)

```bash
echo 'int main(void){return 0;}' | gcc -xc -o /tmp/demo - && /tmp/demo && echo LINK-RUN-OK
rm -f /tmp/demo
```
```text
LINK-RUN-OK
```
Say: *in October this died at link time (`cannot find -lgcc`). Root cause, now
fixed: the snapshot step excluded `*.a`, stripping `libgcc.a` from every
imported guest. The archive was always in the built tree.*

## 6. Full toolset + UTF-8 locale ✅

```bash
for t in mount ps free top ss ip ping ssh; do command -v $t >/dev/null && echo "HAVE $t"; done
locale -a 2>/dev/null
```
```text
HAVE mount
HAVE ps
HAVE free
HAVE top
HAVE ss
HAVE ip
HAVE ping
HAVE ssh
C
C.UTF-8
POSIX
```

## 7. Practice targets ✅ (already running)

```bash
curl -s -o /dev/null -w 'juice:%{http_code}\n' --max-time 8 http://127.0.0.1:3000/
curl -s -o /dev/null -w 'dvwa:%{http_code}\n' --max-time 8 http://127.0.0.1:80/
curl -s -o /dev/null -w 'webgoat:%{http_code}\n' --max-time 8 http://127.0.0.1:8080/WebGoat/
curl -s -o /dev/null -w 'webwolf:%{http_code}\n' --max-time 8 http://127.0.0.1:9090/WebWolf/
(exec 3<>/dev/tcp/127.0.0.1/3307) 2>/dev/null && echo mariadb:UP
```
```text
juice:200
dvwa:302
webgoat:302
webwolf:302
mariadb:UP
```
(DVWA login: `admin` / `password` — the database ships already seeded, so you
can log straight in; "Create / Reset Database" still works to reset it.
DVWA opens at security level *impossible* (upstream default) — switch it to
*low* (DVWA Security page) for the classic demos. Juice Shop serves on 3000,
WebGoat on 8080, WebWolf on 9090, MariaDB on 3307 — 3307, because Windows'
own MySQL frequently owns 3306 through the WSL2 relay.)
All five are also reachable from Windows itself (browser, `curl.exe`, TCP)
at the same `127.0.0.1` URLs — verified from the Windows side, not just the
guest. (WebGoat/WebWolf needed `-Djava.net.preferIPv4Stack=true`: without it
Java binds IPv6-mapped localhost, which the WSL relay does not mirror.)

Restart discipline, verified today: `vulnbox-stop` prints one `stopped …`
line per target and every port goes `CLOSED`; `vulnbox-start` brings all five
back to `up` with no warnings. Every daemon runs detached in its own session
(`setsid`), so ending the starter session cannot kill them — one guest held
all five daemons continuously for 24+ hours (same PIDs, captured twice).

## 8. Host kernel honesty ✅

```bash
uname -a
```
```text
Linux Dracarys 6.18.54.1-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC ... x86_64 GNU/Linux
```
Say: *everything above — bash, gcc, the targets — was compiled from source by
our pipeline and runs as this userland; the kernel underneath is the WSL host
kernel. This certifies the built userland/rootfs. For bare metal there is a
separate bootable ISO artifact (below).*

---

## Artifacts (all from the same final tree, 2026-11-05)

In `lfs-output/goal-builds/goal-20261104-build1/` (sizes from `manifest.json`):

| File | Bytes |
|---|---|
| `lfs-system-goal-20261104-build1.tar.gz` | 2176110894 |
| `vuln-labs-goal-20261104-build1.tar.gz` | 2176110894 |
| `lfs-system-goal-20261104-build1-r2.tar.gz` | 5522176000 |
| `lfs-bootable-goal-20261104-build1.iso` | 1677281280 |

The `-r2` tarball is a re-export of the stabilized demo guest (same tree as
`Test6`: readline-linked bash keeping the `lfs` triplet, `sshd` host keys,
`/etc/os-release` + services data, `demo-up`/`demo-status`/`howto` helpers).
It is the recommended import source — verified 2026-11-05: fresh import,
post-import config, `demo-up`, then all 12 automated checks green
(`Check-DemoHealth.ps1`). The original tarball is kept untouched.

Fresh import (spare box, or recovery if the demo guest is damaged) — run
with no other LFS guest using the ports:
```powershell
wsl --import LFS-Goal-Test7 lfs-output/goal-wsl/LFS-Goal-Test7 lfs-output/goal-builds/goal-20261104-build1/lfs-system-goal-20261104-build1-r2.tar.gz --version 2
wsl -d LFS-Goal-Test7 -u root --exec bash /mnt/c/<repo-path>/harden-committee-box.sh config
wsl -d LFS-Goal-Test7 -u root --exec bash --login -c "demo-up"
.\Check-DemoHealth.ps1 -Guest LFS-Goal-Test7
```
(`<repo-path>` = this repo with `C:\` as `/mnt/c/` and `\` as `/`.)

ISO verification (measured, not assumed): El Torito boot record present,
`xorriso -check_media` reads all 818,985 blocks as good, and the 1.6 GB
initramfs was fully extracted and listed — it contains `setsid`, `libgcc.a`,
`vulnbox-start`, the welcome script, and the `C.UTF-8` locale data. A live VM
boot was not run on this machine (no hypervisor installed); the WSL import
above is the demonstrated boot path.

## Do NOT during the demo

- Don't start a second LFS guest while `Test6` serves (shared loopback —
  see golden rule).
- Don't run `wsl --unregister` / `--shutdown` while anyone needs the guest.
- Don't `rm` outside `/tmp`; the gcc demo cleans up after itself.
- `exit` returns to PowerShell; the daemons keep running detached.

*Prepared 2026-11-05. Every output above was captured from `LFS-Goal-Test6`,
a fresh import of the final tarballs, minutes before writing.*
