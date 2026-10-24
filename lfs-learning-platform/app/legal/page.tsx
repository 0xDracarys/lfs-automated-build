import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldCheck, FileText, ArrowRight, Lock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal & Trust — Policies, Ethics and Disclosure",
  description:
    "How the LFS learning platform expects its build pipeline, practice targets and security research to be used: acceptable use, responsible disclosure and the legal framework around authorized testing.",
};

const POLICIES = [
  {
    href: "/legal/acceptable-use",
    title: "Acceptable Use Policy",
    desc: "What you may and may not do with the platform, the build artifacts and the practice targets.",
    icon: <ShieldCheck className="w-5 h-5" />,
    accent: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    href: "/legal/security",
    title: "Responsible Disclosure",
    desc: "How to report a vulnerability in this platform, our response times and our safe-harbour commitment.",
    icon: <Lock className="w-5 h-5" />,
    accent: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  },
  {
    href: "/legal/ethics",
    title: "Legal & Ethics Framework",
    desc: "Authorization, computer-misuse law, data protection and licensing — the rules behind the labs.",
    icon: <Scale className="w-5 h-5" />,
    accent: "text-violet-300 border-violet-500/30 bg-violet-500/10",
  },
];

export default function LegalHubPage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.04] mb-6">
            <Scale className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-200 tracking-wide">Legal &amp; Trust</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Built to be used{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
              lawfully
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            This platform exists to teach Linux engineering and defensive security. Everything below
            explains the boundaries that keep it educational — and keeps you on the right side of the
            law while you learn.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 mb-10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300 leading-relaxed">
            <span className="font-semibold text-amber-300">Authorized use only. </span>
            You may only run the practice targets and apply the techniques taught here against systems
            you own or have explicit written permission to test. Nothing on this platform is a licence
            to access a third-party system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {POLICIES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/25 transition-colors flex flex-col"
            >
              <span className={`inline-flex w-10 h-10 items-center justify-center rounded-lg border mb-4 ${p.accent}`}>
                {p.icon}
              </span>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-white">{p.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{p.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                Read policy <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-300" /> Related documents
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { href: "/terms", label: "Terms of Service" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/cookies", label: "Cookie Policy" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-300 hover:border-white/25 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-500 leading-relaxed">
            These pages describe platform policy in plain language. They are not legal advice. If you
            need certainty for a professional engagement, consult a lawyer qualified in your
            jurisdiction.
          </p>
        </div>
      </div>
    </main>
  );
}
