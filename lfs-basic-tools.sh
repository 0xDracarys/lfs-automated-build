#!/usr/bin/env bash
# ============================================================================
# lfs-basic-tools.sh — Chapter 6.5: "Daily-Driver" Tool Set
# Builds the every-day utilities a real Linux user expects (networking,
# version control, process/disk inspection, editor), cross-compiled with the
# LFS toolchain and installed into the FINAL rootfs at $LFS.
# Runs from inside the container after build-minimal-bootable.sh.
# Env: LFS=/mnt/lfs, LFS_TGT=x86_64-lfs-linux-gnu, MAKEFLAGS
# ============================================================================
set -u

LFS="${LFS:-/mnt/lfs}"
LFS_TGT="${LFS_TGT:-x86_64-lfs-linux-gnu}"
SRC="$LFS/sources"
mkdir -p "$SRC" "$LFS/build-logs"
BUILDLOG="$LFS/build-logs/basic-tools-$(date +%Y%m%d-%H%M%S).log"

log(){ echo "[basic-tools] $*"; }
llog(){ echo "$*" >> "$BUILDLOG" 2>&1; }
fatal(){ log "❌ $*"; llog "FATAL: $*"; tail -n 12 "$BUILDLOG" 2>/dev/null | sed 's/^/[basic-tools-log] /'; exit 1; }
step(){ log ""; log "===== [$1/$TOOL_TOTAL] $2 ====="; }
run(){ llog "+ $*"; "$@" >> "$BUILDLOG" 2>&1 || fatal "command failed: $*" ; }

download(){ # download <file> <url1> <url2>...
    local f="$1"; shift
    if [ -s "$SRC/$f" ]; then log "✓ Already downloaded: $f"; return 0; fi
    local u
    for u in "$@"; do
        log "⬇  Downloading $f from $u"
        if wget -q --timeout=60 --tries=3 -O "$SRC/$f" "$u" && [ -s "$SRC/$f" ]; then
            log "✓ Downloaded: $f"; return 0
        fi
    done
    fatal "download failed for $f (all mirrors)"
}

extract(){ # extract <file-prefix> <dirname>
    if [ -d "$SRC/$2" ]; then log "✓ Already extracted: $2"; return 0; fi
    # v3.0 lesson: tar without -C extracts into the CURRENT directory — and the
    # script cd's into linux-*/ for headers, so every later package silently
    # extracted inside the kernel tree and the $SRC/<pkg> check then failed.
    run tar -xf "$SRC/$1"* -C "$SRC"
    [ -d "$SRC/$2" ] || fatal "extract failed: $2"
    log "✓ Extracted: $2"
}

# Cross-compile env so every autotools package installs into the LFS rootfs
export CPPFLAGS="-I$LFS/usr/include"
export LDFLAGS="-L$LFS/usr/lib"
export PKG_CONFIG_PATH="$LFS/usr/lib/pkgconfig"

TOOL_TOTAL=15
step 0/15 "Linux kernel headers (into \$LFS/usr/include)"
download linux-6.4.12.tar.xz \
    "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz" \
    "https://mirrors.edge.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz"
extract linux-6.4.12.tar.xz linux-6.4.12
cd "$SRC/linux-6.4.12"
make headers_install INSTALL_HDR_PATH="$LFS/usr" >> "$BUILDLOG" 2>&1 || fatal "headers_install"
log "✅ kernel headers installed"

step 1 "zlib-1.3 (compression: git/curl/ssh dependency)"
download zlib-1.3.tar.gz "https://zlib.net/fossils/zlib-1.3.tar.gz" \
    "https://sources.buildroot.net/zlib/zlib-1.3.tar.gz"
extract zlib-1.3.tar.gz zlib-1.3
cd "$SRC/zlib-1.3"
CHOST="$LFS_TGT" ./configure --prefix=/usr >> "$BUILDLOG" 2>&1 || fatal "zlib configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "zlib make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "zlib install"
log "✅ zlib"

step 2 "openssl-3.1.4 (TLS: git https / ssh dependency)"
download openssl-3.1.4.tar.gz \
    "https://www.openssl.org/source/openssl-3.1.4.tar.gz" \
    "https://github.com/openssl/openssl/releases/download/openssl-3.1.4/openssl-3.1.4.tar.gz"
