"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Code, Wrench, Network, HardDrive, Zap, ChevronRight, FileText, Terminal } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const docCategories = [
    {
      title: "Getting Started",
      icon: <Zap className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
      docs: [
        { title: "Introduction to LFS", description: "What is Linux From Scratch and why build it?", slug: "introduction" },
        { title: "System Requirements", description: "Hardware and software prerequisites", slug: "requirements" },
        { title: "Preparation", description: "Setting up your build environment", slug: "preparation" },
        { title: "Quick Start Guide", description: "Build your first LFS system in 5 steps", slug: "quickstart" },
        { title: "📖 How to Use Downloads", description: "Beginner-friendly guide for using LFS ISO files", slug: "usage" }
      ]
    },
    {
      title: "Kernel Development",
      icon: <Code className="h-5 w-5" />,
      gradient: "from-purple-500 to-pink-500",
      docs: [
        { title: "Kernel 6.4.12 Overview", description: "Features and improvements in this release", slug: "kernel-overview" },
        { title: "Downloading Source", description: "Where and how to get kernel source code", slug: "kernel-download" },
        { title: "Configuration Guide", description: "Using menuconfig to customize your kernel", slug: "kernel-config" },
        { title: "Compilation Process", description: "Building the kernel step by step", slug: "kernel-compile" },
        { title: "Kernel Modules", description: "Understanding and managing kernel modules", slug: "kernel-modules" },
        { title: "Troubleshooting", description: "Common kernel build issues and solutions", slug: "kernel-troubleshooting" }
      ]
    },
    {
      title: "Linux Commands",
      icon: <Terminal className="h-5 w-5" />,
      gradient: "from-green-500 to-emerald-500",
      docs: [
        { title: "Essential Commands", description: "The 50 commands you must know", slug: "essential-commands" },
        { title: "File Operations", description: "Working with files and directories", slug: "file-ops" },
        { title: "Text Processing", description: "grep, sed, awk, and more", slug: "text-processing" },
        { title: "Process Management", description: "Managing running processes", slug: "process-mgmt" },
        { title: "User & Permissions", description: "chmod, chown, user management", slug: "permissions" },
        { title: "Package Management", description: "Installing and managing software", slug: "packages" }
      ]
    },
    {
      title: "Networking",
      icon: <Network className="h-5 w-5" />,
      gradient: "from-orange-500 to-red-500",
      docs: [
        { title: "Network Configuration", description: "Setting up network interfaces", slug: "network-config" },
        { title: "Netcat (nc) Guide", description: "Complete guide to the Swiss Army knife", slug: "netcat" },
        { title: "DNS Tools", description: "dig, nslookup, host commands", slug: "dns-tools" },
        { title: "Network Diagnostics", description: "ping, traceroute, netstat, ss", slug: "network-diagnostics" },
        { title: "File Transfer", description: "wget, curl, scp, rsync", slug: "file-transfer" },
        { title: "Firewall Setup", description: "iptables and firewall configuration", slug: "firewall" }
      ]
    },
    {
      title: "System Development",
      icon: <Wrench className="h-5 w-5" />,
      gradient: "from-indigo-500 to-purple-500",
      docs: [
        { title: "Git Version Control", description: "Essential Git commands and workflows", slug: "git" },
        { title: "Vim Masterclass", description: "From basics to advanced Vim usage", slug: "vim" },
        { title: "Bash Scripting", description: "Automating tasks with shell scripts", slug: "bash-scripting" },
        { title: "Compilation Tools", description: "gcc, make, and build systems", slug: "compilation" },
        { title: "Debugging", description: "gdb, strace, and debugging techniques", slug: "debugging" }
      ]
    },
    {
      title: "File Systems",
      icon: <HardDrive className="h-5 w-5" />,
      gradient: "from-yellow-500 to-orange-500",
      docs: [
        { title: "File System Hierarchy", description: "Understanding Linux directory structure", slug: "fs-hierarchy" },
        { title: "Disk Partitioning", description: "fdisk, parted, and partition management", slug: "partitioning" },
        { title: "File System Types", description: "ext4, xfs, btrfs comparison", slug: "fs-types" },
        { title: "Mounting & Unmounting", description: "mount, umount, and fstab", slug: "mounting" },
        { title: "Disk Usage", description: "df, du, and storage management", slug: "disk-usage" }
      ]
    }
  ];

  const filteredCategories = docCategories.map(category => ({
    ...category,
    docs: category.docs.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.docs.length > 0);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
        <DottedSurface className="opacity-20" />

        {/* Hero Section */}
        <section className="pt-12 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">Documentation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              LFS Documentation
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Everything you need to know about building Linux from scratch
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="py-12 px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-gray-400">Try searching with different keywords</p>
            </div>
          )}

          <div className="space-y-16">
            {(searchQuery ? filteredCategories : docCategories).map((category, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient}`}>
                    {category.icon}
                  </div>
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.docs.map((doc, j) => (
                    <Link
                      key={j}
                      href={`/docs/${doc.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                          {doc.title}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <span>Read more</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/10 to-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Resources</h2>
            <p className="text-gray-400">Most viewed documentation pages</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Quick Start", icon: <Zap className="h-6 w-6" />, color: "blue" },
              { title: "Kernel Build", icon: <Code className="h-6 w-6" />, color: "purple" },
              { title: "Commands", icon: <Terminal className="h-6 w-6" />, color: "green" },
              { title: "Networking", icon: <Network className="h-6 w-6" />, color: "orange" }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className={`inline-flex p-4 rounded-full bg-${item.color}-500/10 border border-${item.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 p-12 text-center backdrop-blur-sm">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to Build?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Start your Linux From Scratch journey with our interactive tutorials
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/learn"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Start Learning
                </Link>
                <Link
                  href="/terminal"
                  className="px-8 py-4 border border-white/20 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Try Terminal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <span className="font-bold">Sam's LFS</span>
            </div>
            <p className="text-sm text-gray-400">
              Open source documentation for the community
            </p>
            <div className="flex gap-6">
              <Link href="/learn" className="text-sm text-gray-400 hover:text-white transition-colors">
                Learn
              </Link>
              <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/commands" className="text-sm text-gray-400 hover:text-white transition-colors">
                Commands
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
