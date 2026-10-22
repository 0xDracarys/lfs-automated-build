# Thesis Demo Checklist — `LFS-Fixed` (READ-ONLY, pre-verified)

**Entry line (from PowerShell):**
```powershell
wsl -d LFS-Fixed -u root
```
*(leaves your Windows shell untouched; nothing on the WSL side changes — starting a
stopped distro is not a modification, it boots the same files every time)*

**Status meanings:** ✅ pre-verified today (output below is real, from this machine).
⚠️ = pre-verified and known to **fail as-is** — the honest handling is written out.
Total meeting time: ~3 minutes. Nothing writes to disk in any step.

---

## The 8 checks

### 1. I can enter LFS-Fixed ✅
Type the entry line above. A Linux prompt appears (bare prompt is normal for this rootfs).
**Proves:** the LFS rootfs imports and boots under WSL 2.

### 2. I am root inside the LFS environment ✅
```bash
whoami
id
```
Verified output:
```text
root
uid=0(root) gid=0(root) groups=0(root)
```
**Proves:** you are operating as root inside the LFS userland.

### 3. The LFS filesystem exists ✅
```bash
ls /
```
Verified output (Unix tree at `/`):
```text
bin boot build-logs dev etc init lib lib64 lost+found mnt
proc root run sbin sys tmp tools usr var
```
**Proves:** a complete, structured LFS root filesystem is mounted and readable.

### 4. Bash is the LFS-built Bash ✅
```bash
/bin/bash --version | head -1
file /bin/bash
```
Verified output:
```text
GNU bash, version 5.2.15(1)-release (x86_64-lfs-linux-gnu)
/bin/bash: ELF 64-bit LSB pie executable, x86-64, ... interpreter /lib64/ld-linux-x86-64.so.2
```
**Proves:** the shell binary was compiled *by our build* (`x86_64-lfs-linux-gnu` is our
LFS build triplet — a distro bash would say `x86_64-pc-linux-gnu`).

### 5. GCC is available ✅
```bash
gcc --version | head -1
gcc -dumpmachine
```
Verified output:
```text
gcc (GCC) 13.2.0
x86_64-lfs-linux-gnu
```
**Proves:** the LFS-built GCC driver runs and targets our LFS triplet.

### 6. I can compile and execute a small C program — ⚠️ honest handling required
**True measured status in this imported rootfs:** `gcc -c` (compile-to-object) works,
but the **final link step fails: `cannot find -lgcc`** — GCC's static runtime archive
`/usr/lib/gcc/x86_64-lfs-linux-gnu/13.2.0/libgcc.a` is missing from the imported
snapshot (diagnosed today; the packaging predates GCC's libgcc install step).

**Recommended honest demo (turns the defect into an analysis credit):**
```bash
echo 'int main(void){return 0;}' | gcc -xc -c -o /dev/null -     # → silent (works, exit 0)
echo 'int main(void){printf("hi\n");return 0;}' | gcc -xc -o /dev/null -
# → ld: cannot find -lgcc  (the diagnosed missing static archive)
```
Writes only to `/dev/null` — zero filesystem change, genuinely read-only.

**Say this at the defense:** *"Compile-to-object succeeds; the link stage fails because
the imported snapshot is missing one static library (`libgcc.a`); we located the exact
missing file and its fix — but repairing it just to demonstration would modify the
system, so we present it as a measured, diagnosed defect instead."*
*(A planned fix and repair paths are documented in `lfs-banner-future-fix-plan.md`'s
neighbouring reports.)*

**Optional substitute proof that new code executes in the LFS userland ✅:**
```bash
awk 'BEGIN { print "Hello from my LFS userland!" }'
```
Verified output:
```text
Hello from my LFS userland!
```

### 7. WSL provides the host kernel ✅
```bash
uname -a
```
Verified output:
```text
Linux DESKTOP-RJIETHS 6.18.54.1-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC ... x86_64 GNU/Linux
```
**Proves:** the running kernel is the **WSL host kernel** (`6.18.54.1-microsoft-standard-WSL2`),
not an LFS-built kernel. *(Note: kernel version varies with WSL updates — the constant
is `*-microsoft-standard-WSL2`.)*

### 8. This is an LFS userland/rootfs demonstration, NOT a custom-kernel boot ✅
**One-liner to say:** *"Everything the audience saw — bash, gcc, awk, the whole tree —
was built from source by our pipeline; the kernel underneath it is the WSL host kernel.
So this certifies the built userland/rootfs, not a kernel boot. Kernel boot work is a
separate chapter step we did not reach."*

---

## Close the demo

```bash
exit
```
You are back in PowerShell. Nothing inside the distro was created, installed, or deleted.

## Do NOT during the demo
- Don't run any `.sh` scripts, `make`, or downloads inside LFS-Fixed.
- Don't `apt install` / `pacman` (no package manager here anyway).
- Don't `rm` anything, don't write outside `/tmp`.
- Don't run `wsl --unregister` or `--shutdown` afterwards while anyone still needs it.

## If asked "why does the prompt look bare / no banner?"
Answer: *"That gap is precisely what we diagnosed — the standalone build flow never seeded
a profile, and the orchestrator's banner isn't picked up by WSL's non-login shells. A
two-paragraph fix is fully prepared (see `lfs-banner-future-fix-plan.md`) and will be in
the next build."* — then move on.

*Prepared 2026-10-21. Every single output above was captured from this machine minutes
before the meeting (10-point probe run inside `LFS-Fixed`).*
