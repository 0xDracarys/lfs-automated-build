"use client";

import { CheckCircle, HardDrive, Box, Container, Shield, Bug, Package, Users, AlertTriangle, Coins } from "lucide-react";

interface VulnBoxReviewProps {
  formData: any;
  userCredits: number;
  buildCost: number;           // flat cost per build (35)
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

function ReviewRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-gray-400 shrink-0 w-40">{label}</span>
      <span className={`text-sm text-right flex-1 ${mono ? "font-mono text-emerald-400" : "text-white"}`}>{value}</span>
    </div>
  );
}

const FORMAT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  iso: { label: "Bootable ISO", icon: <HardDrive className="w-3.5 h-3.5" /> },
  ova: { label: "OVA Image", icon: <Box className="w-3.5 h-3.5" /> },
  docker: { label: "Docker Image", icon: <Container className="w-3.5 h-3.5" /> },
};

export default function VulnBoxReview({ formData, userCredits, buildCost, onSubmit, loading, error }: VulnBoxReviewProps) {
  const { identity, baseConfig, users, vulns, packages, output } = formData;

  const hasEnoughCredits = userCredits >= buildCost;

  // Count enabled vulns
  const enabledVulns = Object.values(vulns ?? {}).filter(
    (v) => v === true
  ).length;

  // Count enabled packages
  const enabledPackages = Object.values(packages ?? {}).filter(
    (v) => v === true
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-1">Review & Submit</h3>
        <p className="text-sm text-gray-400">Confirm your VulnBox configuration before queuing the build.</p>
      </div>

      {/* Identity */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">
        <div className="flex items-center gap-2 p-3.5 bg-white/[0.03] border-b border-white/[0.05]">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-300">Identity</p>
        </div>
        <div className="px-4 pb-1">
          <ReviewRow label="Box Name" value={identity?.boxName || "—"} mono />
          <ReviewRow label="Author Tag" value={identity?.authorTag || "—"} />
          <ReviewRow label="Description" value={identity?.description || "—"} />
          <ReviewRow label="Box Color" value={
            <span className={`inline-flex items-center gap-1.5`}>
              <span className={`w-3 h-3 rounded-full bg-${identity?.boxColor}-500`} />
              {identity?.boxColor}
            </span>
          } />
        </div>
      </div>

      {/* Base Config */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">
        <div className="flex items-center gap-2 p-3.5 bg-white/[0.03] border-b border-white/[0.05]">
          <Shield className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-300">Base System</p>
        </div>
        <div className="px-4 pb-1">
          <ReviewRow label="Architecture" value={baseConfig?.architecture || "x86_64"} />
          <ReviewRow label="OS Persona" value={baseConfig?.osPersona || "—"} />
          <ReviewRow label="Kernel" value={baseConfig?.kernelVersion || "6.4.12"} mono />
          <ReviewRow label="Init System" value={baseConfig?.initSystem || "systemd"} />
          <ReviewRow label="Shell" value={`/bin/${baseConfig?.defaultShell || "bash"}`} mono />
        </div>
      </div>

      {/* Vulns summary */}
      <div className="rounded-xl border border-red-500/20 overflow-hidden">
        <div className="flex items-center justify-between p-3.5 bg-red-500/[0.04] border-b border-red-500/10">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-red-400" />
            <p className="text-sm font-semibold text-red-300">Vulnerabilities</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-bold">
            {enabledVulns} enabled
          </span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(vulns ?? {}).map(([key, val]) => {
              if (val !== true) return null;
              return (
                <span key={key} className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
                  {key}
                </span>
              );
            })}
            {enabledVulns === 0 && <span className="text-sm text-gray-500">No vulnerabilities selected</span>}
          </div>
        </div>
      </div>

      {/* Packages summary */}
      <div className="rounded-xl border border-violet-500/20 overflow-hidden">
        <div className="flex items-center justify-between p-3.5 bg-violet-500/[0.04] border-b border-violet-500/10">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-400" />
            <p className="text-sm font-semibold text-violet-300">Packages</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs font-bold">
            {enabledPackages} packages
          </span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(packages ?? {}).map(([key, val]) => {
              if (!val) return null;
              return (
                <span key={key} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono">
                  {key}
                </span>
              );
            })}
            {enabledPackages === 0 && <span className="text-sm text-gray-500">No packages selected</span>}
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">
        <div className="flex items-center gap-2 p-3.5 bg-white/[0.03] border-b border-white/[0.05]">
          <HardDrive className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-300">Output</p>
        </div>
        <div className="px-4 pb-1">
          <ReviewRow
            label="Formats"
            value={
              <div className="flex items-center gap-2 justify-end flex-wrap">
                {(output?.outputFormats ?? ["iso"]).map((f: string) => (
                  <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    {FORMAT_LABELS[f]?.icon}
                    {FORMAT_LABELS[f]?.label}
                  </span>
                ))}
              </div>
            }
          />
          <ReviewRow label="Difficulty" value={["", "Trivial", "Easy", "Medium", "Hard", "Insane"][output?.difficultyRating ?? 3]} />
          <ReviewRow label="Audience" value={output?.intendedAudience || "—"} />
          <ReviewRow label="Network Mode" value={output?.networkMode || "host-only"} />
        </div>
      </div>

      {/* Credits */}
      <div className={`rounded-xl border p-4 ${hasEnoughCredits ? "border-amber-500/30 bg-amber-500/[0.05]" : "border-red-500/30 bg-red-500/[0.05]"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className={`w-4 h-4 ${hasEnoughCredits ? "text-amber-400" : "text-red-400"}`} />
            <span className="text-sm font-semibold">Build Credits</span>
          </div>
          <span className={`text-lg font-bold ${hasEnoughCredits ? "text-amber-400" : "text-red-400"}`}>
            {userCredits} available
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">This build costs</span>
          <span className="font-bold text-white">{buildCost} credits</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-400">Remaining after build</span>
          <span className={`font-bold ${hasEnoughCredits ? "text-gray-300" : "text-red-400"}`}>
            {Math.max(0, userCredits - buildCost)} credits
          </span>
        </div>
        {!hasEnoughCredits && (
          <p className="mt-2 text-xs text-red-400">
            ⚠️ Not enough credits. You need {buildCost}, you have {userCredits}. Contact an admin to top up your account.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !hasEnoughCredits || !identity?.boxName}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2.5 transition-all ${
          !loading && hasEnoughCredits && identity?.boxName
            ? "bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-500 hover:via-orange-500 hover:to-red-500 shadow-lg shadow-red-900/30 text-white"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Queuing Build…
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Queue VulnBox Build ({buildCost} credits)
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-600">
        Your build will be queued and you&apos;ll be notified when it&apos;s ready to download.
      </p>
    </div>
  );
}
