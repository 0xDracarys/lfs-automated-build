"use client";

/**
 * Vuln Hub — motion layer.
 *
 * Content (TARGETS, credentials, commands, copy) is identical to the page that
 * shipped in 8dcc475. Only motion was added:
 *   · cards reveal Juice Shop → DVWA → WebGoat, 120 ms apart, 8 px rise, 300 ms
 *   · inside each card a neutral connector rail fills Access → Credentials → Commands
 *   · vulnbox-start pulses once (opacity only) on first view, never loops
 *   · "How the targets get on your system" is a stepper whose line fills on scroll
 *
 * Rules honoured here: transform + opacity only, ease-out, no bounce, no scale,
 * amber safety banner never animates, hero gradient + ambient blobs untouched,
 * prefers-reduced-motion turns every reveal into an instant state change.
 */

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  FlaskConical,
  Globe,
  Database,
  KeyRound,
  Terminal,
  Radio,
  TriangleAlert,
  Package,
  ArrowRight,
} from "lucide-react";
import { CommandBlock } from "@/components/wizard/CommandBlock";

interface TargetCard {
  slug: string;
  name: string;
  tagline: string;
  accent: string; // ring / text color classes
  badge: string; // small header badge
  tech: string[];
  access: { label: string; value: string }[];
  creds: { label: string; value: string }[];
  commands: { cmd: string; desc?: string; warning?: string }[];
  note?: string;
}

const TARGETS: TargetCard[] = [
  {
    slug: "juice-shop",
    name: "OWASP Juice Shop",
    tagline: "Modern vulnerable web app — XSS, SQLi, IDOR, blind XXE and 100+ OWASP Top 10 challenges.",
    accent: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    badge: "Node.js · port 3000",
    tech: ["Node.js (bundled engine)", "Express + SQLite", "Single-page frontend"],
    access: [
      { label: "In-guest URL", value: "http://localhost:3000/" },
      { label: "Port", value: "3000" },
    ],
    creds: [
      { label: "Accounts", value: "register any user — first registration becomes admin" },
      { label: "Scoreboard", value: "http://localhost:3000/#/scoreboard" },
    ],
    commands: [
      { cmd: "vulnbox-start", desc: "starts Juice Shop together with every other target" },
      { cmd: "vulnbox-tunnel 3000", desc: "publish Juice Shop on a public https URL" },
    ],
    note: "AIs-in-the-juice challenges warn when no local LLM (localhost:11434) is present — harmless.",
  },
  {
    slug: "dvwa",
    name: "DVWA",
    tagline: "Damn Vulnerable Web App — classic PHP lab for brute force, file upload, RFI/LFI and command injection.",
    accent: "text-rose-300 border-rose-500/30 bg-rose-500/10",
    badge: "PHP + lighttpd · port 80",
    tech: ["PHP 8.2 (fastcgi)", "lighttpd 1.4", "MariaDB 11.4 on :3307"],
    access: [
      { label: "In-guest URL", value: "http://localhost/" },
      { label: "Port", value: "80 (lighttpd)" },
    ],
    creds: [
      { label: "Login", value: "admin / password" },
      { label: "Database", value: "dvwa · user dvwa · pass vulpass · 127.0.0.1:3307" },
    ],
    commands: [
      { cmd: "vulnbox-start", desc: "starts MariaDB, lighttpd and all targets" },
      { cmd: "vulnbox-tunnel 80", desc: "publish DVWA on a public https URL" },
    ],
    note: "First visit: click “Create / Reset Database” on the setup page to seed the challenges.",
  },
  {
    slug: "webgoat",
    name: "WebGoat",
    tagline: "OWASP's interactive lesson app — injection, auth, deserialisation, plus WebWolf for the attacker side.",
    accent: "text-violet-300 border-violet-500/30 bg-violet-500/10",
    badge: "Java 17 · port 8080",
    tech: ["Spring Boot (webgoat-8.2.2.jar)", "WebWolf companion on :9090", "UTF-8 fixed in v3.5+"],
    access: [
      { label: "In-guest URL", value: "http://localhost:8080/WebGoat/" },
      { label: "Port", value: "8080 (WebWolf: 9090)" },
    ],
    creds: [
      { label: "Accounts", value: "self-register on first visit" },
      { label: "WebWolf", value: "same account, separate login page" },
    ],
    commands: [
      { cmd: "vulnbox-start", desc: "starts WebGoat (and WebWolf on v3.5+ builds)" },
      { cmd: "vulnbox-tunnel 8080", desc: "publish WebGoat on a public https URL" },
    ],
    note: "JVM needs ~60–90 s to warm up before /WebGoat answers.",
  },
];

const EASE = "easeOut" as const;

