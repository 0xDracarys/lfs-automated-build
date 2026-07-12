'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, Target, TrendingUp, Award, ExternalLink, Download, CheckCircle, 
  ArrowRight, Terminal, Users, Package, DollarSign, Cloud, Laptop, Globe, 
  RefreshCw, BarChart3, GraduationCap, Sparkles 
} from 'lucide-react';

export default function ResearchPage() {
  return (
    <div className="min-h-screen text-foreground font-sora pt-24 pb-20">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-12 px-4 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-6 backdrop-blur-md">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-primary text-xs uppercase tracking-widest font-semibold">Bachelor's Thesis Research</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight uppercase">
              AUTOMATING LINUX FROM <span className="text-primary">SCRATCH</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 font-light">
              Cloud-Native Infrastructure for Reproducible Linux Education & Automated Build Pipeline
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <Award className="w-4 h-4 text-primary" />
                <span>Vilnius University ISCS Programme</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>LFS 12.0 Automation</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>94% Build Success Rate</span>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: 'Registered Users', value: '150+', icon: <Users className="w-6 h-6 text-primary" /> },
              { label: 'Successful Builds', value: '200+', icon: <CheckCircle className="w-6 h-6 text-primary" /> },
              { label: 'Build Artifacts', value: '1.5 GB', icon: <Package className="w-6 h-6 text-primary" /> },
              { label: 'Cost per Build', value: '$0.47', icon: <DollarSign className="w-6 h-6 text-primary" /> },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-black/60 backdrop-blur-xl border border-white/10 hover:border-primary/50 transition-all duration-300 rounded-xl p-6 text-center group"
              >
                <div className="flex justify-center mb-3">{metric.icon}</div>
                <div className="text-3xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform">{metric.value}</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Research Problem & Solution */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-black/60 backdrop-blur-xl border border-white/10 hover:border-primary/40 transition-all rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-wider">
              <Target className="w-6 h-6 text-primary" />
              The Challenge
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Linux From Scratch (LFS) requires <strong className="text-primary">6-8 hours</strong> of manual terminal commands 
              to compile a complete Linux system from source. This process:
            </p>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Deters students with steep learning curve and time investment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Causes "works on my machine" failures across different environments</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Lacks real-time observability and error recovery mechanisms</span>
              </li>
            </ul>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-black/60 backdrop-blur-xl border border-white/10 hover:border-primary/40 transition-all rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-wider">
              <CheckCircle className="w-6 h-6 text-primary" />
              Our Solution
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              A <strong className="text-primary">cloud-native automation system</strong> combining:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-primary" />
                  Cloud Infrastructure
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li>• Firebase Functions orchestration</li>
                  <li>• Cloud Run Jobs containerized builds</li>
                  <li>• Firestore real-time progress tracking</li>
                  <li>• GCS artifact storage (90-day retention)</li>
                </ul>
              </div>
              <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-primary" />
                  Local Installer
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li>• Native Windows .NET 8.0 application</li>
                  <li>• Automated WSL2 setup & configuration</li>
                  <li>• 5-step wizard with validation</li>
                  <li>• Offline builds for corporate settings</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research Objectives */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center uppercase tracking-wider">Research Objectives & Achievements</h2>
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
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-black/60 backdrop-blur-xl border border-white/10 hover:border-primary/50 transition-all duration-300 rounded-xl p-6 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl font-bold text-primary">#{objective.id}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold">
                    {objective.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-primary transition-colors">{objective.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{objective.description}</p>
                <div className="text-xs text-gray-400 bg-black/60 border border-white/5 rounded-lg p-2.5 font-mono">
                  {objective.metrics}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Contributions */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-3 uppercase tracking-wider">
            <TrendingUp className="w-6 h-6 text-primary" />
            Research Impact
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: '1. Democratizing LFS Access',
                icon: <Globe className="w-8 h-8 text-primary" />,
                description: 'Removed 6-8 hour barrier, making LFS accessible to students in time-constrained academic settings, professionals in bandwidth-limited regions, and learners without local Linux machines.',
                impact: '150+ user adoption validates demand',
              },
              {
                title: '2. Dual-Deployment Architecture',
                icon: <RefreshCw className="w-8 h-8 text-primary" />,
                description: 'Unique contribution demonstrating LFS automation succeeding in both cloud (Firebase + GCP) and local (Windows WSL2) contexts while maintaining reproducibility.',
                impact: 'Transferable to compiler courses & kernel workshops',
              },
              {
                title: '3. Empirical Cost-Performance Optimization',
                icon: <BarChart3 className="w-8 h-8 text-primary" />,
                description: 'Achieved $0.47 per build through aggressive caching, parallel compilation flags (-j4), and optimized Cloud Run container resource allocations.',
                impact: 'Sustainable for educational institution budgets',
              },
              {
                title: '4. Pedagogical Framework Validation',
                icon: <GraduationCap className="w-8 h-8 text-primary" />,
                description: 'Bridged abstract OS theory and practical implementation using interactive visualization, automated validation checkpoints, and structured progression.',
                impact: 'Published in bachelor thesis research',
              },
            ].map((contrib, idx) => (
              <motion.div
                key={idx}
                initial={{ x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-black/60 backdrop-blur-xl border border-white/10 hover:border-primary/50 transition-all duration-300 rounded-xl p-6 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">{contrib.icon}</div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{contrib.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{contrib.description}</p>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-xs text-primary font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span>Impact: {contrib.impact}</span>
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
            className="bg-black/70 backdrop-blur-xl border border-primary/40 rounded-2xl p-12 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 uppercase tracking-tight">START YOUR LFS JOURNEY TODAY</h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-light">
              Experience automated Linux From Scratch with one-click cloud builds or download the native Windows installer
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/build">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-black rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-primary/90 transition-all"
                >
                  Start Cloud Build
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/downloads">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl font-bold uppercase tracking-wider text-xs text-white flex items-center gap-2 hover:border-primary transition-all"
                >
                  <Download className="w-4 h-4 text-primary" />
                  Download Installer
                </motion.button>
              </Link>
            </div>
            <div className="mt-8 flex justify-center gap-8 text-sm text-gray-400">
              <a 
                href="https://github.com/0xDracarys/lfs-automated-build" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on GitHub
              </a>
              <Link href="/docs" className="hover:text-primary transition-colors">
                📚 Read Documentation
              </Link>
              <Link href="/learn" className="hover:text-primary transition-colors">
                🎓 Explore Lessons
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
