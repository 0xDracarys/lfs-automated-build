#!/bin/sh

# LFS Networking Test Script
echo "╔═══════════════════════════════════════════════════════╗"
echo "║     LFS NETWORKING CAPABILITIES TEST BY SAM          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check available tools
echo "[1/8] Checking networking tools..."
for tool in nc ping ifconfig ip netstat ss telnet dig host nslookup route arp hostname; do
    if command -v $tool >/dev/null 2>&1; then
        echo "  ✓ $tool - Available"
    else
        echo "  ✗ $tool - Missing"
    fi
done
echo ""

# Test 2: Show hostname
echo "[2/8] Hostname information:"
hostname
echo ""

# Test 3: Show network interfaces
echo "[3/8] Network interfaces (ifconfig):"
ifconfig 2>/dev/null | head -20
echo ""

# Test 4: Show IP addresses
echo "[4/8] IP addresses (ip addr):"
ip addr show 2>/dev/null | head -20
echo ""

# Test 5: Show routing table
echo "[5/8] Routing table:"
route -n 2>/dev/null || ip route show 2>/dev/null
echo ""

# Test 6: DNS test
echo "[6/8] DNS resolution test:"
nslookup google.com 2>/dev/null || echo "DNS lookup requires network access"
echo ""

# Test 7: Netcat version
echo "[7/8] Netcat capabilities:"
nc -h 2>&1 | head -5
echo ""

# Test 8: Network statistics
echo "[8/8] Socket statistics:"
ss -s 2>/dev/null || netstat -s 2>/dev/null | head -10
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║              NETWORKING TEST COMPLETE                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  • Use 'network' command for examples"
echo "  • Try 'nc -l -p 1234' to create a listener"
echo "  • Try 'ping 8.8.8.8' to test connectivity"
echo "  • Use 'ifconfig' to see network interfaces"
