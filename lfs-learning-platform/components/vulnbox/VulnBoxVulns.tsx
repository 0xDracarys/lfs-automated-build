"use client";

import { useState } from "react";
import { Globe, Settings, Wifi, Shield, Flag, KeyRound, ChevronDown, ChevronUp } from "lucide-react";

export interface VulnVulnsData {
  // Web
  dvwa: boolean;
  webgoat: boolean;
  juiceShop: boolean;
  mutillidae: boolean;
  webPort: string;
  // Misconfigs
  worldWritableCron: boolean;
  suidBinaries: boolean;
  weakPasswdPerms: boolean;
  nfsNoRootSquash: boolean;
  exposedGitDir: boolean;
  directoryListing: boolean;
  // Network Services
  ftpAnon: boolean;
  telnet: boolean;
  smbNullSession: boolean;
  smtpOpenRelay: boolean;
  redisNoAuth: boolean;
  mysqlNoPassword: boolean;
  snmpDefault: boolean;
  // Kernel / Privesc
  dirtyPipe: boolean;
  dirtyCow: boolean;
  customSuidOverflow: boolean;
  // CTF Flags
  plantedFlags: boolean;
  userRootTxt: boolean;
  encryptedFlag: boolean;
  hiddenStegoFlag: boolean;
  flagValue: string;
  rootFlagValue: string;
  // Credential Challenges
  crackablePasswdHashes: boolean;
  weakSSHPassphrase: boolean;
  envFileCredentials: boolean;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  fields: {
    key: keyof VulnVulnsData;
    label: string;
    sublabel: string;
    type?: "toggle" | "text";
    placeholder?: string;
    requires?: keyof VulnVulnsData;
    kernelNote?: string;
  }[];
}

const CATEGORIES: Category[] = [
  {
    id: "web",
    label: "🌐 Web Application Vulnerabilities",
    icon: <Globe className="w-4 h-4" />,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    fields: [
      { key: "dvwa", label: "DVWA", sublabel: "Damn Vulnerable Web Application — PHP/MySQL, covers SQLi, XSS, CSRF, file upload, etc.", type: "toggle" },
      { key: "webgoat", label: "WebGoat", sublabel: "OWASP Java training app — OWASP Top 10 lessons with interactive challenges", type: "toggle" },
      { key: "juiceShop", label: "OWASP Juice Shop", sublabel: "Modern JS app with 85+ vulnerabilities — API security, broken auth, injection", type: "toggle" },
      { key: "mutillidae", label: "Mutillidae II", sublabel: "PHP OWASP Top 10 vulnerable app — more verbose than DVWA, good for learning", type: "toggle" },
      { key: "webPort", label: "Web App Port", sublabel: "Port for the web application(s) to listen on", type: "text", placeholder: "80", requires: undefined },
    ],
  },
  {
    id: "misconfigs",
    label: "🔓 Intentional Misconfigurations",
    icon: <Settings className="w-4 h-4" />,
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    fields: [
      { key: "worldWritableCron", label: "World-writable cron jobs", sublabel: "/etc/cron.d/ is writable by all users — classic cron privesc", type: "toggle" },
      { key: "suidBinaries", label: "SUID Binaries", sublabel: "Sets SUID bit on find, vim, python, nmap — standard GTFOBins privesc vectors", type: "toggle" },
      { key: "weakPasswdPerms", label: "Weak /etc/passwd & /etc/shadow perms", sublabel: "World-readable shadow file — allows offline hash cracking by any user", type: "toggle" },
      { key: "nfsNoRootSquash", label: "NFS no_root_squash", sublabel: "Exports NFS share without root squashing — allows root escalation from NFS client", type: "toggle" },
      { key: "exposedGitDir", label: "Exposed .git in web root", sublabel: "Leaves .git directory accessible via HTTP — leaks source code and commit history", type: "toggle" },
      { key: "directoryListing", label: "Apache/Nginx directory listing enabled", sublabel: "Directory listing on web server — reveals file structure to unauthenticated users", type: "toggle" },
    ],
  },
  {
    id: "network",
    label: "🔌 Exposed Network Services",
    icon: <Wifi className="w-4 h-4" />,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    fields: [
      { key: "ftpAnon", label: "FTP Anonymous Login (vsftpd)", sublabel: "Allows anonymous FTP access — good for file retrieval challenges", type: "toggle" },
      { key: "telnet", label: "Telnet (cleartext)", sublabel: "Enables unencrypted telnet service — teaches sniffing credentials over plaintext protocols", type: "toggle" },
      { key: "smbNullSession", label: "SMB Null Session (Samba)", sublabel: "Samba with null authentication — enum4linux, smbclient without credentials", type: "toggle" },
      { key: "smtpOpenRelay", label: "SMTP Open Relay", sublabel: "Mail server that accepts relay from any IP — email spoofing scenario", type: "toggle" },
      { key: "redisNoAuth", label: "Redis without AUTH", sublabel: "Exposed Redis with no authentication — RCE via cron/SSH key injection", type: "toggle" },
      { key: "mysqlNoPassword", label: "MySQL root with no password", sublabel: "MySQL/MariaDB with root:'' — direct DB access, common in web challenge chains", type: "toggle" },
      { key: "snmpDefault", label: "SNMP v1/v2 default community string", sublabel: "SNMP with 'public' community string — leaks system information via snmpwalk", type: "toggle" },
    ],
  },
  {
    id: "kernel",
    label: "🐧 Kernel / Local Privilege Escalation",
    icon: <Shield className="w-4 h-4" />,
    color: "text-red-400",
    borderColor: "border-red-500/30",
    fields: [
      { key: "dirtyPipe", label: "Dirty Pipe (CVE-2022-0847)", sublabel: "Local privesc to root via pipe buffer overwrite", type: "toggle", kernelNote: "Requires kernel 5.8–5.16 (select in Step 2)" },
      { key: "dirtyCow", label: "Dirty COW (CVE-2016-5195)", sublabel: "Race condition in mmap — classic and widely taught privesc technique", type: "toggle", kernelNote: "Requires kernel < 4.8.3 (select 4.19 in Step 2)" },
      { key: "customSuidOverflow", label: "Custom SUID Binary with Buffer Overflow", sublabel: "Compiled-in C binary with intentional stack overflow — binary exploitation challenge", type: "toggle" },
    ],
  },
  {
    id: "flags",
    label: "🏳️ CTF Flags & Challenges",
    icon: <Flag className="w-4 h-4" />,
    color: "text-green-400",
    borderColor: "border-green-500/30",
    fields: [
      { key: "plantedFlags", label: "Planted flag.txt files", sublabel: "Drops flag.txt files at strategic locations — user supplies the flag strings below", type: "toggle" },
      { key: "flagValue", label: "User Flag Content", sublabel: "Content of /home/<user>/user.txt", type: "text", placeholder: "flag{your_flag_here}", requires: "plantedFlags" },
      { key: "userRootTxt", label: "HTB-style user.txt and root.txt", sublabel: "Places user.txt in user home, root.txt in /root — HackTheBox format", type: "toggle" },
      { key: "rootFlagValue", label: "Root Flag Content", sublabel: "Content of /root/root.txt", type: "text", placeholder: "flag{root_flag_here}", requires: "userRootTxt" },
      { key: "encryptedFlag", label: "Encrypted Flag (requires key hunting)", sublabel: "Flag is encrypted; the key is hidden elsewhere on the box — multi-step challenge", type: "toggle" },
      { key: "hiddenStegoFlag", label: "Steganography Hidden Flag", sublabel: "Flag hidden inside an image file using steghide — teaches steganography techniques", type: "toggle" },
    ],
  },
  {
    id: "creds",
    label: "🔑 Credential Challenges",
    icon: <KeyRound className="w-4 h-4" />,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    fields: [
      { key: "crackablePasswdHashes", label: "Crackable MD5 Password Hashes in /etc/passwd", sublabel: "Injects MD5 hashes for common passwords (hashcat wordlist targets)", type: "toggle" },
      { key: "weakSSHPassphrase", label: "SSH Private Key with Weak Passphrase", sublabel: "Drops an RSA key with 'password' as passphrase — teaches ssh2john + hashcat", type: "toggle" },
      { key: "envFileCredentials", label: ".env File with Credentials in Web Root", sublabel: "Drops a .env file under /var/www with DB creds — teaches recon of config files", type: "toggle" },
    ],
  },
];

