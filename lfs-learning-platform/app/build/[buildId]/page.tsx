"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, XCircle, Download } from "lucide-react";
import Link from "next/link";
import BuildProgress from "@/components/lfs/build-progress";
import LogViewer from "@/components/lfs/log-viewer";
import { DottedSurface } from "@/components/ui/dotted-surface";

interface BuildData {
  buildId: string;
  status: "queued" | "running" | "success" | "failed";
  progress: number;
  currentPhase: string;
  currentStep: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  config: any;
  logs: Array<{
    timestamp: string;
    level: "info" | "warning" | "error" | "success";
    message: string;
    phase?: string;
  }>;
}

export default function BuildProgressPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = use(params);
  const [buildData, setBuildData] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch build data (polling for now, will upgrade to real-time later)
  useEffect(() => {
    const fetchBuildData = async () => {
      try {
        const response = await fetch(`/api/lfs/status/${buildId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch build status");
        }

        const data = await response.json();
        setBuildData(data);
        setLoading(false);

        // Continue polling if build is still running
        if (data.status === "running" || data.status === "queued") {
          setTimeout(fetchBuildData, 2000); // Poll every 2 seconds
        }
      } catch (err) {
        console.error("Error fetching build data:", err);
        setError("Failed to load build data");
        setLoading(false);
      }
    };

    fetchBuildData();
  }, [buildId]);

  const cancelBuild = async () => {
    if (!confirm("Are you sure you want to cancel this build?")) return;

    try {
      await fetch(`/api/lfs/cancel/${buildId}`, { method: "POST" });
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel build");
    }
  };

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

  if (error || !buildData) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || "Build not found"}</p>
          <Link
            href="/build"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Return to build page
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <DottedSurface className="opacity-20" />

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/build"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Build</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Build #{buildId.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-400">
                Started: {new Date(buildData.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {buildData.status === "running" && (
                <button
                  onClick={cancelBuild}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Build</span>
                </button>
              )}

              {buildData.status === "success" && (
                <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download ISO</span>
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Progress */}
          <div className="xl:col-span-2">
            <BuildProgress
              currentPhase={buildData.currentPhase}
              currentStep={buildData.currentStep}
              progress={buildData.progress}
              status={buildData.status}
              estimatedCompletion={buildData.estimatedCompletion}
            />
          </div>

          {/* Right Column - Build Info */}
          <div className="space-y-6">
            {/* Build Configuration */}
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Configuration</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kernel Version:</span>
                  <span className="font-medium">{buildData.config.kernelVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimization:</span>
                  <span className="font-medium">{buildData.config.optimization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Networking:</span>
                  <span className="font-medium">
                    {buildData.config.enableNetworking ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Debug Symbols:</span>
                  <span className="font-medium">
                    {buildData.config.enableDebug ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Build Stats */}
            {buildData.status === "success" && buildData.completedAt && (
              <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Statistics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-medium">
                      {Math.round(
                        (new Date(buildData.completedAt).getTime() -
                          new Date(buildData.startedAt!).getTime()) /
                          1000 /
                          60
                      )}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Logs:</span>
                    <span className="font-medium">{buildData.logs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Errors:</span>
                    <span className="font-medium text-red-400">
                      {buildData.logs.filter((l) => l.level === "error").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warnings:</span>
                    <span className="font-medium text-yellow-400">
                      {buildData.logs.filter((l) => l.level === "warning").length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logs Section */}
        <div className="mt-6">
          <LogViewer logs={buildData.logs} autoScroll={buildData.status === "running"} />
        </div>
      </div>
    </main>
  );
}
