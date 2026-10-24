import Link from "next/link";
import type { Metadata } from "next";
import { ScrollText, UserCheck, Terminal, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Linux From Scratch",
  description: "The short, readable rules for using this platform and building systems with it.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen text-white pt-28 pb-20 px-5 sm:px-6 font-sora">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
            <ScrollText className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-400">Terms of Service</span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Last updated: 23 October 2026.
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              icon: Terminal,
              title: "1 · What this service is",
              body: (
                <p>
                  A learning platform that teaches you to build Linux From Scratch systems, and can
                  build them for you (optionally with practice-target software such as Juice Shop,
                  DVWA, or WebGoat included). Practice targets are <strong className="text-white">deliberately
                  vulnerable applications</strong> provided so you can practice security skills
                  <strong className="text-white"> on your own computer only</strong>. They carry known
                  security holes — never expose them to the internet, never point them at real data,
                  and never run them on hardware you do not own.
                </p>
              ),
            },
            {
              icon: UserCheck,
              title: "2 · Your account",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li>You are responsible for activity under your login; keep your password safe.</li>
                  <li>Runs that build systems use shared cloud capacity — you agree not to abuse resources (cryptomining, denial-of-service testing, or scanning networks other than your own).</li>
                  <li>Accounts are personal; do not resell artifacts or circumvent usage fair-limits.</li>
                </ul>
              ),
            },
            {
              icon: Scale,
              title: "3 · Software is provided “as is”",
              body: (
                <p>
                  Everything you obtain here — systems, ISOs or third-party packages — carries{" "}
                  <strong className="text-white">no warranty of any kind</strong> (see also the licenses
                  that accompany GNU/Linux and each third-party item; their terms govern your use of
                  them). We are not liable for data loss, downtime, or any damage from using builds
                  in production. If a build breaks your sandbox, that is the nature of the exercise.
                </p>
              ),
            },
            {
              icon: Scale,
              title: "4 · Acceptable use & termination",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li>No unlawful content, malware deployment, or using practice targets against third parties.</li>
                  <li>We may suspend accounts that endanger the service or violate these terms.</li>
                  <li>You may stop using the platform at any time and delete your account (see <Link href="/privacy" className="text-blue-400 hover:underline">privacy page</Link>).</li>
                </ul>
              ),
            },
            {
              icon: Scale,
              title: "5 · Changes & governing rules",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li>These terms may change as features change; the date above always shows the current version. Material changes will be announced in-app.</li>
                  <li>This document is a plain-language template — you are responsible for confirming it matches how you actually run the platform (jurisdiction, company details, controller info) before heavy public use.</li>
                </ul>
              ),
            },
          ].map((s) => (
            <section key={s.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 mb-4">
                <s.icon className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-semibold">{s.title}</h2>
              </div>
              <div className="text-sm text-gray-400 space-y-3">{s.body}</div>
            </section>
          ))}

          <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
            <h2 className="text-xl font-semibold mb-3">Related policies</h2>
            <p className="text-sm text-gray-400 mb-4">
              These documents form part of the terms for anyone using the build pipeline or the
              practice targets.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/legal/acceptable-use" className="px-4 py-2 rounded-lg text-sm border border-white/15 hover:bg-white/10 transition-colors">
                Acceptable Use Policy
              </a>
              <a href="/legal/security" className="px-4 py-2 rounded-lg text-sm border border-white/15 hover:bg-white/10 transition-colors">
                Responsible Disclosure
              </a>
              <a href="/legal/ethics" className="px-4 py-2 rounded-lg text-sm border border-white/15 hover:bg-white/10 transition-colors">
                Legal &amp; Ethics
              </a>
              <a href="/privacy" className="px-4 py-2 rounded-lg text-sm border border-white/15 hover:bg-white/10 transition-colors">
                Privacy
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
