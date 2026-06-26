"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, HardDrive, Box, CheckCircle, FileArchive, Info,
  ExternalLink, Cloud, Server, Cpu, Shield, Terminal,
  ArrowRight, Sparkles, Clock, Zap, Monitor
} from "lucide-react";
import Link from "next/link";

/* ───────────────────────── data ───────────────────────── */

interface DownloadCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  size: string;
  format: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  badge?: string;
  badgeColor?: string;
  downloadUrl?: string;
  features: string[];
  steps: string[];
}

const downloads: DownloadCard[] = [
  {
    id: "cloud-wsl",
    title: "Cloud Build (WSL)",
    subtitle: "Latest automated build — ready for WSL",
    description:
      "Our automated cloud pipeline compiles the full LFS 12.0 system from source. Download the tarball and import it into WSL2 in under 2 minutes.",
    icon: <Cloud className="w-7 h-7" />,
    size: "~196 MB",
    format: ".tar.gz",
    gradient: "from-violet-600/20 via-fuchsia-600/20 to-pink-600/20",
    borderColor: "border-violet-500/40",
    glowColor: "shadow-violet-500/20",
    badge: "LATEST",
    badgeColor: "from-violet-500 to-fuchsia-500",
    downloadUrl:
      "https://storage.googleapis.com/alfs-bd1e0-builds/1IokPNQ5rM3BWpugAnVK/lfs-system.tar.gz",
    features: [
      "Full LFS 12.0 root filesystem",
      "GCC 13.2, Bash 5.2, Coreutils 9.3",
      "Binutils Pass 2, 17 compiled packages",
      "Built on Google Cloud Run (8 vCPU, 32 GB RAM)",
    ],
    steps: [
      "Download lfs-system.tar.gz (~196 MB)",
      "Open PowerShell as Administrator",
      'Run: wsl --import LFS-Cloud "C:\\LFS" .\\lfs-system.tar.gz --version 2',
      "Run: wsl --shutdown && wsl -d LFS-Cloud",
      "You're inside your custom Linux system!",
    ],
  },
  {
    id: "toolchain",
    title: "Full Toolchain",
    subtitle: "Complete 436 MB LFS build environment",
    description:
      "Everything you need to continue building LFS packages yourself. Includes the cross-compilation toolchain, headers, and libraries.",
    icon: <Server className="w-7 h-7" />,
    size: "436 MB",
    format: ".tar.gz",
    gradient: "from-blue-600/20 via-cyan-600/20 to-teal-600/20",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
    downloadUrl:
      "https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/lfs-12.0-toolchain.tar.gz?alt=media&token=1e9e0aed-ba72-4465-8fa2-b0ff5381a5c1",
    features: [
      "GCC 13.2.0, Binutils 2.41, Glibc 2.38",
      "Make, Bash, Coreutils, Findutils, Grep",
      "Ready for building additional packages",
      "Tested on x86_64 architecture",
    ],
    steps: [
      "Download the toolchain archive (436 MB)",
      "Extract: tar -xzf lfs-12.0-toolchain.tar.gz",
      "Download helper script: mount-lfs.ps1",
      "Run mount-lfs.ps1 from the extracted folder",
      "Follow prompts to mount into WSL and enter LFS shell",
    ],
  },
  {
    id: "iso",
    title: "Bootable ISO",
    subtitle: "Boot in VirtualBox, VMware, or real hardware",
    description:
      "A lightweight bootable ISO image you can use to explore the LFS system in any virtual machine or burn to a USB drive.",
    icon: <HardDrive className="w-7 h-7" />,
    size: "136 MB",
    format: ".iso",
    gradient: "from-emerald-600/20 via-green-600/20 to-lime-600/20",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    downloadUrl:
      "https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/lfs-12.0-latest.iso?alt=media&token=ff0fb0a6-17c1-4a91-b885-08f42bf2b54e",
    features: [
      "Linux Kernel 6.4.12",
      "GRUB 2.06 bootloader",
      "Essential GNU utilities",
      "Works on VirtualBox, VMware, QEMU, bare metal",
    ],
    steps: [
      "Download the ISO file (136 MB)",
      "Open VirtualBox / VMware / QEMU",
      "Create a new VM → attach ISO",
      "Boot from the ISO",
      "Login as root (no password)",
    ],
  },
  {
    id: "installer",
    title: "Windows Installer",
    subtitle: "One-click native Windows installer",
    description:
      "The easiest way to get started. A lightweight installer that automatically sets up WSL2 and configures your LFS environment with desktop shortcuts.",
    icon: <Monitor className="w-7 h-7" />,
    size: "184 KB",
    format: ".exe",
    gradient: "from-amber-600/20 via-orange-600/20 to-red-600/20",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    badge: "EASIEST",
    badgeColor: "from-amber-500 to-orange-500",
    downloadUrl: "/downloads/LFSBuilderSetup.exe",
    features: [
      "Automatic WSL2 installation",
      "LFS environment auto-configuration",
      "Desktop & Start Menu shortcuts",
      "5-step wizard interface",
    ],
    steps: [
      "Download LFSBuilderSetup.exe (184 KB)",
      "Right-click → Run as Administrator",
      "Follow the 5-step installation wizard",
      "Automatic WSL2 setup and LFS environment configuration",
      "Launch 'LFS Builder' from Desktop when complete",
    ],
  },
];

