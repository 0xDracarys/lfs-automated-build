"use client";

/**
 * LatestPlatformBuilds — surfaces the platform's canonical latest build
 * straight from the builds bucket (via /api/downloads/latest): the newest
 * ISO + vuln-labs tarball with 7-day signed links, visible to everyone
 * regardless of which account launched the build.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Disc, Package2, FileArchive, Wrench, Download, Loader2, BadgeCheck } from "lucide-react";

interface Art {
  key: string;
  label: string;
  hint: string;
  name: string;
  sizeMB: number;
  url: string;
}

interface Latest {
  buildId: string;
  updated: string;
  complete: boolean;
  artifacts: Art[];
}

const ICONS: Record<string, React.ReactNode> = {
  iso: <Disc className="h-4 w-4" />,
  labs: <Package2 className="h-4 w-4" />,
  system: <FileArchive className="h-4 w-4" />,
  toolchain: <Wrench className="h-4 w-4" />,
};

export default function LatestPlatformBuilds() {
  const [data, setData] = useState<Latest | null>(null);
  const [error, setError] = useState(false);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/downloads/latest");
        if (!r.ok) throw new Error(String(r.status));
        const j: Latest = await r.json();
        if (!j?.buildId) throw new Error("empty");
        setData(j);
      } catch {
        setError(true);
      }
    })();
  }, []);

  if (error) return null; // graceful: section simply doesn't render

  if (!data) {
    return (
      <div className="mt-10 flex items-center justify-center gap-3 text-gray-400 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Locating latest platform build…
      </div>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold">Latest platform build</h2>
        {data.complete && (
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          >
            <BadgeCheck className="h-3.5 w-3.5" /> complete (ISO + labs)
          </motion.span>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-6">
        The most recent full pipeline run — every artifact below is signed for 7 days. Re-runs of the
        pipeline replace this set automatically.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono text-xs text-gray-300">{data.buildId}</span>
          <span className="text-xs text-gray-400">
            {new Date(data.updated).toLocaleString()}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.artifacts.map((a, i) => (
            <motion.a
              key={a.key}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut", delay: reduce ? 0 : i * 0.08 }}
              className="group flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3.5 hover:border-emerald-500/40 hover:bg-emerald-500/[0.06] transition-colors"
            >
              <span className="mt-0.5 text-emerald-400">{ICONS[a.key] || <Download className="h-4 w-4" />}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  {a.label} <Download className="h-3 w-3 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                </span>
                <span className="block text-xs text-gray-400 mt-0.5">
                  {a.sizeMB} MB · {a.hint}
                </span>
              </span>
            </motion.a>
          ))}
        </div>
        {data.artifacts.length === 0 && (
          <p className="text-xs text-gray-400">
            This build is still packaging — artifact links appear once objects land in the bucket.
          </p>
        )}
      </div>
    </section>
  );
}
