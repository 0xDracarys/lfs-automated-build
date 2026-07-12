'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronDown,
  Zap,
  Terminal,
  Code2,
  Copy,
  Check,
  Play,
  Cpu,
  Layers,
  CheckCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Module, UserProgress } from '@/lib/types/learning';

interface EnhancedModuleListProps {
  modules: Module[];
  userProgress?: UserProgress[];
}

export default function EnhancedModuleList({
  modules,
  userProgress = [],
}: EnhancedModuleListProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(modules[0]?.id || null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.completionPercentage || 0;
  };

  const handleCopyCommand = (e: React.MouseEvent, cmd: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredModules = modules.filter(m => {
    if (selectedDifficulty === 'ALL') return true;
    return m.difficulty.toUpperCase() === selectedDifficulty;
  });

  // Sample quick commands mapped to typical LFS chapters for rich interactive preview
  const getSampleCommand = (lessonIndex: number, moduleId: string) => {
    const cmds = [
      'export LFS=/mnt/lfs && mkdir -pv $LFS/sources',
      'tar -xf gcc-13.2.0.tar.xz && cd gcc-13.2.0',
      '../configure --prefix=$LFS/tools --with-glibc-version=2.38',
      'make -j$(nproc) && make install',
      'chroot "$LFS" /usr/bin/env -i HOME=/root TERM="$TERM" /bin/bash',
      'make mrproper && make defconfig && make -j$(nproc) bzImage'
    ];
    return cmds[lessonIndex % cmds.length];
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-sora text-foreground">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-4 backdrop-blur-md">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs uppercase tracking-widest font-semibold">
            Interactive LFS Curriculum
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight mb-4">
          LINUX LEARNING <span className="text-primary">PATHWAY</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light">
          Master Linux From Scratch with interactive command execution, live syntax previews, kernel compilation deep dives, and real-time build verification.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-xl border border-white/10 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Total Modules</p>
              <p className="text-3xl font-bold text-primary mt-1">{modules.length}</p>
            </div>
            <Layers className="w-8 h-8 text-primary opacity-40" />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-xl border border-white/10 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Interactive Lessons</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {modules.reduce((sum, m) => sum + m.lessons.length, 0)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-primary opacity-40" />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-xl border border-white/10 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Quick Facts & FAQs</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {modules.reduce(
                  (sum, m) =>
                    sum +
                    m.lessons.reduce(
                      (lsum, l) =>
                        lsum +
                        l.faqs.length +
                        l.interestingFacts.length +
                        l.funFacts.length,
                      0
                    ),
                  0
                )}
              </p>
            </div>
            <Lightbulb className="w-8 h-8 text-primary opacity-40" />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-xl border border-white/10 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Knowledge Quizzes</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {modules.reduce(
                  (sum, m) =>
                    sum + m.lessons.reduce((qsum, l) => qsum + l.quiz.length, 0),
                  0
                )}
              </p>
            </div>
            <Award className="w-8 h-8 text-primary opacity-40" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
          <button
            key={level}
            onClick={() => setSelectedDifficulty(level)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              selectedDifficulty === level
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-black/60 border border-white/10 text-gray-300 hover:border-primary/50'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {filteredModules.map((module, idx) => {
          const progress = getModuleProgress(module.id);
          const isCompleted = progress === 100;
          const isExpanded = expandedModule === module.id;

          return (
            <div
              key={module.id}
              className="bg-black/65 backdrop-blur-xl border border-white/10 hover:border-primary/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Module Header Button */}
              <button
                onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                className="w-full text-left p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                        {module.title}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary">
                        {module.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-black">
                          <CheckCircle className="w-3.5 h-3.5" />
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                      {module.description}
                    </p>

                    {/* Lesson Badges Summary */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <strong className="text-white">{module.lessons.length}</strong> Lessons
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <strong className="text-white">
                          {module.lessons.reduce((sum, l) => sum + l.faqs.length, 0)}
                        </strong> FAQs
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-primary" />
                        Interactive Commands
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="w-24 sm:w-32">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="text-primary font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Interactive Lessons Delivery Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 bg-black/40 px-6 sm:px-8 py-6"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-primary flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Interactive Lesson Curriculum & Command Previews
                      </h4>
                    </div>

                    <div className="grid gap-4">
                      {module.lessons.map((lesson, lIdx) => {
                        const sampleCmd = getSampleCommand(lIdx, module.id);
                        return (
                          <div
                            key={lesson.id}
                            className="bg-black/60 border border-white/10 rounded-xl p-5 hover:border-primary/50 transition-all group"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Left: Lesson Info */}
                              <div className="flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">
                                  {lIdx + 1}
                                </div>
                                <div>
                                  <Link
                                    href={`/learn/${module.id}/${lesson.id}`}
                                    className="text-white font-bold text-base hover:text-primary transition-colors flex items-center gap-2"
                                  >
                                    <span>{lesson.title}</span>
                                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </Link>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Estimated time: <strong className="text-gray-200">{lesson.duration} mins</strong> • 
                                    Contains interactive quiz & live terminal walkthrough
                                  </p>
                                </div>
                              </div>

                              {/* Middle: Interactive Terminal Command Box */}
                              <div className="flex-1 max-w-lg bg-black/80 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-3 font-mono text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <span className="text-primary font-bold shrink-0">$</span>
                                  <span className="text-gray-300 truncate">{sampleCmd}</span>
                                </div>
                                <button
                                  onClick={(e) => handleCopyCommand(e, sampleCmd)}
                                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors flex items-center gap-1.5 shrink-0"
                                  title="Copy command"
                                >
                                  {copiedCmd === sampleCmd ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-primary text-[10px]">COPIED</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span className="text-[10px]">COPY</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Right: Launch Button */}
                              <Link
                                href={`/learn/${module.id}/${lesson.id}`}
                                className="px-5 py-2.5 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary text-primary hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 self-start lg:self-center"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Start Lesson</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
