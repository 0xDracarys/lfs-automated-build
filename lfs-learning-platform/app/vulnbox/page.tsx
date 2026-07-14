import type { Metadata } from "next";
import VulnBoxWizard from "@/components/vulnbox/VulnBoxWizard";
import { ShieldAlert, Bug, Cpu, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "VulnBox Builder — Create Your Intentionally Vulnerable Linux",
  description:
    "Build a fully customized, intentionally vulnerable Linux system from scratch. Choose your misconfigs, CVEs, CTF flags, and output format. Powered by LFS.",
};

export default function VulnBoxPage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-600/[0.05] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 mb-6">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300 tracking-wide">VulnBox Builder</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold mb-5 leading-[1.08]">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Build Your Own{" "}
            </span>
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Vulnerable Linux
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Craft an intentionally vulnerable Linux system from scratch — your misconfigs, your CVEs,
            your CTF flags. Built using LFS principles. No black-box distros.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: <Bug className="w-3.5 h-3.5" />, label: "30+ vuln types", color: "text-red-400 border-red-500/30 bg-red-500/10" },
              { icon: <Cpu className="w-3.5 h-3.5" />, label: "Built from LFS source", color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
              { icon: <Lock className="w-3.5 h-3.5" />, label: "EULA protected", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
              { icon: <ShieldAlert className="w-3.5 h-3.5" />, label: "ISO · OVA · Docker", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" },
            ].map((p) => (
              <span
                key={p.label}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${p.color}`}
              >
                {p.icon}
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Warning banner */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-red-300">For isolated lab use only. </span>
              <span className="text-gray-400">
                VulnBox systems contain real working vulnerabilities. Never deploy on a public
                network or any system you do not own. EULA acceptance is mandatory and logged.
              </span>
            </div>
          </div>
        </div>

        {/* Wizard */}
        <VulnBoxWizard />
      </div>
    </main>
  );
}