extract openssl-3.1.4.tar.gz openssl-3.1.4
cd "$SRC/openssl-3.1.4"
# v3.1 WSL-import lesson: with prefix=/usr, openssl's default libdir is `lib64`,
# but the LFS dynamic loader only searches /lib and /usr/lib — curl then died
# with "libssl.so.3: cannot open shared object file". Force libdir=lib and
# relocate any lib64 stragglers as a safety net.
./Configure linux-x86_64 --cross-compile-prefix="${LFS_TGT}-" --prefix=/usr \
    --libdir=lib --openssldir=/etc/ssl shared no-tests >> "$BUILDLOG" 2>&1 || fatal "openssl Configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "openssl make"
make DESTDIR="$LFS" install_sw >> "$BUILDLOG" 2>&1 || fatal "openssl install"
if [ -d "$LFS/usr/lib64" ] && [ ! -e "$LFS/usr/lib/libssl.so.3" ]; then
    cp -a "$LFS/usr/lib64/"libssl.so* "$LFS/usr/lib64/"libcrypto.so* "$LFS/usr/lib/" 2>/dev/null
fi
# v3.1 WSL lesson: https only works with a CA bundle at
# /etc/ssl/certs/ca-certificates.crt (curl error 77 otherwise). The build
# container ships one via the ca-certificates package — copy it in.
mkdir -p "$LFS/etc/ssl/certs"
if [ -s /etc/ssl/certs/ca-certificates.crt ]; then
    cp /etc/ssl/certs/ca-certificates.crt "$LFS/etc/ssl/certs/ca-certificates.crt"
else
    wget -q --timeout=60 -O "$SRC/cacert.pem" "https://curl.se/ca/cacert.pem" \
        && cp "$SRC/cacert.pem" "$LFS/etc/ssl/certs/ca-certificates.crt" \
        || log "⚠️ CA bundle unavailable — guest https cert checks may fail"
fi
log "✅ openssl"

step 3 "curl-8.5.0 (https client; runtime downloads)"
download curl-8.5.0.tar.xz "https://curl.se/download/curl-8.5.0.tar.xz" \
    "https://github.com/curl/curl/releases/download/curl-8_5_0/curl-8.5.0.tar.xz"
extract curl-8.5.0.tar.xz curl-8.5.0
cd "$SRC/curl-8.5.0"
./configure --host="$LFS_TGT" --prefix=/usr --with-openssl --without-libpsl \
    --without-libidn2 --without-nghttp2 --without-brotli --without-zstd \
    --disable-ftp --disable-ldap --disable-ldaps --disable-rtsp >> "$BUILDLOG" 2>&1 \
    || fatal "curl configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "curl make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "curl install"
log "✅ curl"

step 4 "expat-2.5.0 (XML: git dependency)"
download expat-2.5.0.tar.gz \
    "https://github.com/libexpat/libexpat/releases/download/R_2_5_0/expat-2.5.0.tar.gz" \
    "https://src.fedoraproject.org/repo/pkgs/expat/expat-2.5.0.tar.gz"
extract expat-2.5.0.tar.gz expat-2.5.0
cd "$SRC/expat-2.5.0"
./configure --host="$LFS_TGT" --prefix=/usr >> "$BUILDLOG" 2>&1 || fatal "expat configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "expat make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "expat install"
log "✅ expat"

step 5 "git-2.43.0 — version control, of course"
download git-2.43.0.tar.xz \
    "https://www.kernel.org/pub/software/scm/git/git-2.43.0.tar.xz" \
    "https://github.com/git/git/archive/refs/tags/v2.43.0.tar.gz"
extract git-2.43.0.tar.xz git-2.43.0
cd "$SRC/git-2.43.0"
# v3.1 lesson: with the cross toolchain, git's link line put -lcurl BEFORE the
# object files, so curl symbols never resolved (`git make` died on
# git-http-fetch). git works fine without its http transport locally — the
# standalone curl client (built in step 3) still covers https fetching.
./configure --host="$LFS_TGT" --prefix=/usr --without-tcltk --without-curl \
    >> "$BUILDLOG" 2>&1 || fatal "git configure"
# v3.4 lesson: the translation catalogs run msgfmt, which no toolchain step
# provides — the build died at po/*.mo ("msgfmt: not found") after spending
# its whole budget compiling objects. NO_GETTEXT skips the po/ subtree
# entirely (git messages stay in English — fine for a practice system).
make -j12 NO_GETTEXT=1 NO_TCLTK=1 >> "$BUILDLOG" 2>&1 || fatal "git make"
make DESTDIR="$LFS" NO_GETTEXT=1 NO_TCLTK=1 install >> "$BUILDLOG" 2>&1 || fatal "git install"
log "✅ git"

