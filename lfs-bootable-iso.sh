#!/usr/bin/env bash
# ============================================================================
# lfs-bootable-iso.sh — Chapter 7.5: "Bootable ISO" (the June TODO, fixed)
# 1. Compiles the real Linux 6.4.12 kernel with the container's toolchain
# 2. Installs bzImage into $LFS/boot (so the WSL img has a kernel too)
# 3. Builds an initramfs = a full RAM copy of the LFS rootfs (/bin /usr /etc…)
# 4. Masters a BIOS-bootable ISO (isolinux) into /output/lfs-bootable-<id>.iso
# Boot: any VM (QEMU/VBox) → boots to a root shell of YOUR cloud-built LFS.
# ============================================================================
set -u

LFS="${LFS:-/mnt/lfs}"
LFS_TGT="${LFS_TGT:-x86_64-lfs-linux-gnu}"
KVER="${LFS_KERNEL_VERSION:-6.4.12}"
SRC="$LFS/sources"
OUT="${OUTPUT_DIR:-/output}"
WORK="$SRC/iso-build"
BUILDLOG="$LFS/build-logs/bootable-iso-$(date +%Y%m%d-%H%M%S).log"

log(){ echo "[bootable-iso] $*"; }
fatal(){ log "❌ $*"; echo "FATAL: $*" >> "$BUILDLOG" 2>&1; tail -n 25 "$BUILDLOG" 2>/dev/null | sed 's/^/[iso-log] /'; exit 1; }
run(){ echo "+ $*" >> "$BUILDLOG" 2>&1; "$@" >> "$BUILDLOG" 2>&1 || fatal "cmd failed: $*"; }
download(){
    local f="$1"; shift
    [ -s "$SRC/$f" ] && { log "✓ Already downloaded: $f"; return 0; }
    local u
    for u in "$@"; do
        wget -q --timeout=60 --tries=3 -O "$SRC/$f" "$u" && [ -s "$SRC/$f" ] && \
            { log "✓ Downloaded: $f"; return 0; }
    done
    fatal "download failed: $f"
}

log "=========================================="
log "  BOOTABLE ISO PIPELINE (kernel $KVER)"
log "=========================================="

mkdir -p "$OUT" "$WORK"

# ---------------------------------------------------------------- 1. kernel
log "[1/5] Compiling Linux $KVER for real boot (this takes ~10-15 min)..."
[ -d "$SRC/linux-$KVER" ] || {
    download "linux-$KVER.tar.xz" \
        "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-$KVER.tar.xz" \
        "https://mirrors.edge.kernel.org/pub/linux/kernel/v6.x/linux-$KVER.tar.xz"
    tar -xf "$SRC/linux-$KVER.tar.xz" -C "$SRC" || fatal "kernel extract"
}
cd "$SRC/linux-$KVER"
make mrproper >> "$BUILDLOG" 2>&1
make defconfig >> "$BUILDLOG" 2>&1 || fatal "defconfig"
./scripts/config --set-val CONFIG_SYSTEM_TRUSTED_KEYS "" >> "$BUILDLOG" 2>&1 || true
make -j12 bzImage >> "$BUILDLOG" 2>&1 || fatal "bzImage build"
log "✅ bzImage done"

# v3.0 lesson: `make modules_install` needs modules.order, which exists only
# after `make modules` — building only bzImage made __modinst_pre die with
#   sed: can't read modules.order: No such file or directory
make -j12 modules >> "$BUILDLOG" 2>&1 || fatal "modules build"
log "✅ modules built"

log "[2/5] Installing kernel into \$LFS/boot + stripped modules..."
mkdir -p "$LFS/boot"
cp arch/x86/boot/bzImage "$LFS/boot/vmlinuz-$KVER" || fatal "vmlinuz copy"
INSTALL_MOD_STRIP=1 make INSTALL_MOD_PATH="$LFS" modules_install >> "$BUILDLOG" 2>&1 \
    || fatal "modules_install"
log "✅ kernel + modules in \$LFS"

# ------------------------------------------------- 3. initramfs = RAM rootfs
log "[3/5] Building initramfs (RAM copy of your LFS system; a few minutes)..."
RF="$WORK/initramfs-stage"
rm -rf "$RF"; mkdir -p "$RF/proc" "$RF/sys" "$RF/dev" "$RF/tmp" "$RF/root" "$RF/media"
cd "$LFS"
for d in bin sbin usr lib lib64 etc var root home opt; do
    [ -e "$d" ] && cp -a "$d" "$RF/" 2>/dev/null
done
# static console devices so init output works even before udev/devtmpfs
mknod -m 600 "$RF/dev/console" c 5 1 2>/dev/null || true
mknod -m 666 "$RF/dev/null"    c 1 3 2>/dev/null || true
mknod -m 666 "$RF/dev/tty1"    c 4 1 2>/dev/null || true