/* ── one flow block: Access / Credentials / Commands ─────────────────────── */

function FlowBlock({
  index,
  baseDelay,
  show,
  reduce,
  children,
}: {
  index: number;
  baseDelay: number;
  show: boolean;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: reduce ? 0 : 0.28,
        ease: EASE,
        delay: reduce ? 0 : baseDelay + index * 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── one target card ─────────────────────────────────────────────────────── */

function TargetCardView({ t, index }: { t: TargetCard; index: number }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const show = reduce ? true : inView;
  const baseDelay = reduce ? 0 : index * 0.12;

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: baseDelay }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col hover:border-white/20 transition-colors"
    >
      {/* header — static */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${t.accent}`}
          >
            {t.badge}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.name}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{t.tagline}</p>
      </div>

      {/* body — Access → Credentials → Commands with a filling rail */}
      <div className="relative p-6 pl-9 space-y-5 flex-1">
        {/* rail track */}
        <span
          aria-hidden="true"
          className="absolute left-4 top-8 bottom-8 w-px bg-white/10"
        />
        {/* rail fill — scaleY only, top-down */}
        <motion.span
          aria-hidden="true"
          className="absolute left-4 top-8 bottom-8 w-px bg-white/35 origin-top"
          initial={reduce ? false : { scaleY: 0 }}
          animate={show ? { scaleY: 1 } : undefined}
          transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : baseDelay + 0.15 }}
        />

        <FlowBlock index={0} baseDelay={baseDelay} show={show} reduce={reduce}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              <Globe className="w-3.5 h-3.5" /> Access
            </div>
            <div className="space-y-2">
              {t.access.map((a) => (
                <div key={a.label} className="text-sm">
                  <span className="block text-[11px] uppercase tracking-wide text-gray-400">
                    {a.label}
                  </span>
                  <code className="block text-gray-200 break-all leading-snug">{a.value}</code>
                </div>
              ))}
            </div>
          </div>
        </FlowBlock>

        <FlowBlock index={1} baseDelay={baseDelay} show={show} reduce={reduce}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              <KeyRound className="w-3.5 h-3.5" /> Credentials
            </div>
            <div className="space-y-2">
              {t.creds.map((c) => (
                <div key={c.label} className="text-sm">
                  <span className="block text-[11px] uppercase tracking-wide text-gray-400">
                    {c.label}
                  </span>
                  <span className="block text-gray-200 leading-snug break-words">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </FlowBlock>

        <FlowBlock index={2} baseDelay={baseDelay} show={show} reduce={reduce}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              <Terminal className="w-3.5 h-3.5" /> Commands
            </div>
            <div className="space-y-3">
              {t.commands.map((c, ci) => (
                <div key={c.cmd} className="relative">
                  <CommandBlock command={c.cmd} description={c.desc} className="text-xs" />
                  {/* hero action: vulnbox-start pulses exactly once, opacity only */}
                  {ci === 0 && !reduce && (
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-emerald-400/50"
                      initial={{ opacity: 0 }}
                      animate={show ? { opacity: [0, 0.55, 0] } : undefined}
                      transition={{
                        duration: 1.2,
                        ease: EASE,
                        times: [0, 0.35, 1],
                        delay: baseDelay + 0.55,
                        repeat: 0,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </FlowBlock>

        <div className="text-xs text-gray-400 border-t border-white/5 pt-3 leading-relaxed">
          <span className="text-gray-400 font-medium">Stack: </span>
          {t.tech.join(" · ")}
        </div>
        {t.note && <div className="text-xs text-amber-200/70 leading-relaxed">{t.note}</div>}

        <div className="pt-1">
          <Link
            href={`/vuln-hub/walkthroughs/${t.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-300 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/60 transition-colors"
          >
            Walkthrough for this target <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── 3-step stepper ──────────────────────────────────────────────────────── */

const STEPS = [
  {
    n: 1,
    title: "Tick Include Practice Targets",
    body: (
      <>
        On{" "}
        <Link
          href="/build"
          className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-2 hover:decoration-emerald-300"
        >
          Cloud Build
        </Link>
        , tick <span className="text-gray-200 font-medium">Include Practice Targets</span>.
      </>
    ),
    href: "/build",
    cta: "Cloud Build",
  },
  {
    n: 2,
    title: "vuln-labs-*.tar.gz is packaged",
    body: (
      <>
        The build packages everything into{" "}
        <span className="text-gray-200 font-medium">vuln-labs-*.tar.gz</span> (system + all three
        targets + launchers).
      </>
    ),
    href: "/downloads",
    cta: "Downloads",
  },
  {
    n: 3,
    title: "Import, then vulnbox-start",
    body: (
      <>
        Import it as a WSL distro (or boot the ISO), then run{" "}
        <code className="text-gray-200">vulnbox-start</code>.
      </>
    ),
    href: "/architecture",
    cta: "Architecture",
  },
];

function HowItFitsStepper() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const show = reduce ? true : inView;

  return (
    <div ref={ref} className="relative">
      {/*
        Progress line: fills left → right once, on scroll.
        It sits at the vertical centre of the numbered markers and is hidden on
        mobile (single column) so it never runs across stacked content. The
        markers carry an opaque background, so the line can never pass behind
        a number, and the step titles sit *below* the line — motion never
        crosses readable text.
      */}
      <span
        aria-hidden="true"
        className="hidden sm:block absolute left-0 right-0 top-4 h-px bg-white/10"
      />
      <motion.span
        aria-hidden="true"
        className="hidden sm:block absolute left-0 right-0 top-4 h-px bg-emerald-400/60 origin-left"
        initial={reduce ? false : { scaleX: 0 }}
        animate={show ? { scaleX: 1 } : undefined}
        transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
      />

      <ol className="relative grid sm:grid-cols-3 gap-x-6 gap-y-8">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: reduce ? 0 : 0.28,
              ease: EASE,
              delay: reduce ? 0 : 0.15 + i * 0.12,
            }}
            className="text-sm text-gray-400"
          >
            <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#141414] font-mono text-xs text-gray-200">
              {s.n}
            </span>
            <div className="text-gray-200 font-medium leading-snug mt-3 mb-1">{s.title}</div>
            <div className="leading-relaxed">{s.body}</div>
            <div className="mt-2">
              <Link
                href={s.href}
                className="inline-flex items-center gap-1 text-xs text-gray-400 underline decoration-white/25 underline-offset-2 hover:text-white hover:decoration-white/60 transition-colors"
              >
                {s.cta} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function VulnHubView() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      {/* Ambient glow — untouched, never animated */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Hero — gradient text untouched */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
            <FlaskConical className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-200 tracking-wide">Vuln Hub</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold mb-5 leading-[1.08]">
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent">
              Practice Target{" "}
            </span>
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Every intentionally vulnerable target that ships inside the vuln-labs build — one card
            per target with access URLs, credentials, start commands and the public tunnel helper.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
              <Package className="w-3.5 h-3.5" /> in the vuln-labs tarball
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium text-teal-300 border-teal-500/30 bg-teal-500/10">
              <Terminal className="w-3.5 h-3.5" /> vulnbox-start launcher
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium text-violet-300 border-violet-500/30 bg-violet-500/10">
              <Radio className="w-3.5 h-3.5" /> vulnbox-tunnel helper
            </span>
          </div>

          <div className="mt-6">
            <Link
              href="/vuln-hub/walkthroughs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/60 transition-colors"
            >
              Open the step-by-step walkthroughs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Safety banner — amber, still, never animated */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-amber-300">Lab use only. </span>
              <span className="text-gray-400">
                These services are deliberately vulnerable. Run them on isolated machines or inside
                your VM — never expose a target to a network you do not own. Use is governed by our{" "}
                <Link href="/legal/acceptable-use" className="text-amber-300 underline hover:text-amber-200">
                  Acceptable Use Policy
                </Link>
                .
              </span>
            </div>
          </div>
        </div>

        {/* Target cards — staggered in reading order */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-14">
          {TARGETS.map((t, i) => (
            <TargetCardView key={t.slug} t={t} index={i} />
          ))}
        </div>

        {/* How it fits together */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-300" /> How the targets get on your system
            </h3>

            <HowItFitsStepper />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/build"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:opacity-90 transition-opacity"
              >
                Start a Cloud Build <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/downloads"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
              >
                Download artifacts
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-violet-300" /> Tunnels &amp; port notes
            </h3>
            <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
              <li>
                <code className="text-gray-200">vulnbox-tunnel &lt;port&gt;</code> opens an
                ephemeral public https URL (quick tunnel) — it lives only while the process runs.
              </li>
              <li>
                On WSL, ports already claimed by Windows (3306, 3000, 8080…) can shadow in-guest
                services — MariaDB therefore listens on <span className="text-gray-200">3307</span>.
              </li>
              <li>
                <code className="text-gray-200">vulnbox-stop</code> halts every target cleanly.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-300" /> Authorized use &amp; reporting
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              These targets exist for education. Only run them against systems you own or have written
              permission to test, and keep them isolated from shared and public networks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/legal/acceptable-use"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:opacity-90 transition-opacity"
              >
                Acceptable Use Policy <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/legal/security"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
              >
                Report a platform vulnerability
              </Link>
              <Link
                href="/legal/ethics"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
              >
                Legal &amp; Ethics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
