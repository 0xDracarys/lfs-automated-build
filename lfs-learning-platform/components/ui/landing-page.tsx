"use client";

import dynamic from "next/dynamic";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Terminal, Download, Cpu, Layers, ChevronRight, Code, Zap,
  Rocket, BookOpen, Cloud, ArrowRight, Sparkles, Shield, Box
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const Penguin3D = dynamic(() => import("@/components/ui/penguin-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  ),
});

/* ──────── data ──────── */

const features = [
  {
    icon: <Layers className="w-6 h-6 text-primary" />,
    title: "Cross-Toolchain",
    description: "Build Binutils, GCC, and Glibc from source",
  },
  {
    icon: <Cpu className="w-6 h-6 text-primary" />,
    title: "Kernel 6.4.12",
    description: "Compile and configure the Linux kernel",
  },
  {
    icon: <Code className="w-6 h-6 text-primary" />,
    title: "100+ Packages",
    description: "Build every component from source code",
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Optimized System",
    description: "Create a minimal, fast Linux system",
  },
];

const stats = [
  { value: "12.0", label: "LFS Version" },
  { value: "100+", label: "Packages" },
  { value: "6.4.12", label: "Kernel" },
  { value: "2-6h", label: "Build Time" },
];

/* ──────── typing animation ──────── */

const terminalLines = [
  { prefix: "$ ", text: "export LFS=/mnt/lfs", delay: 0 },
  { prefix: "$ ", text: "export LFS_TGT=$(uname -m)-lfs-linux-gnu", delay: 600 },
  { prefix: "$ ", text: "cd $LFS/sources", delay: 1200 },
  { prefix: "$ ", text: "tar -xf binutils-2.41.tar.xz", delay: 1800 },
  { prefix: "$ ", text: "cd binutils-2.41 && mkdir build", delay: 2400 },
  { prefix: "$ ", text: "../configure --prefix=/tools \\", delay: 3000 },
  { prefix: "  ", text: "--with-sysroot=$LFS \\", delay: 3200 },
  { prefix: "  ", text: "--target=$LFS_TGT", delay: 3400 },
  { prefix: "$ ", text: "make && make install", delay: 3800 },
  { prefix: "# ", text: "Toolchain ready ✓", delay: 4400, isComment: true },
];

function TypingTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    const timers: NodeJS.Timeout[] = [];
    terminalLines.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="p-6 rounded-2xl bg-nav-button/60 border border-white/[0.08] font-mono text-sm shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.08]">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-muted-foreground text-xs">terminal — bash</span>
      </div>
      <div className="space-y-1.5 text-foreground/90 min-h-[220px]">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={line.isComment ? "text-primary/70 mt-3" : ""}
          >
            <span className="text-primary">{line.prefix}</span>
            {line.text}
          </motion.p>
        ))}
        {visibleLines < terminalLines.length && inView && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}

import InteractiveBlockWall from "@/components/ui/interactive-block-wall";

/* ──────── main component ──────── */