/* ───────────────────────── helpers ───────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ───────────────────────── page ───────────────────────── */

export default function DownloadsPage() {
  const [selected, setSelected] = useState<string>("cloud-wsl");
  const [downloading, setDownloading] = useState(false);
  const [pulseIdx, setPulseIdx] = useState(0);

  // Subtle animation: cycle glowing dot on the stats bar
  useEffect(() => {
    const t = setInterval(() => setPulseIdx((p) => (p + 1) % 4), 2500);
    return () => clearInterval(t);
  }, []);

  const activeCard = downloads.find((d) => d.id === selected)!;

  const handleDownload = () => {
    if (activeCard.downloadUrl) {
      setDownloading(true);
      window.open(activeCard.downloadUrl, "_blank");
      setTimeout(() => setDownloading(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-violet-500/30">
      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-fuchsia-600/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/[0.06] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* ──────── Hero ──────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300 tracking-wide">
              Downloads
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-5 leading-[1.1]">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Get Your{" "}
            </span>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Custom Linux
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Choose your preferred format below. Every artifact is compiled from
            source using our automated cloud pipeline.
          </p>
        </motion.div>

        {/* ──────── Stats bar ──────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: <Cpu className="w-5 h-5" />, label: "LFS Version", value: "12.0" },
            { icon: <Shield className="w-5 h-5" />, label: "Kernel", value: "6.4.12" },
            { icon: <Box className="w-5 h-5" />, label: "Packages", value: "17+" },
            { icon: <Clock className="w-5 h-5" />, label: "Last Build", value: "Jun 21" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm transition-all duration-500 ${
                pulseIdx === i ? "border-violet-500/40 bg-violet-500/[0.06]" : ""
              }`}
            >
              <div className="text-gray-500">{s.icon}</div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-lg font-bold">{s.value}</div>
              </div>
              {pulseIdx === i && (
                <motion.div
                  layoutId="statGlow"
                  className="absolute inset-0 rounded-xl border border-violet-400/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* ──────── Download cards ──────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5 mb-12"
        >
          {downloads.map((card) => {
            const isActive = selected === card.id;
            return (
              <motion.button
                key={card.id}
                variants={itemVariants}
                onClick={() => setSelected(card.id)}
                className={`group relative text-left rounded-2xl p-6 transition-all duration-300 cursor-pointer border backdrop-blur-sm ${
                  isActive
                    ? `bg-gradient-to-br ${card.gradient} ${card.borderColor} ring-1 ring-white/10 ${card.glowColor} shadow-xl`
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10"
                }`}
              >
                {/* Badge */}
                {card.badge && (
                  <span
                    className={`absolute -top-2.5 right-4 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-gradient-to-r ${card.badgeColor} text-white shadow-lg`}
                  >
                    {card.badge}
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      isActive ? "bg-white/10" : "bg-white/[0.04]"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-gray-500"}>
                      {card.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-0.5">{card.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{card.subtitle}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-gray-400 font-mono">
                        {card.format}
                      </span>
                      <span className="text-gray-500">{card.size}</span>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 mt-1 transition-all ${
                      isActive
                        ? "text-white translate-x-0 opacity-100"
                        : "text-gray-600 -translate-x-1 opacity-0 group-hover:opacity-60 group-hover:translate-x-0"
                    }`}
                  />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ──────── Expanded detail panel ──────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="max-w-6xl mx-auto"
          >
            <div
              className={`rounded-2xl border backdrop-blur-sm p-8 bg-gradient-to-br ${activeCard.gradient} ${activeCard.borderColor}`}
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: features */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{activeCard.title}</h2>
                  <p className="text-gray-400 mb-6">{activeCard.description}</p>

                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    What&apos;s included
                  </h4>
                  <ul className="space-y-2.5 mb-8">
                    {activeCard.features.map((f, i) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2.5 text-sm text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Download button */}
                  <button
                    onClick={handleDownload}
                    disabled={downloading || !activeCard.downloadUrl}
                    className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting Download…
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download {activeCard.format.toUpperCase()} ({activeCard.size})
                      </>
                    )}
                  </button>
                </div>

                {/* Right: steps */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                    Installation Steps
                  </h4>
                  <ol className="space-y-4">
                    {activeCard.steps.map((step, i) => (
                      <motion.li
                        key={step}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-300 font-mono pt-0.5 leading-relaxed">
                          {step}
                        </p>
                      </motion.li>
                    ))}
                  </ol>

                  {/* Terminal preview for WSL card */}
                  {selected === "cloud-wsl" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-6 rounded-xl bg-black/60 border border-white/[0.06] p-4 font-mono text-xs"
                    >
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        <span className="ml-2 text-gray-600 text-[10px]">PowerShell</span>
                      </div>
                      <div className="space-y-1.5 text-gray-400">
                        <p>
                          <span className="text-blue-400">PS&gt;</span> wsl --import LFS-Cloud
                          &quot;C:\LFS&quot; .\lfs-system.tar.gz
                        </p>
                        <p className="text-green-400">The operation completed successfully.</p>
                        <p>
                          <span className="text-blue-400">PS&gt;</span> wsl -d LFS-Cloud
                        </p>
                        <p className="text-emerald-400">-bash-5.2# whoami</p>
                        <p className="text-white">root</p>
                        <p className="text-emerald-400">-bash-5.2# gcc --version</p>
                        <p className="text-white">gcc (GCC) 13.2.0</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ──────── Resources ──────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-5"
        >
          {[
            {
              icon: <Terminal className="w-5 h-5 text-violet-400" />,
              title: "Toolchain Usage Guide",
              desc: "Complete guide for extracting and using the toolchain on Windows, Linux, and macOS.",
              href: "/docs/toolchain-guide",
              color: "violet",
            },
            {
              icon: <FileArchive className="w-5 h-5 text-emerald-400" />,
              title: "ISO Usage Guide",
              desc: "Step-by-step instructions for using the ISO with VirtualBox or USB boot.",
              href: "/docs/usage",
              color: "emerald",
            },
            {
              icon: <Zap className="w-5 h-5 text-blue-400" />,
              title: "Build Your Own",
              desc: "Want to customize? Use our cloud build system to create your own LFS.",
              href: "/build",
              color: "blue",
            },
          ].map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all"
            >
              <div className="mb-3">{r.icon}</div>
              <h3 className="font-semibold mb-2 group-hover:text-white transition-colors">
                {r.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{r.desc}</p>
              <span className={`text-sm font-medium text-${r.color}-400 flex items-center gap-1`}>
                Learn more
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </motion.div>

        {/* ──────── Checksum ──────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-300 mb-2">Verify Your Download</h3>
              <p className="text-sm text-gray-400 mb-3">
                Always verify the integrity of downloaded files:
              </p>
              <div className="rounded-lg bg-black/40 p-3 font-mono text-xs text-gray-400 space-y-1">
                <p className="text-gray-600"># Linux / Mac:</p>
                <p className="text-emerald-400">sha256sum lfs-system.tar.gz</p>
                <p className="text-gray-600 mt-2"># Windows (PowerShell):</p>
                <p className="text-emerald-400">
                  Get-FileHash lfs-system.tar.gz -Algorithm SHA256
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
