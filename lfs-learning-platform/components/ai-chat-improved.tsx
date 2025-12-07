'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageSquare, AlertCircle, BookOpen } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  lessonContext?: string;
  lessonTitle?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

// Comprehensive knowledge base for AI responses
const KNOWLEDGE_BASE: Record<string, Record<string, string>> = {
  'linux-basics': {
    'what is linux': 'Linux is a free, open-source operating system kernel created by Linus Torvalds in 1991. It powers everything from servers to smartphones and works on top of GNU software to create a complete operating system. Linux is known for being secure, stable, and highly customizable.',
    'why learn linux': 'Learning Linux is essential for system administration, web development, cybersecurity, and DevOps roles. It teaches fundamental computing concepts and provides hands-on experience with a powerful operating system used by most web servers and cloud platforms.',
    'what is lfs': 'Linux From Scratch (LFS) is a project that teaches you how to build a complete Linux system from source code. It starts with a toolchain, builds essential system utilities, and compiles a working kernel - giving you deep understanding of how Linux works.',
  },
  'commands': {
    'what is bash': 'Bash (Bourne Again Shell) is a command-line interpreter for Linux. It allows you to interact with the operating system by typing commands. You can use it to manage files, run programs, and automate tasks through shell scripts.',
    'ls command': 'The `ls` command lists files and directories in the current location. Common options: `ls -l` (detailed list), `ls -a` (show hidden files), `ls -la` (combined options).',
    'cd command': 'The `cd` (change directory) command moves you between folders. Usage: `cd /path/to/directory` to go to a specific folder, `cd ..` to go up one level, `cd ~` to go to home directory.',
    'pwd command': 'The `pwd` (print working directory) command shows your current location in the file system. It displays the full path from the root directory.',
    'mkdir command': 'The `mkdir` (make directory) command creates new folders. Usage: `mkdir folder_name` creates one folder, `mkdir -p path/to/nested/folder` creates nested directories.',
    'rm command': 'The `rm` (remove) command deletes files. Use `rm file.txt` to delete a file. WARNING: Deleted files cannot be recovered! Use `rm -rf directory` to remove directories (use carefully!).',
    'cp command': 'The `cp` (copy) command duplicates files and directories. Usage: `cp source destination` copies a file, `cp -r source/ destination/` copies directories recursively.',
    'mv command': 'The `mv` (move) command moves or renames files. Usage: `mv oldname newname` renames, `mv file /path/` moves file to a directory.',
    'cat command': 'The `cat` (concatenate) command displays file contents or combines files. Usage: `cat file.txt` shows the content.',
    'grep command': 'The `grep` command searches for text patterns in files. Usage: `grep "pattern" file.txt` finds lines containing the pattern.',
  },
  'permissions': {
    'what are file permissions': 'File permissions control who can read, write, and execute files. In Linux, permissions are divided into three categories: Owner (User), Group, and Others. Each has three permissions: Read (r), Write (w), and Execute (x).',
    'chmod command': 'The `chmod` command changes file permissions. Numeric method: `chmod 755 file` (owner: rwx, group: rx, others: rx). Symbolic method: `chmod +x file` (add execute permission).',
    'what is 755': '755 means: Owner has read+write+execute (7), Group has read+execute (5), Others have read+execute (5). This is common for executable scripts and directories.',
    'what is 644': '644 means: Owner has read+write (6), Group has read-only (4), Others have read-only (4). This is typical for regular files that shouldn\'t be executed.',
    'sudo command': 'The `sudo` command runs a command with superuser (administrator) privileges. Usage: `sudo command` prompts for your password, then executes the command with admin rights. Very powerful - use carefully!',
  },
  'filesystem': {
    'what is root directory': 'The root directory (/) is the top-level directory in Linux. All other directories branch from it. It contains essential system directories like /bin, /etc, /home, /usr, /var, etc.',
    'what is home directory': 'The home directory (~) is your personal folder where you store your files. For user "alice", the home directory is /home/alice. You can use ~ as a shortcut to your home directory.',
    'what is bin directory': 'The /bin directory contains essential command-line programs (binaries) needed for the system to function. Commands like ls, cp, and rm are stored here.',
    'what is etc directory': 'The /etc directory stores system configuration files. Most files here are text-based and control how the system and applications behave. You typically need superuser access to modify files here.',
    'what is usr directory': 'The /usr directory contains user programs and data. It includes /usr/bin (user applications), /usr/lib (libraries), and /usr/share (shared data like documentation).',
    'what is var directory': 'The /var directory contains variable data like logs (/var/log), temporary files (/var/tmp), and mail. These files change frequently during system operation.',
  },
  'users-groups': {
    'what is a user': 'A user is a login account on the system. Each user has a unique name, user ID (UID), home directory, and shell. Multiple users can work on the same system securely.',
    'what are groups': 'A group is a collection of users. Groups allow you to manage permissions for multiple users at once. Each group has a group ID (GID).',
    'useradd command': 'The `useradd` command creates a new user. Usage: `sudo useradd -m -s /bin/bash username` creates a user with a home directory and bash shell.',
    'passwd command': 'The `passwd` command sets or changes a user\'s password. Usage: `passwd` changes your own password, `sudo passwd username` changes another user\'s password.',
    'whoami command': 'The `whoami` command displays your current username. It\'s useful to verify which user account you\'re logged in as.',
    'su command': 'The `su` command switches to another user account. Usage: `su username` switches to that user (prompts for password), `su -` switches to root.',
  },
  'processes': {
    'what is a process': 'A process is a running instance of a program. Every running program, service, and command is a process. Each process has a unique Process ID (PID).',
    'what is pid': 'PID (Process ID) is a unique number assigned to each running process. The kernel uses PIDs to track and manage processes. You can view processes using the `ps` command.',
    'ps command': 'The `ps` command displays running processes. Usage: `ps` shows your processes, `ps aux` shows all processes on the system with detailed information.',
    'top command': 'The `top` command shows real-time system resource usage and running processes. It displays CPU usage, memory consumption, and process details. Press `q` to quit.',
    'kill command': 'The `kill` command terminates a process. Usage: `kill PID` sends SIGTERM (graceful shutdown), `kill -9 PID` sends SIGKILL (forced termination). Use carefully!',
    'background processes': 'A background process runs without blocking the terminal. Add `&` at the end of a command to run it in the background. Use `jobs` to see background jobs, `fg` to bring them to foreground.',
  },
  'networking': {
    'what is tcp-ip': 'TCP/IP is the fundamental protocol suite for internet communication. TCP (Transmission Control Protocol) ensures reliable delivery, while IP (Internet Protocol) handles routing packets between computers.',
    'what is ipv4': 'IPv4 (Internet Protocol version 4) uses 32-bit addresses (like 192.168.1.1). It supports about 4.3 billion unique addresses. Most of the internet still uses IPv4.',
    'what is ipv6': 'IPv6 (Internet Protocol version 6) uses 128-bit addresses, providing vastly more address space. It\'s designed to be the successor to IPv4 and support the growing number of internet devices.',
    'ifconfig command': 'The `ifconfig` command displays network interface configuration. It shows IP addresses, MAC addresses, and network statistics. Newer systems use `ip` command instead.',
    'ping command': 'The `ping` command tests connectivity to a remote host. Usage: `ping google.com` sends test packets and shows response times. Press `Ctrl+C` to stop.',
    'netstat command': 'The `netstat` command displays network statistics and active connections. It shows open ports, listening services, and connection information.',
  },
  'shell-scripting': {
    'what is a shell script': 'A shell script is a text file containing bash commands executed sequentially. It\'s a powerful way to automate tasks, perform backups, and manage system administration.',
    'hello world script': 'A basic shell script starts with `#!/bin/bash` (shebang) followed by commands:\n```bash\n#!/bin/bash\necho "Hello, World!"\n```\nMake it executable with `chmod +x script.sh` and run with `./script.sh`.',
    'variables in bash': 'Bash variables store data: `name="value"`. Access with `$name`. No spaces around the `=` sign. Example: `greeting="Hello"` then `echo $greeting`.',
    'if statement': 'Bash if statements test conditions:\n```bash\nif [ $age -ge 18 ]; then\n  echo "Adult"\nelse\n  echo "Minor"\nfi\n```\nCommon tests: `-eq` (equal), `-ne` (not equal), `-gt` (greater), `-lt` (less).',
    'loops in bash': 'For loops iterate over items:\n```bash\nfor i in 1 2 3; do\n  echo $i\ndone\n```\nWhile loops repeat until condition is false:\n```bash\nwhile [ $count -lt 5 ]; do\n  ((count++))\ndone\n```',
  },
};

