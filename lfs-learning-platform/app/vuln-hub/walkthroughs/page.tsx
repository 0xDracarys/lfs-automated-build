import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FlaskConical, TriangleAlert } from "lucide-react";
import { WALKTHROUGHS } from "@/lib/walkthroughs";

export const metadata: Metadata = {
  title: "Vuln Hub Walkthroughs — Juice Shop, DVWA, WebGoat | Linux From Scratch",
  description:
    "Step-by-step lab guides for the three practice targets shipped in the vuln-labs build: OWASP Juice Shop, DVWA and WebGoat — goal, steps, expected result and the bug class behind each exercise.",
};

const ACCENT = {
  emerald: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  rose: "text-rose-300 border-rose-500/30 bg-rose-500/10",
  violet: "text-violet-300 border-violet-500/30 bg-violet-500/10",
} as const;

const BAR = {
  emerald: "bg-emerald-400/50",
  rose: "bg-rose-400/50",
  violet: "bg-violet-400/50",
} as const;

export default function WalkthroughsIndexPage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <Link
          href="/vuln-hub"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Vuln Hub
        </Link>

        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-xs font-medium text-emerald-200 tracking-wide">Walkthroughs</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-[1.1]">
            Three labs, one method
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Each guide gives the goal, the steps, the result you should see and the bug class behind
            it. The exercises are the same problems implemented three ways — that comparison is the
            point.
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3 mb-10">
          <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-300">Lab use only. </span>
            <span className="text-gray-400">
              These systems are deliberately vulnerable. Run them isolated, on a machine you own,
              and never expose a target to a network you do not control. Use is governed by the{" "}
              <Link
                href="/legal/acceptable-use"
                className="text-amber-300 underline hover:text-amber-200"
              >
                Acceptable Use Policy
              </Link>
              .
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {WALKTHROUGHS.map((w) => (
            <article
              key={w.slug}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${ACCENT[w.accent]}`}
                >
                  {w.badge}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-mono">
                  {w.exercises.length} exercises
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-2">{w.name}</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{w.intro}</p>

              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-5">
                {w.exercises.map((e) => (
                  <li key={e.title} className="flex items-start gap-2 text-sm text-gray-400">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-1 w-4 shrink-0 rounded-full ${BAR[w.accent]}`}
                    />
                    <span className="leading-snug">{e.title}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/vuln-hub/walkthroughs/${w.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/60 transition-colors"
              >
                Open the {w.name} walkthrough <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/build"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
          >
            Start a Cloud Build <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/downloads"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
          >
            Download the labs tarball
          </Link>
          <Link
            href="/legal/acceptable-use"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
          >
            Acceptable Use Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
