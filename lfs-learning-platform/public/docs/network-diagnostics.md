---
title: Network Diagnostics & Diagnostics Tools
description: Analyzing packet transmission, delays, and monitoring active network sockets (ping, netstat, ss).
---

# Network Diagnostics & Tools

Troubleshoot connectivity issues.

## 1. Checking Active Sockets
```bash
ss -tulan   # List listening TCP/UDP ports
```

## 2. Trace Route Packets
```bash
traceroute google.com
```
