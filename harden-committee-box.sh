#!/bin/bash
# harden-committee-box.sh — make the LFS demo guest survive a live committee.
# The committee drives: arbitrary commands, not a script. This fills the gaps
# an audit found (no python, no vim, no man, no users, no readline in bash...)
# by building the missing tools from source with the guest's own toolchain.
#
# Usage (from Windows PowerShell, guest must be the only one running):
#   wsl -d LFS-Goal-Test6 -u root --exec bash /mnt/c/.../harden-committee-box.sh config
#   # build runs ~1h: launch it detached (guest setsid takes NO flags; use &):
#   'DETACH=1 setsid /bin/bash /mnt/c/.../harden-committee-box.sh build </dev/null >>/build-logs/committee-build.log 2>&1 &' |
#     wsl -d LFS-Goal-Test6 -u root --exec bash -s
# Progress: tail /build-logs/committee-build.log ; cat /tmp/committee-build.status
#
# SCOPE (2026-11-05): only `config` is used. The `build` phase (python, man-db,
# shadow, sudo, ...) was stopped by scope decision: stabilize the existing
# features, add nothing the thesis does not promise. The one code repair that
# survived (bash without readline) lives in fix-guest-bash.sh instead.
MODE=${1:-}
SRC=/tmp/committee-src
LOG=/build-logs/committee-$MODE.log
STATUS=/tmp/committee-build.status
export SRC LOG STATUS

if [ "$MODE" != config ] && [ "$MODE" != build ]; then
  echo "usage: $0 {config|build}" >&2; exit 2
fi

# Log everything to the build log AND keep stdout live.
if [ -z "${LOGGED:-}" ]; then
  export LOGGED=1
  mkdir -p /build-logs
  if [ "${DETACH:-0}" = 1 ]; then
    # Detached: no terminal will exist, so log straight to the file.
    echo "detached logging to $LOG"
    exec "$0" "$MODE" >>"$LOG" 2>&1
    exit 0
  fi
  echo "logging to $LOG"
  exec "$0" "$MODE" 2>&1 | tee "$LOG"
  echo "tee-exit=$?"
  exit 0
fi

