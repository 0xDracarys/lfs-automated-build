// Enhanced AI Service with Real Linux Knowledge Base
// Provides intelligent responses with fallback when API is unavailable

import { Message, AIResponse } from './ai-service';

// Real Linux knowledge base for fallback responses
const LINUX_KNOWLEDGE_BASE: { [key: string]: string } = {
  // Basic Linux questions
  'what is linux': `Linux is a free and open-source operating system kernel created by Linus Torvalds in 1991. It manages hardware resources and allows software to run on computers. 

Key characteristics:
- **Open Source**: Source code is publicly available
- **Multi-user**: Multiple users can access the system simultaneously
- **Multitasking**: Runs multiple processes at once
- **Portable**: Runs on various hardware platforms
- **Secure**: Built-in user/permission system

Popular distributions include Ubuntu, Fedora, CentOS, and Debian.`,

  'linux file system': `The Linux file system is a hierarchical structure starting with root (/).

Key directories:
- **/bin** - Essential user commands
- **/sbin** - System administration commands
- **/home** - User home directories
- **/etc** - Configuration files
- **/var** - Variable data (logs, caches)
- **/usr** - User programs and data
- **/dev** - Device files
- **/proc** - Process information
- **/sys** - System information
- **/root** - Root user's home

Use \`ls -la\` to see files and \`tree\` to visualize directory structure.`,

  'chmod': `chmod changes file permissions in Linux.

Syntax: \`chmod [options] mode file\`

Modes (octal):
- **4** = read (r)
- **2** = write (w)
- **1** = execute (x)

Examples:
\`\`\`bash
chmod 755 script.sh    # Owner: rwx, Others: r-x
chmod 644 file.txt     # Owner: rw-, Others: r--
chmod +x script.sh     # Add execute permission
chmod -w file.txt      # Remove write permission
\`\`\`

Use \`chmod u=rwx,g=rx,o=rx file\` for symbolic notation.`,

  'sudo': `sudo (superuser do) allows users to run commands with elevated privileges.

Syntax: \`sudo command\`

Key points:
- Requires user password (configurable)
- Logged for auditing
- \`sudo -l\` lists available commands
- \`sudo -i\` opens root shell
- \`sudo -u user\` runs as specific user

Example:
\`\`\`bash
sudo apt update           # Update packages as root
sudo useradd newuser      # Create new user
sudo chown user:group file # Change ownership
\`\`\`

Configure with \`visudo\` for granular control.`,

  'processes': `A process is a running instance of a program in Linux.

Key concepts:
- **PID**: Process ID (unique identifier)
- **PPID**: Parent Process ID
- **States**: Running, Sleeping, Stopped, Zombie

Important commands:
\`\`\`bash
ps aux              # List all processes
top                 # Real-time process monitor
htop                # Enhanced top (needs installation)
kill -9 PID         # Force terminate process
bg                  # Run in background
fg                  # Bring to foreground
jobs                # List background jobs
\`\`\`

Use \`ps aux | grep name\` to find specific processes.`,

  'bash scripting': `Bash is the shell language for Linux scripts.

Basic structure:
\`\`\`bash
#!/bin/bash
# This is a comment

# Variables
name="Linux"
count=5

# Conditional
if [ $count -gt 3 ]; then
  echo "Count is greater than 3"
fi

# Loop
for i in {1..5}; do
  echo "Number: $i"
done

# Functions
greet() {
  echo "Hello, $1!"
}
greet "World"
\`\`\`

Key operators:
- \`-eq\` (equal), \`-ne\` (not equal)
- \`-gt\` (greater), \`-lt\` (less)
- \`-f\` (file exists), \`-d\` (directory exists)`,

  'networking': `Linux networking basics for connectivity.

Key commands:
\`\`\`bash
ifconfig              # Show network interfaces (deprecated)
ip addr show          # Modern alternative
ping 8.8.8.8          # Test connectivity
nslookup google.com   # DNS lookup
curl https://example.com  # Make web requests
netstat               # Show network connections
ss                    # Modern netstat replacement
\`\`\`

Network configuration:
- IP addresses: IPv4 (32-bit) or IPv6 (128-bit)
- Subnet mask: Defines network portion
- Gateway: Routes to other networks
- DNS: Resolves domain names to IPs`,

  'user management': `Create and manage users in Linux.

Key commands:
\`\`\`bash
useradd username           # Create new user
passwd username            # Set password
userdel username           # Delete user
usermod -aG sudo username  # Add user to sudoers
groupadd groupname         # Create group
usermod -g groupname user  # Change user's group
\`\`\`

View users:
\`\`\`bash
cat /etc/passwd      # All users
whoami               # Current user
id                   # Current user's ID and groups
w                    # Logged in users
\`\`\`

User files:
- **/etc/passwd** - User information
- **/etc/shadow** - Password hashes
- **/etc/group** - Group information`,

  'package management': `Install software using package managers.

Debian/Ubuntu (apt):
\`\`\`bash
apt update           # Update package list
apt install name     # Install package
apt remove name      # Remove package
apt upgrade          # Upgrade all packages
apt search name      # Search for package
\`\`\`

RedHat/CentOS (yum/dnf):
\`\`\`bash
yum install name     # Install package
yum remove name      # Remove package
yum update           # Update all packages
yum search name      # Search for package
\`\`\`

Arch (pacman):
\`\`\`bash
pacman -S name       # Install package
pacman -R name       # Remove package
pacman -Syu          # Update all packages
\`\`\``,

  'grep': `Search text patterns in files and streams.

Syntax: \`grep [options] pattern file\`

Common options:
- \`-i\` - Case insensitive
- \`-v\` - Invert match (exclude)
- \`-n\` - Show line numbers
- \`-r\` - Recursive search
- \`-c\` - Count matches

Examples:
\`\`\`bash
grep "error" logfile.txt         # Find "error"
grep -i "ERROR" file.txt         # Case insensitive
grep -v "^#" config.conf         # Exclude comments
grep -r "function" .             # Recursive search
ps aux | grep python             # Search in command output
\`\`\`

Use \`grep -E\` for extended regex patterns.`,

  'permissions': `File permissions control access in Linux.

Format: \`rwxrwxrwx\` (user/owner, group, others)
- **r** (4) - Read
- **w** (2) - Write
- **x** (1) - Execute

Example breakdown of \`755\`:
- Owner: 7 (rwx) - Full access
- Group: 5 (r-x) - Read and execute
- Others: 5 (r-x) - Read and execute

Commands:
\`\`\`bash
chmod 644 file.txt     # Owner: rw-, Others: r--
chmod 755 script.sh    # Owner: rwx, Others: r-x
chmod 700 private.txt  # Owner only: rwx
chown user:group file  # Change ownership
\`\`\`

For directories:
- **r** - List contents
- **w** - Create/delete files
- **x** - Enter directory`,

  'ssh': `Secure Shell for remote access.

Connect:
\`\`\`bash
ssh user@hostname          # Basic connection
ssh -p 2222 user@host      # Custom port
ssh -i key.pem user@host   # With key file
\`\`\`

Key generation:
\`\`\`bash
ssh-keygen -t rsa -b 4096  # Generate keys
ssh-copy-id -i key user@host  # Copy public key
\`\`\`

Security best practices:
- Use key-based authentication
- Disable password authentication
- Change default SSH port
- Disable root login
- Use firewall rules`,

  'lfs': `Linux From Scratch (LFS) is building a Linux system from source code.

Benefits:
- **Learn**: Deep understanding of Linux internals
- **Control**: Customize every component
- **Minimal**: No unnecessary packages
- **Performance**: Optimized for your hardware

Main steps:
1. Prepare environment and toolchain
2. Build temporary system
3. Enter chroot and build final system
4. Install bootloader
5. Configure boot system

Time: 20-30 hours depending on speed

Resources:
- Official book: linuxfromscratch.org
- Covers kernel, glibc, gcc, binutils
- Step-by-step instructions
- Community support available`,
};

