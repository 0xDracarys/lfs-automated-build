---
title: Debugging & Execution Profilers
description: Using GDB to debug crashes, and strace to capture system calls.
---

# Debugging & Execution Profilers

Inspect low-level binaries and monitor calls.

## 1. Monitoring System Calls
```bash
strace -o trace.log ./binary
```