export default function AIChat({
  lessonContext,
  lessonTitle = 'Linux Learning',
  onClose,
  isOpen = true,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `👋 Hello! I'm your Linux Learning AI Assistant. I can help you with:\n\n📚 Linux fundamentals\n⚙️ Command explanations\n🔐 File permissions\n👥 User & group management\n🔗 Networking concepts\n⚡ Shell scripting\n📂 File system navigation\n🔄 Process management\n\nWhat would you like to learn about? Try asking me about any Linux topic!`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find best matching answer from knowledge base
  const findAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Search all categories and questions
    for (const category of Object.values(KNOWLEDGE_BASE)) {
      for (const [question, answer] of Object.entries(category)) {
        if (question.includes(lowerQuery) || lowerQuery.includes(question)) {
          return answer;
        }
      }
    }
    
    // If no exact match, search for keywords
    const keywords = lowerQuery.split(' ');
    for (const category of Object.values(KNOWLEDGE_BASE)) {
      for (const [question, answer] of Object.entries(category)) {
        if (keywords.some(kw => question.includes(kw))) {
          return answer;
        }
      }
    }
    
    // Default response for unknown questions
    return `I found your question about "${query}" interesting! While I don't have specific information about that exact topic, I recommend:\n\n1. Checking the lesson FAQs\n2. Looking at related code examples\n3. Exploring the Linux man pages\n4. Trying the command in a terminal\n\nFor more comprehensive AI responses, please configure Google Cloud Vertex AI credentials. What else would you like to learn about?`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Simulate processing delay for natural feel
    setTimeout(() => {
      try {
        const answer = findAnswer(input);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: answer,
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
        setError(errorMessage);
        
        const errorAIMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease try rephrasing your question.`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorAIMessage]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    }, 300);
  };

  const quickQuestions = [
    'What is Linux?',
    'Explain chmod command',
    'How do I create a user?',
    'What are file permissions?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      const form = inputRef.current?.form;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Linux AI Assistant</h3>
            <p className="text-xs text-blue-100">{lessonTitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-950/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none border border-slate-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/50">
          <p className="text-xs text-slate-400 mb-2">Try asking:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="text-left text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-700 p-3 bg-slate-900/50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Linux..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