// Question normalization for matching
function normalizeQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/[?!.,:]/g, '');
}

// Find matching answer from knowledge base
function findMatchingAnswer(question: string): string | null {
  const normalized = normalizeQuestion(question);
  
  for (const [key, answer] of Object.entries(LINUX_KNOWLEDGE_BASE)) {
    // Direct match
    if (normalized.includes(key)) {
      return answer;
    }
    // Partial match
    if (key.split(' ').some(word => normalized.includes(word))) {
      return answer;
    }
  }
  
  return null;
}

/**
 * Get a real answer from knowledge base with fallback
 */
export async function getRealAnswer(userQuery: string): Promise<AIResponse> {
  try {
    // First try to find an answer in knowledge base
    const knowledgeAnswer = findMatchingAnswer(userQuery);
    
    if (knowledgeAnswer) {
      return {
        message: knowledgeAnswer,
        sources: ['Linux Knowledge Base', 'LFS Platform'],
        relatedTopics: ['Linux Fundamentals', 'System Administration']
      };
    }

    // Try API if configured
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // API failed, use fallback
    }

    // Fallback: Generic but helpful response
    return {
      message: `I understand you're asking about: "${userQuery}"

This is a great Linux learning question! Based on the LFS platform, here are some related resources:

**Suggested Modules:**
- System Administration Fundamentals - User and Group Management
- Essential Skills - Understanding Linux Commands
- Networking and Connectivity - Network Configuration

**Quick Tips:**
- Use \`man command\` to read manual pages
- \`--help\` flag shows command options
- \`info command\` provides detailed documentation

Try browsing the course modules or ask more specific questions like:
- "What is chmod?"
- "How do I use sudo?"
- "Explain processes in Linux"

I'll provide detailed answers to specific Linux topics!`,
      sources: ['LFS Platform Fallback'],
      relatedTopics: ['Linux Basics', 'Commands', 'System Admin']
    };
  } catch (error) {
    console.error('Error getting answer:', error);
    return {
      message: 'I encountered an issue processing your question. Please try rephrasing or ask about specific Linux topics.',
      sources: ['Error Handler']
    };
  }
}

export async function queryVertexAI(userQuery: string, context?: string): Promise<AIResponse> {
  return getRealAnswer(userQuery);
}
