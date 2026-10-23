#!/usr/bin/env bash
# ============================================================================
# lfs-vulnbox.sh — "Practice Targets" layer (FULL HOUSE version)
# Opt-in only: the build calls this when ENABLE_VULNBOX=true and
# VULNBOX_PACKAGES lists targets, e.g. VULNBOX_PACKAGES=juice-shop,dvwa,webgoat
#
#   juice-shop : OWASP Juice Shop (prebuilt node bundle) — port 3000
#   dvwa       : Damn Vulnerable Web App  — lighttpd + PHP + MySQL, port 80/9000
#   webgoat    : OWASP WebGoat 8 (Java)   — port 8080 (+ WebWolf 9090)
#
# Graceful by design: a target that fails only logs a warning — never kills
# the build. Launcher: /usr/bin/vulnbox-start (+ vulnbox-stop).
# ============================================================================
set -u

LFS="${LFS:-/mnt/lfs}"
LFS_TGT="${LFS_TGT:-x86_64-lfs-linux-gnu}"
SRC="$LFS/sources"
PKG_LIST="${VULNBOX_PACKAGES:-juice-shop}"
BUILDLOG="$LFS/build-logs/vulnbox-$(date +%Y%m%d-%H%M%S).log"
export CPPFLAGS="${CPPFLAGS:--I$LFS/usr/include}"
export LDFLAGS="${LDFLAGS:--L$LFS/usr/lib}"
export PKG_CONFIG_PATH="${PKG_CONFIG_PATH:-$LFS/usr/lib/pkgconfig}"

log(){ echo "[vulnbox] $*"; }
warn(){ log "⚠️  $*"; echo "WARN: $*" >> "$BUILDLOG" 2>&1; tail -n 8 "$BUILDLOG" 2>/dev/null | sed 's/^/[vulnbox-log] /'; }
fatal(){ log "❌ $*"; echo "FATAL: $*" >> "$BUILDLOG" 2>&1; tail -n 25 "$BUILDLOG" 2>/dev/null | sed 's/^/[vulnbox-log] /'; exit 1; }
download(){
    local f="$1"; shift
    [ -s "$SRC/$f" ] && { log "✓ Already downloaded: $f"; return 0; }
    local u
    for u in "$@"; do
        wget -q --timeout=90 --tries=3 -O "$SRC/$f" "$u" && [ -s "$SRC/$f" ] && \
            { log "✓ Downloaded: $f"; return 0; }
    done
    warn "download failed: $f"; return 1
}
run(){ echo "+ $*" >> "$BUILDLOG" 2>&1; "$@" >> "$BUILDLOG" 2>&1 || return 1; }

log "=== PRACTICE TARGETS LAYER: $PKG_LIST ==="

# Destination dirs exist BEFORE any download success/failure branch — v3 lesson:
# $LFS/opt was previously created only inside branches that had already
# succeeded, so every later copy silently failed when the first download died.
mkdir -p "$LFS/opt" "$LFS/opt/webgoat" "$LFS/usr/lib" 2>>"$BUILDLOG" || warn "opt dirs create failed"
has_js=false;  printf '%s' "$PKG_LIST" | grep -q 'juice-shop' && has_js=true
has_dvwa=false; printf '%s' "$PKG_LIST" | grep -q 'dvwa'        && has_dvwa=true
has_wg=false;  printf '%s' "$PKG_LIST" | grep -q 'webgoat'      && has_wg=true

