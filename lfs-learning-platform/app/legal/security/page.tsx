import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Clock, ShieldCheck, Mail, AlertTriangle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Responsible Disclosure — Report a Vulnerability",
  description:
    "How to report a security issue in the LFS learning platform, what is in scope, our response commitments and our good-faith safe-harbour statement.",
};

const IN_SCOPE = [
  "This website and its API routes (authentication, build submission, download signing, account handling).",
  "The cloud build pipeline configuration, container images and launcher scripts maintained in this repository.",
  "Exposure of credentials, service-account material or other secrets through the application or its build logs.",
  "Access-control flaws that let one account read another account's builds, artifacts or profile data.",
  "Injection, SSRF, path traversal or deserialization issues in first-party code.",
];

const OUT_OF_SCOPE = [
  "The intentionally vulnerable practice targets (Juice Shop, DVWA, WebGoat) — they are supposed to be vulnerable.",
  "Anything requiring physical access to a device, or social engineering of the maintainer or users.",
  "Denial-of-service testing, volumetric load, or automated scanning that degrades the service.",
  "Third-party platforms: Google Cloud, Firebase, Vercel, GitHub and similar providers. Report those to the provider directly.",
  "Reports produced solely by a scanner with no demonstrated impact.",
  "Missing hardening headers or best-practice suggestions with no exploitable consequence.",
];

const COMMITMENTS = [
  { icon: <Clock className="w-4 h-4" />, title: "Acknowledge in 3 business days", body: "A human reads every report and confirms receipt." },
  { icon: <ShieldCheck className="w-4 h-4" />, title: "Triage in 10 business days", body: "We reproduce, rate severity and tell you whether we consider it in scope." },
  { icon: <Lock className="w-4 h-4" />, title: "Coordinated disclosure", body: "We aim to fix confirmed issues within 90 days and will agree a public-disclosure date with you." },
  { icon: <Mail className="w-4 h-4" />, title: "Credit where it is due", body: "We will name you in the fix notes unless you prefer to stay anonymous." },
];

export default function ResponsibleDisclosurePage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 mb-5">
            <Lock className="w-3.5 h-3.5 text-sky-300" />
            <span className="text-xs font-medium text-sky-200 tracking-wide">Security</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Responsible Disclosure</h1>
          <p className="text-gray-400">
            Good-faith security research on this platform is welcome. This page defines the scope, the
            rules of engagement and what you can expect from us in return. Last updated: October 2026.
          </p>
        </div>

        <section className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-sky-300">Report to</h2>
          <p className="text-sm text-gray-300">
            <a href="mailto:contact@shubhambhasker.dev" className="underline hover:text-white">
              contact@shubhambhasker.dev
            </a>{" "}
            — subject line <span className="font-mono text-gray-200">[SECURITY]</span>. Encrypted mail
            is welcome; ask for our key in a first, detail-free message.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">What to include</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>A clear description of the issue and the affected endpoint, page or component.</li>
            <li>Reproduction steps precise enough for us to repeat them, with the account role used.</li>
            <li>Impact: what an attacker gains, and what preconditions are required.</li>
            <li>Proof-of-concept requests or screenshots, redacting any real personal data.</li>
            <li>Your preferred name and contact for credit, or a request to remain anonymous.</li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Please do not attach other users&apos; data, and do not pivot, persist or exfiltrate beyond the
            minimum needed to demonstrate the issue.
          </p>
        </section>

        <section className="mb-8 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold mb-3 text-emerald-300">In scope</h3>
            <ul className="space-y-2">
              {IN_SCOPE.map((i) => (
                <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                  <span className="text-emerald-400">•</span> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold mb-3 text-rose-300">Out of scope</h3>
            <ul className="space-y-2">
              {OUT_OF_SCOPE.map((i) => (
                <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                  <span className="text-rose-400">•</span> {i}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our commitments</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {COMMITMENTS.map((c) => (
              <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 text-sky-300 mb-2">
                  {c.icon}
                  <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-emerald-300">Safe harbour</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            If you make a good-faith effort to comply with this policy, we will consider your research
            authorized, will not pursue or support legal action against you, and will work with you on
            disclosure. This statement covers our own systems only — it cannot bind third parties,
            cloud providers or law enforcement, and it does not apply if you act in bad faith, access
            data beyond what is needed, or degrade the service.
          </p>
        </section>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/80 leading-relaxed">
            The practice targets shipped in the vuln-labs tarball are intentionally vulnerable. Finding
            a vulnerability in Juice Shop, DVWA or WebGoat is expected behaviour, not a reportable
            issue — report those upstream to OWASP if you believe the packaged version is outdated.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/legal/acceptable-use"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:opacity-90 transition-opacity"
          >
            Acceptable Use Policy <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/legal/ethics"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
          >
            Legal &amp; Ethics Framework
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-500 leading-relaxed">
          This page is a policy statement, not legal advice, and does not replace the rules of any
          bug-bounty programme or the laws of your jurisdiction.
        </p>
      </div>
    </main>
  );
}
