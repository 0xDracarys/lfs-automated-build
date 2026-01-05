"use client";

import { useState, useEffect } from "react";
import { Settings, Package, Terminal as TerminalIcon, CheckCircle, Clock, Zap, Download, Monitor, HardDrive, AlertTriangle, ExternalLink, Copy, Check, Wand2, LogIn } from "lucide-react";
import Link from "next/link";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import CloudBuildForm from "@/components/cloud-build/CloudBuildForm";
import BuildTicker from "@/components/BuildTicker";

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState<"download" | "local" | "cloud">("download");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login error:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <DottedSurface className="opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-6"
          >
            <Package className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">LFS Build System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Custom Linux</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Choose how you want to get your Linux From Scratch system - download pre-built or build it yourself!
          </motion.p>
        </div>

        {/* Installation Wizard CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Link
            href="/install"
            className="block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-2xl p-6 hover:border-purple-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Wand2 className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Installation Wizard</h3>
                    <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full">New!</span>
                  </div>
                  <p className="text-gray-400">Step-by-step guided installation with progress tracking</p>
                </div>
              </div>
              <div className="hidden sm:block text-purple-400 group-hover:translate-x-2 transition-transform">
                →
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: "download", label: "Download Pre-built", icon: Download, color: "green" },
              { id: "local", label: "Build Locally", icon: Monitor, color: "blue" },
              { id: "cloud", label: "Cloud Build", icon: Zap, color: "purple", badge: user ? undefined : "Login Required" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                    ? `bg-${tab.color}-500/20 border-2 border-${tab.color}-500 text-${tab.color}-400`
                    : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
                {tab.badge && (
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Download Pre-built Tab */}
        {activeTab === "download" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <h2 className="text-2xl font-bold text-green-400">Pre-built LFS Available!</h2>
                  <p className="text-gray-400">Tested and working - ready to boot in minutes</p>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Toolchain */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-10 w-10 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-bold">Full Toolchain</h3>
                    <p className="text-sm text-gray-400">Complete build environment</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6 text-sm text-gray-300">
                  <p>✓ GCC 13.2.0, Binutils 2.41, Glibc 2.38</p>
                  <p>✓ Make, Bash, Coreutils, and more</p>
                  <p>✓ Ready for building additional packages</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-400">436 MB</span>
                  <span className="text-gray-500">.tar.gz</span>
                </div>
                <Link
                  href="/downloads"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download Toolchain
                </Link>
              </div>

              {/* ISO */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive className="h-10 w-10 text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold">Bootable ISO</h3>
                    <p className="text-sm text-gray-400">Ready to run in VM</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6 text-sm text-gray-300">
                  <p>✓ Linux Kernel 6.4.12</p>
                  <p>✓ Essential utilities included</p>
                  <p>✓ Boot in VirtualBox or real hardware</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-green-400">136 MB</span>
                  <span className="text-gray-500">.iso</span>
                </div>
                <Link
                  href="/downloads"
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download ISO
                </Link>
              </div>
            </div>

            {/* Usage Guide Link */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-4">Need help using the downloads?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/docs/toolchain-guide"
                  className="px-6 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                >
                  Toolchain Guide
                </Link>
                <Link
                  href="/docs/usage"
                  className="px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-all"
                >
                  ISO Usage Guide
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Local Build Tab */}
        {activeTab === "local" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Monitor className="h-8 w-8 text-blue-400 shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold">Build LFS Locally</h2>
                  <p className="text-gray-400">For advanced users who want to build from source</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold">Requirements</p>
                    <p className="text-sm text-gray-400">Linux environment (native or WSL), 10GB+ disk space, 2-4 hours build time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Windows Installer - Easiest Option */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-2xl p-6 mb-8 relative">
              <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xs font-bold shadow-lg shadow-green-500/50 animate-pulse">
                ⚡ EASIEST METHOD
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Download className="h-8 w-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Windows Installer (One-Click Setup)</h3>
                  <p className="text-gray-300 mb-4">Native Windows installer with automated WSL2 setup, LFS environment configuration, and desktop shortcuts. No manual commands required!</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Automatic WSL2 installation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">LFS environment setup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Desktop & Start Menu shortcuts</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">5-step wizard interface</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Prerequisites checking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Size: Only 184 KB</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="/downloads/LFSBuilderSetup.exe"
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download LFSBuilderSetup.exe (184 KB)
                  </a>
                  <p className="text-xs text-gray-400 mt-2">Run as Administrator after download • SHA-256: 11F9A2DE9BA23938A27FACF32B3F486EBBA543D8CA466AFE1FFBF22380B0AFB3</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 my-8 pt-8">
              <h3 className="text-xl font-bold mb-4 text-gray-400">Manual Build Instructions (Advanced)</h3>
              <p className="text-gray-500 mb-6">For users who prefer manual control or want to customize the build process</p>
            </div>

            {/* Build Steps */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-bold">Set Up Build Environment</h3>
                </div>
                <p className="text-gray-400 mb-4">Install WSL (Windows) or use native Linux</p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm relative">
                  <button
                    onClick={() => copyToClipboard("wsl --install -d Ubuntu", "step1")}
                    className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded"
                  >
                    {copiedCommand === "step1" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  </button>
                  <p className="text-gray-500"># Windows - Install WSL</p>
                  <p className="text-green-400">wsl --install -d Ubuntu</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-bold">Create LFS Mount Point</h3>
                </div>
                <p className="text-gray-400 mb-4">Set up the LFS directory structure</p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm relative">
                  <button
                    onClick={() => copyToClipboard("export LFS=/mnt/lfs\nsudo mkdir -pv $LFS\nsudo mkdir -pv $LFS/sources\nsudo chmod -v a+wt $LFS/sources", "step2")}
                    className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded"
                  >
                    {copiedCommand === "step2" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  </button>
                  <p className="text-green-400">export LFS=/mnt/lfs</p>
                  <p className="text-green-400">sudo mkdir -pv $LFS</p>
                  <p className="text-green-400">sudo mkdir -pv $LFS/sources</p>
                  <p className="text-green-400">sudo chmod -v a+wt $LFS/sources</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-bold">Download and Extract Toolchain</h3>
                </div>
                <p className="text-gray-400 mb-4">Use our pre-built toolchain as a starting point</p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm relative">
                  <button
                    onClick={() => copyToClipboard("cd $LFS\nwget https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/lfs-12.0-toolchain.tar.gz?alt=media -O toolchain.tar.gz\ntar -xzf toolchain.tar.gz", "step3")}
                    className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded"
                  >
                    {copiedCommand === "step3" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  </button>
                  <p className="text-green-400">cd $LFS</p>
                  <p className="text-green-400 break-all">wget [toolchain-url] -O toolchain.tar.gz</p>
                  <p className="text-green-400">tar -xzf toolchain.tar.gz</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-bold">Continue Building</h3>
                </div>
                <p className="text-gray-400 mb-4">Follow the LFS book to build additional packages</p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://www.linuxfromscratch.org/lfs/view/stable/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    LFS Book
                  </a>
                  <Link
                    href="/commands"
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <TerminalIcon className="h-4 w-4" />
                    Command Reference
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cloud Build Tab */}
        {activeTab === "cloud" && (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CloudBuildForm user={user} onLogin={handleLogin} />
            </div>
            <div className="lg:col-span-1">
              <BuildTicker />
            </div>
          </div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <Clock className="h-10 w-10 text-blue-400 mb-3" />
            <h4 className="font-semibold mb-2">Build Time</h4>
            <p className="text-sm text-gray-400">2-4 hours for full local build</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <Settings className="h-10 w-10 text-purple-400 mb-3" />
            <h4 className="font-semibold mb-2">Customizable</h4>
            <p className="text-sm text-gray-400">Choose packages and options</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
            <Package className="h-10 w-10 text-green-400 mb-3" />
            <h4 className="font-semibold mb-2">LFS 12.0</h4>
            <p className="text-sm text-gray-400">Latest stable version</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
