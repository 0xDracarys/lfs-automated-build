"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Trash2, Download, AlertCircle } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { ProgressService } from "@/lib/progressService";

interface HistoryEntry {
  command: string;
  output: string;
  type: "success" | "error" | "info";
}

export default function TerminalPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: "welcome",
      output: `Welcome to LFS Terminal Emulator!
      
This is a practice terminal for learning Linux commands.
Type 'help' to see available commands.
Type 'clear' to clear the terminal.

Note: This is a simulated environment.`,
      type: "info"
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cmdFromUrl = params.get('cmd');
      if (cmdFromUrl) {
        setCurrentCommand(cmdFromUrl);
        inputRef.current?.focus();
      }
    }
  }, []);


  const simulateCommand = (cmd: string): { output: string; type: "success" | "error" | "info" } => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (trimmedCmd === "help") {
      return {
        output: `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  ls            - List directory contents
  pwd           - Print working directory
  whoami        - Display current user
  date          - Show current date and time
  echo [text]   - Print text to terminal
  uname         - Show system information
  cat [file]    - Display file contents
  mkdir [name]  - Create directory
  touch [file]  - Create file
  history       - Show command history
  ping [host]   - Test connectivity
  ifconfig      - Show network interfaces
  wget [url]    - Download file
  git status    - Show git status
  git log       - Show commit history`,
        type: "info"
      };
    }

    if (trimmedCmd === "clear") return { output: "", type: "info" };

    if (trimmedCmd === "ls" || trimmedCmd.startsWith("ls ")) {
      return {
        output: `drwxr-xr-x  documents/\ndrwxr-xr-x  downloads/\n-rwxr-xr-x  lfs-kernel-6.4.12\ndrwxr-xr-x  projects/`,
        type: "success"
      };
    }

    if (trimmedCmd === "pwd") return { output: "/home/sam/lfs-learning", type: "success" };
    if (trimmedCmd === "whoami") return { output: "sam", type: "success" };
    if (trimmedCmd === "date") return { output: new Date().toString(), type: "success" };
    if (trimmedCmd.startsWith("echo ")) return { output: cmd.substring(5), type: "success" };
    if (trimmedCmd === "uname" || trimmedCmd === "uname -a") {
      return { output: "Linux lfs-system 6.4.12-custom x86_64 GNU/Linux", type: "success" };
    }

    if (trimmedCmd.startsWith("cat ")) {
      const filename = trimmedCmd.substring(4).trim();
      if (filename.includes("readme")) {
        return { output: "# Linux From Scratch Learning Platform\nBuilt by Sam", type: "success" };
      }
      return { output: `cat: ${filename}: No such file or directory`, type: "error" };
    }

    if (trimmedCmd.startsWith("mkdir ")) return { output: `Directory created: ${trimmedCmd.substring(6)}`, type: "success" };
    if (trimmedCmd.startsWith("touch ")) return { output: `File created: ${trimmedCmd.substring(6)}`, type: "success" };
    if (trimmedCmd === "history") return { output: commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join("\n"), type: "info" };

    if (trimmedCmd.startsWith("ping ")) {
      const host = trimmedCmd.substring(5).trim();
      return { output: `PING ${host}: 64 bytes, time=12.3ms\n4 packets transmitted, 4 received, 0% loss`, type: "success" };
    }

    if (trimmedCmd === "ifconfig") {
      return { output: `eth0: inet 192.168.1.100  netmask 255.255.255.0\nlo: inet 127.0.0.1`, type: "success" };
    }

    if (trimmedCmd.startsWith("wget ")) {
      return { output: `Downloading... 100% complete\nSaved to 'index.html'`, type: "success" };
    }

    if (trimmedCmd === "git status") {
      return { output: `On branch main\nYour branch is up to date.\nnothing to commit`, type: "info" };
    }

    if (trimmedCmd === "git log" || trimmedCmd.startsWith("git log ")) {
      return { output: `commit a1b2c3d (HEAD -> main)\nAuthor: Sam\nDate: Nov 9 2025\n\n    Initial commit`, type: "info" };
    }

    return { output: `${cmd}: command not found\nType 'help' for available commands.`, type: "error" };
  };

  const executeCommand = async () => {
    if (!currentCommand.trim()) return;
    const cmd = currentCommand.trim();
    setCommandHistory(prev => [...prev, cmd]);

    if (cmd.toLowerCase() === "clear") {
      setHistory([]);
      setCurrentCommand("");
      return;
    }

    const result = simulateCommand(cmd);
    setHistory(prev => [...prev, { command: cmd, ...result }]);
    setCurrentCommand("");
    setHistoryIndex(-1);

    if (user) {
      const category = cmd.startsWith('ls') || cmd.startsWith('cd') || cmd.startsWith('pwd') ? 'file-operations' :
                       cmd.startsWith('ping') || cmd.startsWith('ifconfig') ? 'networking' :
                       cmd.startsWith('git') ? 'git-dev' : 'system-info';
      await ProgressService.trackCommand(user.uid, cmd, category, result.type === 'success');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        <DottedSurface className="opacity-20" />
        
        <div className="relative z-10 pt-8 px-6 pb-6 h-[calc(100vh-64px)] flex flex-col">
          <div className="container mx-auto max-w-6xl flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="py-4 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Interactive Terminal
                  </h1>
                  <p className="text-gray-400 text-sm">Practice Linux commands safely</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const content = history.map(e => `$ ${e.command}\n${e.output}\n`).join("\n");
                      const blob = new Blob([content], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "terminal-history.txt";
                      a.click();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setHistory([])}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  Simulated environment. Type <code className="px-1 rounded bg-white/10 text-green-400">help</code> for commands.
                </p>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-gray-900/90 overflow-hidden min-h-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2">sam@lfs-learning</span>
                </div>
                <span className="text-xs text-gray-500">{commandHistory.length} commands</span>
              </div>

              <div
                ref={terminalRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-sm"
                style={{ maxHeight: 'calc(100vh - 350px)' }}
              >
                {history.map((entry, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <span className="text-green-400">sam</span>
                      <span>@</span>
                      <span className="text-blue-400">lfs</span>
                      <span>:~$</span>
                      <span className="text-white ml-1">{entry.command}</span>
                    </div>
                    {entry.output && (
                      <pre className={`whitespace-pre-wrap text-xs ${
                        entry.type === "error" ? "text-red-400" :
                        entry.type === "success" ? "text-green-400" : "text-gray-300"
                      }`}>{entry.output}</pre>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="text-green-400">sam</span>
                  <span>@</span>
                  <span className="text-blue-400">lfs</span>
                  <span>:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-white font-mono ml-1"
                    autoFocus
                    spellCheck={false}
                  />
                </div>
                <div ref={terminalEndRef} />
              </div>
            </div>

            {/* Quick Commands */}
            <div className="py-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Quick:</span>
                {["help", "ls", "pwd", "uname -a", "ifconfig"].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => { setCurrentCommand(cmd); inputRef.current?.focus(); }}
                    className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 hover:text-green-400"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
