"use client";

import { CheckCircle, Clock, Loader2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuildProgressProps {
  currentPhase?: string;
  currentStep?: string;
  progress: number;
  // Accept any string — normalise internally
  status: string;
  estimatedCompletion?: string;
}

const PHASES = [
  { id: "preparation", name: "Preparation", emoji: "📦" },
  { id: "toolchain", name: "Toolchain", emoji: "🔧" },
  { id: "basic-system", name: "Basic System", emoji: "📚" },
  { id: "kernel", name: "Kernel", emoji: "⚙️" },
  { id: "configuration", name: "Configuration", emoji: "⚡" },
  { id: "cleanup", name: "Cleanup", emoji: "✨" },
];

export default function BuildProgress({
  currentPhase = "",
  currentStep = "",
  progress = 0,
  status,
  estimatedCompletion,
}: BuildProgressProps) {
  const s = (status || "unknown").toLowerCase();
  const isRunning = s === "running";
  const isSuccess = s === "success";
  const isFailed = s === "failed";
  const isCancelled = s === "cancelled";
  const isQueued = s === "queued" || s === "pending";

  const currentPhaseIndex = PHASES.findIndex((p) => p.id === currentPhase);

  const statusColor = isRunning
    ? "bg-blue-500/20 text-blue-400"
    : isSuccess
    ? "bg-green-500/20 text-green-400"
    : isFailed || isCancelled
    ? "bg-red-500/20 text-red-400"
    : "bg-gray-500/20 text-gray-400";

  const barColor = isSuccess
    ? "bg-gradient-to-r from-green-500 to-emerald-500"
    : isFailed || isCancelled
    ? "bg-gradient-to-r from-red-500 to-orange-500"
    : "bg-gradient-to-r from-blue-500 to-cyan-500";

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Build Progress</h2>
          <div className="flex items-center gap-2">
            {isRunning && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
            {isSuccess && <CheckCircle className="h-5 w-5 text-green-400" />}
            {(isFailed || isCancelled) && <AlertCircle className="h-5 w-5 text-red-400" />}
            {isQueued && <Clock className="h-5 w-5 text-gray-400" />}
            <span className={cn("text-sm font-medium px-3 py-1 rounded-full", statusColor)}>
              {s.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500 rounded-full", barColor)}
              style={{ width: `${isCancelled || isFailed ? 100 : progress}%`, opacity: isCancelled || isFailed ? 0.4 : 1 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Current Step</div>
          <div className="font-medium text-white">
            {isCancelled
              ? "Build was cancelled by user"
              : isFailed
              ? "Build failed"
              : currentStep || "Waiting..."}
          </div>
        </div>

        {/* Estimated Completion */}
        {estimatedCompletion && isRunning && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Estimated completion: {estimatedCompletion}</span>
          </div>
        )}
      </div>

      {/* Phase Timeline */}
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Build Phases</h3>
        <div className="space-y-3">
          {PHASES.map((phase, index) => {
            const isActive = phase.id === currentPhase;
            const isCompleted = currentPhaseIndex > index || isSuccess;
            const isUpcoming = !isActive && !isCompleted;

            return (
              <div
                key={phase.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all",
                  isActive && "bg-blue-500/20 border border-blue-500/30",
                  isCompleted && "bg-green-500/10 border border-green-500/20",
                  isUpcoming && "bg-gray-800/50 border border-white/5"
                )}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                  )}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Phase Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{phase.emoji}</span>
                    <h4
                      className={cn(
                        "font-semibold",
                        isActive && "text-blue-400",
                        isCompleted && "text-green-400",
                        isUpcoming && "text-gray-500"
                      )}
                    >
                      {phase.name}
                    </h4>
                  </div>
                  {isActive && (
                    <div className="text-sm text-gray-400 truncate">{currentStep}</div>
                  )}
                </div>

                {/* Phase Number */}
                <div
                  className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full",
                    isActive && "bg-blue-500/20 text-blue-400",
                    isCompleted && "bg-green-500/20 text-green-400",
                    isUpcoming && "bg-gray-700/50 text-gray-500"
                  )}
                >
                  {index + 1}/6
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
