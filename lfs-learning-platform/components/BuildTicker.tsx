"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, XCircle, Clock, Server } from "lucide-react";

interface PublicBuild {
    id: string;
    projectName: string;
    lfsVersion: string;
    status: string;
    timestamp: string;
    duration?: string;
}

export default function BuildTicker() {
    const [builds, setBuilds] = useState<PublicBuild[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBuilds = async () => {
        try {
            // Use Firebase Function URL directly to avoid Next.js rewrites issues if any
            // In production, this should benefit from a rewrite or env var
            const response = await fetch("https://us-central1-alfs-bd1e0.cloudfunctions.net/getPublicBuilds");
            if (response.ok) {
                const data = await response.json();
                setBuilds(data.builds || []);
            }
        } catch (error) {
            console.error("Failed to fetch public builds", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuilds();
        const interval = setInterval(fetchBuilds, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "SUCCESS": return "text-green-400 bg-green-500/10 border-green-500/20";
            case "FAILED": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "RUNNING": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case "SUCCESS": return <CheckCircle className="w-4 h-4" />;
            case "FAILED": return <XCircle className="w-4 h-4" />;
            case "RUNNING": return <Activity className="w-4 h-4 animate-pulse" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold text-white">Live Build Feed</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Global Activity
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {loading && builds.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {builds.map((build) => (
                            <motion.div
                                key={build.id + build.status}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                layout
                                className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(build.status)} transition-colors`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-black/20">
                                        {getStatusIcon(build.status)}
                                    </div>
                                    <div>
                                        <div className="font-mono text-sm font-bold flex items-center gap-2">
                                            {build.projectName}
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-white/70">
                                                {build.lfsVersion}
                                            </span>
                                        </div>
                                        <div className="text-xs opacity-70 flex items-center gap-2">
                                            <span>ID: {build.id}</span>
                                            <span>•</span>
                                            <span>{new Date(build.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-bold opacity-90">
                                        {build.status}
                                    </div>
                                    {build.duration && (
                                        <div className="text-xs opacity-60 font-mono">
                                            {build.duration}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {builds.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent builds</p>
                    </div>
                )}
            </div>
        </div>
    );
}