export default function LFSLandingPage() {
  return (
    <div className="relative w-full min-h-screen text-foreground font-sora">
      {/* ──────── Hero Section ──────── */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-hero-bg via-transparent to-transparent z-[1] pointer-events-none" />

        {/* Content — bottom-anchored, full-width on mobile */}
        <div className="relative z-10 pointer-events-none w-full px-5 sm:px-8 md:px-12 pb-10 sm:pb-14 md:pb-16 pt-28 max-w-full lg:max-w-3xl">
          <h1
            className="opacity-0 animate-fade-up text-[clamp(2.2rem,8vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-foreground mb-2 md:mb-4 uppercase"
            style={{ animationDelay: "0.2s" }}
          >
            LINUX FROM <span className="text-primary">SCRATCH</span>
          </h1>

          <p
            className="opacity-0 animate-fade-up text-foreground/80 text-[clamp(1rem,2.5vw,1.75rem)] font-light mb-3 md:mb-6"
            style={{ animationDelay: "0.4s" }}
          >
            Build your own custom Linux system from source code.
          </p>

          <p
            className="opacity-0 animate-fade-up text-muted-foreground text-[clamp(0.8rem,1.4vw,1.1rem)] font-light mb-6 md:mb-8 max-w-2xl"
            style={{ animationDelay: "0.55s" }}
          >
            Master Linux kernel compilation, cross-toolchain architecture, and system configuration. Build Binutils, GCC, and over 100+ packages from scratch.
          </p>

          {/* CTA Buttons — stack on tiny screens */}
          <div
            className="opacity-0 animate-fade-up flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-3 font-bold pointer-events-auto"
            style={{ animationDelay: "0.7s" }}
          >
            <Link
              href="/learn"
              className="bg-primary text-primary-foreground text-center px-6 py-3.5 text-sm rounded-sm uppercase tracking-wider cursor-pointer hover:brightness-110 transition-all active:scale-[0.97]"
            >
              Start Learning
            </Link>
            <Link
              href="/downloads"
              className="bg-white text-background text-center px-6 py-3.5 text-sm rounded-sm uppercase tracking-wider cursor-pointer hover:brightness-90 transition-all active:scale-[0.97]"
            >
              Download LFS 12.0
            </Link>
          </div>

          <p
            className="opacity-0 animate-fade-up text-muted-foreground/60 text-[10px] sm:text-xs font-light mt-5 uppercase tracking-wider"
            style={{ animationDelay: "0.85s" }}
          >
            LFS Version 12.0 • Linux Kernel 6.4.12 • 100+ Packages
          </p>
        </div>
      </section>

      {/* ──────── Stats Ribbon ──────── */}
      <section className="relative z-10 py-8 sm:py-12 px-5 sm:px-8 md:px-12 lg:px-20 border-y border-white/[0.08] bg-nav-button/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-mono">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-primary mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── Features ──────── */}
      <section className="relative py-16 sm:py-24 md:py-28 px-5 sm:px-8 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-primary px-3 py-1 rounded bg-primary/10 border border-primary/20 mb-4 inline-block">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
              Build Everything <span className="text-primary">From Source</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Learn how every component of a Linux system works by compiling it yourself from the ground up
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-5 sm:p-6 rounded-xl bg-nav-button/30 border border-white/[0.08] hover:border-primary/40 hover:bg-nav-button/60 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Build Process (animated terminal) ──────── */}
      <section className="relative py-16 sm:py-24 md:py-28 px-5 sm:px-8 md:px-12 lg:px-20 border-t border-white/[0.06] bg-nav-button/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/20 mb-6">
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Chapters 5-8</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase tracking-tight">
                Cross-Compilation <span className="text-primary">Toolchain</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground font-light mb-8">
                Build a self-contained toolchain isolated from your host system.
                This ensures reproducible builds and teaches you how compilers and linkers work under the hood.
              </p>
              <div className="space-y-4 font-mono text-sm">
                {[
                  { name: "Binutils 2.41", desc: "Assembler and linker" },
                  { name: "GCC 13.2.0", desc: "C/C++ compiler (2 passes)" },
                  { name: "Glibc 2.38", desc: "GNU C Library" },
                  { name: "Libstdc++", desc: "C++ Standard Library" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <TypingTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ──────── Cloud Build CTA ──────── */}
      <section className="relative py-16 sm:py-20 md:py-24 px-5 sm:px-8 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-primary/30 bg-nav-button/40 p-8 md:p-14">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/20 mb-4">
                  <Cloud className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-primary uppercase tracking-widest">Cloud Pipeline</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 uppercase tracking-tight">
                  Build on <span className="text-primary">Google Cloud</span>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground font-light mb-6">
                  Our automated pipeline compiles the entire LFS system on cloud infrastructure
                  with 8 vCPUs and 32 GB RAM. Click build and download your ready system.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/build"
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-sm font-semibold uppercase text-xs tracking-wider hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    Start Cloud Build
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/downloads"
                    className="px-6 py-3 border border-white/10 rounded-sm font-semibold uppercase text-xs tracking-wider hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Latest
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Cpu className="w-5 h-5" />, label: "8 vCPUs", sub: "Cloud Run" },
                  { icon: <Box className="w-5 h-5" />, label: "32 GB RAM", sub: "Per build" },
                  { icon: <Shield className="w-5 h-5" />, label: "Automated", sub: "CI/CD" },
                  { icon: <Zap className="w-5 h-5" />, label: "~30 min", sub: "Build time" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 rounded-xl bg-nav-button/40 border border-white/[0.08]"
                  >
                    <div className="text-primary mb-2">{s.icon}</div>
                    <div className="font-bold text-sm uppercase tracking-wider">{s.label}</div>
                    <div className="text-xs text-muted-foreground font-light">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── CTA ──────── */}
      <section className="relative py-16 sm:py-24 md:py-28 px-5 sm:px-8 md:px-12 lg:px-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="w-10 h-10 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase tracking-tight">
            Ready to Build Your <span className="text-primary">Custom Linux</span>?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-light mb-8 max-w-2xl mx-auto">
            Start with our interactive learning modules or jump straight into the command terminal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/learn"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-sm font-semibold uppercase text-xs tracking-wider hover:brightness-110 transition-all"
            >
              Start Learning
            </Link>
            <Link
              href="/commands"
              className="px-8 py-4 border border-white/20 rounded-sm font-semibold uppercase text-xs tracking-wider hover:bg-white/10 transition-all"
            >
              View All Commands
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 border border-white/20 rounded-sm font-semibold uppercase text-xs tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* ──────── Footer ──────── */}
      <footer className="relative z-20 py-8 sm:py-10 px-5 sm:px-8 border-t border-white/[0.08] bg-hero-bg">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 items-center text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Linux From Scratch
            </h3>
            <p className="text-muted-foreground text-xs font-light mt-1">LFS 12.0 Interactive Learning Platform</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-5 sm:gap-8 text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
            <Link href="/commands" className="hover:text-foreground transition-colors">Commands</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/downloads" className="hover:text-foreground transition-colors">Downloads</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