step 6 "net-tools-2.10 — ifconfig, route, netstat (what you asked for)"
download net-tools-2.10.tar.xz \
    "https://netcologne.dl.sourceforge.net/project/net-tools/net-tools-2.10.tar.xz" \
    "https://downloads.sourceforge.net/project/net-tools/net-tools-2.10.tar.xz"
extract net-tools-2.10.tar.xz net-tools-2.10
cd "$SRC/net-tools-2.10"
yes "" | make config >> "$BUILDLOG" 2>&1 || fatal "net-tools config"
make >> "$BUILDLOG" 2>&1 || fatal "net-tools make"
make BASEDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "net-tools install"
log "✅ net-tools (ifconfig installed)"

step 7 "iputils-s20160308 — ping, tracepath, arping"
download iputils-s20160308.tar.gz \
    "https://github.com/iputils/iputils/archive/refs/tags/s20160308.tar.gz" \
    "https://src.fedoraproject.org/repo/pkgs/iputils/iputils-s20160308.tar.gz"
extract iputils-s20160308.tar.gz iputils-s20160308
cd "$SRC/iputils-s20160308"
make USE_CAP=no USE_IDN=no USE_SELINUX=no CC="${LFS_TGT}-gcc" ping tracepath arping \
    >> "$BUILDLOG" 2>&1 || fatal "iputils make"
install -m 0755 ping      "$LFS/usr/bin/ping"
install -m 0755 tracepath "$LFS/usr/bin/tracepath"
install -m 0755 arping    "$LFS/usr/bin/arping"
log "✅ iputils (ping installed)"

step 8 "procps-ng-4.0.3 — ps, free, top, uptime"
download procps-ng-4.0.3.tar.xz \
    "https://sourceforge.net/projects/procps-ng/files/Production/procps-ng-4.0.3.tar.xz" \
    "https://gitlab.com/procps-ng/procps/-/archive/v4.0.3/procps-v4.0.3.tar.gz"
# tolerant extraction: sourceforge names vs gitlab names differ
if [ ! -d "$SRC/procps-ng-4.0.3" ] && [ ! -d "$SRC/procps-v4.0.3" ]; then
    tar -xf "$SRC/procps-ng-4.0.3.tar.xz" -C "$SRC" >> "$BUILDLOG" 2>&1 \
        || tar -xf "$SRC/procps-v4.0.3.tar.gz" -C "$SRC" >> "$BUILDLOG" 2>&1 \
        || fatal "procps extract (both names failed)"
fi
cd "$SRC/procps-ng-4.0.3" 2>/dev/null || cd "$SRC/procps-v4.0.3" || fatal "procps dir missing"
log "   using $(basename "$PWD")"
    ./configure --host="$LFS_TGT" --prefix=/usr --disable-kill --without-systemd \
    >> "$BUILDLOG" 2>&1 || fatal "procps configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "procps make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "procps install"
log "✅ procps (free works now)"

# ── util-linux: mount/umount/blkid/dmesg ────────────────────────────────────
# v3.6 lesson: the ISO's /init tries `mount -t proc` before login, but this
# image shipped no mount binary at all. The call failed silently (stderr went
# to /dev/null) and the booted system had no /proc, /sys or /dev — so `free`,
# `ps` and `top` all failed too, and the welcome banner printed blank memory.
# Only the few binaries we actually need are enabled; a full util-linux build
# is far heavier than this image warrants.
step 8b "util-linux-2.39.3 — mount, umount, blkid, lsblk, dmesg"
download util-linux-2.39.3.tar.xz \
    "https://cdn.kernel.org/pub/linux/utils/util-linux/v2.39/util-linux-2.39.3.tar.xz" \
    "https://mirrors.edge.kernel.org/pub/linux/utils/util-linux/v2.39/util-linux-2.39.3.tar.xz"
extract util-linux-2.39.3.tar.xz util-linux-2.39.3
cd "$SRC/util-linux-2.39.3"
# Non-fatal on purpose: a missing mount binary degrades the image (no /proc),
# but it must not abort an otherwise complete build.
if ./configure --host="$LFS_TGT" --prefix=/usr \
        --disable-all-programs \
        --enable-libmount --enable-mount --enable-umount \
        --enable-libblkid --enable-blkid \
        --enable-lsblk --enable-dmesg \
        --disable-nls --without-python --without-systemd --disable-bash-completion \
        >> "$BUILDLOG" 2>&1 \
   && make -j12 >> "$BUILDLOG" 2>&1 \
   && make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1; then
    log "✅ util-linux (mount/umount/blkid/lsblk/dmesg)"
