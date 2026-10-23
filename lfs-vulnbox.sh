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
warn(){ log "⚠️  $*"; echo "WARN: $*" >> "$BUILDLOG" 2>&1; }
fatal(){ log "❌ $*"; echo "FATAL: $*" >> "$BUILDLOG" 2>&1; exit 1; }
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
has_js=false;  printf '%s' "$PKG_LIST" | grep -q 'juice-shop' && has_js=true
has_dvwa=false; printf '%s' "$PKG_LIST" | grep -q 'dvwa'        && has_dvwa=true
has_wg=false;  printf '%s' "$PKG_LIST" | grep -q 'webgoat'      && has_wg=true

# ============================================================ 1. Juice Shop
if [ "$has_js" = true ]; then
    NODEV="v20.11.0"
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
        if download "juice-shop-15.4.0.zip" \
            "https://github.com/juice-shop/juice-shop/releases/download/v15.4.0/juice-shop-15.4.0_node16_linux_x64.zip" \
            "https://github.com/juice-shop/juice-shop/releases/download/v15.4.0/juice-shop-15.4.0_node18_linux_x64.zip"; then
            mkdir -p "$LFS/opt"
            if ( cd "$LFS/opt" && run unzip -oq "$SRC/juice-shop-15.4.0.zip" ); then
                log "✅ Juice Shop installed at /opt/juice-shop"
            else warn "juice-shop unzip failed"; fi
        fi
    fi
fi

# ============================================================ 2. DVWA stack
if [ "$has_dvwa" = true ]; then
    log "--- DVWA: MySQL server (prebuilt distribution) ---"
    if [ -x "$LFS/opt/mysql/bin/mysqld" ]; then
        log "✓ MySQL already installed"
    else
        if download "mysql-8.0.35-linux-glibc2.28-x86_64.tar.xz" \
            "https://cdn.mysql.com/Downloads/MySQL-8.0/mysql-8.0.35-linux-glibc2.28-x86_64.tar.xz"; then
            mkdir -p "$LFS/opt" "$LFS/usr/local/bin"
            if tar -xf "$SRC/mysql-8.0.35-linux-glibc2.28-x86_64.tar.xz" -C "$LFS/opt" 2>>"$BUILDLOG"; then
                ln -sfn /opt/mysql-8.0.35-linux-glibc2.28-x86_64 "$LFS/opt/mysql"
                log "✅ MySQL 8.0.35 (server + client) at /opt/mysql"
            else warn "mysql extract failed"; fi
        fi
    fi

    log "--- DVWA: PHP 8.2 (compiling; mysqli via bundled mysqlnd) ---"
    if [ ! -x "$LFS/usr/bin/php-cgi" ]; then
        if download "php-8.2.13.tar.xz" \
            "https://www.php.net/distributions/php-8.2.13.tar.xz" \
            "https://github.com/php/php-src/archive/refs/tags/php-8.2.13.tar.gz"; then
            [ -d "$SRC/php-8.2.13" ] || { [ -d "$SRC/php-src-php-8.2.13" ] || run tar -xf "$SRC/php-8.2.13.tar.xz" -C "$SRC"; }
            cd "$SRC/php-8.2.13" 2>/dev/null || cd "$SRC/php-src-php-8.2.13" || warn "php dir missing"
            ./configure --host="$LFS_TGT" --prefix=/usr --disable-all \
                --enable-cli --enable-cgi --enable-session --enable-filter --enable-mysqli \
                --with-zlib --without-pcre-jit --without-libxml >> "$BUILDLOG" 2>&1 \
                && run make -j12 && run make DESTDIR="$LFS" install \
                || warn "php build/install failed"
        fi
        [ -x "$LFS/usr/bin/php-cgi" ] && log "✅ PHP 8.2 (cli + fastcgi)" || warn "php missing"
    else log "✓ PHP already installed"; fi

    log "--- DVWA: lighttpd 1.4.74 (compiling) ---"
    if [ ! -x "$LFS/usr/sbin/lighttpd" ]; then
        if download "lighttpd-1.4.74.tar.gz" \
            "https://download.lighttpd.net/lighttpd/releases-1.4.x/lighttpd-1.4.74.tar.gz"; then
            [ -d "$SRC/lighttpd-1.4.74" ] || run tar -xf "$SRC/lighttpd-1.4.74.tar.gz" -C "$SRC"
            cd "$SRC/lighttpd-1.4.74"
            ./configure --host="$LFS_TGT" --prefix=/usr --without-zlib >> "$BUILDLOG" 2>&1 \
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
                [ -n "$JDKDIR" ] && ln -sfn "$JDKDIR" "$LFS/usr/local/jdk" \
                    && ln -sfn /usr/local/jdk/bin/java "$LFS/usr/local/bin/java" \
                    && ln -sfn /usr/local/jdk/bin/javac "$LFS/usr/local/bin/javac" \
                    && log "✅ JDK 17 at /usr/local/jdk"
            else warn "jdk extract failed"; fi
        fi
    fi
    if download "webgoat-8.2.2.jar" \
        "https://github.com/WebGoat/WebGoat/releases/download/v8.2.2/webgoat-8.2.2.jar"; then
        mkdir -p "$LFS/opt/webgoat"
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
        echo -e "${Y}… initializing MySQL data directory (first boot, ~1 min)${R}"
        /opt/mysql/bin/mysqld --initialize-insecure \
            --datadir=/opt/mysql-data --basedir=/opt/mysql >> /root/.mysqld-init.log 2>&1
    fi
    /opt/mysql/bin/mysqld --datadir=/opt/mysql-data --basedir=/opt/mysql \
        --port=3306 --bind-address=127.0.0.1 --skip-grant-tables=OFF \
        > /root/.mysqld.log 2>&1 &
    sleep 2
    if /opt/mysql/bin/mysqladmin ping --silent 2>/dev/null; then
        /opt/mysql/bin/mysql -e "CREATE DATABASE IF NOT EXISTS dvwa; CREATE USER IF NOT EXISTS 'dvwa'@'localhost' IDENTIFIED BY 'vulpass';
            GRANT ALL ON dvwa.* TO 'dvwa'@'localhost';" 2>/dev/null || true
        echo -e "${G}🎯 MySQL${R}     → 127.0.0.1:3306 (db: dvwa, user: dvwa, pass: vulpass)"
    else
        echo -e "${Y}⚠ MySQL did not come up — check /root/.mysqld.log${R}"
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