# ============================================================ 1. Juice Shop
if [ "$has_js" = true ]; then
    # v20.x bundles ship for node22/node24/node26 — pin node22 to match them.
    # v3.2 lesson: Juice Shop 20.x bundles an ESM-only dependency (proxy-agent);
    # Node enabled require() of ES modules starting 22.12 — 22.11 died with
    # ERR_REQUIRE_ESM on boot. Pin a 22.x with require(ESM) enabled.
    NODEV="v22.14.0"
    log "--- Juice Shop ---"
    if [ -x "$LFS/usr/local/bin/node" ]; then
        log "✓ node already installed"
    else
        if download "node-$NODEV-linux-x64.tar.xz" "https://nodejs.org/dist/$NODEV/node-$NODEV-linux-x64.tar.xz"; then
            mkdir -p "$LFS/usr/local/bin"
            if tar -xf "$SRC/node-$NODEV-linux-x64.tar.xz" -C "$LFS/usr/local" 2>>"$BUILDLOG"; then
                ln -sfn "/usr/local/node-$NODEV-linux-x64/bin/node" "$LFS/usr/local/bin/node"
                ln -sfn "/usr/local/node-$NODEV-linux-x64/bin/npm"  "$LFS/usr/local/bin/npm"
                ln -sfn "/usr/local/node-$NODEV-linux-x64/bin/npx"  "$LFS/usr/local/bin/npx"
                log "✅ node $NODEV installed"
            else warn "node extract failed"; fi
        fi
    fi
    if [ -d "$LFS/opt/juice-shop" ]; then
        log "✓ Juice Shop already installed"
    else
        # NOTE: linux x64 bundles are .tgz (v20 era); the old v15 .zip URL 404'd.
        if download "juice-shop-20.3.0_node22.tgz" \
            "https://github.com/juice-shop/juice-shop/releases/download/v20.3.0/juice-shop-20.3.0_node22_linux_x64.tgz" \
            "https://github.com/juice-shop/juice-shop/releases/download/v20.2.0/juice-shop-20.2.0_node22_linux_x64.tgz"; then
            rm -rf "$LFS/opt/juice-shop-tmp"
            mkdir -p "$LFS/opt/juice-shop-tmp"
            if tar -xzf "$SRC/juice-shop-20.3.0_node22.tgz" -C "$LFS/opt/juice-shop-tmp" 2>>"$BUILDLOG"; then
                top="$(find "$LFS/opt/juice-shop-tmp" -mindepth 1 -maxdepth 1 -type d | head -1)"
                if [ -n "$top" ] && [ "$(find "$LFS/opt/juice-shop-tmp" -mindepth 1 -maxdepth 1 | wc -l)" = "1" ]; then
                    mv "$top" "$LFS/opt/juice-shop"
                else
                    mv "$LFS/opt/juice-shop-tmp" "$LFS/opt/juice-shop"
                fi
                rm -rf "$LFS/opt/juice-shop-tmp"
                log "✅ Juice Shop installed at /opt/juice-shop"
            else warn "juice-shop extract failed"; fi
        fi
    fi
fi

