"use client";

import { HardDrive, Box, Container, Users, Shield, Layers, Network, Gauge, BookOpen } from "lucide-react";

interface VulnBoxOutputProps {
  data: {
    outputFormats: string[];
    difficultyRating: number;
    intendedAudience: string;
    networkMode: string;
    autoStartServices: boolean;
  };
  onChange: (updates: Partial<VulnBoxOutputProps["data"]>) => void;
}

const OUTPUT_FORMATS = [
  {
    id: "iso",
    label: "Bootable ISO",
    icon: <HardDrive className="w-5 h-5" />,
    desc: "Boot in VirtualBox, VMware, QEMU, or burn to USB",
    gradient: "from-emerald-500/20 to-green-500/20",
    border: "border-emerald-500/40",
    active: "ring-emerald-500/50",
    iconColor: "text-emerald-400",
  },
  {
    id: "ova",
    label: "OVA (VMware/VBox)",
    icon: <Box className="w-5 h-5" />,
    desc: "Pre-configured virtual machine — import and run instantly",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/40",
    active: "ring-blue-500/50",
    iconColor: "text-blue-400",
  },
  {
    id: "docker",
    label: "Docker Base Image",
    icon: <Container className="w-5 h-5" />,
    desc: "Container-ready image — run with docker run, no VM needed",
    gradient: "from-sky-500/20 to-indigo-500/20",
    border: "border-sky-500/40",
    active: "ring-sky-500/50",
    iconColor: "text-sky-400",
  },
];

const AUDIENCES = [
  { value: "beginner", label: "Beginner", icon: <BookOpen className="w-4 h-4" />, desc: "First-time learners, students" },
  { value: "intermediate", label: "Intermediate", icon: <Shield className="w-4 h-4" />, desc: "OSCP students, HTB users" },
  { value: "advanced", label: "Advanced", icon: <Layers className="w-4 h-4" />, desc: "Experienced pentesters, red teamers" },
  { value: "ctf-organizer", label: "CTF Organizer", icon: <Users className="w-4 h-4" />, desc: "Building challenges for others" },
];

const NETWORK_MODES = [
  { value: "host-only", label: "Host-Only (Isolated)", desc: "Most secure — VM can only talk to host, no internet" },
  { value: "nat", label: "NAT", desc: "VM gets internet through host — useful for downloading payloads" },
  { value: "bridged", label: "Bridged", desc: "VM is on the same network as host — only for air-gapped labs" },
];

const DIFFICULTY_LABELS = ["", "Trivial", "Easy", "Medium", "Hard", "Insane"];

export default function VulnBoxOutput({ data, onChange }: VulnBoxOutputProps) {
  const toggleFormat = (id: string) => {
    const current = data.outputFormats;
    const updated = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    if (updated.length === 0) return; // must have at least one
    onChange({ outputFormats: updated });
  };

  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-lg font-bold mb-1">Output Format & Difficulty</h3>
        <p className="text-sm text-gray-400">Choose how your VulnBox will be packaged and define its challenge metadata.</p>
      </div>

      {/* Output Formats */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-3">
          <HardDrive className="w-4 h-4 text-gray-400" />
          Output Formats <span className="text-xs text-gray-500 font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {OUTPUT_FORMATS.map((fmt) => {
            const active = data.outputFormats.includes(fmt.id);
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => toggleFormat(fmt.id)}
                className={`relative p-4 rounded-xl border text-left transition-all ${
                  active
                    ? `bg-gradient-to-br ${fmt.gradient} ${fmt.border} ring-1 ${fmt.active}`
                    : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                }`}
              >
                <div className={`mb-2.5 ${active ? fmt.iconColor : "text-gray-500"}`}>{fmt.icon}</div>
                <p className={`font-semibold text-sm mb-1 ${active ? "text-white" : "text-gray-300"}`}>{fmt.label}</p>
                <p className="text-xs text-gray-500 leading-snug">{fmt.desc}</p>
                {active && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          All selected formats are built from the same base. Credits consumed = 1 per format selected.
        </p>
      </div>

      {/* Difficulty */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Gauge className="w-4 h-4 text-gray-400" />
          Difficulty Rating
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            data.difficultyRating <= 1 ? "bg-green-500/20 text-green-400" :
            data.difficultyRating <= 2 ? "bg-emerald-500/20 text-emerald-400" :
            data.difficultyRating <= 3 ? "bg-yellow-500/20 text-yellow-400" :
            data.difficultyRating <= 4 ? "bg-orange-500/20 text-orange-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            {DIFFICULTY_LABELS[data.difficultyRating]}
          </span>
        </label>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 w-12">Easy</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={data.difficultyRating}
            onChange={(e) => onChange({ difficultyRating: parseInt(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-white/10 accent-red-500 cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-12 text-right">Insane</span>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">Stored as metadata — shown to users browsing VulnBox builds on the platform.</p>
      </div>

      {/* Audience */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Users className="w-4 h-4 text-gray-400" />
          Intended Audience
        </label>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => onChange({ intendedAudience: a.value })}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                data.intendedAudience === a.value
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-white/[0.07] bg-white/[0.02] text-gray-400 hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <span className={data.intendedAudience === a.value ? "text-violet-400" : "text-gray-600 mt-0.5"}>
                {a.icon}
              </span>
              <div>
                <p className="font-medium text-sm">{a.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Network Mode */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Network className="w-4 h-4 text-gray-400" />
          Recommended Network Mode
          <span className="text-xs text-gray-500 font-normal">(informational — configure in your VM)</span>
        </label>
        <div className="space-y-2">
          {NETWORK_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange({ networkMode: m.value })}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                data.networkMode === m.value
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                data.networkMode === m.value ? "border-cyan-400" : "border-gray-600"
              }`}>
                {data.networkMode === m.value && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </div>
              <div>
                <p className={`font-medium text-sm ${data.networkMode === m.value ? "text-cyan-300" : "text-gray-300"}`}>
                  {m.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Auto-start */}
      <label className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all">
        <div
          onClick={() => onChange({ autoStartServices: !data.autoStartServices })}
          className={`mt-0.5 w-11 h-6 rounded-full relative transition-all shrink-0 ${
            data.autoStartServices ? "bg-orange-500" : "bg-gray-700"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              data.autoStartServices ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
        <div>
          <p className="font-semibold text-sm">Auto-start Vulnerable Services on Boot</p>
          <p className="text-xs text-gray-500 mt-0.5">
            When enabled, all selected network services (FTP, Telnet, Redis, etc.) start automatically on boot.
            When disabled, the user/player must start them manually — adds a reconnaissance layer.
          </p>
        </div>
      </label>
    </div>
  );
}
