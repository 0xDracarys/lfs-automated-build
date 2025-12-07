#!/bin/sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

clear

# ASCII Art Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║   ██╗     ███████╗███████╗    ██████╗ ██╗   ██╗    ███████╗ █████╗  ║"
echo "║   ██║     ██╔════╝██╔════╝    ██╔══██╗╚██╗ ██╔╝    ██╔════╝██╔══██╗ ║"
echo "║   ██║     █████╗  ███████╗    ██████╔╝ ╚████╔╝     ███████╗███████║ ║"
echo "║   ██║     ██╔══╝  ╚════██║    ██╔══██╗  ╚██╔╝      ╚════██║██╔══██║ ║"
echo "║   ███████╗██║     ███████║    ██████╔╝   ██║       ███████║██║  ██║ ║"
echo "║   ╚══════╝╚═╝     ╚══════╝    ╚═════╝    ╚═╝       ╚══════╝╚═╝  ╚═╝ ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}"
echo "    ┌─────────────────────────────────────────────────────────────┐"
echo "    │  🚀 Linux From Scratch - Custom Built System 🚀             │"
echo "    │  Built by: Sam | Kernel: 6.4.12 | GCC: 13.2.0              │"
echo "    └─────────────────────────────────────────────────────────────┘"
echo -e "${NC}"

# System Info
echo -e "${YELLOW}┌─[ System Information ]───────────────────────────────────────┐${NC}"
echo -e "${WHITE}  Kernel:    ${CYAN}$(busybox uname -r)${NC}"
echo -e "${WHITE}  Hostname:  ${CYAN}$(busybox hostname)${NC}"
echo -e "${WHITE}  Shell:     ${CYAN}Bash + BusyBox${NC}"
echo -e "${WHITE}  Memory:    ${CYAN}$(busybox free -h | busybox grep Mem | busybox awk '{print $3 "/" $2}')${NC}"
echo -e "${YELLOW}└──────────────────────────────────────────────────────────────┘${NC}"

echo ""

# Available Tools
echo -e "${PURPLE}┌─[ Available Development Tools ]──────────────────────────────┐${NC}"
echo -e "  ${GREEN}✓${NC} git      - Version control system"
echo -e "  ${GREEN}✓${NC} wget     - Download files from the web"
echo -e "  ${GREEN}✓${NC} curl     - Transfer data with URLs"
echo -e "  ${GREEN}✓${NC} vim      - Advanced text editor"
echo -e "  ${GREEN}✓${NC} nano     - User-friendly text editor"
echo -e "  ${GREEN}✓${NC} bash     - Bourne Again Shell"
echo -e "  ${GREEN}✓${NC} gcc      - GNU Compiler Collection (via toolchain)"
echo -e "  ${GREEN}✓${NC} busybox  - 392+ Unix utilities"
echo -e "${PURPLE}└──────────────────────────────────────────────────────────────┘${NC}"

echo ""

# Network Tools
echo -e "${CYAN}┌─[ Network & Communication Tools ]────────────────────────────┐${NC}"
echo -e "  ${GREEN}✓${NC} nc (netcat) - Network Swiss army knife"
echo -e "  ${GREEN}✓${NC} ping        - Test connectivity"
echo -e "  ${GREEN}✓${NC} ifconfig    - Configure network interfaces"
echo -e "  ${GREEN}✓${NC} ip          - Modern network configuration"
echo -e "  ${GREEN}✓${NC} netstat/ss  - Network statistics"
echo -e "  ${GREEN}✓${NC} telnet      - Remote connection testing"
echo -e "  ${GREEN}✓${NC} dig/nslookup - DNS lookups"
echo -e "  ${GREEN}✓${NC} route/arp   - Routing and ARP tables"
echo -e "${CYAN}└──────────────────────────────────────────────────────────────┘${NC}"

echo ""

# Quick Commands
echo -e "${BLUE}┌─[ Quick Start Commands ]─────────────────────────────────────┐${NC}"
echo -e "  ${CYAN}commands${NC}     - View all available commands reference"
echo -e "  ${CYAN}network${NC}      - Networking tools and examples"
echo -e "  ${CYAN}sysinfo${NC}      - Show detailed system information"
echo -e "  ${CYAN}test-lfs${NC}     - Run LFS functionality tests"
echo -e "  ${CYAN}help${NC}         - List all available commands (392+)"
echo -e "  ${CYAN}ping 8.8.8.8${NC} - Test internet connectivity"
echo -e "  ${CYAN}nc -l -p 1234${NC} - Start netcat listener"
echo -e "${BLUE}└──────────────────────────────────────────────────────────────┘${NC}"

echo ""

# Tips
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo -e "   • Use ${GREEN}network${NC} to see networking examples"
echo -e "   • Use ${GREEN}nc -l -p 1234${NC} to create a listener"
echo -e "   • Use ${GREEN}ping host${NC} to test connectivity"
echo -e "   • Use ${GREEN}ifconfig${NC} or ${GREEN}ip addr${NC} to see network info"
echo -e "   • Type ${GREEN}exit${NC} to leave LFS environment"

echo ""
echo -e "${WHITE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
