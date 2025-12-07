---
title: Command Line Interface Guide
description: Master the Linux command line with our comprehensive CLI guide
---

# Command Line Interface Guide

Learn to navigate and control Linux through the command line interface (CLI).

## What is the CLI?

The **Command Line Interface** is a text-based interface where you type commands to interact with the operating system. Unlike graphical interfaces (GUI), the CLI provides:

- **Speed**: Execute commands faster than clicking through menus
- **Power**: Access advanced features not available in GUIs
- **Automation**: Write scripts to automate repetitive tasks
- **Remote Access**: Manage systems over SSH connections

## Basic Command Structure

Every command follows this pattern:

```bash
command [options] [arguments]
```

### Examples

```bash
# List files
ls -lah /home

# Remove a file
rm -rf /tmp/oldfiles

# Copy files
cp -r source/ destination/
```

## Essential Commands

### File Management

#### Listing Files

```bash
# Basic listing
ls

# Detailed listing
ls -l

# Include hidden files
ls -a

# Human-readable sizes
ls -lh

# Sort by modification time
ls -lt
```

#### Creating Files and Directories

```bash
# Create empty file
touch newfile.txt

# Create directory
mkdir mydir

# Create nested directories
mkdir -p parent/child/grandchild
```

#### Copying and Moving

```bash
# Copy file
cp source.txt destination.txt

# Copy directory
cp -r sourcedir/ destdir/

# Move/rename
mv oldname.txt newname.txt
```

#### Deleting

```bash
# Remove file
rm file.txt

# Remove directory
rm -r directory/

# Force remove (careful!)
rm -rf directory/
```

### Navigation

```bash
# Print working directory
pwd

# Change directory
cd /path/to/directory

# Go to home directory
cd ~
cd

# Go up one level
cd ..

# Go to previous directory
cd -
```

### Viewing Files

```bash
# Display entire file
cat file.txt

# View with pagination
less file.txt
more file.txt

# View first 10 lines
head file.txt

# View last 10 lines
tail file.txt

# Follow file changes (logs)
tail -f logfile.log
```

### Searching

```bash
# Find files by name
find /path -name "*.txt"

# Search file contents
grep "search term" file.txt

# Recursive search
grep -r "search term" /directory

# Case-insensitive search
grep -i "search term" file.txt
```

### System Information

```bash
# Display system info
uname -a

# Show disk usage
df -h

# Show directory size
du -sh /path

# Display memory usage
free -h

# Show running processes
ps aux

# Interactive process viewer
top
htop
```

## Command Composition

### Pipes

Chain commands together:

```bash
# List files and search
ls -la | grep ".txt"

# Count files
ls -la | wc -l

# Sort process by memory
ps aux | sort -k 4 -r | head -10
```

### Redirection

Save command output:

```bash
# Redirect to file (overwrite)
echo "Hello" > file.txt

# Append to file
echo "World" >> file.txt

# Redirect errors
command 2> errors.log

# Redirect both output and errors
command > output.log 2>&1
```

### Background Jobs

```bash
# Run in background
long_command &

# List background jobs
jobs

# Bring to foreground
fg %1

# Send to background
bg %1
```

## Text Processing

### grep - Search

```bash
# Basic search
grep "pattern" file.txt

# Multiple files
grep "pattern" *.txt

# Show line numbers
grep -n "pattern" file.txt

# Invert match (exclude)
grep -v "pattern" file.txt
```

### sed - Stream Editor

```bash
# Replace text
sed 's/old/new/g' file.txt

# Delete lines
sed '/pattern/d' file.txt

# Edit in place
sed -i 's/old/new/g' file.txt
```

### awk - Text Processing

```bash
# Print specific columns
awk '{print $1, $3}' file.txt

# Sum column values
awk '{sum += $1} END {print sum}' numbers.txt

# Filter by condition
awk '$3 > 100' data.txt
```

## Permissions

### Understanding Permissions

```bash
# Format: rwxrwxrwx
# Owner - Group - Others
# r (read) = 4
# w (write) = 2
# x (execute) = 1
```

### Changing Permissions

```bash
# Numeric mode
chmod 755 script.sh

# Symbolic mode
chmod u+x script.sh
chmod go-w file.txt

# Recursive
chmod -R 644 directory/
```

### Changing Ownership

```bash
# Change owner
chown user file.txt

# Change group
chgrp group file.txt

# Change both
chown user:group file.txt

# Recursive
chown -R user:group directory/
```

## Environment Variables

```bash
# Display variable
echo $PATH
echo $HOME

# Set variable
export MY_VAR="value"

# Add to PATH
export PATH=$PATH:/new/path

# View all variables
env
printenv
```

## Shortcuts

### Keyboard Shortcuts

- `Ctrl + C`: Cancel current command
- `Ctrl + D`: Exit terminal / EOF
- `Ctrl + L`: Clear screen
- `Ctrl + R`: Search command history
- `Ctrl + A`: Move to line start
- `Ctrl + E`: Move to line end
- `Ctrl + U`: Clear line before cursor
- `Ctrl + K`: Clear line after cursor
- `Tab`: Auto-complete

### Command History

```bash
# Show history
history

# Execute previous command
!!

# Execute specific command
!123

# Execute last command starting with 'git'
!git

# Search history
Ctrl + R, then type search term
```

## Best Practices

### 1. Always Use Tab Completion

Prevents typos and saves time.

### 2. Be Careful with `rm -rf`

Double-check paths before deleting.

### 3. Use `man` for Help

```bash
man ls
man grep
man chmod
```

### 4. Test Commands with `echo`

```bash
# Test before executing
echo rm /path/to/files/*
```

### 5. Create Aliases

```bash
# Add to ~/.bashrc
alias ll='ls -la'
alias gs='git status'
alias ..='cd ..'
```

## Practice Exercises

Try these commands in our [Interactive Terminal](/terminal):

1. Create a directory structure: `mkdir -p projects/web/frontend`
2. Create files: `touch projects/web/{index.html,style.css,script.js}`
3. List files recursively: `ls -R projects/`
4. Find all .js files: `find projects/ -name "*.js"`
5. Display disk usage: `du -sh projects/`

---

**Next Steps**:
- [File Systems Guide →](/docs/file-systems)
- [Shell Scripting →](/docs/shell-scripting)
- [Try Commands →](/commands)
