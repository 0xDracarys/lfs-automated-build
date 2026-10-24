"use client";

/**
 * /architecture — VM implementation & background processes (Prof. Martas
 * Ambraziūnas, 21 Oct). One animated diagram, one idea per view.
 *
 * The diagram plays the path of ONE build request and then stops. It never
 * loops, every label is present in the DOM at full contrast while it plays,
 * and the Pause control freezes it mid-flow. With prefers-reduced-motion the
 * whole flow is drawn in its final state — no autoplay, no stagger.
 *
 * Package-sync row: cloud side comes live from the newest build's manifest.json
 * (/api/architecture/packages); local side comes from lib/local-build-config.json,
 * generated from lfs-vulnbox.sh + lfs-build.sh + installer/installer-manifest.json.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Check,
  CircleAlert,
  Cloud,
  Database,
  HardDrive,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Server,
  Terminal,
  TriangleAlert,
} from "lucide-react";

const EASE = "easeOut" as const;

/* ── platform hops ───────────────────────────────────────────────────────── */

const HOPS = [
  {
    id: "ui",
    icon: Layers,
    title: "Next.js 16 / React",
    detail: "You tick Include Practice Targets and submit. The form POSTs to /api/cloud-build.",
  },
  {
    id: "fn",
    icon: Database,
    title: "Firebase Functions + Firestore",
    detail:
      "Auth is verified, the build record is written, and the one-active-build-per-user rule is enforced.",
  },
  {
    id: "run",
    icon: Server,
    title: "Cloud Run Jobs — 8 vCPU / 32 GB",
    detail:
      "Staged jobs: the 60-minute Cloud Run execution limit is beaten by chaining stages, each finishing inside its own window.",
  },
  {
    id: "gcs",
    icon: HardDrive,
    title: "Cloud Storage (GCS)",
    detail:
      "ISO, system and vuln-labs tarballs, toolchain and manifest.json land in the builds bucket with signed links.",
  },
];

const LOCAL_STEPS = [
  {
    icon: Boxes,
    title: ".NET 8 Windows installer",
    detail: "Checks the host, enables WSL2, lays out /mnt/lfs and the build scripts.",
  },
  {
    icon: Terminal,
    title: "WSL2 + chroot",
    detail: "Builds on the machine itself: cross-toolchain, temporary tools, then the final system in chroot.",
  },
];

/* ── diagram ─────────────────────────────────────────────────────────────── */

