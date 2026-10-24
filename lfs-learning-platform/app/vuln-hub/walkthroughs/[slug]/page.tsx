import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Terminal, TriangleAlert, Target } from "lucide-react";
import { WALKTHROUGHS, getWalkthrough } from "@/lib/walkthroughs";

export function generateStaticParams() {
  return WALKTHROUGHS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = getWalkthrough(slug);
  if (!w) return { title: "Walkthrough not found | Linux From Scratch" };
  return {
    title: `${w.name} walkthrough — Vuln Hub | Linux From Scratch`,
    description: w.intro,
  };
}

const ACCENT = {
  emerald: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  rose: "text-rose-300 border-rose-500/30 bg-rose-500/10",
  violet: "text-violet-300 border-violet-500/30 bg-violet-500/10",
} as const;

const RULE = {
  emerald: "bg-emerald-400/50",
  rose: "bg-rose-400/50",
  violet: "bg-violet-400/50",
} as const;

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 mb-3 overflow-x-auto rounded-lg border border-white/10 bg-black/50 px-4 py-3">
      <code className="font-mono text-[13px] leading-relaxed text-emerald-300 whitespace-pre-wrap break-all">
        {children}
      </code>
    </pre>
  );
}

export default async function WalkthroughPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = getWalkthrough(slug);
  if (!w) notFound();

  const others = WALKTHROUGHS.filter((x) => x.slug !== w.slug);

  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <Link
          href="/vuln-hub/walkthroughs"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All walkthroughs
        </Link>

        <header className="mb-8">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium mb-4 ${ACCENT[w.accent]}`}
          >
            {w.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-[1.1]">{w.name}</h1>
          <p className="text-lg text-gray-400 leading-relaxed">{w.intro}</p>
        </header>

        {/* access + credentials — the two facts you need before exercise one */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Target className="w-3.5 h-3.5" /> Access
            </div>
            <code className="block text-sm text-gray-200 break-all leading-snug">{w.url}</code>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <KeyRound className="w-3.5 h-3.5" /> Credentials
            </div>
            <p className="text-sm text-gray-200 leading-snug">{w.creds}</p>
          </div>
        </div>

        {/* setup */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-gray-300" /> Before you start
          </h2>
          {w.setup.map((s, i) => (
            <div key={i}>
              {s.text && <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>}
              {s.code && <Code>{s.code}</Code>}
              {s.note && (
                <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-white/10 pl-3 my-3">
                  {s.note}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* exercises */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold mb-1">
            {w.exercises.length} exercises
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Work top to bottom. Each one states what to prove before it tells you how.
          </p>

          {w.exercises.map((e, i) => (
            <article
              key={e.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#141414] font-mono text-xs text-gray-300">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-snug">{e.title}</h3>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">
                    {e.category}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                <span className="text-gray-400 font-medium">Goal: </span>
                {e.goal}
              </p>

              <div className="space-y-1">
                {e.steps.map((s, si) => (
                  <div key={si}>
                    {s.text && (
                      <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>
                    )}
                    {s.code && <Code>{s.code}</Code>}
                    {s.note && (
                      <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-white/10 pl-3 my-3">
                        {s.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <p className="leading-relaxed">
                  <span className="text-gray-400 font-medium">You should see: </span>
                  <span className="text-gray-300">{e.expected}</span>
                </p>
                <p className="leading-relaxed">
                  <span className="text-gray-400 font-medium">Why it works: </span>
                  <span className="text-gray-300">{e.why}</span>
                </p>
              </div>

              <div aria-hidden="true" className={`mt-5 h-px w-10 rounded-full ${RULE[w.accent]}`} />
            </article>
          ))}
        </section>

        {w.footer && (
          <p className="text-sm text-gray-400 leading-relaxed mt-6 border-l-2 border-white/10 pl-4">
            {w.footer}
          </p>
        )}

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3 mt-8">
          <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-amber-300">Authorised targets only. </span>
            Everything here is for systems you own or have written permission to test. Pointing any
            of these techniques at a third party is a criminal offence in most jurisdictions — see
            the{" "}
            <Link href="/legal/acceptable-use" className="text-amber-300 underline hover:text-amber-200">
              Acceptable Use Policy
            </Link>
            .
          </p>
        </div>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-mono mb-3">
            Next target
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/vuln-hub/walkthroughs/${o.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 transition-colors"
              >
                <span className="text-sm font-medium">{o.name}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