# ============================================================ 2. DVWA stack
if [ "$has_dvwa" = true ]; then
    log "--- DVWA: MariaDB 11.4 server (prebuilt bintar, MySQL-compatible) ---"
    if [ -x "$LFS/opt/mysql/bin/mysqld" ]; then
        log "✓ MariaDB already installed"
    else
        # MySQL's CDN purged the 8.0.x prebuilt tarballs (all 404 now);
        # MariaDB's archive keeps stable bintars — DVWA speaks to it fine.
        if download "mariadb-11.4.5-linux-systemd-x86_64.tar.gz" \
            "https://archive.mariadb.org/mariadb-11.4.5/bintar-linux-systemd-x86_64/mariadb-11.4.5-linux-systemd-x86_64.tar.gz"; then
            mkdir -p "$LFS/opt" "$LFS/usr/local/bin"
            if tar -xzf "$SRC/mariadb-11.4.5-linux-systemd-x86_64.tar.gz" -C "$LFS/opt" 2>>"$BUILDLOG"; then
                ln -sfn /opt/mariadb-11.4.5-linux-systemd-x86_64 "$LFS/opt/mysql"
                # v3.1 WSL-import lesson: the container's libncursesw replaced
                # $LFS/usr/lib/libncursesw.so.6.4 (the LFS-built version is
                # self-contained; Debian's dlopens a separate libtinfo.so.6 the
                # minimal root doesn't have) — every binary in the guest then
                # died with "libtinfo.so.6: cannot open". Only ADD missing
                # libs, never overwrite anything the root already has.
                ship_missing_lib(){ # copy container lib ONLY if the target lacks it
                    local src="$1" name
                    name="$(basename "$src")"
                    [ -e "$LFS/usr/lib/$name" ] && return 0
                    cp -aL "$src" "$LFS/usr/lib/$name" 2>>"$BUILDLOG"
                }
                for pat in libaio.so* libcrypt.so*; do
                    for lib in /lib/x86_64-linux-gnu/$pat /usr/lib/x86_64-linux-gnu/$pat; do
                        [ -e "$lib" ] && ship_missing_lib "$lib"
                    done
                done
                # libcrypt.so.1 may be a tiny ld-script stub in some distros —
                # make sure a REAL ELF (>=32KB) landed in the target.
                if [ -e "$LFS/usr/lib/libcrypt.so.1" ] && \
                   [ "$(stat -c%s "$LFS/usr/lib/libcrypt.so.1" 2>/dev/null)" -lt 32768 ]; then
                    for real in $(find /lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu \
                                   -name 'libcrypt.so.*.*.*' 2>/dev/null); do
                        if [ "$(stat -c%s "$real")" -ge 32768 ]; then
                            cp -aL "$real" "$LFS/usr/lib/libcrypt.so.1"
                            break
                        fi
                    done
                fi
                # Self-healing dependency scan: MariaDB's binaries list their own
                # NEEDED libs — copy any the minimal root lacks straight from the
                # container, so libsystemd.so.0 and friends arrive automatically
                # instead of needing one-off hand-shipping per visit.
                if [ -e "$LFS/opt/mysql/bin/mysqld" ]; then
                    while read -r soname; do
                        case "$soname" in
                            libc.so*|libm.so*|libdl*|libpthread*|librt*|ld-linux*) continue ;;
                        esac
                        [ -e "$LFS/usr/lib/$soname" ] && continue
                        found=""
                        for d in /usr/lib/x86_64-linux-gnu /lib/x86_64-linux-gnu /usr/lib /lib; do
                            if [ -e "$d/$soname" ]; then found="$d/$soname"; break; fi
                        done
                        if [ -n "$found" ]; then
                            cp -aL "$found" "$LFS/usr/lib/$soname" 2>>"$BUILDLOG"
                        else
                            log "warn: mysqld needs $soname but container lacks it"
                        fi
                    done < <(objdump -p "$LFS/opt/mysql/bin/mysqld" 2>/dev/null | awk '/NEEDED/{print $2}')
                fi
                log "✅ MariaDB 11.4.5 (server + client) at /opt/mysql (compat path)"
            else warn "mariadb extract failed"; fi
        fi
    fi

    log "--- DVWA: PHP 8.2 (compiling; mysqli via bundled mysqlnd) ---"
    if [ ! -x "$LFS/usr/bin/php-cgi" ]; then
        if download "php-8.2.13.tar.xz" \
            "https://www.php.net/distributions/php-8.2.13.tar.xz" \
            "https://github.com/php/php-src/archive/refs/tags/php-8.2.13.tar.gz"; then
            [ -d "$SRC/php-8.2.13" ] || { [ -d "$SRC/php-src-php-8.2.13" ] || run tar -xf "$SRC/php-8.2.13.tar.xz" -C "$SRC"; }
            # cd in the PARENT shell (a ( cd … ) test if would only move the
            # subshell — v3.1 lesson: ./configure then ran from the wrong cwd).
            prev_dir="$(pwd)"
            if [ -d "$SRC/php-8.2.13" ] && cd "$SRC/php-8.2.13"; then
                php_dir="$SRC/php-8.2.13"
            elif [ -d "$SRC/php-src-php-8.2.13" ] && cd "$SRC/php-src-php-8.2.13"; then
                php_dir="$SRC/php-src-php-8.2.13"
            else
                php_dir=""
            fi
            if [ -n "$php_dir" ]; then
                # --disable-all configures without zlib (the minimal root has no
                # guaranteed libz for cross-linking) and without libxml.
                ./configure --host="$LFS_TGT" --prefix=/usr --disable-all \
                    --enable-cli --enable-cgi --enable-session --enable-filter --enable-mysqli \
                    --without-pcre-jit --without-libxml >> "$BUILDLOG" 2>&1 \
                    && run make -j12 && run make DESTDIR="$LFS" install \
                    || warn "php build/install failed"
                cd "$prev_dir"
            else
                warn "php source dir missing (extract failed?)"
            fi
        fi
        [ -x "$LFS/usr/bin/php-cgi" ] && log "✅ PHP 8.2 (cli + fastcgi)" || warn "php missing"
    else log "✓ PHP already installed"; fi

    log "--- DVWA: lighttpd 1.4.74 (compiling) ---"
    if [ ! -x "$LFS/usr/sbin/lighttpd" ]; then
        if download "lighttpd-1.4.74.tar.gz" \
            "https://download.lighttpd.net/lighttpd/releases-1.4.x/lighttpd-1.4.74.tar.gz"; then
            [ -d "$SRC/lighttpd-1.4.74" ] || run tar -xf "$SRC/lighttpd-1.4.74.tar.gz" -C "$SRC"
            cd "$SRC/lighttpd-1.4.74"
            ./configure --host="$LFS_TGT" --prefix=/usr --without-zlib --without-pcre2 --without-bzip2 >> "$BUILDLOG" 2>&1 \
                && run make -j12 && run make DESTDIR="$LFS" install \
                || warn "lighttpd build/install failed"
        fi
        [ -x "$LFS/usr/sbin/lighttpd" ] && log "✅ lighttpd" || warn "lighttpd missing"
    else log "✓ lighttpd already installed"; fi

    log "--- DVWA: the application + web config ---"
    if download "dvwa-master.tar.gz" \
        "https://github.com/digininja/DVWA/archive/refs/heads/master.tar.gz"; then
        if [ ! -d "$LFS/opt/dvwa" ]; then
            [ -d "$SRC/DVWA-master" ] || run tar -xf "$SRC/dvwa-master.tar.gz" -C "$SRC"
            rm -rf "$LFS/opt/dvwa"; cp -r "$SRC/DVWA-master" "$LFS/opt/dvwa" 2>>"$BUILDLOG" \
                && { rm -rf "$LFS/opt/dvwa/.git"; log "✅ DVWA app at /opt/dvwa"; } \
                || warn "dvwa copy failed"
        fi
    fi
    if [ -d "$LFS/opt/dvwa" ]; then
        mkdir -p "$LFS/opt/dvwa/config" "$LFS/etc/lighttpd"
        # DVWA config with local mysql creds (vulnbox boot creates the db)
        [ -f "$LFS/opt/dvwa/config/config.inc.php" ] || cp "$LFS/opt/dvwa/config/config.inc.php.dist" \
            "$LFS/opt/dvwa/config/config.inc.php" 2>>"$BUILDLOG" || true
        sed -i "s/^\$_DVWA\[ 'db_server' \].*/\$_DVWA[ 'db_server' ] = '127.0.0.1';/; s/^\$_DVWA\[ 'db_database' \].*/\$_DVWA[ 'db_database' ] = 'dvwa';/; s/^\$_DVWA\[ 'db_user' \].*/\$_DVWA[ 'db_user' ] = 'dvwa';/; s/^\$_DVWA\[ 'db_password' \].*/\$_DVWA[ 'db_password' ] = 'vulpass';/" \
            "$LFS/opt/dvwa/config/config.inc.php" 2>>"$BUILDLOG" || warn "dvwa config sed"
        cat > "$LFS/etc/lighttpd/lighttpd.conf" << 'LT_EOF'
