"use client";

import { motion } from "framer-motion";
import { Download, Terminal, Info, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function ToolchainGuide() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden px-6 py-12">
      <DottedSurface className="opacity-20" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <Link
          href="/downloads"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Downloads
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">🔥 LFS Toolchain Usage Guide</h1>
          <p className="text-xl text-gray-400">
            Learn how to extract, mount, and use the LFS Chapter 5 toolchain in your environment.
          </p>
        </motion.div>

        {/* What's Inside Section */}
        <section className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-400" />
            What's inside the archive?
          </h2>
          <p className="text-gray-300 mb-6">
            When you extract the <code className="text-blue-400">lfs-12.0-toolchain.tar.gz</code>, you will see two folders:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <h3 className="font-bold text-green-400 mb-2">/tools</h3>
              <p className="text-sm text-gray-400">
                Contains the cross-compiler, linker, and build utilities (GCC, Binutils, Glibc) compiled specifically for LFS.
              </p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <h3 className="font-bold text-green-400 mb-2">/usr</h3>
              <p className="text-sm text-gray-400">
                Contains essential libraries and headers needed for compiling Chapter 6 packages.
              </p>
            </div>
          </div>
        </section>

        {/* Windows Instructions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-400" />
            Windows (WSL2) Setup
          </h2>

          <div className="space-y-6">
            <div className="relative pl-8 border-l-2 border-green-500/30">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-500" />
              <h3 className="font-bold mb-2">Step 1: Download Helper Script</h3>
              <p className="text-gray-400 mb-4 text-sm">
                To simplify the mounting process, we provide a PowerShell script that handles the WSL mount points and chroot initialization.
              </p>
              <a
                href="/mount-lfs.ps1"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download mount-lfs.ps1
              </a>
            </div>

            <div className="relative pl-8 border-l-2 border-green-500/30">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-500" />
              <h3 className="font-bold mb-2">Step 2: Run the Script</h3>
              <p className="text-gray-400 mb-4 text-sm">
                Place the script in the same folder as your extracted <code className="text-white">tools</code> and <code className="text-white">usr</code> folders.
                Right-click → <span className="text-white italic">Run with PowerShell</span>.
              </p>
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 font-mono text-xs text-gray-300">
                PS C:\LFS\> .\mount-lfs.ps1
              </div>
            </div>

            <div className="relative pl-8 border-l-2 border-green-500/30">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-500" />
              <h3 className="font-bold mb-2">Step 3: Enter Your Distro</h3>
              <p className="text-gray-400 text-sm">
                The script will ask for your WSL Distro name (e.g., Ubuntu). It will then mount the folders to <code className="text-white">/mnt/lfs</code> and enter the shell automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-12">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-yellow-500 mb-2">Important Note on Persistence</h3>
              <p className="text-sm text-gray-300">
                The mounts are <span className="font-bold underline">not persistent</span>. If you restart WSL or your computer, you must run the <code className="text-white">mount-lfs.ps1</code> script again to reconnect the toolchain.
              </p>
            </div>
          </div>
        </section>

        {/* Verification */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-blue-400" />
            Verifying the Shell
          </h2>
          <p className="text-gray-300 mb-4">
            Once inside the LFS shell, run this command to verify you are using the correct tools:
          </p>
          <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-sm text-green-400">
            lfs:/# gcc -v
          </div>
          <p className="text-gray-400 text-sm mt-4 italic">
            Target should say: x86_64-lfs-linux-gnu
          </p>
        </section>
      </div>
    </main>
  );
}
