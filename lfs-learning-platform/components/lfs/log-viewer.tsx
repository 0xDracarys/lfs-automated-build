"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  phase?: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  autoScroll?: boolean;
  buildId?: string;
  logsSource?: string;
}

export default function LogViewer({ logs, autoScroll = true, buildId, logsSource }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"all" | "info" | "warning" | "error" | "success">("all");

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getLevelBg = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "bg-red-500/20 border-red-500/30";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/30";
      case "success":
        return "bg-green-500/20 border-green-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

  const filteredLogs = logs.filter((log) => filter === "all" || log.level === filter);

  const downloadLogs = () => {
    const logText = logs
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lfs-build-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-bold">Build Logs</h3>
          <span className="text-sm text-gray-400">({logs.length} entries)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-black border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Logs</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Download Button */}
          <button
            onClick={downloadLogs}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Download logs"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div
        ref={scrollRef}
        className="h-[400px] overflow-y-auto bg-black font-mono text-sm p-4 space-y-2"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 p-4">
            <Terminal className="h-8 w-8 opacity-30" />
            <p className="text-sm">
              {logsSource === "none" || !logsSource
                ? "No logs were written to Firestore for this build."
                : "No logs to display for the current filter."}
            </p>
            {(logsSource === "none" || !logsSource) && (
              <div className="text-center text-xs text-gray-600 space-y-1">
                <p>The Cloud Run container writes logs to Google Cloud Logging.</p>
                <a
                  href={`https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_job%22%20AND%20resource.labels.job_name%3D%22lfs-builder%22;project=alfs-bd1e0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                >
                  View Live Logs in Cloud Console →
                </a>
              </div>
            )}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 p-2 rounded-lg border",
                getLevelBg(log.level)
              )}
            >
              <span className="text-gray-600 flex-shrink-0 text-xs">
                {log.timestamp}
              </span>
              <span
                className={cn(
                  "flex-shrink-0 font-bold text-xs uppercase",
                  getLevelColor(log.level)
                )}
              >
                [{log.level}]
              </span>
              {log.phase && (
                <span className="text-blue-400 flex-shrink-0 text-xs">
                  [{log.phase}]
                </span>
              )}
              <span className="text-gray-300 break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-gray-900/30 text-xs text-gray-500 flex items-center justify-between">
        <span>Auto-scrolling {autoScroll ? "enabled" : "disabled"}</span>
        <span>Showing {filteredLogs.length} of {logs.length} logs</span>
      </div>
    </div>
  );
}