function FlowDiagram() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(reduce ? HOPS.length - 1 : 0);
  const [playing, setPlaying] = useState(!reduce);

  // One pass, then stop. No loop, no bounce.
  useEffect(() => {
    if (reduce || !playing) return;
    if (active >= HOPS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setActive((i) => Math.min(i + 1, HOPS.length - 1)), 1200);
    return () => clearTimeout(t);
  }, [active, playing, reduce]);

  const finished = active >= HOPS.length - 1 && !playing;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-300" /> One build request, end to end
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Platform path. Every label stays readable while the flow plays.
          </p>
        </div>

        {/* Visible Pause control — the only auto-playing motion on the page. */}
        {reduce ? (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs text-gray-400">
            <Pause className="w-3.5 h-3.5" /> Motion off (system setting)
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (finished) {
                setActive(0);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            aria-pressed={!playing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 text-xs font-medium text-gray-200 hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            {finished ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" /> Replay
              </>
            ) : playing ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Play
              </>
            )}
          </button>
        )}
      </div>

      <ol className="relative">
        {HOPS.map((hop, i) => {
          const isActive = active === i;
          const isDone = active > i;
          const Icon = hop.icon;
          return (
            <li key={hop.id} className="relative pl-12 pb-8 last:pb-0">
              {/* connector — fills only when this hop is reached */}
              {i < HOPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 bottom-0 w-px bg-white/10"
                >
                  <motion.span
                    className="absolute inset-0 w-px bg-emerald-400/60 origin-top"
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: isDone || isActive ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                  />
                </span>
              )}

              {/* marker */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  isActive
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : isDone
                      ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300/80"
                      : "border-white/15 bg-hero-bg text-gray-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div
                className={`rounded-xl border p-4 transition-colors ${
                  isActive ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-white/10"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
                    hop {i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-white">{hop.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{hop.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* status line for screen readers and for defence narration */}
      <p className="mt-2 text-xs text-gray-400" aria-live="polite">
        {finished
          ? `Flow complete — ${HOPS.length} hops.`
          : `Step ${active + 1} of ${HOPS.length}: ${HOPS[active].title}`}
      </p>
    </div>
  );
}

/* ── local path ──────────────────────────────────────────────────────────── */

function LocalPath() {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
        <Terminal className="w-4 h-4 text-gray-300" /> Local path
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        The same system, built on your own machine instead of the cloud.
      </p>
      <ol className="grid sm:grid-cols-2 gap-4">
        {LOCAL_STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.title}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: reduce ? 0 : i * 0.12 }}
              className="rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4 text-gray-300" />
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{s.detail}</p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── source → service call map ───────────────────────────────────────────── */

/**
 * Each row is a call site that exists in this repository today. Grouped by the
 * service being reached, because that is the question a defence panel asks:
 * "which code talks to what, and how do you know?"
 *
 * Deliberately static — this is reference material, read line by line, so
 * nothing here animates.
 */
const CALL_MAP = [
  {
    service: "Firebase Auth",
    rows: [
      {
        file: "contexts/AuthContext.tsx",
        call: "signInWithEmailAndPassword(auth, …) · onAuthStateChanged(auth, …)",
        note: "client SDK, project alfs-bd1e0",
      },
      {
        file: "app/api/cloud-build/route.ts",
        call: "admin.auth().verifyIdToken(bearer token)",
        note: "Admin SDK — the route refuses to run without a verified uid",
      },
    ],
  },
  {
    service: "Firestore",
    rows: [
      {
        file: "app/api/cloud-build/route.ts",
        call: "adminDb.collection('builds').add(doc) → .update(status)",
        note: "build record, written before the job is launched",
      },
      {
        file: "contexts/AuthContext.tsx",
        call: "getDoc / setDoc on users/{uid}",
        note: "client SDK — rules allow the owner only",
      },
      {
        file: "app/api/lfs/status/[buildId]/route.ts",
        call: "GET documents/builds/{id} and /logs",
        note: "Firestore REST with an Admin SDK access token; ownership checked server-side",
      },
    ],
  },
  {
    service: "Cloud Run Jobs",
    rows: [
      {
        file: "lib/job-launch.ts",
        call: "POST run.googleapis.com/v2/projects/{p}/locations/us-central1/jobs/lfs-builder:run",
        note: "containerOverrides carry ENABLE_VULNBOX / VULNBOX_PACKAGES as env",
      },
      {
        file: "lib/job-launch.ts",
        call: "GET …/jobs/lfs-builder/executions",
        note: "polls up to 12× at 5 s to resolve the execution name",
      },
    ],
  },
  {
    service: "Cloud Storage",
    rows: [
      {
        file: "lfs-build.sh",
        call: "gsutil cp lfs-bootable-*.iso · vuln-labs-*.tar.gz · manifest.json",
        note: "runs inside the job container, not in the web app",
      },
      {
        file: "app/api/downloads/latest/route.ts",
        call: "bucket.getFiles() → file.getSignedUrl()",
        note: "7-day links, newest complete build only",
      },
      {
        file: "app/api/architecture/packages/route.ts",
        call: "newest builds/*/manifest.json → download()",
        note: "the cloud half of the package-sync row below",
      },
    ],
  },
  {
    service: "Cloud Logging",
    rows: [
      {
        file: "app/api/lfs/status/[buildId]/route.ts",
        call: "logging.googleapis.com/v2/entries:list",
        note: "fallback when the job wrote no Firestore logs; filtered to job_name=lfs-builder",
      },
    ],
  },
  {
    service: "Firebase Functions (background)",
    rows: [
      {
        file: "functions/index.js",
        call: "onBuildSubmitted · onExecutionStatusChange · sendBuildEmail",
        note: "Firestore triggers for status fan-out and email",
      },
      {
        file: "functions/index.js",
        call: "executeLfsBuild (pub/sub) · listBuilds · getBuildStatus",
        note: "scheduled/HTTP helpers",
      },
    ],
  },
] as const;

function CallMap() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
        <Terminal className="w-4 h-4 text-emerald-300" /> How the code reaches each service
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        Every row is a call site in this repository. The web path launches the job itself — it does
        not wait on a Cloud Function — which is why a build starts even when the functions layer is
        idle.
      </p>

      <div className="space-y-5">
        {CALL_MAP.map((group) => (
          <div key={group.service}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-emerald-300/90 mb-2">
              {group.service}
            </h3>
            <ul className="border-t border-white/5">
              {group.rows.map((row) => (
                <li key={row.file + row.call} className="border-b border-white/5 py-3">
                  <code className="block font-mono text-[11px] leading-relaxed text-gray-200 break-all">
                    {row.file}
                  </code>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-gray-400 break-all">
                    {row.call}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">{row.note}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── package-sync proof ──────────────────────────────────────────────────── */
interface SyncData {
  local: {
    targets: string[];
    defaultTargets: string | null;
    dependencies: string[];
    lfsVersion: string | null;
    source: string[];
  };
  cloud: {
    buildId: string | null;
    lfsVersion: string | null;
    buildDate: string | null;
    buildDuration: string | null;
    vulnboxEnabled: string | boolean | null;
    targets: string[];
    artifacts: string[];
    manifestPath: string;
  } | null;
  match: boolean | null;
  reason?: string;
}

function PackageSync() {
  const [data, setData] = useState<SyncData | null>(null);
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/architecture/packages");
        if (!r.ok) throw new Error(String(r.status));
        const j: SyncData = await r.json();
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
        <Boxes className="w-4 h-4 text-emerald-300" /> Package sync
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        Cloud build set against local build set. Cloud side is read from the newest build&apos;s
        manifest.json; local side is generated from the repository build config.
      </p>

      {failed && (
        <p className="text-sm text-gray-400">Package data unavailable right now.</p>
      )}

      {!failed && !data && (
        <p className="text-sm text-gray-400">Reading manifest…</p>
      )}

      {data && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* cloud */}
            <div className="rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="h-4 w-4 text-emerald-300" />
                <h3 className="text-sm font-semibold">Cloud</h3>
              </div>
              {data.cloud ? (
                <ul className="text-sm text-gray-400 space-y-1.5">
                  <li className="font-mono text-xs text-gray-300 break-all">{data.cloud.buildId}</li>
                  <li>practice targets: {data.cloud.targets.length ? data.cloud.targets.join(", ") : "none"}</li>
                  <li>LFS {data.cloud.lfsVersion ?? "—"}</li>
                  <li className="break-all text-xs">
                    source: {data.cloud.manifestPath}
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-gray-400">
                  Manifest unavailable{data.reason ? ` — ${data.reason}` : ""}.
                </p>
              )}
            </div>

            {/* local */}
            <div className="rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="h-4 w-4 text-gray-300" />
                <h3 className="text-sm font-semibold">Local</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1.5">
                <li>
                  practice targets: {data.local.targets.length ? data.local.targets.join(", ") : "none"}
                </li>
                <li>LFS {data.local.lfsVersion ?? "—"}</li>
                <li>runtime: {data.local.dependencies.join(" + ") || "—"}</li>
                <li className="break-all text-xs">source: {data.local.source.join(", ")}</li>
              </ul>
            </div>
          </div>

          {/* verdict — a single fade, never a count-up */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
            className="mt-4"
          >
            {data.match === true && (
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-300">
                <Check className="h-4 w-4" /> same set
              </p>
            )}
            {data.match === false && (
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-sm text-amber-300">
                <CircleAlert className="h-4 w-4" /> sets differ — cloud and local config are out of sync
              </p>
            )}
            {data.match === null && (
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 text-sm text-gray-400">
                <CircleAlert className="h-4 w-4" /> comparison unavailable
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function ArchitectureView() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-[1.1]">
            Architecture
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            How a build actually runs: the web app, the background processes, the cloud jobs and the
            storage — plus the local path on your own machine.
          </p>
        </header>

        <div className="space-y-6">
          <FlowDiagram />
          <LocalPath />
          <CallMap />
          <PackageSync />

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-amber-300">Lab use only. </span>
              Builds that include practice targets are intentionally vulnerable. Keep them isolated
              and test only systems you own or have written permission to assess — see the{" "}
              <Link
                href="/legal/acceptable-use"
                className="text-amber-300 underline hover:text-amber-200"
              >
                Acceptable Use Policy
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/build"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Start a Cloud Build <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vuln-hub"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Vuln Hub <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/downloads"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Downloads <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
