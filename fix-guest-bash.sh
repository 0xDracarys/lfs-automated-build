#!/bin/bash
# fix-guest-bash.sh — repair interactive line editing in the demo guest's bash
# while keeping the x86_64-lfs-linux-gnu triplet the demo story relies on.
#
# Bug: the shipped /bin/bash links only libncursesw, not libreadline, so arrow
# keys, history search and tab completion misbehave on a live terminal.
# Fix: rebuild the SAME bash 5.2.15 against readline, forcing the lfs triplet
# explicitly (config.guess would otherwise stamp x86_64-pc-linux-gnu).
#
# Usage (guest must be running; safe to re-run — skips when already fixed):
#   wsl -d <guest> -u root --exec bash /mnt/c/.../fix-guest-bash.sh
# Verify line editing for real over a PTY (from Windows, key in ~/.ssh):
#   ssh -i ~/.ssh/lfs_demo -t root@localhost "bash -i -c 'bind -v'" | head -3
# Log: /build-logs/fix-guest-bash.log
set -u
LOG=/build-logs/fix-guest-bash.log
mkdir -p /build-logs
if [ -z "${LOGGED:-}" ]; then
  export LOGGED=1
  echo "logging to $LOG"
  exec "$0" "$@" 2>&1 | tee "$LOG"
  echo "tee-exit=$?"
  exit 0
fi

J=$(nproc 2>/dev/null || echo 4)
SRC=/tmp/committee-src
TRIPLET=x86_64-lfs-linux-gnu

already_fixed() {
  ldd /bin/bash 2>/dev/null | grep -q libreadline \
    && /bin/bash --version 2>/dev/null | head -1 | grep -q "$TRIPLET"
}

echo "date=$(date -u '+%Y-%m-%dT%H:%M:%SZ') jobs=$J"
if already_fixed; then
  echo "SKIP: /bin/bash already links readline and reports $TRIPLET"
  exit 0
fi

if ! [ -f /usr/lib/libreadline.so ]; then
  echo "FATAL: /usr/lib/libreadline.so missing — build+install readline 8.2 first" >&2
  exit 1
fi

mkdir -p "$SRC"
if ! [ -s "$SRC/bash.tar.gz" ]; then
  echo "fetching bash 5.2.15..."
  curl -fSL --retry 3 --max-time 600 -o "$SRC/bash.tar.gz" \
    https://ftp.gnu.org/gnu/bash/bash-5.2.15.tar.gz || exit 1
fi
rm -rf "$SRC/bash" && mkdir -p "$SRC/bash"
tar -xzf "$SRC/bash.tar.gz" -C "$SRC/bash" --strip-components=1

[ -f /bin/bash.pre-committee ] || cp -a /bin/bash /bin/bash.pre-committee
echo "backup at /bin/bash.pre-committee"

( cd "$SRC/bash" \
  && ./configure --build=$TRIPLET --host=$TRIPLET --prefix=/usr \
       --without-bash-malloc --disable-nls \
       --with-installed-readline --docdir=/usr/share/doc/bash-5.2.15 \
  && make -j$J \
  && make install ) || { echo "BUILD-FAILED" >&2; exit 1; }

/bin/bash --version | head -1
if already_fixed; then
  echo "OK: bash fixed — readline linked, triplet $TRIPLET"
  echo 'int main(void){return 42;}' | gcc -xc -o /tmp/fgb - && /tmp/fgb; rc=$?
  rm -f /tmp/fgb
  [ $rc -eq 42 ] && echo "OK: toolchain smoke (exit 42)" || echo "WARN: toolchain smoke rc=$rc"
  exit 0
fi

echo "VERIFY-FAILED, restoring backup" >&2
cp -af /bin/bash.pre-committee /bin/bash
exit 1
