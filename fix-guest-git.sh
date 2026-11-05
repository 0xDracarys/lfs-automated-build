#!/bin/bash
# fix-guest-git.sh — rebuild the demo guest's git WITH https support.
#
# Bug: the shipped git 2.43.0 lacks the git-remote-https helper, so
# `git clone https://...` fails. The demo story says `git clone <repo> && make`,
# so https cloning must work. Rebuilds the SAME version against libcurl.
#
# Usage (guest must be running; safe to re-run — skips when already fixed):
#   wsl -d <guest> -u root --exec bash /mnt/c/.../fix-guest-git.sh
# Log: /build-logs/fix-guest-git.log
set -u
LOG=/build-logs/fix-guest-git.log
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
VER=2.43.0

helper_present() {
  local ep
  ep=$(git --exec-path 2>/dev/null) && [ -x "$ep/git-remote-https" ]
}

echo "date=$(date -u '+%Y-%m-%dT%H:%M:%SZ') jobs=$J have=$(git --version 2>/dev/null)"
if helper_present; then
  echo "SKIP: git-remote-https already present"
  exit 0
fi

if ! [ -f /usr/include/curl/curl.h ]; then
  echo "FATAL: curl headers missing, cannot build https support" >&2
  exit 1
fi

mkdir -p "$SRC"
if ! [ -s "$SRC/git.tar.gz" ]; then
  echo "fetching git $VER..."
  curl -fSL --retry 3 --max-time 600 -o "$SRC/git.tar.gz" \
    "https://mirrors.edge.kernel.org/pub/software/scm/git/git-$VER.tar.gz" || exit 1
fi
rm -rf "$SRC/git" && mkdir -p "$SRC/git"
tar -xzf "$SRC/git.tar.gz" -C "$SRC/git" --strip-components=1

( cd "$SRC/git" \
  && make -j$J prefix=/usr NO_GETTEXT=1 NO_TCLTK=1 \
  && make prefix=/usr NO_GETTEXT=1 NO_TCLTK=1 install ) || { echo "BUILD-FAILED" >&2; exit 1; }

git --version
if helper_present; then
  echo "OK: git-remote-https present"
  git ls-remote --exit-code https://github.com/landley/toybox HEAD >/dev/null 2>&1 \
    && echo "OK: https remote works" || echo "WARN: ls-remote failed (network?)"
  exit 0
fi
echo "VERIFY-FAILED" >&2
exit 1
