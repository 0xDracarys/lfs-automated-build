"use client";

import dynamic from "next/dynamic";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Terminal, Download, Cpu, Layers, ChevronRight, Code, Zap, Rocket, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const Penguin3D = dynamic(() => import('@/components/ui/penguin-3d'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div></div>
});

const features = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Cross-Toolchain",
    description: "Build Binutils, GCC, and Glibc from source",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Kernel 6.4.12",
    description: "Compile and configure the Linux kernel",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "100+ Packages",
    description: "Build every component from source code",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Optimized System",
    description: "Create a minimal, fast Linux system",
    color: "from-orange-500 to-red-500",
  },
];

const stats = [
  { value: "12.0", label: "LFS Version" },
  { value: "100+", label: "Packages" },
  { value: "6.4.12", label: "Kernel" },
  { value: "2-6h", label: "Build Time" },
];

export default function LFSLandingPage() {
  return (
    <div className="relative w-full min-h-screen bg-black text-white">
      {/* Dotted Surface Background */}
      <DottedSurface className="opacity-40" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-20 overflow-visible">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400 tracking-wider uppercase">
                LFS 12.0
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Linux From
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Scratch
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Build your own Linux system from source code. Master kernel compilation, 
              toolchain building, and system configuration.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-16">
              <Link
                href="/learn"
                className="group px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-2"
              >
                Start Learning
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/commands"
                className="px-8 py-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all hover:scale-105"
              >
                View Commands
              </Link>
              <Link
                href="/downloads"
                className="px-8 py-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download ISO
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3D Penguin - Right Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block w-full h-[700px] xl:h-[800px] 2xl:h-[900px]"
          >
            <Penguin3D />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Build Everything From Source
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Learn how every component of a Linux system works by compiling it yourself
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                  feature.color
                )}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Build Process Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <span className="text-sm text-green-400">Chapter 5-8</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Cross-Compilation Toolchain
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Build a self-contained toolchain isolated from your host system. 
                This ensures reproducible builds and teaches you how compilers work.
              </p>
              <div className="space-y-4">
                {[
                  { name: "Binutils 2.41", desc: "Assembler and linker" },
                  { name: "GCC 13.2.0", desc: "C/C++ compiler (2 passes)" },
                  { name: "Glibc 2.38", desc: "GNU C Library" },
                  { name: "Libstdc++", desc: "C++ Standard Library" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="p-6 rounded-2xl bg-gray-900/80 border border-white/10 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-gray-500">terminal</span>
                </div>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-green-400">$</span> export LFS=/mnt/lfs</p>
                  <p><span className="text-green-400">$</span> export LFS_TGT=$(uname -m)-lfs-linux-gnu</p>
                  <p><span className="text-green-400">$</span> cd $LFS/sources</p>
                  <p><span className="text-green-400">$</span> tar -xf binutils-2.41.tar.xz</p>
                  <p><span className="text-green-400">$</span> cd binutils-2.41 && mkdir build</p>
                  <p><span className="text-green-400">$</span> ../configure --prefix=/tools \</p>
                  <p className="pl-4">--with-sysroot=$LFS \</p>
                  <p className="pl-4">--target=$LFS_TGT</p>
                  <p><span className="text-green-400">$</span> make && make install</p>
                  <p className="text-gray-500 mt-4"># Toolchain ready ✓</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 p-12 text-center"
          >
            <div className="relative z-10">
              <Rocket className="w-12 h-12 mx-auto mb-6 text-blue-400" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Build Your Own Linux?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Start with our interactive learning modules or jump straight into the commands
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/learn"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Start Learning
                </Link>
                <Link
                  href="/commands"
                  className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  View All Commands
                </Link>
                <Link
                  href="/docs"
                  className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Documentation
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-12 px-6 border-t border-white/10 bg-black/80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              Sam's LFS
            </h3>
            <p className="text-gray-500 text-sm">Linux From Scratch 12.0 Learning Platform</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/commands" className="hover:text-white transition-colors">Commands</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/downloads" className="hover:text-white transition-colors">Downloads</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
