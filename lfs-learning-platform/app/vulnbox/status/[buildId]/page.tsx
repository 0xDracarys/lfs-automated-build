"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  ShieldAlert, CheckCircle, Clock, Loader2, HardDrive,
  Box, Container, Download, ArrowLeft, AlertCircle
} from "lucide-react";
import Link from "next/link";

interface BuildData {
  status: string;
  config: {
    identity: { boxName: string; boxColor: string; description: string };
    output: { outputFormats: string[]; difficultyRating: number };
  };
  createdAt: any;
  downloadUrls?: Record<string, string>;
  buildLog?: string;
  creditsConsumed?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; pulse: boolean }> = {
  queued: {
    label: "Queued",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    icon: <Clock className="w-5 h-5 text-amber-400" />,
    pulse: true,
  },
  building: {
    label: "Building",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    icon: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
    pulse: true,
  },
  complete: {
    label: "Complete",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    pulse: false,
  },
  failed: {
    label: "Failed",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    pulse: false,
  },
};

const FORMAT_META: Record<string, { icon: React.ReactNode; label: string; ext: string }> = {
  iso: { icon: <HardDrive className="w-5 h-5" />, label: "Bootable ISO", ext: ".iso" },
  ova: { icon: <Box className="w-5 h-5" />, label: "OVA Image", ext: ".ova" },
  docker: { icon: <Container className="w-5 h-5" />, label: "Docker Image", ext: ".tar" },
};

export default function VulnBoxStatusPage() {
  const params = useParams();
  const router = useRouter();
  const buildId = params?.buildId as string;

  const [user, setUser] = useState<User | null>(null);
  const [build, setBuild] = useState<BuildData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) router.push("/vulnbox");
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!buildId || !user) return;
    const ref = doc(db, "vulnbox_builds", buildId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) { setNotFound(true); return; }
        setBuild(snap.data() as BuildData);
      },
      () => setNotFound(true)
    );
    return unsub;
  }, [buildId, user]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-transparent text-white pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Build Not Found</h1>
          <p className="text-gray-400 mb-6">This build doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/vulnbox" className="px-6 py-2.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-600/30 transition-all">
            Back to VulnBox
          </Link>
        </div>
      </main>
    );
  }

  if (!build) {
    return (
      <main className="min-h-screen bg-transparent text-white pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </main>
    );
  }

  const statusCfg = STATUS_CONFIG[build.status] ?? STATUS_CONFIG.queued;
  const formats = build.config?.output?.outputFormats ?? ["iso"];
  const boxName = build.config?.identity?.boxName ?? "VulnBox";

  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/[0.05] blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        {/* Back */}
        <Link href="/vulnbox" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to VulnBox Builder
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold">{boxName}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusCfg.color}`}>
              {statusCfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-mono">Build ID: {buildId}</p>
        </motion.div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-6"
        >
          {build.status === "queued" && (
            <div className="text-center py-6">
              <div className="relative inline-flex mb-5">
                <Clock className="w-12 h-12 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-75" />
              </div>
              <h2 className="text-xl font-bold mb-2">Your build is queued</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Your VulnBox configuration has been saved. The build worker will pick it up shortly.
                You&apos;ll see live progress here once it starts.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-sm text-amber-300/80">
                ⚡ Build execution launches in Phase 2 — your config is locked in and ready.
              </div>
            </div>
          )}

          {build.status === "building" && (
            <div className="text-center py-6">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Building your VulnBox…</h2>
              <p className="text-gray-400 text-sm">LFS base compilation + vulnerability injection in progress.</p>
            </div>
          )}

          {build.status === "complete" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-bold">Build Complete!</h2>
                  <p className="text-sm text-gray-400">Your VulnBox artifacts are ready to download.</p>
                </div>
              </div>
              <div className="space-y-3">
                {formats.map((fmt) => {
                  const meta = FORMAT_META[fmt];
                  const url = build.downloadUrls?.[fmt];
                  return (
                    <div key={fmt} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center gap-3 text-gray-300">
                        {meta?.icon}
                        <div>
                          <p className="font-medium text-sm">{meta?.label}</p>
                          <p className="text-xs text-gray-500">{meta?.ext} format</p>
                        </div>
                      </div>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-gray-600">Link pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {build.status === "failed" && (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Build Failed</h2>
              <p className="text-gray-400 text-sm mb-4">Something went wrong during the build process.</p>
              {build.buildLog && (
                <pre className="text-left text-xs font-mono bg-black/50 p-4 rounded-xl text-red-300 overflow-auto max-h-40">
                  {build.buildLog}
                </pre>
              )}
              <Link
                href="/vulnbox"
                className="inline-block mt-4 px-6 py-2.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-600/30 transition-all text-sm"
              >
                Try Again
              </Link>
            </div>
          )}
        </motion.div>

        {/* Config summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Build Config</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Formats</div>
            <div className="text-gray-200 text-right">{formats.join(", ").toUpperCase()}</div>
            <div className="text-gray-500">Difficulty</div>
            <div className="text-gray-200 text-right">
              {["", "Trivial", "Easy", "Medium", "Hard", "Insane"][build.config?.output?.difficultyRating ?? 2]}
            </div>
            <div className="text-gray-500">Credits used</div>
            <div className="text-gray-200 text-right">{build.creditsConsumed ?? formats.length}</div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