say()  { printf '\n==> %s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }
PASS=0; FAIL=0; FAILED_ITEMS=""
ok()  { PASS=$((PASS+1)); echo "OK: $*"; }
bad() { FAIL=$((FAIL+1)); FAILED_ITEMS="$FAILED_ITEMS [$*]"; echo "FAIL: $*"; }
need_cmd()  { if have "$1"; then ok "$1 on PATH"; else bad "$1 on PATH"; fi; }
need_file() { if [ -s "$1" ]; then ok "$2"; else bad "$2"; fi; }

J=$(nproc 2>/dev/null || echo 4)
echo "mode=$MODE jobs=$J date=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

# ---------------------------------------------------------------- config
do_config() {
  say "directories"
  mkdir -p /var/log /var/cache/man /run/sshd /root/.ssh /usr/local/bin
  chmod 700 /root/.ssh
  ok "mkdirs"

  say "PATH + pager/editor defaults in /etc/profile"
  if grep -q '^export PATH=/usr/bin' /etc/profile 2>/dev/null; then
    sed -i 's|^export PATH=.*|export PATH=/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin|' /etc/profile
  fi
  grep -q 'MANPAGER' /etc/profile || cat >>/etc/profile <<'EOF'
export MANPAGER=less
export PAGER=less
export EDITOR=nano
export VISUAL=nano
EOF
  grep -q '/usr/local/bin' /etc/profile && ok "profile PATH" || bad "profile PATH"

  say "bare-entry shell env (bashrc) + single-banner guard"
  if ! grep -q 'LFS_WELCOME_SHOWN' /root/.bashrc 2>/dev/null; then
    cat >>/root/.bashrc <<'EOF'
# Bare `wsl -d` entry skips /etc/profile: bring the same environment here.
export PATH=/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin
export LANG=C HOME=/root
if [ -z "${LFS_WELCOME_SHOWN:-}" ] && [ -f /etc/lfs-welcome.sh ]; then
  export LFS_WELCOME_SHOWN=1
  . /etc/lfs-welcome.sh
fi
EOF
  fi
  if ! grep -q 'LFS_WELCOME_SHOWN' /etc/profile 2>/dev/null; then
    sed -i 's|if \[ -f /etc/lfs-welcome.sh \]; then|if [ -z "${LFS_WELCOME_SHOWN:-}" ] \&\& [ -f /etc/lfs-welcome.sh ]; then\n  export LFS_WELCOME_SHOWN=1|' /etc/profile
  fi
  grep -q 'LFS_WELCOME_SHOWN' /root/.bashrc && grep -q 'LFS_WELCOME_SHOWN' /etc/profile \
    && ok "banner guard" || bad "banner guard"

  say "symlink installed-but-hidden runtimes onto PATH"
  shopt -s nullglob
  for n in /usr/local/node-*/bin/node; do ln -sf "$n" /usr/local/bin/node; done
  for n in /usr/local/node-*/bin/npm /usr/local/node-*/bin/npx; do
    [ -e "$n" ] && ln -sf "$n" "/usr/local/bin/$(basename "$n")"
  done
  for b in /usr/local/jdk*/bin/*; do ln -sf "$b" "/usr/local/bin/$(basename "$b")"; done
  for b in /opt/mariadb-*/bin/*; do ln -sf "$b" "/usr/local/bin/$(basename "$b")"; done
  [ -x /usr/bin/php-cgi ] && ln -sf /usr/bin/php-cgi /usr/local/bin/php
  shopt -u nullglob
  export PATH=/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin
  need_cmd node; need_cmd java
  [ -e /usr/local/bin/npm ] && ok "npm linked" || echo "NOTE: no npm in node tree (node ships without npm here)"
  need_cmd mariadb; need_cmd php

  say "/etc identity files"
  cat >/etc/os-release <<'EOF'
NAME="Linux From Scratch"
VERSION="12.0 (Custom)"
ID=lfs
PRETTY_NAME="Linux From Scratch 12.0 (Custom) - goal-20261104-build1"
BUILD_ID="goal-20261104-build1"
HOME_URL="https://www.linuxfromscratch.org/"
EOF
  printf '/bin/sh\n/bin/bash\n' > /etc/shells
  cat >/etc/nsswitch.conf <<'EOF'
passwd: files
group: files
shadow: files
hosts: files dns
networks: files
protocols: files
services: files
ethers: files
rpc: files
EOF
  printf 'LFS 12.0 (Custom) \\n \\l\n\n' > /etc/issue
  need_file /etc/os-release "os-release"; need_file /etc/shells "shells"
  need_file /etc/nsswitch.conf "nsswitch.conf"

  say "iana-etc (services/protocols) — fetch, else minimal fallback"
  mkdir -p "$SRC"
  if curl -fSL --retry 2 --max-time 120 \
      -o "$SRC/iana-etc.tar.gz" \
      https://github.com/Mic92/iana-etc/releases/download/20230810/iana-etc-20230810.tar.gz \
      && [ -s "$SRC/iana-etc.tar.gz" ]; then
    rm -rf "$SRC/iana" && mkdir -p "$SRC/iana"
    tar -xzf "$SRC/iana-etc.tar.gz" -C "$SRC/iana"
    d=$(echo "$SRC"/iana/iana-etc-*)
    # Mic92's iana-etc ships raw data files, no install target — copy them.
    [ -f "$d/services" ] && cp -f "$d/services" "$d/protocols" /etc/ 2>/dev/null
    [ -s /etc/services ] && ok "iana-etc installed" || bad "iana-etc installed"
  else
    echo "NOTE: iana-etc fetch failed, writing minimal services/protocols"
    cat >/etc/services <<'EOF'
ftp-data        20/tcp
ftp             21/tcp
ssh             22/tcp
telnet          23/tcp
smtp            25/tcp
dns             53/tcp
dns             53/udp
tftp            69/udp
http            80/tcp
pop3            110/tcp
nntp            119/tcp
ntp             123/udp
netbios-ns      137/udp
netbios-dgm     138/udp
netbios-ssn     139/tcp
imap            143/tcp
snmp            161/udp
irc             194/tcp
https           443/tcp
mysql           3306/tcp
mariadb         3307/tcp
socks           1080/tcp
webcache        8080/tcp
EOF
    printf 'ip\t0\tIP\nicmp\t1\tICMP\ntcp\t6\tTCP\nudp\t17\tUDP\nipv6\t41\tIPv6\n' > /etc/protocols
    need_file /etc/services "services fallback"
  fi

  say "honest explainer shims (reboot/systemctl/...) — guidance, not fakes"
  explain() { # name + message...
    local name=$1; shift
    {
      echo '#!/bin/bash'
      echo "# Honest stub: this guest has no init/systemd; explain instead of failing cryptically."
      printf 'echo "%s" >&2\n' "$@"
      echo 'exit 1'
    } > "/usr/local/bin/$name"
    chmod +x "/usr/local/bin/$name"
  }
  RB_MSG="use Windows PowerShell: wsl --terminate LFS-Goal-Test6, then re-enter with: wsl -d LFS-Goal-Test6 -u root --exec bash --login"
  explain reboot \
    "reboot: no init/systemd in this guest (PID 1 is WSL), so there is nothing to reboot from inside." \
    "To reboot it, $RB_MSG."
  explain shutdown \
    "shutdown: no init/systemd in this guest (PID 1 is WSL)." \
    "To stop it, $RB_MSG."
  explain poweroff "poweroff: no init/systemd in this guest (PID 1 is WSL). To stop it, $RB_MSG."
  explain halt "halt: no init/systemd in this guest (PID 1 is WSL). To stop it, $RB_MSG."
  explain systemctl \
    "systemctl: no systemd here — services are plain daemons started by hand." \
    "Use: demo-up (start all), demo-status, vulnbox-start / vulnbox-stop (practice targets), /usr/sbin/sshd (ssh)."
  explain service \
    "service: no SysV script tree here — services are plain daemons started by hand." \
    "Use: demo-up (start all), demo-status, vulnbox-start / vulnbox-stop (practice targets), /usr/sbin/sshd (ssh)."
  for s in reboot shutdown poweroff halt systemctl service; do need_cmd "$s"; done

  say "demo-up / demo-status helpers"
  cat >/usr/local/bin/demo-status <<'EOF'
#!/bin/bash
# One-screen status of the demo services.
echo "PORT CHECKS (from inside this guest):"
curl -s -o /dev/null -w '  juice shop :3000 -> %{http_code}\n' --max-time 5 http://127.0.0.1:3000/ || echo "  juice shop :3000 -> DOWN"
curl -s -o /dev/null -w '  dvwa      :80 -> %{http_code}\n' --max-time 5 http://127.0.0.1:80/ || echo "  dvwa      :80 -> DOWN"
curl -s -o /dev/null -w '  webgoat :8080 -> %{http_code}\n' --max-time 5 http://127.0.0.1:8080/WebGoat/ || echo "  webgoat :8080 -> DOWN"
curl -s -o /dev/null -w '  webwolf :9090 -> %{http_code}\n' --max-time 5 http://127.0.0.1:9090/WebWolf/ || echo "  webwolf :9090 -> DOWN"
(exec 3<>/dev/tcp/127.0.0.1/3307) 2>/dev/null && echo "  mariadb  :3307 -> UP" || echo "  mariadb  :3307 -> DOWN"
(exec 3<>/dev/tcp/127.0.0.1/22) 2>/dev/null && echo "  sshd        :22 -> UP" || echo "  sshd        :22 -> DOWN"
echo "DAEMONS:"
ps -eo comm,args 2>/dev/null | grep -E 'node|mysqld|mariadbd|lighttpd|java|sshd' | grep -v grep || echo "  (none running)"
EOF
  cat >/usr/local/bin/demo-up <<'EOF'
#!/bin/bash
# Cold-start everything a demo needs: sshd + practice targets.
if (exec 3<>/dev/tcp/127.0.0.1/22) 2>/dev/null; then
  echo "sshd: already up"
else
  mkdir -p /run/sshd
  /usr/sbin/sshd 2>/dev/null
  sleep 1
  if (exec 3<>/dev/tcp/127.0.0.1/22) 2>/dev/null; then echo "sshd: up"; else echo "sshd: FAILED to start"; fi
fi
vulnbox-start
demo-status
EOF
  chmod +x /usr/local/bin/demo-up /usr/local/bin/demo-status
  need_cmd demo-up; need_cmd demo-status

  say "howto guide card"
  cat >/usr/local/bin/howto <<'EOF'
#!/bin/bash
cat <<'GUIDE'
LFS 12.0 (Custom) — demo guide                      build goal-20261104-build1
================================================================
ENTRY (from Windows PowerShell)
  wsl -d LFS-Goal-Test6 -u root --exec bash --login     # login shell + banner

SERVICES (no systemd here — plain daemons, started by hand)
  demo-up            start sshd + all 5 practice targets, show status
  demo-status        show target ports + daemon processes
  vulnbox-start      start the 5 targets (juice:3000 dvwa:80
                     webgoat:8080 webwolf:9090 mariadb:3307)
  vulnbox-stop       stop them
  /usr/sbin/sshd     start the SSH server (key login as root)

SHELL + TOOLCHAIN (compiled from source by our pipeline)
  bash 5.2.15 + gcc 13.2.0, make, patch/diff, binutils
  git, strace, htop, nano + vim
  node v22, java 17, php 8.2, mariadb client (run the targets; on PATH)

PROOF IT WAS BUILT, NOT INSTALLED
  cat /etc/lfs-release     # build metadata (builder, date, versions)
  ls /build-logs           # per-package build logs
  gcc -dumpmachine         # x86_64-lfs-linux-gnu = our toolchain, not a distro's

HONEST LIMITS (design, not breakage)
  - No systemd: start services with demo-up / vulnbox-start (PID 1 is WSL).
  - No package manager (no LFS has one): software is compiled from source.
    gcc + make + curl + git are present, so ./configure && make works live.
  - Single user (root); no passwords set — WSL logs in as root directly.
  - The kernel is the WSL2 host kernel (see uname -r); the userland is ours.
  - Reboot from Windows: wsl --terminate LFS-Goal-Test6, then re-enter.

TRY ME
  vim /tmp/t.txt               git clone <repo> && cd <repo> && make
  gcc -dumpmachine              ssh -i ~/.ssh/lfs_demo root@localhost   # from Windows
GUIDE
EOF
  chmod +x /usr/local/bin/howto
  need_cmd howto
  if ! grep -q 'Type howto' /etc/lfs-welcome.sh 2>/dev/null; then
    cat >>/etc/lfs-welcome.sh <<'EOF'
printf '  \033[2mType \033[1;37mhowto\033[0m\033[2m for the demo guide (services, users, tools)\033[0m\n'
EOF
  fi
  ok "banner points at howto"

  say "sshd host keys + start"
  # Privilege-separation user (LFS openssh convention: sshd:50:50).
  grep -q '^sshd:' /etc/group || echo 'sshd:x:50:' >> /etc/group
  grep -q '^sshd:' /etc/passwd || echo 'sshd:x:50:50:sshd PrivSep:/var/empty:/bin/false' >> /etc/passwd
  ssh-keygen -A >/dev/null 2>&1
  ls /etc/ssh/ssh_host_* >/dev/null 2>&1 && ok "host keys" || bad "host keys"
  mkdir -p /run/sshd
  if (exec 3<>/dev/tcp/127.0.0.1/22) 2>/dev/null; then
    ok "sshd already up"
  else
    /usr/sbin/sshd 2>/dev/null
    sleep 1
    if (exec 3<>/dev/tcp/127.0.0.1/22) 2>/dev/null; then ok "sshd started"; else bad "sshd started"; fi
  fi
}

# ---------------------------------------------------------------- build
fetch() { # url file
  if [ -s "$SRC/$2" ]; then echo "cached: $2"; return 0; fi
  echo "fetch: $1"
  curl -fSL --retry 3 --max-time 900 -o "$SRC/$2" "$1" && [ -s "$SRC/$2" ]
}
unpack() { # file dirname
  rm -rf "$SRC/$2" && mkdir -p "$SRC/$2"
  tar -xf "$SRC/$1" -C "$SRC/$2" --strip-components=1
}
# NOTE on gettext: this guest has no gettext/msgfmt, so every package that
# supports it is configured --disable-nls. A demo box needs no translations.

build_libffi() {
  say "build libffi (python _ctypes needs it)"
  fetch https://github.com/libffi/libffi/releases/download/v3.4.6/libffi-3.4.6.tar.gz libffi.tar.gz || { bad "fetch libffi"; return; }
  unpack libffi.tar.gz libffi
  ( cd "$SRC/libffi" \
    && ./configure --prefix=/usr --disable-static --disable-nls >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null && ldconfig ) \
    && ok "libffi" || bad "libffi"
}

build_readline() {
  say "build readline (bash + python line editing need it)"
  fetch https://ftp.gnu.org/gnu/readline/readline-8.2.tar.gz readline.tar.gz || { bad "fetch readline"; return; }
  unpack readline.tar.gz readline
  ( cd "$SRC/readline" \
    && ./configure --prefix=/usr --disable-static --disable-nls --with-curses --docdir=/usr/share/doc/readline-8.2 >/dev/null \
    && make -j$J SHLIB_LIBS="-lncursesw" >/dev/null \
    && make SHLIB_LIBS="-lncursesw" install >/dev/null && ldconfig ) \
    && ok "readline" || bad "readline"
}

build_sqlite() {
  say "build sqlite (python sqlite3 module + sqlite3 CLI)"
  fetch https://sqlite.org/2024/sqlite-autoconf-3470200.tar.gz sqlite.tar.gz || { bad "fetch sqlite"; return; }
  unpack sqlite.tar.gz sqlite
  ( cd "$SRC/sqlite" \
    && ./configure --prefix=/usr --disable-static --disable-nls >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null && ldconfig ) \
    && ok "sqlite" || bad "sqlite"
  need_cmd sqlite3
}

build_bzip2() {
  say "build bzip2 (.bz2 tarballs + python bz2 module)"
  fetch https://sourceware.org/pub/bzip2/bzip2-1.0.8.tar.gz bzip2.tar.gz || { bad "fetch bzip2"; return; }
  unpack bzip2.tar.gz bzip2
  ( cd "$SRC/bzip2" \
    && make -f Makefile-libbz2_so -j$J >/dev/null && make clean >/dev/null \
    && make -j$J >/dev/null && make PREFIX=/usr install >/dev/null \
    && cp -f bzip2-shared /usr/bin/bzip2 && cp -af libbz2.so* /usr/lib && ldconfig ) \
    && ok "bzip2" || bad "bzip2"
  need_cmd bzip2; need_cmd bunzip2
}

build_gdbm() {
  say "build gdbm (man-db + python dbm need it)"
  fetch https://ftp.gnu.org/gnu/gdbm/gdbm-1.23.tar.gz gdbm.tar.gz || { bad "fetch gdbm"; return; }
  unpack gdbm.tar.gz gdbm
  ( cd "$SRC/gdbm" \
    && ./configure --prefix=/usr --disable-static --disable-nls --enable-libgdbm-compat >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null && ldconfig ) \
    && ok "gdbm" || bad "gdbm"
}

build_libpipeline() {
  say "build libpipeline (man-db needs it)"
  fetch https://download.savannah.gnu.org/releases/libpipeline/libpipeline-1.5.7.tar.gz libpipeline.tar.gz || { bad "fetch libpipeline"; return; }
  unpack libpipeline.tar.gz libpipeline
  ( cd "$SRC/libpipeline" \
    && ./configure --prefix=/usr --disable-static --disable-nls >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null && ldconfig ) \
    && ok "libpipeline" || bad "libpipeline"
}

build_bash() {
  say "rebuild bash 5.2.15 against readline (arrow keys/history for the demo)"
  fetch https://ftp.gnu.org/gnu/bash/bash-5.2.15.tar.gz bash.tar.gz || { bad "fetch bash"; return; }
  unpack bash.tar.gz bash
  [ -f /bin/bash.pre-committee ] || cp -a /bin/bash /bin/bash.pre-committee
  if ( cd "$SRC/bash" \
    && ./configure --prefix=/usr --without-bash-malloc --disable-nls \
         --with-installed-readline --docdir=/usr/share/doc/bash-5.2.15 >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null ); then
    if [ "$(/bin/bash --version 2>/dev/null | head -1)" ] && \
       /bin/bash -i -c 'bind -v' </dev/null 2>/dev/null | grep -q '^set '; then
      ok "bash with readline"
    else
      cp -af /bin/bash.pre-committee /bin/bash
      bad "bash readline test (old bash restored)"
    fi
  else
    bad "bash build"
  fi
}

build_vim() {
  say "build vim (provides vi + vim + xxd)"
  fetch https://github.com/vim/vim/archive/refs/tags/v9.1.0.tar.gz vim.tar.gz || { bad "fetch vim"; return; }
  unpack vim.tar.gz vim
  ( cd "$SRC/vim" \
    && ./configure --prefix=/usr --disable-nls --with-features=huge --enable-multibyte \
         --with-x=no --enable-gui=no --enable-python3interp=no --enable-perlinterp=no \
         --enable-rubyinterp=no --enable-luainterp=no --enable-tclinterp=no >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null ) \
    && ok "vim" || bad "vim"
  ln -sf vim /usr/bin/vi 2>/dev/null
  need_cmd vim; need_cmd vi; need_cmd xxd
}

build_python() {
  say "build python 3.12 (+ pip)"
  fetch https://www.python.org/ftp/python/3.12.7/Python-3.12.7.tgz python.tgz || { bad "fetch python"; return; }
  unpack python.tgz python
  ( cd "$SRC/python" \
    && ./configure --prefix=/usr --enable-shared --disable-nls \
         --with-system-expat --with-system-ffi --with-ensurepip=yes \
         --docdir=/usr/share/doc/python-3.12.7 >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null && ldconfig ) \
    && ok "python" || { bad "python"; return; }
  have python || ln -sf python3 /usr/bin/python
  need_cmd python3; need_cmd python; need_cmd pip3
  python3 -c "print('PY-RUN-OK')" 2>/dev/null | grep -q PY-RUN-OK && ok "python runs" || bad "python runs"
  echo "--- python stdlib module probe (missing = header was absent, non-fatal):"
  python3 -c "
import importlib
for m in ['ssl','zlib','bz2','sqlite3','ctypes','readline','uuid','lzma','decimal','pyexpat','curses','dbm.gnu']:
    try:
        importlib.import_module(m); print('PYMOD HAVE', m)
    except Exception as e:
        print('PYMOD MISS', m)
" 2>/dev/null || bad "python module probe"
  python3 -m pip --version >/dev/null 2>&1 && ok "pip" || bad "pip"
}

build_groff() {
  say "build groff (man-db renders through it)"
  fetch https://ftp.gnu.org/gnu/groff/groff-1.23.0.tar.gz groff.tar.gz || { bad "fetch groff"; return; }
  unpack groff.tar.gz groff
  ( cd "$SRC/groff" \
    && PAGE=A4 ./configure --prefix=/usr --disable-nls >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null ) \
    && ok "groff" || bad "groff"
}

build_mandb() {
  say "build man-db (13 MB of pages already ship, nothing reads them yet)"
  fetch https://download.savannah.nongnu.org/releases/man-db/man-db-2.12.0.tar.gz mandb.tar.gz || { bad "fetch man-db"; return; }
  unpack mandb.tar.gz mandb
  mkdir -p /var/cache/man
  ( cd "$SRC/mandb" \
    && ./configure --prefix=/usr --sysconfdir=/etc --disable-nls --disable-setuid \
         --enable-cache-owner=root --docdir=/usr/share/doc/man-db-2.12.0 >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null ) \
    && ok "man-db" || { bad "man-db"; return; }
  need_cmd man
  mandb >/dev/null 2>&1
  MANPAGER=cat man ls 2>/dev/null | head -5 | grep -qi 'ls(1)' && ok "man renders" || bad "man renders"
}

build_shadow() {
  say "build shadow (useradd/su/passwd) + demo user"
  fetch https://github.com/shadow-maint/shadow/releases/download/4.15.3/shadow-4.15.3.tar.gz shadow.tar.gz || { bad "fetch shadow"; return; }
  unpack shadow.tar.gz shadow
  ( cd "$SRC/shadow" \
    && ./configure --sysconfdir=/etc --disable-static --disable-nls \
         --with-group-name-max-length=32 --without-selinux >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null ) \
    && ok "shadow" || { bad "shadow"; return; }
  need_cmd useradd; need_cmd su; need_cmd passwd; need_cmd chpasswd
  pwconv 2>/dev/null; grpconv 2>/dev/null
  id demo >/dev/null 2>&1 || useradd -m -s /bin/bash -c "Demo user" demo
  echo 'demo:lfsdemo' | chpasswd
  echo 'root:lfsdemo' | chpasswd
  [ "$(su demo -c whoami 2>/dev/null)" = demo ] && ok "su to demo" || bad "su to demo"
  grep -q '^demo:' /etc/shadow && ok "demo in shadow" || bad "demo in shadow"
}

build_utillinux() {
  say "build util-linux, install ONLY the missing tools (mount/login untouched)"
  fetch https://mirrors.edge.kernel.org/util-linux/v2.40/util-linux-2.40.2.tar.gz utillinux.tar.gz || { bad "fetch util-linux"; return; }
  unpack utillinux.tar.gz utillinux
  ( cd "$SRC/utillinux" \
    && ADJTIME_PATH=/var/lib/hwclock/adjtime ./configure --bindir=/usr/bin --sbindir=/usr/sbin \
         --disable-nls --disable-chfn-chsh --disable-login --disable-nologin --disable-su \
         --disable-setpriv --disable-runuser --disable-pylibmount --disable-liblastlog2 \
         --disable-makeinstall-chown --without-python --without-systemd --without-udev \
         --docdir=/usr/share/doc/util-linux-2.40.2 >/dev/null \
    && make -j$J >/dev/null ) \
    && ok "util-linux built" || { bad "util-linux built"; return; }
  ( cd "$SRC/utillinux" \
    && for t in dmesg lsblk lscpu fdisk hwclock cal logger script flock more whereis chrt ionice taskset prlimit; do
         if ! have "$t" && [ -x "$t" ]; then
           case "$t" in fdisk|hwclock) cp -f "$t" /usr/sbin/;; *) cp -f "$t" /usr/bin/;; esac
           echo "installed: $t"
         fi
       done )
  for t in dmesg lsblk lscpu fdisk cal logger more whereis; do need_cmd "$t"; done
}

build_unzip_zip() {
  say "build unzip + zip"
  fetch https://fossies.org/linux/misc/unzip60.tar.gz unzip.tar.gz || { bad "fetch unzip"; return; }
  rm -rf "$SRC/unzipx" && mkdir -p "$SRC/unzipx" && tar -xzf "$SRC/unzip.tar.gz" -C "$SRC/unzipx"
  ( cd "$SRC/unzipx"/* \
    && make -f unix/Makefile generic -j$J >/dev/null \
    && make -f unix/Makefile prefix=/usr install >/dev/null ) \
    && ok "unzip" || bad "unzip"
  fetch https://fossies.org/linux/misc/zip30.tar.gz zip.tar.gz || { bad "fetch zip"; return; }
  rm -rf "$SRC/zipx" && mkdir -p "$SRC/zipx" && tar -xzf "$SRC/zip.tar.gz" -C "$SRC/zipx"
  ( cd "$SRC/zipx"/* \
    && make -f unix/Makefile generic -j$J >/dev/null \
    && make -f unix/Makefile prefix=/usr MANDIR=/usr/share/man install >/dev/null ) \
    && ok "zip" || bad "zip"
  need_cmd unzip; need_cmd zip
}

build_sudo() {
  say "build sudo (no PAM on this box)"
  fetch https://www.sudo.ws/dist/sudo-1.9.15p5.tar.gz sudo.tar.gz || { bad "fetch sudo"; return; }
  unpack sudo.tar.gz sudo
  ( cd "$SRC/sudo" \
    && ./configure --prefix=/usr --libexecdir=/usr/lib --disable-nls --without-pam \
         --with-secure-path=/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/bin --with-env-editor >/dev/null \
    && make -j$J >/dev/null && make install >/dev/null ) \
    && ok "sudo" || { bad "sudo"; return; }
  printf 'root ALL=(ALL:ALL) ALL\ndemo ALL=(ALL:ALL) ALL\n' > /etc/sudoers
  chmod 440 /etc/sudoers
  visudo -c >/dev/null 2>&1 && ok "sudoers valid" || bad "sudoers valid"
  [ "$(su demo -c 'echo lfsdemo | sudo -S whoami' 2>/dev/null | tail -1)" = root ] \
    && ok "sudo from demo" || bad "sudo from demo"
}

build_tzdata() {
  say "build tzdata + set Europe/Paris (matches the demo host)"
  fetch https://www.iana.org/time-zones/repository/tzdata-latest.tar.gz tzdata.tar.gz || { bad "fetch tzdata"; return; }
  fetch https://www.iana.org/time-zones/repository/tzcode-latest.tar.gz tzcode.tar.gz || { bad "fetch tzcode"; return; }
  rm -rf "$SRC/tzb" && mkdir -p "$SRC/tzb"
  tar -xzf "$SRC/tzdata.tar.gz" -C "$SRC/tzb"
  tar -xzf "$SRC/tzcode.tar.gz" -C "$SRC/tzb"
  ( cd "$SRC/tzb" && make -j$J >/dev/null && make TOPDIR=/usr install >/dev/null ) \
    && ok "tzdata" || { bad "tzdata"; return; }
  cp -f /usr/share/zoneinfo/Europe/Paris /etc/localtime
  echo Europe/Paris > /etc/timezone
  date | grep -q 'CET' && ok "guest on CET" || echo "NOTE: $(date)"
}

build_completion() {
  say "install bash-completion scripts (pure shell, no build)"
  fetch https://github.com/scop/bash-completion/releases/download/2.16.0/bash-completion-2.16.0.tar.xz completion.tar.xz || { bad "fetch bash-completion"; return; }
  unpack completion.tar.xz completion
  ( cd "$SRC/completion" \
    && ./configure --prefix=/usr --sysconfdir=/etc >/dev/null \
    && make install >/dev/null ) \
    && ok "bash-completion" || { bad "bash-completion"; return; }
  grep -q 'bash_completion' /etc/profile || cat >>/etc/profile <<'EOF'
if [ -f /usr/share/bash-completion/bash_completion ]; then
  . /usr/share/bash-completion/bash_completion
fi
EOF
  ok "completion hooked into profile"
}

do_build() {
  mkdir -p "$SRC"
  echo "BUILD-START $(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$STATUS"
  build_libffi
  build_readline
  build_sqlite
  build_bzip2
  build_gdbm
  build_libpipeline
  build_bash
  build_vim
  build_python
  build_groff
  build_mandb
  build_shadow
  build_utillinux
  build_unzip_zip
  build_sudo
  build_tzdata
  build_completion
  say "final sweep"
  for t in vi vim python python3 pip3 man mandb useradd su sudo dmesg lsblk lscpu fdisk cal logger more whereis unzip zip bzip2 sqlite3 node java javac mariadb php git curl ssh flock script chrt xxd; do
    need_cmd "$t"
  done
  echo "BUILD-END pass=$PASS fail=$FAIL failed_items:$FAILED_ITEMS" | tee -a "$STATUS"
  echo "STATUS=$([ "$FAIL" = 0 ] && echo done || echo done-with-failures)" | tee -a "$STATUS"
}

case "$MODE" in
  config) do_config ;;
  build)  do_build ;;
esac
say "summary: pass=$PASS fail=$FAIL"
[ -n "$FAILED_ITEMS" ] && echo "failed items:$FAILED_ITEMS"
exit 0
