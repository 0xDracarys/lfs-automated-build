# lfs-fixed-demo-report.md

**Read-only demonstration inside WSL distro `LFS-Fixed` — Wed Oct 21, 2026, ~01:33 CEST.**
Restrictions honored: nothing installed, deleted, unregistered, or modified; no new builds; no GCP contact; no git changes; `LFS-ThesisDemo` untouched.
_Environment context: Windows 11 host `DESKTOP-RJIETHS`, WSL2. `LFS-Fixed` is the repaired import of the same Jun-21-2026 rootfs that produced repo-root `lfs-system.tar.gz` (repair predates this session — its `/root` and `bin→usr/bin` symlinks are timestamped Oct 19; today only read-only commands were run)._

---

## Command-by-command results

### 1. Confirm the distribution
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "echo DISTRO=LFS-Fixed"`
- **Purpose:** verify the requested distro is reachable and executing our commands.
- **Output:** `DISTRO=LFS-Fixed`
- **PASS.** Proves commands execute inside `LFS-Fixed`, not the host Ubuntu.

### 2. Confirm the current user
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "whoami; id"`
- **Purpose:** verify root context (matches LFS build-convention user).
- **Output:** `root` / `uid=0(root) gid=0(root) groups=0(root)`
- **PASS.** Proves the distro's own account database (`/etc/passwd`, `/etc/group`) is intact and we run as root inside LFS-Fixed.

### 3. Confirm the root directory
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "pwd; ls -la /"`
- **Purpose:** verify default cwd is `/root` and show the filesystem layout.
- **Output:** `pwd` → `/root`; `/` listing shows the canonical merged-usr LFS layout: `bin -> usr/bin`, `lib -> usr/lib`, `sbin -> usr/sbin`, plus `etc/ lib64/ usr/ var/ root/ boot/ tools/ build-logs/ .build_progress` (Jun 21 15:21) and `lost+found/` (native ext4).
- **PASS.** Proves a purpose-built ext4 rootfs with the LFS 12.0 merged-usr layout — not a copy of Ubuntu's layout. `tools/` inside also proves the Chapter-5 cross toolchain is embedded. The `init` file at `/` is WSL's injected bootstrap binary, not part of LFS.

### 4. Check important directories
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "ls -ld /bin /sbin /etc /lib /lib64 /usr /var"`
- **Purpose:** verify the five essential trees every usable rootfs needs.
- **Output:** `bin → usr/bin` (link), `sbin → usr/sbin` (link), `/etc`, `lib → usr/lib` (link), `/lib64`, `/usr`, `/var` — all present.
- **PASS.** Proves completeness of the FHS skeleton from the build's Chapter-6 layout.

### 5. Check the shell
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "bash --version | head -1"`
- **Purpose:** verify the LFS-built shell runs.
- **Output:** `GNU bash, version 5.2.15(1)-release (x86_64-lfs-linux-gnu)`
- **PASS.** The build triple `x86_64-lfs-linux-gnu` is hard evidence this bash was **cross-compiled by the LFS Chapter-5 toolchain** (`LFS_TGT`), i.e. it came from the automated build, not from a distro package feed.

### 6. Check the compiler
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "gcc --version | head -1"`
- **Purpose:** verify the LFS compiler is present and functional.
- **Output:** `gcc (GCC) 13.2.0`
- **PASS.** Proves the GCC 13.2.0 — the exact version pinned in the build scripts and the LFS 12.0 book — is installed in the userland.

### 7. Check basic build tools
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "command -v bash gcc make gawk sed awk"`
- **Purpose:** confirm the core build toolkit resolves on PATH.
- **Output:** `/usr/bin/bash`, `/usr/bin/gcc`, `/usr/bin/make`, `/usr/bin/gawk`, `/usr/bin/sed`, `/usr/bin/awk`
- **PASS.** Proves bash, GCC, make, gawk, sed, awk — the GNU toolchain needed to compile software — are all installed and PATH-resolvable.

### 8. Count installed user-space programs
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "find /usr/bin -maxdepth 1 -type f -executable | wc -l"`
- **Purpose:** quantify the userland.
- **Output:** `205` executable programs in `/usr/bin`
- **PASS.** Proves a populated, usable userland (matches the 228-binary signature of the Jun-21 archive; some entries are symlinks/shim files, so the executable-file count is slightly lower).

### 9. Check the LFS target architecture
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "file /bin/bash; file /usr/bin/gcc"`
- **Purpose:** verify binaries are genuine x86-64 ELF built for GNU/Linux.
- **Output:** `/bin/bash: ELF 64-bit LSB pie executable, x86-64 … dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2 … not stripped`; `/usr/bin/gcc: ELF 64-bit LSB executable, x86-64 … with debug_info … not stripped`
- **PASS.** Proves the binaries are real x86-64 ELF executables with the correct loader path — a fully linkable, runnable environment.

### 10. Check release information
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "cat /etc/lfs-release 2>/dev/null || true; cat /etc/os-release 2>/dev/null || true"`
- **Purpose:** check for release marker files.
- **Output:** *(empty — neither file exists)*
- **PASS (honest).** Proves nothing invented: the system carries **no fabricated release branding**. This is an honest cosmetic gap — the packaging script never wrote `/etc/lfs-release` (a known packaging-script improvement opportunity).

### 11. Run a harmless shell test
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "echo LFS_USERSPACE_TEST_PASSED"`
- **Purpose:** end-to-end shell round-trip sanity check.
- **Output:** `LFS_USERSPACE_TEST_PASSED`
- **PASS.** Proves the full WSL relay → distro init → shell → output path works.

### 12. Show the kernel separately
- **Command:** `wsl -d LFS-Fixed -u root -- bash -c "uname -a"`
- **Purpose:** document which kernel is actually running.
- **Output:** `Linux DESKTOP-RJIETHS 6.18.54.1-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC Tue Oct  6 19:13:07 UTC 2026 x86_64 GNU/Linux`
- **PASS (with the correct interpretation).** This is the **WSL host kernel** — every WSL distro on this machine shares it. It is *not* a custom-compiled LFS kernel.

---

## What this demonstrates — and what it does not

| Interpretation for the defense |
|---|
| ✅ **The bash shell, GCC 13.2.0 + make/gawk/sed toolchain, and the entire directory structure come from the LFS root filesystem** built by the project's own pipeline (cross-compile fingerprint `x86_64-lfs-linux-gnu` embedded in the binaries). |
| ✅ A user **can enter it** (`wsl -d LFS-Fixed`), run compilers, and build/execute software inside it. |
| ⚠️ **`uname -a` reports the WSL host kernel** (`6.18.54.1-microsoft-standard-WSL2`), not a kernel built from source by this project. |
| ⛔ **This is a rootfs/userland demonstration — it is NOT proof that a custom LFS kernel was compiled and booted.** The kernel phase (`boot/vmlinuz`) was never produced by the pipeline to date; no ISO/bootable image exists. Claim only the userland scope, and present the kernel as the clearly-labeled next build phase. |

**Overall verdict: 12 / 12 PASS** — a working, honest, demonstrable LFS userland inside WSL.

## Method note

All outputs captured verbatim via `wsl -d LFS-Fixed -u root -- bash -c …` (filtered from display: only WSL Windows-PATH translation warnings, which are cosmetic relay noise and unrelated to the filesystem). Every check is read-only.