else
    log "⚠  util-linux build failed — /proc will not mount on boot (see build log)"
fi

step 9 "which-2.21"
download which-2.21.tar.gz \
    "https://ftp.gnu.org/gnu/which/which-2.21.tar.gz" \
    "https://mirrors.kernel.org/gnu/which/which-2.21.tar.gz"
extract which-2.21.tar.gz which-2.21
cd "$SRC/which-2.21"
./configure --host="$LFS_TGT" --prefix=/usr >> "$BUILDLOG" 2>&1 || fatal "which configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "which make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "which install"
log "✅ which"

step 10 "less-643 (pager)"
download less-643.tar.gz \
    "https://www.greenwoodsoftware.com/less/less-643.tar.gz" \
    "https://ftp.gnu.org/gnu/less/less-643.tar.gz"
extract less-643.tar.gz less-643
cd "$SRC/less-643"
./configure --host="$LFS_TGT" --prefix=/usr >> "$BUILDLOG" 2>&1 || fatal "less configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "less make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "less install"
log "✅ less"

step 11 "strace-6.6 (syscall tracer — thesis demo gold)"
download strace-6.6.tar.xz \
    "https://strace.io/files/6.6/strace-6.6.tar.xz" \
    "https://github.com/strace/strace/releases/download/v6.6/strace-6.6.tar.xz"
extract strace-6.6.tar.xz strace-6.6
cd "$SRC/strace-6.6"
./configure --host="$LFS_TGT" --prefix=/usr --without-libselinux \
    >> "$BUILDLOG" 2>&1 || fatal "strace configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "strace make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "strace install"
log "✅ strace"

step 12 "openssh-9.6p1 — ssh/scp client"
download openssh-9.6p1.tar.gz \
    "https://cdn.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-9.6p1.tar.gz" \
    "https://ftp.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-9.6p1.tar.gz"
extract openssh-9.6p1.tar.gz openssh-9.6p1
cd "$SRC/openssh-9.6p1"
./configure --host="$LFS_TGT" --prefix=/usr --sysconfdir=/etc/ssh \
    --without-selinux-support >> "$BUILDLOG" 2>&1 || fatal "openssh configure"
make  >> "$BUILDLOG" 2>&1 || fatal "openssh make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "openssh install"
log "✅ openssh (ssh, scp, ssh-keygen)"

step 13 "htop-3.2.2 (visual process monitor)"
download htop-3.2.2.tar.xz \
    "https://github.com/htop-dev/htop/releases/download/3.2.2/htop-3.2.2.tar.xz" \
    "https://src.fedoraproject.org/repo/pkgs/htop/htop-3.2.2.tar.xz"
extract htop-3.2.2.tar.xz htop-3.2.2
cd "$SRC/htop-3.2.2"
./configure --host="$LFS_TGT" --prefix=/usr >> "$BUILDLOG" 2>&1 || fatal "htop configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "htop make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "htop install"
log "✅ htop"

step 14 "nano-7.2 (editor)"
download nano-7.2.tar.xz \
    "https://www.nano-editor.org/dist/v7/nano-7.2.tar.xz" \
    "https://ftp.gnu.org/gnu/nano/nano-7.2.tar.xz"
extract nano-7.2.tar.xz nano-7.2
cd "$SRC/nano-7.2"
./configure --host="$LFS_TGT" --prefix=/usr >> "$BUILDLOG" 2>&1 || fatal "nano configure"
make -j12 >> "$BUILDLOG" 2>&1 || fatal "nano make"
make DESTDIR="$LFS" install >> "$BUILDLOG" 2>&1 || fatal "nano install"
log "✅ nano"

step 15 "CA trust store (so https actually works in the built system)"
mkdir -p "$LFS/etc/ssl"
wget -q --timeout=60 --tries=3 -O "$LFS/etc/ssl/cacert.pem" \
    "https://curl.se/ca/cacert.pem" || fatal "CA bundle download"
[ -s "$LFS/etc/ssl/cacert.pem" ] || fatal "CA bundle empty"
printf '[http]\n\tsslCAInfo = /etc/ssl/cacert.pem\n[init]\n\tdefaultBranch = main\n' \
    > "$LFS/etc/gitconfig"
log "✅ CA bundle + git ssl config (profile exports handled by Chapter 7)"

log ""
log "🎉 BASIC TOOLS COMPLETE — 15/15"
log "   added: git curl ssh ping ifconfig route ps free top htop nano less which strace"
exit 0
