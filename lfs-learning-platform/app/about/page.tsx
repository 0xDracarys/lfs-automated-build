"use client";

import Link from "next/link";
import { Heart, Users, Target, Rocket, BookOpen, Code, Zap, Terminal } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background */}
        <DottedSurface className="opacity-20" />

        {/* Hero Section */}
        <section className="pt-12 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              About Linux From Scratch
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A passion project to demystify Linux and empower developers to truly understand the system they work with every day
            </p>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400">Our Story</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Why I Built This</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  Linux From Scratch started as a personal challenge: Could I build a fully functional Linux system from the ground up? What began as curiosity evolved into a deep learning journey that transformed how I understand operating systems.
                </p>
                <p>
                  After successfully compiling <strong className="text-white">Linux Kernel 6.4.12</strong>, configuring networking tools, and creating a bootable system, I realized this knowledge was too valuable to keep to myself.
                </p>
                <p>
                  This platform exists to share that journey with you—breaking down complex concepts into digestible lessons, providing hands-on exercises, and guiding you through building your own Linux system.
                </p>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">What We Aim To Do</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  Our mission is simple: <strong className="text-white">Make Linux accessible</strong>. Too often, the barrier to deep systems knowledge feels insurmountable. We believe anyone with curiosity and dedication can understand how Linux works at its core.
                </p>
                <p>
                  We provide:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Clear, step-by-step tutorials</li>
                  <li>Interactive learning experiences</li>
                  <li>Real-world examples and projects</li>
                  <li>A supportive learning environment</li>
                  <li>Tools to practice safely</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Have Built */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/10 to-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What We Have Built</h2>
            <p className="text-gray-400">A complete learning ecosystem for Linux education</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Code className="h-8 w-8" />,
                title: "Custom Kernel",
                description: "Linux 6.4.12 compiled from source",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "13 Network Tools",
                description: "nc, ping, wget, curl, and more",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: <Terminal className="h-8 w-8" />,
                title: "410+ Commands",
                description: "Comprehensive toolchain ready",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "6 Modules",
                description: "From basics to advanced topics",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-400">What drives everything we do</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-6 w-6" />,
                title: "Open & Free",
                description: "All content is free forever. Knowledge should be accessible to everyone, everywhere.",
                color: "red"
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Community-Driven",
                description: "Built by learners, for learners. We grow together and learn from each other.",
                color: "blue"
              },
              {
                icon: <Rocket className="h-6 w-6" />,
                title: "Hands-On Learning",
                description: "Theory is important, but practice makes perfect. Build real systems, solve real problems.",
                color: "purple"
              }
            ].map((value, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-white/20 transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-full bg-${value.color}-500/10 border border-${value.color}-500/20 mb-6`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Creator */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet The Creator</h2>
            <p className="text-gray-400">The person behind LFS Builder</p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 md:p-12 backdrop-blur-sm">
            {/* Author Profile */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="shrink-0">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold">
                  SB
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-2">Shubham Bhasker</h3>
                <p className="text-xl text-blue-400 mb-2">Linux Systems Developer</p>
                <p className="text-sm text-gray-500 mb-6">Born: July 5, 2001 • India 🇮🇳</p>
                <p className="text-gray-400 mb-4">
                  Passionate about Linux systems, open-source development, and making complex technologies accessible to everyone. This LFS Builder platform represents years of experience in Linux system administration and development.
                </p>
                <p className="text-gray-400 mb-6">
                  With a deep understanding of Linux kernel internals and system programming, I&apos;ve dedicated this project to helping others master the art of building Linux from scratch—breaking down barriers and making advanced concepts approachable for developers at all levels.
                </p>
                
                {/* Contact */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:contact@shubhambhasker.dev"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Me
                  </a>
                  <a
                    href="https://github.com/shubhambhasker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub Profile
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Expertise */}
            <div className="border-t border-white/10 pt-8 mb-8">
              <h4 className="text-2xl font-bold mb-6 text-center">Technical Expertise</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Linux Kernel", color: "blue" },
                  { name: "System Programming", color: "purple" },
                  { name: "DevOps", color: "green" },
                  { name: "React", color: "cyan" },
                  { name: "TypeScript", color: "indigo" },
                  { name: "Supabase", color: "emerald" },
                  { name: "Docker", color: "blue" },
                  { name: "VMware", color: "orange" }
                ].map((skill, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-lg bg-${skill.color}-500/10 border border-${skill.color}-500/20 text-center hover:bg-${skill.color}-500/20 transition-colors`}
                  >
                    <p className="font-semibold text-sm">{skill.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Goals */}
            <div className="border-t border-white/10 pt-8">
              <h4 className="text-2xl font-bold mb-6 text-center">Project Goals</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: <Target className="h-5 w-5" />, text: "Make LFS accessible to beginners" },
                  { icon: <BookOpen className="h-5 w-5" />, text: "Provide hands-on learning experience" },
                  { icon: <Users className="h-5 w-5" />, text: "Build a community of Linux enthusiasts" },
                  { icon: <Rocket className="h-5 w-5" />, text: "Advance open-source education" },
                  { icon: <Code className="h-5 w-5" />, text: "Demystify system-level programming" },
                  { icon: <Zap className="h-5 w-5" />, text: "Create practical learning tools" }
                ].map((goal, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      {goal.icon}
                    </div>
                    <p className="text-gray-300">{goal.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built With Modern Tech</h2>
            <p className="text-gray-400">The tools powering this platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              "Next.js 16", "TypeScript", "Tailwind CSS",
              "Firebase", "Framer Motion", "Lucide Icons"
            ].map((tech, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <p className="font-semibold">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 p-12 text-center backdrop-blur-sm">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of learners building Linux systems from scratch
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/learn"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Start Learning
                </Link>
                <Link
                  href="/docs"
                  className="px-8 py-4 border border-white/20 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Browse Docs
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
              Built with ❤️ for the Linux community
            </p>
            <div className="flex gap-6">
              <Link href="/learn" className="text-sm text-gray-400 hover:text-white transition-colors">
                Learn
              </Link>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                Docs
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
