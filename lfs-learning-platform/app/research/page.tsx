'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, ExternalLink, Download, CheckCircle, ArrowRight } from 'lucide-react';

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-20 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <span className="text-blue-400 text-sm font-semibold">Bachelor's Thesis Research</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Automating Linux From Scratch
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Cloud-Native Infrastructure for Reproducible Linux Education
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Vilnius University ISCS Programme</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>LFS 12.0 Automation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>94% Build Success Rate</span>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: 'Registered Users', value: '150+', icon: '👥' },
              { label: 'Successful Builds', value: '200+', icon: '✅' },
              { label: 'Build Artifacts', value: '1.5 GB', icon: '📦' },
              { label: 'Cost per Build', value: '$0.47', icon: '💰' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className="text-3xl font-bold text-blue-400 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Research Problem */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-red-500" />
              The Challenge
            </h2>
            <div className="bg-white/5 border border-red-500/20 rounded-xl p-8">
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Linux From Scratch (LFS) requires <strong className="text-red-400">6-8 hours</strong> of manual terminal commands 
                to compile a complete Linux system from source. This process:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Deters students with steep learning curve and time investment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Causes "works on my machine" failures across different environments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Lacks real-time observability and error recovery mechanisms</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              Our Solution
            </h2>
            <div className="bg-white/5 border border-green-500/20 rounded-xl p-8">
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                A <strong className="text-green-400">cloud-native automation system</strong> combining:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">☁️ Cloud Infrastructure</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Firebase Functions for serverless orchestration</li>
                    <li>• Cloud Run Jobs for containerized builds</li>
                    <li>• Firestore for real-time progress tracking</li>
                    <li>• GCS for artifact storage with 90-day lifecycle</li>
                  </ul>
                </div>
                <div className="bg-black/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">💻 Local Installer</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Native Windows .NET 8.0 application</li>
                    <li>• Automated WSL2 setup and configuration</li>
                    <li>• 5-step wizard with prerequisite validation</li>
                    <li>• Offline builds for corporate/academic settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research Objectives */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Research Objectives & Achievements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: 'Automate LFS Toolchain',
                status: '✅ Fully Achieved',
                description: 'Automated all 18 core packages from Chapter 5 with zero manual intervention',
                metrics: '94% success rate, 188/200 builds completed',
              },
              {
                id: 2,
                title: 'Interactive Learning Platform',
                status: '✅ Fully Achieved',
                description: '15 comprehensive lessons with real-time build tracking and 3D visualizations',
                metrics: '87% test coverage, deployed at sams-lfs.netlify.app',
              },
              {
                id: 3,
                title: 'Firebase Integration',
                status: '✅ Fully Achieved',
                description: 'Auth, Firestore, Cloud Functions, and Storage with 150+ users',
                metrics: '<500ms p95 latency, 99.8% function success rate',
              },
              {
                id: 4,
                title: 'Cloud Build Execution',
                status: '✅ Fully Achieved',
                description: 'Docker containers on Cloud Run with Pub/Sub messaging',
                metrics: '$0.47/build, <2% infrastructure failure rate',
              },
              {
                id: 5,
                title: 'Comprehensive Documentation',
                status: '✅ Fully Achieved',
                description: 'README, API docs, 15 test suites, and 17,000+ word thesis',
                metrics: '45 tests, 87% code coverage, validated by 3 testers',
              },
              {
                id: 6,
                title: 'Native Windows Installer',
                status: '🆕 Bonus Feature',
                description: 'Professional installer with 5-step wizard and WSL2 automation',
                metrics: '7 prerequisite checks, 193 KB download size',
              },
            ].map((objective, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl font-bold text-blue-400">#{objective.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    objective.status.includes('Achieved') 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {objective.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{objective.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{objective.description}</p>
                <div className="text-xs text-gray-500 bg-black/30 rounded p-2">
                  {objective.metrics}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Contributions */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-500" />
            Research Impact & Contributions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: '1. Democratizing LFS Access',
                icon: '🌍',
                description: 'Removed 6-8 hour barrier, making LFS accessible to students in time-constrained academic settings, professionals in bandwidth-limited regions, and learners without local Linux machines.',
                impact: '150+ user adoption validates market demand',
              },
              {
                title: '2. Dual-Deployment Architecture',
                icon: '🔄',
                description: 'Unique contribution demonstrating LFS automation succeeding in both cloud (Firebase + GCP) and local (Windows WSL2) contexts while maintaining reproducibility.',
                impact: 'Transferable to compiler courses, kernel workshops',
              },
              {
                title: '3. Observable Automation',
                icon: '👁️',
                description: 'Unlike previous tools (ALFS, jhalfs) that execute silently, this system exposes real-time logs, progress indicators, and error traces through Firestore streams.',
                impact: 'Bridges automation with education',
              },
              {
                title: '4. Open-Source Template',
                icon: '📖',
                description: 'MIT License release with 1,200+ lines of documentation provides reusable patterns for Firebase + GCP integration for educational infrastructure.',
                impact: 'Benefits future cloud-based automation projects',
              },
            ].map((contribution, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl p-6"
              >
                <div className="text-4xl mb-3">{contribution.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-yellow-400">{contribution.title}</h3>
                <p className="text-gray-300 mb-4">{contribution.description}</p>
                <div className="bg-black/40 rounded-lg p-3 border-l-4 border-yellow-500">
                  <p className="text-sm text-yellow-400 font-semibold">{contribution.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-12"
          >
            <h2 className="text-4xl font-bold mb-6">Start Your LFS Journey Today</h2>
            <p className="text-xl text-gray-300 mb-8">
              Experience automated Linux From Scratch with one-click cloud builds or download the native Windows installer
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/build">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Start Cloud Build
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/downloads">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/20 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download Installer
                </motion.button>
              </Link>
            </div>
            <div className="mt-8 flex justify-center gap-8 text-sm text-gray-400">
              <a 
                href="https://github.com/0xDracarys/lfs-automated-build" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on GitHub
              </a>
              <Link href="/docs" className="hover:text-blue-400 transition-colors">
                📚 Read Documentation
              </Link>
              <Link href="/learn" className="hover:text-blue-400 transition-colors">
                🎓 Explore Lessons
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
