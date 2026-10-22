# lfs-artifact-inventory.md

**Read-only artifact audit — Wed Oct 21, 2026 (~01:45 CEST).**
Method: `find`, `ls`, `stat`, `du`, `file`, `sha256sum`, and `tar -tf / tar -tzf` (listing only).
**Nothing was extracted, mounted, deleted, modified, or imported.** No builds started, no GCP calls, no git changes.

---

## 1. Candidate artifacts found

### 1.1 ★ `lfs-system.tar.gz` (repo root) — the primary candidate

| Field | Finding |
|---|---|
| 1. Full path | `C:\Users\Chintu\Desktop\PROJECTS-LAPTOP\Bhasker\Projects\lfs-automated\lfs-system.tar.gz` |
| 2. File type | gzip-compressed POSIX tar, namespace `./…` (import-ready shape) |
| 3. Size | 186.9 MB (196,023,922 bytes) — uncompressed ~565 MB |
| 4. Time | **Created/modified 2026-06-21 17:52:07** (internal build log: `minimal-bootable-20260621-153046.log` ⇒ produced by `build-minimal-bootable.sh` on Jun 21 2026, ~2 h 20 min run) |
| 5. Linux root filesystem? | **YES** — a complete minimal-LFS userland (the "17-package bootable-system" layout) |
| 6. `/bin` `/sbin` `/etc` `/usr` `/lib`? | **ALL present**: `./bin/`, `./sbin/`, `./etc/`, `./usr/` (9,389 entries; **`./usr/bin` = 228 binaries incl. `bash`, `gcc`, `gawk`**), `./lib`→`usr/lib`-style layout with `./lib64/ld-linux-x86-64.so.2`; `/etc/passwd` ✓ (`/etc/shadow` not present — rootless/WSL-user mode), `/etc/{group,hostname,hosts,rpc, wsl.conf}` ✓ |
| 7. Kernel image? | **NO** — `./boot/` is empty (no `vmlinuz`/`bzImage`/initramfs) |
| 8. Complete? | **YES** — `tar -tzf` reads to the archive end without error |
| 9. Safe to copy for testing? | **YES** — read-only source file, integrity verified, `wsl.conf` inside is explicitly WSL-tuned (`[user] default=root`, `[boot] systemd=false`) |
| SHA-256 | `9308d9ed51156441…` (full hash on request) |
| Git status | untracked (covered by `.gitignore:30: *.tar.*`) |
| convergent URL | name matches the `/downloads` page "Cloud Build (WSL)" card and the `Last Build: Jun 21` stat — i.e. **the artifact the website was advertising** (its cloud URL is dead, but this local copy exists and is complete) |

### 1.2 `gcloud-builds-downloads/lfs-system.tar.gz`

| Field | Finding |
|---|---|
| 1 Path | `…\lfs-automated\gcloud-builds-downloads\lfs-system.tar.gz` |
| 2 Type | gzip-compressed tar, **content = cross-toolchain only** (`./tools/bin/x86_64-lfs-*` — full LFS_TGT binutils+gcc 13.2 set; 806 entries) |
| 3 Size | 561.8 MB (589,048,162 bytes) |
| 4 Time | **2026-06-20 18:53:53** (day before §1.1) — likely a GCS download of a Ch-5-stage build upload |
| 5 Root fs? | NO (toolchain only) |
| 6 Key dirs | only `./tools/…` — no `/etc`, `/bin`, `/usr` system tree |
| 7 Kernel? | NO |
| 8 Complete? | **NO — integrity FAILS** (`tar -tzf` cannot read to the end; stream truncated/broken). **Unusable without re-download** |
| 9 Safe to copy? | Not useful for WSL import in this state |

### 1.3 `lfs-12.0-toolchain.tar.gz` (repo root)

Complete **toolchain-only** tarball: `tools/` with full x86_64-lfs cross toolchain (binutils 2.41, gcc 13.2.0, g++, gcov…), 3,460 entries, reads to end ✓. 457,472,378 bytes, mtime **2025-11-08 22:49:39**. SHA-256 `e0d0d88273f9f00c…`. Usable for `/tools` extraction into a fresh `/mnt/lfs` if a Chapter-5 toolchain is needed. Not a rootfs.

### 1.4 `lfs-toolchain-final.tar.gz` (repo root)

**Byte-identical duplicate of §1.3** (same size, same mtime, same SHA-256 `e0d0d88273f9f00c…`). Redundant copy.

### 1.5 `lfs-toolchain-complete.tar.gz` (repo root)

Smaller toolchain snapshot (44.5 MB, 3,472 entries — tools + full C++ headers), reads to end ✓, mtime **2025-11-08 22:39:16**, SHA-256 `318f14c5931cc4b5…`. Toolchain-only, not a rootfs.

### 1.6 `lfs-output/test-lfs/` — NOT an LFS artifact

Sparse **vulnbox CTF fixture tree** (Ubuntu-derived bits: `lib/x86_64-linux-gnu/libc.so.6`, `netcat`, `weak_sudo`, `player`/`testuser` accounts, `root.txt`). Not produced by any LFS build script; not usable as an LFS rootfs.

### 1.7 `lfs-output/test-out/TestBox.tar` — NOT gzip and NOT an LFS artifact

30,720-byte plain POSIX tar (despite "gz" absence in name): skeleton `{./bin/,./boot/,./etc/passwd,./etc/shadow,…}` vulnbox fixture. Empty/incomplete. Not usable.

### 1.8 `lfs-output/mock-build/` — simulator output only

