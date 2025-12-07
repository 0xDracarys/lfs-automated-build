#!/bin/sh
# LFS Command Reference - Quick Help Guide

cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║              LFS COMMAND REFERENCE BY SAM                      ║
╚═══════════════════════════════════════════════════════════════╝

┌─[ FILE & DIRECTORY OPERATIONS ]──────────────────────────────┐
  ls -lah              List all files with details
  cd /path             Change directory
  pwd                  Show current directory
  mkdir dirname        Create directory
  rmdir dirname        Remove empty directory
  rm file              Remove file
  rm -rf dir           Remove directory recursively
  cp source dest       Copy files
  mv source dest       Move/rename files
  touch file           Create empty file
  find / -name file    Search for file
  tree                 Show directory tree
└──────────────────────────────────────────────────────────────┘

┌─[ TEXT VIEWING & EDITING ]───────────────────────────────────┐
  cat file             Display file contents
  less file            View file (scrollable)
  head -n 10 file      Show first 10 lines
  tail -n 10 file      Show last 10 lines
  tail -f file         Follow file updates (logs)
  nano file            Edit with nano (easy)
  vim file             Edit with vim (advanced)
  grep pattern file    Search in file
  grep -r pattern dir  Search recursively
└──────────────────────────────────────────────────────────────┘

┌─[ GIT COMMANDS ]─────────────────────────────────────────────┐
  git init             Initialize repository
  git clone url        Clone repository
  git status           Check status (alias: gs)
  git add file         Stage file (alias: ga)
  git commit -m "msg"  Commit changes (alias: gc)
  git push             Push to remote (alias: gp)
  git pull             Pull from remote
  git log              View commit history
  git branch           List branches
  git checkout branch  Switch branch
└──────────────────────────────────────────────────────────────┘

┌─[ DOWNLOAD & TRANSFER ]──────────────────────────────────────┐
  wget url             Download file
  wget -O name url     Download with custom name
  curl url             Fetch URL content
  curl -O url          Download file
  curl -I url          Show headers only
└──────────────────────────────────────────────────────────────┘

┌─[ ARCHIVE & COMPRESSION ]────────────────────────────────────┐
  tar -czf file.tar.gz dir    Create tar.gz
  tar -xzf file.tar.gz        Extract tar.gz
  tar -cjf file.tar.bz2 dir   Create tar.bz2
  tar -xjf file.tar.bz2       Extract tar.bz2
  gzip file                   Compress file
  gunzip file.gz              Decompress file
  zip -r archive.zip dir      Create zip
  unzip archive.zip           Extract zip
└──────────────────────────────────────────────────────────────┘

┌─[ PROCESS MANAGEMENT ]───────────────────────────────────────┐
  ps                   Show processes
  ps aux               Show all processes
  top                  Interactive process viewer
  htop                 Enhanced process viewer
  kill PID             Kill process by ID
  killall name         Kill process by name
  jobs                 List background jobs
  bg                   Resume job in background
  fg                   Bring job to foreground
└──────────────────────────────────────────────────────────────┘

┌─[ SYSTEM INFORMATION ]───────────────────────────────────────┐
  uname -a             System information
  uptime               System uptime
  hostname             Show hostname
  free -h              Memory usage
  df -h                Disk usage
  du -sh dir           Directory size
  lscpu                CPU information
  date                 Current date/time
└──────────────────────────────────────────────────────────────┘

┌─[ NETWORK ]──────────────────────────────────────────────────┐
  ping host            Test connectivity
  ifconfig             Network interfaces
  netstat -tuln        Active connections
  ss -tuln             Socket statistics
  ip addr              Show IP addresses
└──────────────────────────────────────────────────────────────┘

┌─[ PERMISSIONS ]──────────────────────────────────────────────┐
  chmod +x file        Make executable
  chmod 755 file       rwxr-xr-x
  chmod 644 file       rw-r--r--
  chown user:group file Change owner
└──────────────────────────────────────────────────────────────┘

┌─[ CUSTOM LFS COMMANDS ]──────────────────────────────────────┐
  lfs-welcome          Show welcome banner
  sysinfo              Detailed system info
  test-lfs             Run LFS tests
  help                 List all 392 commands
└──────────────────────────────────────────────────────────────┘

┌─[ USEFUL ALIASES ]───────────────────────────────────────────┐
  ll                   ls -lh (long list)
  la                   ls -lah (all files)
  cls                  clear screen
  ..                   cd .. (up one directory)
  ...                  cd ../.. (up two directories)
  h                    history
  gs                   git status
  ga                   git add
  gc                   git commit
  gp                   git push
  gl                   git log --oneline
└──────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  💡 TIP: Press Tab for auto-completion                        ║
║  💡 TIP: Use Ctrl+R to search command history                 ║
║  💡 TIP: Use Ctrl+C to cancel current command                 ║
║  💡 TIP: Use Ctrl+L to clear screen                           ║
╚═══════════════════════════════════════════════════════════════╝

EOF