server.port          = 80
server.bind          = "0.0.0.0"
server.username      = "root"
server.groupname     = "root"
server.document-root = "/opt/dvwa"
server.errorlog      = "/root/.lighttpd-error.log"
server.modules = ( "mod_fastcgi", "mod_access", "mod_indexfile" )
index-file.names = ( "index.php", "index.html" )
mimetype.assign = ( ".css" => "text/css", ".js" => "text/javascript",
                    ".png" => "image/png", ".jpg" => "image/jpeg", ".ico" => "image/x-icon" )
fastcgi.server = ( ".php" => (( "bin-path" => "/usr/bin/php-cgi",
                                "socket" => "/tmp/php.socket",
                                "max-procs" => 2,
                                "bin-environment" => ( "PHP_FCGI_CHILDREN" => "4" ) )) )
LT_EOF
        log "✅ lighttpd config (docroot /opt/dvwa)"
    fi
fi

# ============================================================ 3. WebGoat (Java)
if [ "$has_wg" = true ]; then
    log "--- WebGoat: JDK 17 (prebuilt distribution) ---"
    if [ -x "$LFS/usr/local/jdk/bin/java" ]; then
        log "✓ JDK already installed"
    else
        if download "jdk17-linux-x64.tar.gz" \
            "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse"; then
            mkdir -p "$LFS/usr/local"
            if tar -xzf "$SRC/jdk17-linux-x64.tar.gz" -C "$LFS/usr/local" 2>>"$BUILDLOG"; then
                JDKDIR=$(find "$LFS/usr/local" -maxdepth 1 -type d -name 'jdk-17*' | head -1)
                # v3.1 lesson: find() returns the ABSOLUTE /mnt/lfs/... path, and
                # symlinks built from it dangle in any other environment (the
                # path only exists on the builder). Link RELATIVE to the dir.
                JDKBASE=$(basename "$JDKDIR")
                [ -n "$JDKDIR" ] && (cd "$LFS/usr/local" && ln -sfn "$JDKBASE" jdk) \
                    && ln -sfn /usr/local/jdk/bin/java "$LFS/usr/local/bin/java" \
                    && ln -sfn /usr/local/jdk/bin/javac "$LFS/usr/local/bin/javac" \
                    && log "✅ JDK 17 at /usr/local/jdk"
            else warn "jdk extract failed"; fi
        fi
    fi
    mkdir -p "$LFS/opt/webgoat"
    if download "webgoat-8.2.2.jar" \
        "https://github.com/WebGoat/WebGoat/releases/download/v8.2.2/webgoat-server-8.2.2.jar"; then
        cp "$SRC/webgoat-8.2.2.jar" "$LFS/opt/webgoat/" && log "✅ WebGoat 8.2.2 jar at /opt/webgoat"
    fi
    if download "webwolf-8.2.2.jar" \
        "https://github.com/WebGoat/WebGoat/releases/download/v8.2.2/webwolf-8.2.2.jar"; then
        cp "$SRC/webwolf-8.2.2.jar" "$LFS/opt/webgoat/" && log "✅ WebWolf 8.2.2 jar"
    fi
