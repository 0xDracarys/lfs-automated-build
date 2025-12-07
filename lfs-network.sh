#!/bin/sh

cat << 'EOF'
╔══════════════════════════════════════════════════════════╗
║         LFS NETWORKING TOOLS REFERENCE BY SAM           ║
╚══════════════════════════════════════════════════════════╝

[BASIC NETWORK INFO]
  ifconfig              - Show network interfaces
  ifconfig eth0         - Show specific interface
  ip addr show          - Show IP addresses (modern)
  ip link show          - Show network interfaces
  hostname              - Show/set hostname
  hostname -I           - Show all IP addresses

[CONNECTIVITY TESTING]
  ping 8.8.8.8          - Test internet connectivity
  ping -c 4 google.com  - Ping with count limit
  nc -zv host port      - Test if port is open
  telnet host port      - Connect to remote port

[DNS LOOKUPS]
  nslookup google.com   - Basic DNS lookup
  dig google.com        - Detailed DNS query
  host google.com       - Simple DNS lookup

[NETWORK STATISTICS]
  netstat -tuln         - Show listening ports
  netstat -anp          - Show all connections
  ss -tuln              - Socket statistics (modern)
  ss -s                 - Summary statistics
  route -n              - Show routing table
  arp -a                - Show ARP cache

[NETCAT (nc) EXAMPLES]
  # Listen on port 1234
  nc -l -p 1234
  
  # Connect to server
  nc hostname 1234
  
  # Transfer file (receiver)
  nc -l -p 1234 > file.txt
  
  # Transfer file (sender)
  nc hostname 1234 < file.txt
  
  # Chat server
  nc -l -p 1234
  
  # Port scanning
  nc -zv hostname 20-80
  
  # HTTP request
  echo -e "GET / HTTP/1.0\r\n\r\n" | nc google.com 80

[ADVANCED IP COMMANDS]
  ip addr add IP/24 dev eth0    - Add IP address
  ip link set eth0 up           - Bring interface up
  ip route show                 - Show routes
  ip neigh show                 - Show ARP table

[COMMON USE CASES]
  # Check if website is reachable
  ping -c 3 google.com
  
  # Test if web server is running
  nc -zv localhost 80
  
  # Simple web server (serve current dir)
  while true; do nc -l -p 8080 < index.html; done
  
  # Chat between two machines
  # Machine 1: nc -l -p 1234
  # Machine 2: nc machine1_ip 1234
  
  # Transfer directory
  # Receiver: nc -l -p 1234 | tar xzf -
  # Sender: tar czf - directory | nc hostname 1234
  
  # Test DNS resolution
  nslookup google.com
  dig google.com A
  
  # Monitor network connections
  watch -n 1 'netstat -tuln'

[TROUBLESHOOTING]
  # Can't connect?
  1. Check interface: ifconfig
  2. Check routes: route -n
  3. Test DNS: nslookup google.com
  4. Test ping: ping 8.8.8.8
  5. Check ports: netstat -tuln

[SECURITY NOTES]
  • nc (netcat) is powerful but use carefully
  • Don't expose ports unnecessarily
  • Test on local network first
  • Use telnet only for testing (not secure)

[PRO TIPS]
  ✓ Use 'ss' instead of 'netstat' (faster)
  ✓ Use 'ip' instead of 'ifconfig' (modern)
  ✓ nc can replace many specialized tools
  ✓ Combine with pipes for powerful workflows

Type 'network' anytime to see this reference!

EOF