cat > "$RF/init" << 'INIT_EOF'
#!/bin/bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
export TERM=${TERM:-linux}
[ -e /proc/stat ] || mount -t proc   none /proc  2>/dev/null
[ -e /sys/slot ]  || mount -t sysfs  none /sys   2>/dev/null
[ -e /dev/zero ]  || mount -t devtmpfs none /dev 2>/dev/null
clear 2>/dev/null
echo ""
echo "  ✅ Booted: Linux From Scratch 12.0 (Cloud-Built)"
echo "     Kernel: $(uname -r)"
echo "     Everything you see was compiled from source in the cloud."
echo ""
echo "     Head over to a console shell below. Try: whoami / uname -a / git --version"
echo ""
cd /root
exec /bin/bash --login < /dev/console > /dev/console 2>&1
INIT_EOF
chmod +x "$RF/init"

log "[4/5] Packing initramfs (cpio+gzip)..."
mkdir -p "$WORK/isotree/boot" "$WORK/isotree/isolinux"
( cd "$RF" && find . -print0 | cpio --null -o -H newc ) | gzip -3 \
    > "$WORK/isotree/boot/initramfs.img" || fatal "initramfs pack"
cp "$LFS/boot/vmlinuz-$KVER" "$WORK/isotree/boot/vmlinuz-$KVER" || fatal "vmlinuz to iso"
log "   initramfs: $(du -h "$WORK/isotree/boot/initramfs.img" | cut -f1)"

# ------------------------------------------------- 4. isolinux + xorriso
log "[5/5] ISO assembly (isolinux + xorriso)..."
download syslinux-6.03.tar.xz \
    "https://cdn.kernel.org/pub/linux/utils/boot/syslinux/syslinux-6.03.tar.xz" \
    "https://mirrors.edge.kernel.org/pub/linux/utils/boot/syslinux/syslinux-6.03.tar.xz"
[ -d "$SRC/syslinux-6.03" ] || tar -xf "$SRC/syslinux-6.03.tar.xz" -C "$SRC"
SLB=$(find "$SRC/syslinux-6.03/bios" -name 'isolinux.bin' | head -1)
SLC=$(find "$SRC/syslinux-6.03/bios" -name 'ldlinux.c32' | head -1)
[ -n "$SLB" ] && [ -n "$SLC" ] || fatal "isolinux files not found"
cp "$SLB" "$SLC" "$WORK/isotree/isolinux/"

cat > "$WORK/isotree/isolinux/isolinux.cfg" << CFG_EOF
DEFAULT lfs
PROMPT 1
TIMEOUT 100
LABEL lfs
  KERNEL /boot/vmlinuz-$KVER
  APPEND initrd=/boot/initramfs.img rdinit=/init console=tty0
CFG_EOF

# host-side xorriso (native build, runs in container)
if ! command -v xorriso >/dev/null 2>&1 && [ ! -x /usr/local/bin/xorriso ]; then
    download xorriso-1.5.5.tar.gz \
        "https://ftp.gnu.org/gnu/xorriso/xorriso-1.5.5.tar.gz" \
        "https://mirrors.kernel.org/gnu/xorriso/xorriso-1.5.5.tar.gz"
    [ -d "$SRC/xorriso-1.5.5" ] || tar -xf "$SRC/xorriso-1.5.5.tar.gz" -C "$SRC"
    cd "$SRC/xorriso-1.5.5"
    ./configure --prefix=/usr/local >> "$BUILDLOG" 2>&1 || fatal "xorriso configure"
    make -j12 >> "$BUILDLOG" 2>&1 || fatal "xorriso make"
    make install >> "$BUILDLOG" 2>&1 || fatal "xorriso install"
fi
export PATH="/usr/local/bin:$PATH"
command -v xorriso >/dev/null 2>&1 || fatal "xorriso still not on PATH"

ISO_NAME="lfs-bootable-${BUILD_ID:-cloud}.iso"
xorriso -as mkisofs -o "$OUT/$ISO_NAME" \
    -b isolinux/isolinux.bin -c isolinux/boot.cat \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -J -R -V "LFS-12.0-CloudBuilt" "$WORK/isotree" >> "$BUILDLOG" 2>&1 \
    || fatal "ISO mastering"
[ -s "$OUT/$ISO_NAME" ] || fatal "ISO not created"
log "✅ ISO ready: $OUT/$ISO_NAME ($(du -h "$OUT/$ISO_NAME" | cut -f1))"

# cleanup RAM-heavy temp tree (keeps disk small)
rm -rf "$RF"
log "ANALYTICS: kernel=$KVER iso=$ISO_NAME"
exit 0
