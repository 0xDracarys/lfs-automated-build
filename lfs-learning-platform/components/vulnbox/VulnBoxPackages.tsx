"use client";

import { Package } from "lucide-react";

export interface PackagesData {
  // Networking
  netcat: boolean;
  nmap: boolean;
  curlWget: boolean;
  socat: boolean;
  // Web Stack
  apache: boolean;
  php: boolean;
  mysql: boolean;
  python3Web: boolean;
  // Scripting
  python3: boolean;
  ruby: boolean;
  perl: boolean;
  // File Utils
  zipUnzip: boolean;
  git: boolean;
  vimNano: boolean;
  // CTF Utils
  binwalk: boolean;
  exiftool: boolean;
  steghide: boolean;
  foremost: boolean;
  // Build Tools
  gcc: boolean;
  make: boolean;
  gdb: boolean;
}

interface PackageGroup {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  packages: {
    key: keyof PackagesData;
    name: string;
    detail: string;
  }[];
}

const PACKAGE_GROUPS: PackageGroup[] = [
  {
    id: "networking",
    label: "Networking",
    emoji: "🌐",
    desc: "Network utilities for recon, pivoting, and traffic tools",
    packages: [
      { key: "netcat", name: "netcat / nc", detail: "TCP/UDP Swiss army knife — reverse shells, listeners" },
      { key: "nmap", name: "nmap", detail: "Network scanner and port mapper" },
      { key: "curlWget", name: "curl + wget", detail: "HTTP clients for downloading files, interacting with APIs" },
      { key: "socat", name: "socat", detail: "Advanced netcat — relay, tunneling, encrypted shells" },
    ],
  },
  {
    id: "webstack",
    label: "Web Stack",
    emoji: "🌍",
    desc: "Required if enabling DVWA, WebGoat, or Juice Shop",
    packages: [
      { key: "apache", name: "Apache2 / Nginx", detail: "Web server — required for PHP-based vuln apps" },
      { key: "php", name: "PHP", detail: "Server-side scripting — required for DVWA and Mutillidae" },
      { key: "mysql", name: "MySQL / MariaDB", detail: "Database — required for all SQL injection apps" },
      { key: "python3Web", name: "Python3 SimpleHTTP", detail: "Quick HTTP server for file serving / SSRF testing" },
    ],
  },
  {
    id: "scripting",
    label: "Scripting",
    emoji: "🐍",
    desc: "Runtimes and interpreters for exploit scripts",
    packages: [
      { key: "python3", name: "Python 3", detail: "Essential for pwntools, exploit scripts, CTF automation" },
      { key: "ruby", name: "Ruby", detail: "Needed for some Metasploit modules and scripts" },
      { key: "perl", name: "Perl", detail: "Legacy exploit scripts, regex tooling" },
    ],
  },
  {
    id: "fileutils",
    label: "File Utilities",
    emoji: "📁",
    desc: "Basic utilities for file manipulation and editing",
    packages: [
      { key: "zipUnzip", name: "zip / unzip", detail: "Archive handling — useful for CTF file challenges" },
      { key: "git", name: "git", detail: "Version control — needed if exposed .git repo is enabled" },
      { key: "vimNano", name: "vim + nano", detail: "Text editors — minimal ergonomics for the box" },
    ],
  },
  {
    id: "ctfutils",
    label: "CTF Utilities",
    emoji: "🔍",
    desc: "Forensics, steganography, and analysis tools",
    packages: [
      { key: "binwalk", name: "binwalk", detail: "Firmware analysis and extraction — good for stego/forensics" },
      { key: "exiftool", name: "exiftool", detail: "Metadata extraction from images/files" },
      { key: "steghide", name: "steghide", detail: "Steganography tool — required if steganography flag is enabled" },
      { key: "foremost", name: "foremost", detail: "File carving from disk images or dumps" },
    ],
  },
  {
    id: "build",
    label: "Build & Debug Tools",
    emoji: "🔧",
    desc: "Compilers and debuggers for binary exploitation challenges",
    packages: [
      { key: "gcc", name: "GCC", detail: "C compiler — needed for compiling custom exploit binaries or challenges" },
      { key: "make", name: "make", detail: "Build automation — required for compiled challenge binaries" },
      { key: "gdb", name: "gdb", detail: "GNU Debugger — for buffer overflow / pwn challenges" },
    ],
  },
];

interface VulnBoxPackagesProps {
  data: PackagesData;
  onChange: (updates: Partial<PackagesData>) => void;
}

export default function VulnBoxPackages({ data, onChange }: VulnBoxPackagesProps) {
  const totalOn = Object.values(data).filter(Boolean).length;

  const toggleAll = (group: PackageGroup, on: boolean) => {
    const updates: Partial<PackagesData> = {};
    group.packages.forEach((p) => {
      updates[p.key] = on;
    });
    onChange(updates);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">Tools & Packages</h3>
          <p className="text-sm text-gray-400">
            Select what gets pre-installed. These are legitimate tools for the challenge creator or player.
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl font-bold text-violet-400">{totalOn}</div>
          <div className="text-xs text-gray-500">packages</div>
        </div>
      </div>

      {PACKAGE_GROUPS.map((group) => {
        const groupOn = group.packages.filter((p) => data[p.key]).length;
        const allOn = groupOn === group.packages.length;

        return (
          <div key={group.id} className="rounded-xl border border-white/[0.07] overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-base">{group.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{group.label}</p>
                  <p className="text-xs text-gray-500">{group.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {groupOn > 0 && (
                  <span className="text-xs text-violet-400 font-medium">{groupOn}/{group.packages.length}</span>
                )}
                <button
                  type="button"
                  onClick={() => toggleAll(group, !allOn)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                    allOn
                      ? "border-violet-500/50 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20"
                      : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                  }`}
                >
                  {allOn ? "All On" : "All Off"}
                </button>
              </div>
            </div>

            <div className="border-t border-white/[0.04] divide-y divide-white/[0.03]">
              {group.packages.map((pkg) => (
                <label
                  key={String(pkg.key)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    onClick={() => onChange({ [pkg.key]: !data[pkg.key] } as Partial<PackagesData>)}
                    className={`w-9 h-5 rounded-full relative transition-all shrink-0 ${
                      data[pkg.key] ? "bg-violet-600" : "bg-gray-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        data[pkg.key] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 font-mono">{pkg.name}</p>
                    <p className="text-xs text-gray-500">{pkg.detail}</p>
                  </div>
                  <Package className={`w-4 h-4 shrink-0 ${data[pkg.key] ? "text-violet-400" : "text-gray-700"}`} />
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
