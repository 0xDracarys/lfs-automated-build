#!/bin/bash
# fix-guest-php.sh — rebuild the demo guest's PHP WITH the mysqli extension.
#
# Bug: DVWA fatals with "Call to undefined function mysqli_connect()" — the
# shipped php-cgi was built without mysqli, so DVWA can never reach MariaDB.
# Rebuilds the SAME php 8.2.13 with the repo's flags (lfs-vulnbox.sh), which
# include --enable-mysqli via bundled mysqlnd (no external deps needed).
#
# Usage (guest must be running; safe to re-run — skips when already fixed):
#   wsl -d <guest> -u root --exec bash /mnt/c/.../fix-guest-php.sh
# After it: restart the targets (vulnbox-stop; vulnbox-start) so lighttpd
# spawns the new php-cgi, then run the DVWA setup + login flow.
# Log: /build-logs/fix-guest-php.log
set -u
LOG=/build-logs/fix-guest-php.log
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
VER=8.2.13

echo "date=$(date -u '+%Y-%m-%dT%H:%M:%SZ') jobs=$J have=$(/usr/bin/php-cgi --version 2>/dev/null | head -1)"
if /usr/bin/php-cgi -m 2>/dev/null | grep -qi '^mysqli$' \
   && /usr/bin/php-cgi -m 2>/dev/null | grep -qi '^pdo_mysql$'; then
  echo "SKIP: mysqli + pdo_mysql already present"
  exit 0
fi

mkdir -p "$SRC"
# PHP's configure demands pkg-config (a tiny build tool, invisible afterwards).
if ! command -v pkg-config >/dev/null 2>&1; then
  echo "bootstrapping pkg-config..."
  curl -fSL --retry 3 --max-time 300 -o "$SRC/pkgcfg.tar.gz" \
    https://pkgconfig.freedesktop.org/releases/pkg-config-0.29.2.tar.gz || exit 1
  rm -rf "$SRC/pkgcfg" && mkdir -p "$SRC/pkgcfg"
  tar -xzf "$SRC/pkgcfg.tar.gz" -C "$SRC/pkgcfg" --strip-components=1
  ( cd "$SRC/pkgcfg" \
    && ./configure --prefix=/usr --disable-nls --with-internal-glib \
    && make -j$J && make install ) || { echo "PKGCONFIG-FAILED" >&2; exit 1; }
  command -v pkg-config && echo "OK: pkg-config bootstrapped"
fi
if ! [ -s "$SRC/php.tar.xz" ]; then
  echo "fetching php $VER..."
  curl -fSL --retry 3 --max-time 900 -o "$SRC/php.tar.xz" \
    "https://www.php.net/distributions/php-$VER.tar.xz" || exit 1
fi
rm -rf "$SRC/php" && mkdir -p "$SRC/php"
tar -xf "$SRC/php.tar.xz" -C "$SRC/php" --strip-components=1

[ -f /usr/bin/php-cgi.pre-committee ] || cp -a /usr/bin/php-cgi /usr/bin/php-cgi.pre-committee
echo "backup at /usr/bin/php-cgi.pre-committee"

# Same flags as lfs-vulnbox.sh (plus explicit mysqlnd, the bundled driver).
( cd "$SRC/php" \
  && ./configure --prefix=/usr --disable-all \
       --enable-cli --enable-cgi --enable-session --enable-filter \
       --enable-mysqli --with-mysqli=mysqlnd \
       --enable-pdo --with-pdo-mysql=mysqlnd \
       --without-pcre-jit --without-libxml --without-pear \
  && make -j$J \
  && make install ) || { echo "BUILD-FAILED" >&2; exit 1; }

/usr/bin/php-cgi -m 2>/dev/null | grep -Ei 'mysqli|mysqlnd|pdo' && echo "OK: db modules present" || { echo "VERIFY-FAILED" >&2; exit 1; }
