---
title: Network Configuration Interface
description: Setting up manual IP allocation, interfaces, DNS resolvers, and default gateway configurations.
---

# Network Configuration Interface

Configure network cards and gateway routes.

## 1. Setting IP Manually
```bash
ip addr add 192.168.1.100/24 dev eth0
ip link set eth0 up
```

## 2. Adding Default Route
```bash
ip route add default via 192.168.1.1
```
