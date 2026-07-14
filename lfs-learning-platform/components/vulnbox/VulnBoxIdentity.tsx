"use client";

import { Palette } from "lucide-react";

const BOX_COLORS = [
  { name: "Red", value: "red", cls: "bg-red-500" },
  { name: "Orange", value: "orange", cls: "bg-orange-500" },
  { name: "Amber", value: "amber", cls: "bg-amber-500" },
  { name: "Green", value: "green", cls: "bg-emerald-500" },
  { name: "Cyan", value: "cyan", cls: "bg-cyan-500" },
  { name: "Blue", value: "blue", cls: "bg-blue-500" },
  { name: "Purple", value: "purple", cls: "bg-violet-500" },
  { name: "Pink", value: "pink", cls: "bg-pink-500" },
];

interface VulnBoxIdentityProps {
  data: {
    boxName: string;
    description: string;
    boxColor: string;
    authorTag: string;
  };
  onChange: (updates: Partial<VulnBoxIdentityProps["data"]>) => void;
}

export default function VulnBoxIdentity({ data, onChange }: VulnBoxIdentityProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-1">Identity & Branding</h3>
        <p className="text-sm text-gray-400">Give your vulnerable box a name and personality.</p>
      </div>

      {/* Box Name */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Box Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={data.boxName}
          onChange={(e) => onChange({ boxName: e.target.value })}
          placeholder="e.g. VulneraBeast, LabRat-01, PwnBox"
          maxLength={32}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Becomes the Linux hostname. Alphanumeric and hyphens only, max 32 chars.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-2">Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What is this box for? e.g. 'My OSCP prep box with web vulns and privesc challenges'"
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all resize-none"
        />
      </div>

      {/* Author Tag */}
      <div>
        <label className="block text-sm font-semibold mb-2">Author / Creator Tag</label>
        <input
          type="text"
          value={data.authorTag}
          onChange={(e) => onChange({ authorTag: e.target.value })}
          placeholder="e.g. 0xHacker, YourHandle"
          maxLength={24}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Embedded in <code className="font-mono text-gray-400">/etc/vulnbox-info</code> as creator metadata.
        </p>
      </div>

      {/* Box Color */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Palette className="w-4 h-4 text-gray-400" />
          Box Color
        </label>
        <div className="flex flex-wrap gap-3">
          {BOX_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange({ boxColor: c.value })}
              title={c.name}
              className={`w-9 h-9 rounded-full transition-all ring-offset-2 ring-offset-gray-950 ${c.cls} ${
                data.boxColor === c.value
                  ? "ring-2 ring-white scale-110"
                  : "opacity-60 hover:opacity-90 hover:scale-105"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">Used for visual identification on your dashboard.</p>
      </div>
    </div>
  );
}
