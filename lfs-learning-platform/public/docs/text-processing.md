---
title: Text Processing (grep, sed, awk)
description: Mastering streams and text search pipelines to edit configuration files programmatically.
---

# Text Processing

Learn how to search, replace, and filter config outputs.

## 1. Regex Search with Grep
Find patterns inside files:
```bash
grep -rnw '/etc/' -e 'nameserver'
```

## 2. Replace Strings with Sed
Non-interactive inline editing:
```bash
sed -i 's/OLD_IP/NEW_IP/g' /etc/resolv.conf
```