fi

# ==================================================== 4. /usr/bin launchers
mkdir -p "$LFS/usr/bin"
cat > "$LFS/usr/bin/vulnbox-start" << 'VBEOF'
#!/bin/bash
# Starts every installed practice target. Run as:  vulnbox-start
R='\033[0m'; G='\033[1;32m'; Y='\033[1;33m'
STARTED=0

if [ -x /usr/local/bin/node ] && [ -d /opt/juice-shop ]; then
    ( cd /opt/juice-shop || exit 1
      if [ -f app.js ]; then /usr/local/bin/node app.js > /root/.juice-shop.log 2>&1 &
      elif [ -f app/index.js ]; then /usr/local/bin/node app/index.js > /root/.juice-shop.log 2>&1 &
      else /usr/local/bin/npm start --silent > /root/.juice-shop.log 2>&1 &
      fi )
    echo -e "${G}🎯 Juice Shop${R}  → http://localhost:3000  (log: /root/.juice-shop.log)"
    STARTED=1
fi

if [ -x /opt/mysql/bin/mysqld ] && [ -d /opt/dvwa ]; then
    if [ ! -d /opt/mysql-data/mysql ]; then
        echo -e "${Y}… initializing MariaDB data directory (first boot, ~1 min)${R}"
        # MariaDB init ≠ MySQL init: use mariadb-install-db when present.
        if [ -x /opt/mysql/bin/mariadb-install-db ]; then
            /opt/mysql/bin/mariadb-install-db \
                --datadir=/opt/mysql-data --basedir=/opt/mysql \
                --auth-root-authentication-method=normal --skip-test-db \
                >> /root/.mysqld-init.log 2>&1
        else
            TERM=dumb /opt/mysql/bin/mysqld --initialize-insecure \
                --datadir=/opt/mysql-data --basedir=/opt/mysql >> /root/.mysqld-init.log 2>&1
        fi
    fi
    /opt/mysql/bin/mysqld --datadir=/opt/mysql-data --basedir=/opt/mysql \
        --port=3306 --bind-address=127.0.0.1 \
        > /root/.mysqld.log 2>&1 &
    sleep 3
    if TERM=dumb /opt/mysql/bin/mysql -e "SELECT 1" >/dev/null 2>&1; then
        TERM=dumb /opt/mysql/bin/mysql -e "CREATE DATABASE IF NOT EXISTS dvwa; CREATE USER IF NOT EXISTS 'dvwa'@'localhost' IDENTIFIED BY 'vulpass';
            GRANT ALL ON dvwa.* TO 'dvwa'@'localhost';" 2>/dev/null || true
        echo -e "${G}🎯 MariaDB${R}  → 127.0.0.1:3306 (db: dvwa, user: dvwa, pass: vulpass)"
    else
        echo -e "${Y}⚠ MariaDB did not come up — check /root/.mysqld.log /root/.mysqld-init.log${R}"
    fi
    if [ -x /usr/sbin/lighttpd ]; then
        /usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf > /root/.lighttpd.log 2>&1 &
        sleep 1
        echo -e "${G}🎯 DVWA${R}      → http://localhost/  (login: admin / password, click 'Create / Reset Database' on first visit)"
    fi
    STARTED=1