`*-SIM.log`, `firestore-mock-*.json`, `state-*.json` from `MOCK-BUILD-SIMULATOR` (Dec 12 2025). No binaries or archives. Not a build artifact.

### 1.9 `/mnt/lfs` (live build tree from tonight's interrupted run)

- `tools/` cross toolchain **working but partial**: 28 binaries in `tools/bin` (binutils pass-1 + gcc pass-1 ✓, kernel headers ✓, glibc step interrupted at its first patch application at 00:09:48).
- System trees (`etc`,`usr`,`var`,`boot`) created but **empty** — Chapter 6 never started. `sources/` = 29 upstream tarballs (inputs, not artifacts).
- `/mnt/lfs/outputs` — **does not exist**. `/mnt/lfs/.runner-exit` — absent. `/root/lfs-build.log` = 15,000-line real compile log (2.5 MB) ending at the glibc patch step.

### 1.10 Negative sweep results

- **No** `.iso`, `.img`, ext4/loop images, `.squashfs`, or initramfs files anywhere in the repo, `lfs-output/`, `/root`, or `/tmp`.
- Kernel scripts exist (`build-bootable-kernel.sh`, `BUILD-BOOTABLE-NOW.ps1`) but produced **no kernel image** on disk that can be found now.
- **Only one WSL distro installed: `Ubuntu`** — no previously imported LFS distro exists.
- `builds/`, `output/`, `outputs/`, `artifacts/`, `rootfs/` named directories: absent at repo root.

## 2. Build-script packaging questions

1. **Which script creates the final output?** Two coexist:
   - `package-lfs-outputs.sh` (Packages: toolchain tarball of the whole `$LFS` tree, conditional ISO, WSL install script) — invoked by `lfs-build.sh:1103-1116` only **after a successful build**.
   - `lfs-build.sh` **itself** writes `lfs-system-${BUILD_ID}.tar.gz` + `build-metadata-*.txt` (`lfs-build.sh:764, 775`) and optionally `gsutil`-uploads `lfs-system.tar.gz` to GCS (`:871`).
2. **Expected output path?** Inconsistent: `lfs-build.sh:76` uses `OUTPUT_DIR=${PROJECT_ROOT}/output` (repo `output/`), while `package-lfs-outputs.sh:14` uses `OUTPUT_DIR=$LFS/outputs` (`/mnt/lfs/outputs`). Neither exists on disk today (packaging never ran this cycle) — proven by the sweep in §1.10.
3. **Does the build currently package the system?** **No.** Packaging is gated on full build success (`lfs-build.sh:1110`); tonight's run died at glibc (Chapter 5), never reaching the gate.
4. **What is the output — rootfs, kernel, or both?** Rootfs **and** embedded cross toolchain in one `$LFS`-tree tarball; the ISO (with kernel) is **only built if a kernel image exists** (`package-lfs-outputs.sh:47` checks `$LFS/boot/vmlinuz` or `$LFS/bootable/boot/vmlinuz-6.4.12-lfs`, else skips at `:104`). Kernel images are only produced by the separate `build-bootable-kernel.sh` path, which has never left an artifact behind.
5. **Did a previous build reach the packaging stage?** **Yes, demonstrably:**
   - `lfs-system.tar.gz` (§1.1, Jun 21 2026) — full minimal-system run completed **and** packaged (its own run log is inside the archive).
   - Three toolchain tarballs (Nov 8 2025, Jun 20 2026) — Chapter-5-stage packaging/upload history.
   - Tonight (Oct 21, 2026) — did not (died pre-glibc).

## 3. SHA-256 digest table (first 16 hex chars)

```
9308d9ed51156441…  lfs-system.tar.gz                    (186.9 MB, Jun 21 2026 — THE rootfs)
9b041da7d7eb8cc7…  gcloud-builds-downloads/lfs-system.tar.gz (561.8 MB, TRUNCATED — do not use)
e0d0d88273f9f00c…  lfs-12.0-toolchain.tar.gz            (436.3 MB, complete)
e0d0d88273f9f00c…  lfs-toolchain-final.tar.gz           (identical duplicate)
318f14c5931cc4b5…  lfs-toolchain-complete.tar.gz        (44.5 MB, complete)
```

## 4. Verdict

A **complete, integrity-verified, WSL-tailored LFS root filesystem already exists on disk**: repo-root `lfs-system.tar.gz` — real Chapter5+17-package system with bash/gcc, `/etc/passwd`, tuned `wsl.conf`, produced by the platform's own build script on Jun 21 2026, and exactly the artifact the `/downloads` page advertises. Tonight's recovery of a newer equivalent is not necessary for a working demo.

## 5. Recommended next action (exactly one — **not performed yet**, awaiting approval)

**Use the existing complete root filesystem:**

```powershell
mkdir C:\LFS-Demo
Select-String / copy verification of sha256 (compare 9308d9ed51156441…)
wsl --import LFS-ThesisDemo C:\LFS-Demo "C:\Users\Chintu\Desktop\PROJECTS-LAPTOP\Bhasker\Projects\lfs-automated\lfs-system.tar.gz" --version 2
wsl -d LFS-ThesisDemo -u root -- bash -c "uname -a; bash --version | head -1; gcc --version | head -1; echo it-works"
```

Fallbacks if import verification fails (not assumed): re-download/rebuild the truncated `gcloud-builds-downloads` toolchain, or a fresh targeted rebuild — but the existing rootfs is the fastest, honest path to "I enter LFS and test it inside WSL" for tomorrow's defense.
