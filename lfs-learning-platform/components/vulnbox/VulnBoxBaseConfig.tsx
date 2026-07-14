"use client";

import { Cpu, Terminal, Server, Globe } from "lucide-react";

interface VulnBoxBaseConfigProps {
  data: {
    architecture: string;
    osPersona: string;
    kernelVersion: string;
    initSystem: string;
    defaultShell: string;
    timezone: string;
  };
  onChange: (updates: Partial<VulnBoxBaseConfigProps["data"]>) => void;
}

// Dark-mode safe select className — fixes white dropdown on dark UI
const DARK_SELECT =
  "w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all [color-scheme:dark]";

const RADIO_CLS =
  "flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-all";
const RADIO_ACTIVE = "border-red-500/60 bg-red-500/10 text-white";
const RADIO_INACTIVE =
  "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:bg-white/[0.06]";

function RadioGroup({
  label,
  icon,
  options,
  value,
  onChange,
  note,
}: {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string; note?: string }[];
  value: string;
  onChange: (v: string) => void;
  note?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold mb-3">
        {icon}
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.note}
            className={`${RADIO_CLS} ${value === o.value ? RADIO_ACTIVE : RADIO_INACTIVE}`}
          >
            {o.label}
            {o.note && (
              <span className="text-xs opacity-60 hidden sm:inline">— {o.note}</span>
            )}
          </button>
        ))}
      </div>
      {note && <p className="mt-1.5 text-xs text-gray-500">{note}</p>}
    </div>
  );
}

export default function VulnBoxBaseConfig({ data, onChange }: VulnBoxBaseConfigProps) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-lg font-bold mb-1">Base System Configuration</h3>
        <p className="text-sm text-gray-400">
          Define the underlying Linux system your VulnBox will run on.
        </p>
      </div>

      <RadioGroup
        label="Architecture"
        icon={<Cpu className="w-4 h-4 text-gray-400" />}
        value={data.architecture}
        onChange={(v) => onChange({ architecture: v })}
        options={[
          { value: "x86_64", label: "x86_64 (AMD/Intel)", note: "Most compatible" },
          { value: "arm64", label: "ARM64 (Apple Silicon / Pi)", note: "ARM hosts" },
        ]}
      />

      <RadioGroup
        label="OS Persona"
        icon={<Server className="w-4 h-4 text-gray-400" />}
        value={data.osPersona}
        onChange={(v) => onChange({ osPersona: v })}
        note="Sets default package layout and file structure feel. LFS base is always used underneath."
        options={[
          { value: "debian-like", label: "Debian-like" },
          { value: "rhel-like", label: "RHEL-like" },
          { value: "ubuntu-like", label: "Ubuntu-like" },
          { value: "minimal-lfs", label: "Minimal LFS (raw)" },
        ]}
      />

      {/* Kernel Version — dark select to fix white dropdown bug */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Globe className="w-4 h-4 text-gray-400" />
          Kernel Version
        </label>
        <select
          value={data.kernelVersion}
          onChange={(e) => onChange({ kernelVersion: e.target.value })}
          className={DARK_SELECT}
        >
          <option value="6.4.12">6.4.12 — Latest Stable (fewer known CVEs)</option>
          <option value="5.15.0">5.15.0 — LTS (moderate vuln surface)</option>
          <option value="5.8.0">5.8.0 — Dirty Pipe CVE-2022-0847 range</option>
          <option value="4.19.0">4.19.0 — Legacy (Dirty COW CVE-2016-5195 range)</option>
        </select>
        <p className="mt-1.5 text-xs text-gray-500">
          Older kernels unlock more kernel-level privilege escalation CVEs. Choose based on
          the vulnerability categories you plan to include.
        </p>
      </div>

      <RadioGroup
        label="Init System"
        value={data.initSystem}
        onChange={(v) => onChange({ initSystem: v })}
        options={[
          { value: "systemd", label: "systemd", note: "recommended" },
          { value: "sysvinit", label: "SysVinit" },
          { value: "busybox", label: "Busybox init", note: "minimal" },
        ]}
      />

      <RadioGroup
        label="Default Shell"
        icon={<Terminal className="w-4 h-4 text-gray-400" />}
        value={data.defaultShell}
        onChange={(v) => onChange({ defaultShell: v })}
        options={[
          { value: "bash", label: "/bin/bash" },
          { value: "zsh", label: "/bin/zsh" },
          { value: "sh", label: "/bin/sh (minimal)" },
        ]}
      />

      {/* Timezone — dark select */}
      <div>
        <label className="block text-sm font-semibold mb-2">Timezone</label>
        <select
          value={data.timezone}
          onChange={(e) => onChange({ timezone: e.target.value })}
          className={DARK_SELECT}
        >
          <option value="UTC">UTC (recommended for CTFs)</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
          <option value="Europe/London">Europe/London (GMT/BST)</option>
          <option value="Europe/Berlin">Europe/Berlin (CET)</option>
          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
        </select>
      </div>
    </div>
  );
}