fi

if [ -x /usr/local/jdk/bin/java ] && [ -f /opt/webgoat/webgoat-8.2.2.jar ]; then
    (
        cd /opt/webgoat
        /usr/local/jdk/bin/java -jar webgoat-8.2.2.jar --server.port=8080 > /root/.webgoat.log 2>&1 &
        sleep 1
        [ -f webwolf-8.2.2.jar ] && /usr/local/jdk/bin/java -jar webwolf-8.2.2.jar --server.port=9090 > /root/.webwolf.log 2>&1 &
    )
    echo -e "${G}🎯 WebGoat${R}   → http://localhost:8080/WebGoat (register new user; WebWolf → :9090)"
    STARTED=1
fi

if [ "$STARTED" = "0" ]; then
    echo "No practice targets installed on this system."
    echo "Rebuild with ENABLE_VULNBOX=true and VULNBOX_PACKAGES=juice-shop,dvwa,webgoat"
fi
VBEOF
chmod +x "$LFS/usr/bin/vulnbox-start"

cat > "$LFS/usr/bin/vulnbox-stop" << 'VBS_EOF'
#!/bin/bash
# Stops practice targets.  Run as:  vulnbox-stop
pkill -f "node.*juice-shop" 2>/dev/null && echo "stopped Juice Shop"
pkill -f "lighttpd"          2>/dev/null && echo "stopped lighttpd (DVWA)"
pkill -f "mysqld"            2>/dev/null && echo "stopped MySQL"
pkill -f "webgoat-8.2.2.jar" 2>/dev/null && echo "stopped WebGoat"
pkill -f "webwolf-8.2.2.jar" 2>/dev/null && echo "stopped WebWolf"
exit 0
VBS_EOF
chmod +x "$LFS/usr/bin/vulnbox-stop"

# advertise on the welcome banner
if [ -f "$LFS/etc/lfs-welcome.sh" ] && ! grep -q "vulnbox-start" "$LFS/etc/lfs-welcome.sh"; then
    printf 'echo -e "  \\033[2mPractice targets? Type \\033[31mvulnbox-start\\033[0m\\033[2m to launch them, or \\033[33mvulnbox-stop\\033[0m\\033[2m to stop.\\033[0m"\n' \
        >> "$LFS/etc/lfs-welcome.sh"
fi

log "=== PRACTICE TARGETS LAYER DONE ($PKG_LIST) ==="
exit 0
