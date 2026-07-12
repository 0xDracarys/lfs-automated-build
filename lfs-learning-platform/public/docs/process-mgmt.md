---
title: Process Management & Controls
description: Listing, killing, backgrounding, and configuring process priority (top, htop, ps, kill).
---

# Process Management & Controls

Manage background tasks and prioritize resource allocation.

## 1. Background Jobs
Run jobs in the background:
```bash
./build-lfs.sh &
jobs -l
```

## 2. Process Termination
Gracefully terminate or force close processes:
```bash
kill -15 <PID>  # SIGTERM (clean exit)
kill -9 <PID>   # SIGKILL (force close)
```
