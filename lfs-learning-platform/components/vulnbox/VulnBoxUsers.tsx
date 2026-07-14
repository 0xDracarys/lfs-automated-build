"use client";

import { Users, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface VulnBoxUsersProps {
  data: {
    rootPassword: string;
    addLowPrivUser: boolean;
    lowPrivUsername: string;
    lowPrivPassword: string;
    weakSudoConfig: boolean;
    injectSSHKeys: boolean;
    worldWritableHomedirs: boolean;
    historyFileCredentials: boolean;
  };
  onChange: (updates: Partial<VulnBoxUsersProps["data"]>) => void;
}

function ToggleRow({
  label,
  sublabel,
  checked,
  onChange,
  danger,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all group">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-11 h-6 rounded-full relative transition-all shrink-0 ${
          checked
            ? danger
              ? "bg-red-500"
              : "bg-orange-500"
            : "bg-gray-700"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <div>
        <p className={`font-medium text-sm ${checked && danger ? "text-red-300" : "text-gray-200"}`}>{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
      </div>
    </label>
  );
}

export default function VulnBoxUsers({ data, onChange }: VulnBoxUsersProps) {
  const [showRoot, setShowRoot] = useState(false);
  const [showLowPriv, setShowLowPriv] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-1">Users & Credentials</h3>
        <p className="text-sm text-gray-400">
          Configure the accounts and credential weaknesses on your VulnBox. These are intentional for challenge purposes.
        </p>
      </div>

      {/* Root Password */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Users className="w-4 h-4 text-gray-400" />
          Root Password
        </label>
        <div className="relative">
          <input
            type={showRoot ? "text" : "password"}
            value={data.rootPassword}
            onChange={(e) => onChange({ rootPassword: e.target.value })}
            placeholder='Blank = no password (most vulnerable), or set "toor", "root", etc.'
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-orange-500/60 focus:outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowRoot((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showRoot ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">Leave blank for passwordless root (most realistic for vulnerable boxes).</p>
      </div>

      {/* Low Priv User Toggle */}
      <div className="space-y-3">
        <ToggleRow
          label="Add Low-Privilege User"
          sublabel="Creates a non-root user for realistic access scenarios (e.g. initial shell via web exploit → privesc to root)"
          checked={data.addLowPrivUser}
          onChange={(v) => onChange({ addLowPrivUser: v })}
        />

        {data.addLowPrivUser && (
          <div className="ml-4 pl-4 border-l border-orange-500/20 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-400">Username</label>
                <input
                  type="text"
                  value={data.lowPrivUsername}
                  onChange={(e) => onChange({ lowPrivUsername: e.target.value })}
                  placeholder="e.g. bob, user, player1"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-orange-500/60 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-400">Password</label>
                <div className="relative">
                  <input
                    type={showLowPriv ? "text" : "password"}
                    value={data.lowPrivPassword}
                    onChange={(e) => onChange({ lowPrivPassword: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3 py-2.5 pr-9 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-orange-500/60 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLowPriv((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showLowPriv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Misconfig Toggles */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Credential Misconfigurations</p>

        <ToggleRow
          label="Weak Sudo Config"
          sublabel="Adds NOPASSWD:ALL to the low-priv user's sudoers entry — classic privesc vector"
          checked={data.weakSudoConfig}
          onChange={(v) => onChange({ weakSudoConfig: v })}
          danger
        />
        <ToggleRow
          label="Inject Weak SSH Keys"
          sublabel="Pre-installs known/weak RSA keys in ~/.ssh/authorized_keys for SSH challenge scenarios"
          checked={data.injectSSHKeys}
          onChange={(v) => onChange({ injectSSHKeys: v })}
          danger
        />
        <ToggleRow
          label="World-writable Home Directories"
          sublabel="chmod 777 on /home/* — allows any user to read/write other users' files"
          checked={data.worldWritableHomedirs}
          onChange={(v) => onChange({ worldWritableHomedirs: v })}
          danger
        />
        <ToggleRow
          label="Credentials in Bash History"
          sublabel="Injects plaintext passwords in .bash_history — teaches users to search shell history"
          checked={data.historyFileCredentials}
          onChange={(v) => onChange({ historyFileCredentials: v })}
        />
      </div>
    </div>
  );
}
