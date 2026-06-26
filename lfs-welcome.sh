#!/bin/bash
# lfs-welcome.sh — Custom welcome banner + neofetch-style info for LFS-Cloud
# This script is sourced from /etc/profile on login

# ──────────────────── Colors ────────────────────
RST='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
R='\033[1;31m'
G='\033[1;32m'
Y='\033[1;33m'
B='\033[1;34m'
M='\033[1;35m'
C='\033[1;36m'
W='\033[1;37m'

# ──────────────────── ASCII Art ────────────────────
echo ""
echo -e "${B}        .--.${RST}"
echo -e "${B}       |o_o |${RST}    ${W}${BOLD}Linux From Scratch 12.0${RST}"
echo -e "${B}       |:_/ |${RST}    ${DIM}Cloud-Built Custom System${RST}"
echo -e "${B}      //   \\ \\${RST}"
echo -e "${B}     (|     | )${RST}   ${G}✓${RST} ${DIM}Built by Sam's LFS Pipeline${RST}"
echo -e "${B}    /'\\_   _/\`\\${RST}   ${G}✓${RST} ${DIM}Google Cloud Run (8 vCPU)${RST}"
echo -e "${B}    \\___)=(___/${RST}   ${G}✓${RST} ${DIM}Compiled entirely from source${RST}"
echo ""

# ──────────────────── System Info (neofetch-style) ────────────────────
# Gather info
KERNEL=$(uname -r 2>/dev/null || echo "unknown")
ARCH=$(uname -m 2>/dev/null || echo "x86_64")
HOSTNAME=$(cat /etc/hostname 2>/dev/null || hostname 2>/dev/null || echo "lfs-custom")
SHELL_VER=$(bash --version 2>/dev/null | head -1 | sed 's/.*version //' | cut -d' ' -f1 || echo "5.2")
UPTIME=$(cat /proc/uptime 2>/dev/null | awk '{printf "%dd %dh %dm", $1/86400, ($1%86400)/3600, ($1%3600)/60}' || echo "N/A")
MEM_TOTAL=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{printf "%.0f MB", $2/1024}' || echo "N/A")
MEM_FREE=$(grep MemAvailable /proc/meminfo 2>/dev/null | awk '{printf "%.0f MB", $2/1024}' || echo "N/A")
CPU_MODEL=$(grep "model name" /proc/cpuinfo 2>/dev/null | head -1 | sed 's/.*: //' | sed 's/(R)//g; s/(TM)//g' | xargs || echo "N/A")
NCPU=$(nproc 2>/dev/null || grep -c processor /proc/cpuinfo 2>/dev/null || echo "?")
GCC_VER=$(gcc --version 2>/dev/null | head -1 | sed 's/.*) //' || echo "N/A")
PKG_COUNT=$(ls /usr/bin 2>/dev/null | wc -l || echo "?")

# Print
echo -e "  ${C}${BOLD}${HOSTNAME}${RST}"
echo -e "  ${DIM}──────────────────────────${RST}"
echo -e "  ${Y}OS${RST}        ${W}LFS 12.0 (Custom)${RST}"
echo -e "  ${Y}Kernel${RST}    ${W}${KERNEL}${RST}"
echo -e "  ${Y}Arch${RST}      ${W}${ARCH}${RST}"
echo -e "  ${Y}Shell${RST}     ${W}Bash ${SHELL_VER}${RST}"
echo -e "  ${Y}GCC${RST}       ${W}${GCC_VER}${RST}"
echo -e "  ${Y}CPU${RST}       ${W}${CPU_MODEL} (${NCPU} cores)${RST}"
echo -e "  ${Y}Memory${RST}    ${W}${MEM_FREE} free / ${MEM_TOTAL} total${RST}"
echo -e "  ${Y}Uptime${RST}    ${W}${UPTIME}${RST}"
echo -e "  ${Y}Packages${RST}  ${W}${PKG_COUNT} (in /usr/bin)${RST}"
echo ""
echo -e "  ${DIM}Type ${W}help${RST}${DIM} to see available commands${RST}"
echo ""

# ──────────────────── Color palette ────────────────────
echo -e "  \033[40m  \033[41m  \033[42m  \033[43m  \033[44m  \033[45m  \033[46m  \033[47m  ${RST}"
echo -e "  \033[100m  \033[101m  \033[102m  \033[103m  \033[104m  \033[105m  \033[106m  \033[107m  ${RST}"
echo ""
