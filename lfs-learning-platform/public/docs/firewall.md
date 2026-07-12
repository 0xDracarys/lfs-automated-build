---
title: Firewall Administration (iptables/nftables)
description: Defining packet filtering rules, block lists, and port forwarding rules.
---

# Firewall Administration

Secure your LFS install by defining firewall policies.

## 1. Blocking Traffic
```bash
iptables -A INPUT -s 10.0.0.5 -j DROP
```

## 2. Listing Rules
```bash
iptables -L -n -v
```