interface VulnBoxVulnsProps {
  data: VulnVulnsData;
  onChange: (updates: Partial<VulnVulnsData>) => void;
}

export default function VulnBoxVulns({ data, onChange }: VulnBoxVulnsProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ web: true });

  const toggle = (id: string) =>
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleField = (key: keyof VulnVulnsData) =>
    onChange({ [key]: !data[key] } as Partial<VulnVulnsData>);

  const totalSelected = CATEGORIES.reduce(
    (acc, cat) =>
      acc +
      cat.fields.filter(
        (f) => f.type !== "text" && data[f.key as keyof VulnVulnsData] === true
      ).length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">Vulnerability Categories</h3>
          <p className="text-sm text-gray-400">
            Select which intentional vulnerabilities to inject. The more you add, the richer the challenge.
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl font-bold text-red-400">{totalSelected}</div>
          <div className="text-xs text-gray-500">vuln types</div>
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const isOpen = openCategories[cat.id];
        const catActiveCount = cat.fields.filter(
          (f) => f.type !== "text" && data[f.key] === true
        ).length;

        return (
          <div key={cat.id} className={`rounded-xl border ${cat.borderColor} overflow-hidden`}>
            <button
              type="button"
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className={cat.color}>{cat.icon}</span>
                <span className={`font-semibold text-sm ${cat.color}`}>{cat.label}</span>
                {catActiveCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white font-bold">
                    {catActiveCount} on
                  </span>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-white/[0.04] p-4 space-y-3">
                {cat.fields.map((field) => {
                  const disabled = field.requires && !data[field.requires];

                  if (field.type === "text") {
                    if (field.requires && !data[field.requires]) return null;
                    return (
                      <div key={String(field.key)} className="ml-2">
                        <label className="block text-xs font-semibold mb-1.5 text-gray-400">{field.label}</label>
                        <input
                          type="text"
                          value={String(data[field.key] ?? "")}
                          onChange={(e) => onChange({ [field.key]: e.target.value } as any)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-red-500/60 focus:outline-none font-mono transition-all"
                        />
                        <p className="mt-1 text-xs text-gray-500">{field.sublabel}</p>
                      </div>
                    );
                  }

                  return (
                    <label
                      key={String(field.key)}
                      className={`flex items-start gap-3 p-3 rounded-xl border border-white/[0.04] cursor-pointer transition-all ${
                        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/[0.03]"
                      } ${data[field.key] === true ? "bg-white/[0.04]" : ""}`}
                    >
                      <div
                        onClick={() => !disabled && toggleField(field.key)}
                        className={`mt-0.5 w-10 h-5 rounded-full relative transition-all shrink-0 ${
                          data[field.key] === true ? "bg-red-500" : "bg-gray-700"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            data[field.key] === true ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-200">{field.label}</p>
                          {field.kernelNote && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                              {field.kernelNote}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{field.sublabel}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
