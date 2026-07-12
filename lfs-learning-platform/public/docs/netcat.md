---
title: Netcat (nc) Swiss Army Knife Guide
description: Using netcat to test ports, run remote shells, verify firewalls, and perform simple file transfers.
---

# Netcat (nc) Guide

Netcat is a powerful utility for network debugging and testing.

## 1. Listen on Port
```bash
nc -l -p 8080
```

## 2. Simple Port Scan
```bash
nc -zv 192.168.1.1 22-80
```
