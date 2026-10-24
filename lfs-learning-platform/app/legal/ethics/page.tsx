import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Gavel, Database, Package, ListChecks, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal & Ethics Framework — Authorized Security Testing",
  description:
    "Computer-misuse law, authorization checklists, data protection, export controls and licensing as they apply to building and attacking your own Linux systems.",
};

const LAWS = [
  {
    region: "United States",
    law: "Computer Fraud and Abuse Act (18 U.S.C. §1030)",
    note: "Unauthorized access, exceeding authorized access and damage to protected computers. Penalties scale with intent and harm; state laws add further exposure.",
  },
  {
    region: "United Kingdom",
    law: "Computer Misuse Act 1990",
    note: "Unauthorized access (§1), unauthorized acts with intent to impair (§3) and making or supplying articles for use in offences (§3ZA).",
  },
  {
    region: "India",
    law: "Information Technology Act 2000, §§43, 66, 66C–66F",
    note: "Unauthorized access, data theft, identity theft and tampering with computer source documents are separately punishable.",
  },
  {
    region: "European Union",
    law: "Directive 2013/40/EU + national implementations",
    note: "Member states criminalise illegal access, illegal system and data interference, and illegal interception; GDPR governs any personal data you encounter.",
  },
];

const CHECKLIST = [
  "Written authorization exists, names the tester, the targets and the time window.",
  "The scope lists in-scope hosts, excluded systems and any production constraints.",
  "Rules of engagement define permitted techniques and escalation contacts.",
  "A rollback or snapshot plan exists before any destructive test.",
  "Personal data encountered is minimised, encrypted and deleted on completion.",
  "Findings are reported privately to the owner, never published before remediation.",
];

export default function LegalEthicsPage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 mb-5">
            <Scale className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-xs font-medium text-violet-200 tracking-wide">Framework</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Legal &amp; Ethics</h1>
          <p className="text-gray-400">
            Why the platform draws hard lines around the labs, and what “authorized” actually means in
            practice. Last updated: October 2026.
          </p>
        </div>

        <section className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-violet-300">Consent is the whole game</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Security work is legal or criminal depending almost entirely on authorization. The same
            command, run against your own VM, is learning; run against someone else&apos;s server, it is
            an offence in most jurisdictions. Owning a copy of a target, having a login, or being “just
            curious” is not authorization.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-violet-300" /> Computer-misuse law at a glance
          </h2>
          <div className="space-y-3">
            {LAWS.map((l) => (
              <div key={l.region} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-violet-300">
                    {l.region}
                  </span>
                  <span className="text-sm font-semibold">{l.law}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{l.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            This is a summary for orientation, not a legal analysis. Your jurisdiction may add offences,
            reporting duties or sector-specific rules.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-300" /> Authorization checklist
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Before you point any tool at anything that is not your own machine, all six of these should
            be true.
          </p>
          <ul className="space-y-2.5">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="mt-0.5 inline-flex w-4 h-4 shrink-0 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 text-[9px] text-emerald-300">
                  ✓
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-300" /> Data protection while you practise
          </h2>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              Practice targets ship with synthetic data. Treat any real personal data you encounter
              during an authorized assessment as a regulated processing activity: collect only what is
              necessary to prove the finding, store it encrypted, restrict access, and delete it at the
              end of the engagement. Under the GDPR, a breach you cause may itself trigger notification
              duties.
            </p>
            <p>
              Never paste production credentials, customer records or private keys into a lab, a
              public tunnel or a bug report.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-300" /> Licensing &amp; export notes
          </h2>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              Software compiled into your image remains under its own licence — mostly GPL-family
              copyleft, plus the licences of the bundled practice targets. Redistributing an image means
              honouring those terms, including source-availability obligations.
            </p>
            <p>
              Exploitation tooling and certain cryptographic software can be subject to export-control
              and sanctions rules. If you operate across borders, check what may lawfully be exported to
              your destination before shipping an artifact.
            </p>
            <p>
              Linux® is a registered trademark of Linus Torvalds. OWASP Juice Shop, DVWA and WebGoat are
              the property of their respective authors; this platform packages them unmodified and is
              not endorsed by them.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold mb-2">Where to go next</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Read the operational rules and the reporting process that accompany this framework.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/legal/acceptable-use"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:opacity-90 transition-opacity"
            >
              Acceptable Use <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/legal/security"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Responsible Disclosure
            </Link>
            <Link
              href="/vuln-hub"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Vuln Hub
            </Link>
          </div>
        </section>

        <p className="mt-8 text-xs text-gray-500 leading-relaxed">
          Not legal advice. If a decision matters commercially or could expose you to liability, take
          advice from a qualified lawyer in the relevant jurisdiction.
        </p>
      </div>
    </main>
  );
}
