#!/usr/bin/env bash
# ============================================================================
# lfs-vulnbox.sh — Optional "Practice Targets" layer (vulnerability boxes)
# Opt-in only: the build script calls this when ENABLE_VULNBOX=true and
# VULNBOX_PACKAGES lists the wanted targets, e.g.  VULNBOX_PACKAGES=juice-shop,dvwa
#
#   juice-shop : OWASP Juice Shop (Node.js web app)  — fast, fully automated
#   dvwa       : Damn Vulnerable Web App (PHP+MySQL) — heavy (MariaDB+PHP+server)
#                EXPERIMENTAL in this version; runs after light stack proves out
#
# Every target degrades gracefully: a failure here does NOT kill the build.
# ============================================================================
set -u

LFS="${LFS:-/mnt/lfs}"
SRC="$LFS/sources"
PKG_LIST="${VULNBOX_PACKAGES:-juice-shop}"
BUILDLOG="$LFS/build-logs/vulnbox-$(date +%Y%m%d-%H%M%S).log"

log(){ echo "[vulnbox] $*"; }
warn(){ log "⚠️  $*"; echo "WARN: $*" >> "$BUILDLOG" 2>&1; }
download(){
    local f="$1"; shift
    [ -s "$SRC/$f" ] && { log "✓ Already downloaded: $f"; return 0; }
    local u
    for u in "$@"; do
        wget -q --timeout=60 --tries=3 -O "$SRC/$f" "$u" && [ -s "$SRC/$f" ] && \
            { log "✓ Downloaded: $f"; return 0; }
    done
    warn "download failed: $f (all mirrors)"; return 1
}

log "=== PRACTICE TARGETS LAYER: $PKG_LIST ==="

has_js=false;   printf '%s' "$PKG_LIST" | grep -q 'juice-shop' && has_js=true
has_dvwa=false; printf '%s' "$PKG_LIST" | grep -q 'dvwa'        && has_dvwa=true

# ------------------------------------------------------------- 1. Juice Shop
if [ "$has_js" = true ]; then
    NODEV="v20.11.0"
    log "--- Juice Shop: node runtime (prebuilt distribution) ---"
    if download "node-$NODEV-linux-x64.tar.xz" "https://nodejs.org/dist/$NODEV/node-$NODEV-linux-x64.tar.xz"; then
        mkdir -p "$LFS/usr/local/bin"
        if tar -xf "$SRC/node-$NODEV-linux-x64.tar.xz" -C "$LFS/usr/local" 2>>"$BUILDLOG"; then
            ln -sfn /usr/local/node-$NODEV-linux-x64/bin/node "$LFS/usr/local/bin/node"
            ln -sfn /usr/local/node-$NODEV-linux-x64/bin/npm  "$LFS/usr/local/bin/npm"
            ln -sfn /usr/local/node-$NODEV-linux-x64/bin/npx  "$LFS/usr/local/bin/npx"
            log "✅ node $NODEV installed to /usr/local/bin"
        else
            warn "node runtime extract failed"
        fi
    fi

    log "--- Juice Shop: the app ---"
    if download "juice-shop-15.4.0.zip" \
        "https://github.com/juice-shop/juice-shop/releases/download/v15.4.0/juice-shop-15.4.0_node16_linux_x64.zip"; then
        mkdir -p "$LFS/opt"
        if ( cd "$LFS/opt" && unzip -oq "$SRC/juice-shop-15.4.0.zip" 2>>"$BUILDLOG" ); then
            log "✅ Juice Shop installed at /opt/juice-shop"
        else
            warn "juice-shop unzip failed"
        fi
    fi
fi

# ------------------------------------------------------------- 2. DVWA (heavy)
if [ "$has_dvwa" = true ]; then
    log "--- DVWA: requires PHP + MySQL-compatible server + web server (HEAVY) ---"
    warn "dvwa stack (mariadb + php + lighttpd) is EXPERIMENTAL in this pipeline version;"
    warn "requested, but it ships in the NEXT pipeline release (after light stack proves out)."
    # Planned order: mariadb (cmake, ~25 min) → php (~8 min) → lighttpd (~1 min)
    #                → dvwa source + db init + full vulnbox-start wiring.
fi

# --------------------------------------------------- 3. /usr/bin/vulnbox-start
mkdir -p "$LFS/usr/bin"
cat > "$LFS/usr/bin/vulnbox-start" << 'VBEOF'
#!/bin/bash
# Starts every installed practice target. Run as:  vulnbox-start
STARTED=0
if [ -x /usr/local/bin/node ] && [ -d /opt/juice-shop ]; then
    (
        cd /opt/juice-shop || exit 1
        if [ -f app.js ]; then
            /usr/local/bin/node app.js > /root/.juice-shop.log 2>&1 &
        elif [ -f app/index.js ]; then
            /usr/local/bin/node app/index.js > /root/.juice-shop.log 2>&1 &
        else
            /usr/local/bin/npm start --silent > /root/.juice-shop.log 2>&1 &
        fi
    )
    echo "🎯 Juice Shop → http://localhost:3000   (log: /root/.juice-shop.log)"
    STARTED=1
fi
if [ "$STARTED" = "0" ]; then
    echo "No practice targets installed on this system."
    echo "Rebuild with ENABLE_VULNBOX=true and VULNBOX_PACKAGES=juice-shop,dvwa"
fi
VBEOF
chmod +x "$LFS/usr/bin/vulnbox-start"

# advertise on the welcome banner
if [ -f "$LFS/etc/lfs-welcome.sh" ] && ! grep -q "vulnbox-start" "$LFS/etc/lfs-welcome.sh"; then
    printf 'echo -e "  \\033[2mPractice targets? Type \\033[31mvulnbox-start\\033[0m\\033[2m to launch them.\\033[0m"\n' \
        >> "$LFS/etc/lfs-welcome.sh"
fi

log "=== PRACTICE TARGETS LAYER DONE ($PKG_LIST) ==="
exit 0
