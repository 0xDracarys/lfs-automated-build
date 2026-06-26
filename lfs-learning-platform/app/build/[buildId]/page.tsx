"use client";

import { use, useEffect, useState, useCallback } from "react";
import { ArrowLeft, RefreshCw, XCircle, Download, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import BuildProgress from "@/components/lfs/build-progress";
import LogViewer from "@/components/lfs/log-viewer";
import { DottedSurface } from "@/components/ui/dotted-surface";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  phase?: string;
}

interface BuildData {
  id: string;
  status: string;
  progress: number;
  currentPhase: string;
  currentStep: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  error?: string;
  config: {
    kernelVersion?: string;
    optimization?: string;
    enableNetworking?: boolean;
    enableDebug?: boolean;
  };
  logs: LogEntry[];
}

// Normalise status to lowercase for all comparisons
const norm = (s: string) => (s || "").toLowerCase();

const isRunning = (s: string) => norm(s) === "running";
const isQueued  = (s: string) => norm(s) === "queued" || norm(s) === "pending";
const isActive  = (s: string) => isRunning(s) || isQueued(s);
const isFinal   = (s: string) =>
  ["success", "failed", "cancelled", "error"].includes(norm(s));

export default function BuildProgressPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = use(params);

  const [buildData, setBuildData]   = useState<BuildData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  // ── Polling ────────────────────────────────────────────────────────────────
  const fetchBuild = useCallback(async () => {
    try {
      const res = await fetch(`/api/lfs/status/${buildId}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const data: BuildData = await res.json();
      setBuildData(data);
      setLoading(false);
      setError(null);
      return data;
    } catch (err: any) {
      console.error("fetchBuild error:", err.message);
      setError(err.message || "Failed to load build data");
      setLoading(false);
      return null;
    }
  }, [buildId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const poll = async () => {
      const data = await fetchBuild();
      if (data && isActive(data.status)) {
        timer = setTimeout(poll, 3000);
      }
    };

    poll();
    return () => clearTimeout(timer);
  }, [fetchBuild]);

  // ── Live elapsed timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!buildData) return;

    if (isActive(buildData.status)) {
      const start = new Date(buildData.startedAt || buildData.createdAt).getTime();
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }

    if (isFinal(buildData.status) && buildData.startedAt && buildData.completedAt) {
      const secs = Math.floor(
        (new Date(buildData.completedAt).getTime() - new Date(buildData.startedAt).getTime()) / 1000
      );
      setElapsedTime(secs);
    }
  }, [buildData?.status, buildData?.startedAt, buildData?.completedAt, buildData?.createdAt]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  // ── Cancel build ────────────────────────────────────────────────────────────
  const cancelBuild = async () => {
    if (!confirm("Cancel this build? This will stop the Cloud Run container.")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/lfs/cancel/${buildId}`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Cancel failed");
      await fetchBuild();
    } catch (err: any) {
      alert(`Cancel failed: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading build data...</p>
        </div>
      </main>
    );
  }

  // ── Render: error ────────────────────────────────────────────────────────────
  if (error || !buildData) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">{error || "Build not found"}</p>
          <button
            onClick={() => { setLoading(true); setError(null); fetchBuild(); }}
            className="text-blue-400 hover:text-blue-300 underline mr-4"
          >
            Retry
          </button>
          <Link href="/build" className="text-gray-400 hover:text-white underline">
            Back to builds
          </Link>
        </div>
      </main>
    );
  }

  const status = norm(buildData.status);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <DottedSurface className="opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <Link
            href="/build"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Build</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-1">
                Build #{buildId.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-400 text-sm">
                {buildData.createdAt
                  ? `Started: ${new Date(buildData.createdAt).toLocaleString()}`
                  : "Start time unavailable"}
              </p>

              {/* Status + Timer row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {/* Status badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  status === "running"   ? "bg-blue-500/20 text-blue-400" :
                  status === "success"   ? "bg-green-500/20 text-green-400" :
                  isQueued(status)       ? "bg-yellow-500/20 text-yellow-400" :
                                           "bg-red-500/20 text-red-400"
                }`}>
                  {status.toUpperCase()}
                </span>

                {/* Live timer */}
                {elapsedTime > 0 && (
                  <span className="font-mono text-sm bg-white/5 px-3 py-1 rounded-full text-gray-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isActive(buildData.status) ? "Running" : "Duration"}: {formatTime(elapsedTime)}
                  </span>
                )}

                {/* Error badge */}
                {buildData.error && (
                  <span className="text-red-400 text-xs bg-red-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {buildData.error}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {isActive(buildData.status) && (
                <button
                  onClick={cancelBuild}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {cancelling ? "Cancelling..." : "Cancel Build"}
                </button>
              )}

              {status === "success" && (
                <button
                  onClick={() =>
                    window.open(
                      `https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds/${buildId}`,
                      "_blank"
                    )
                  }
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Output</span>
                </button>
              )}

              <button
                onClick={() => { setLoading(false); fetchBuild(); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left — Progress */}
          <div className="xl:col-span-2">
            <BuildProgress
              currentPhase={buildData.currentPhase}
              currentStep={buildData.currentStep}
              progress={buildData.progress}
              status={buildData.status}
              estimatedCompletion={buildData.estimatedCompletion}
            />
          </div>

          {/* Right — Info panels */}
          <div className="space-y-6">

            {/* Configuration */}
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Configuration</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Kernel Version",  buildData.config?.kernelVersion  ?? "—"],
                  ["Optimization",    buildData.config?.optimization   ?? "—"],
                  ["Networking",      buildData.config?.enableNetworking ? "Enabled" : "Disabled"],
                  ["Debug Symbols",   buildData.config?.enableDebug    ? "Enabled" : "Disabled"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics (only when done) */}
            {isFinal(buildData.status) && (
              <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Statistics</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ["Duration",  elapsedTime > 0 ? formatTime(elapsedTime) : "—"],
                    ["Total Logs", String(buildData.logs.length)],
                    ["Errors",    String(buildData.logs.filter((l) => l.level === "error").length)],
                    ["Warnings",  String(buildData.logs.filter((l) => l.level === "warning").length)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}:</span>
                      <span className={`font-medium ${label === "Errors" && Number(value) > 0 ? "text-red-400" : label === "Warnings" && Number(value) > 0 ? "text-yellow-400" : ""}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Logs ────────────────────────────────────────────────────────── */}
        <div className="mt-6">
          <LogViewer
            logs={buildData.logs}
            autoScroll={isRunning(buildData.status)}
            buildId={buildId}
            logsSource={(buildData as any).logsSource}
          />
        </div>

      </div>
    </main>
  );
}
