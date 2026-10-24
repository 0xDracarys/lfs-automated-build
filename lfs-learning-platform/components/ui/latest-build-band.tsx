"use client";

/**
 * LatestBuildBand — a slim, always-current strip for the landing page showing
 * the newest platform build straight from the builds bucket: build id, ISO
 * availability/size, labs-tarball availability, and a link to Downloads.
 * Renders nothing if the feed is unavailable, so it can never break the hero.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Disc, Package2, ArrowRight, Loader2 } from "lucide-react";

interface Art {
  key: string;
  sizeMB: number;
}

interface Latest {
  buildId: string;
  updated: string;
  complete: boolean;
  artifacts: Art[];
}

export default function LatestBuildBand() {
  const [data, setData] = useState<Latest | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/downloads/latest");
        if (!r.ok) throw new Error(String(r.status));
        const j: Latest = await r.json();
        if (cancelled) return;
        if (!j?.buildId) throw new Error("empty");
        setData(j);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  if (!data) {
    return (
      <div className="relative z-10 border-b border-white/[0.06] bg-nav-button/20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-2.5 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70">
          <Loader2 className="w-3 h-3 animate-spin" /> locating latest build…
        </div>
      </div>
    );
  }

  const iso = data.artifacts.find((a) => a.key === "iso");
  const labs = data.artifacts.find((a) => a.key === "labs");
  const when = new Date(data.updated).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative z-10 border-b border-white/[0.06] bg-nav-button/20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono uppercase tracking-widest">
        <span className="text-emerald-400/90">Latest build</span>
        <span className="text-muted-foreground normal-case tracking-normal">{data.buildId}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Disc className="w-3 h-3" />
          {iso ? `ISO ${iso.sizeMB} MB` : "ISO pending"}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Package2 className="w-3 h-3" />
          {labs ? `Labs ${(labs.sizeMB / 1024).toFixed(1)} GB` : "Labs pending"}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-muted-foreground">{when}</span>
        <Link
          href="/downloads"
          className="ml-auto inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
        >
          Downloads <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
