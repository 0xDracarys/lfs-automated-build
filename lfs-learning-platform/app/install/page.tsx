'use client';

/**
 * LFS Installation Wizard Page
 * 
 * Interactive step-by-step guide for installing Linux From Scratch.
 * Features:
 * - 12 stages covering the complete LFS build process
 * - Platform detection (Windows/Linux)
 * - Progress tracking with localStorage persistence
 * - Copy-paste commands
 * - Script generation
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { ProgressSidebar, ProgressIndicator } from '@/components/wizard/ProgressSidebar';
import { StageContent } from '@/components/wizard/StageContent';
import { STAGES, getStageById } from '@/lib/data/wizard-stages';
import { 
  Platform, 
  LinuxDistro, 
  WizardProgress, 
  DEFAULT_PROGRESS,
  TOTAL_STAGES,
} from '@/lib/types/wizard';
import { detectPlatform } from '@/lib/utils/platformDetection';
import { saveProgress, loadProgress, clearProgress } from '@/lib/utils/wizardStorage';

// Stage prerequisites
const STAGE_PREREQUISITES: Record<number, number[]> = {
  1: [], 2: [1], 3: [2], 4: [3], 5: [4], 6: [5],
  7: [6], 8: [7], 9: [8], 10: [9], 11: [10], 12: [11],
};

// Initialize progress from localStorage or create new
function getInitialProgress(): WizardProgress {
  // Only run on client side
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }
  
  const stored = loadProgress();
  if (stored) {
    return stored;
  }
  
  const detectedPlatform = detectPlatform();
  return {
    ...DEFAULT_PROGRESS,
    platform: detectedPlatform,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

export default function InstallWizardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<WizardProgress>(DEFAULT_PROGRESS);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Derived state
  const completedStages = new Set(progress.completedStages);
  const currentStage = getStageById(progress.currentStage);

  // Load progress on mount (client-side only)
  useEffect(() => {
    const initialProgress = getInitialProgress();
    setProgress(initialProgress);
    setIsLoading(false);
  }, []);

  // Save progress when it changes
  useEffect(() => {
    if (!isLoading) {
      saveProgress(progress);
    }
  }, [progress, isLoading]);

  // Check if a stage is accessible
  const isStageAccessible = (stageId: number): boolean => {
    const prerequisites = STAGE_PREREQUISITES[stageId] || [];
    return prerequisites.every(prereq => completedStages.has(prereq));
  };

  // Navigate to a stage
  const goToStage = (stageId: number) => {
    if (isStageAccessible(stageId)) {
      setProgress(prev => ({
        ...prev,
        currentStage: stageId,
        lastUpdated: new Date().toISOString(),
      }));
      setShowSidebar(false);
    }
  };

  // Mark current stage as complete
  const markStageComplete = () => {
    setProgress(prev => {
      if (prev.completedStages.includes(prev.currentStage)) {
        return prev;
      }
      return {
        ...prev,
        completedStages: [...prev.completedStages, prev.currentStage].sort((a, b) => a - b),
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  // Go to next stage
  const goToNextStage = () => {
    const nextStageId = progress.currentStage + 1;
    if (nextStageId <= TOTAL_STAGES && isStageAccessible(nextStageId)) {
      goToStage(nextStageId);
    }
  };

  // Reset all progress
  const resetAllProgress = () => {
    clearProgress();
    const detectedPlatform = detectPlatform();
    setProgress({
      ...DEFAULT_PROGRESS,
      platform: detectedPlatform,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    setShowResetConfirm(false);
  };

  // Set platform
  const setPlatform = (platform: Platform) => {
    setProgress(prev => ({
      ...prev,
      platform,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Set distro
  const setDistro = (distro: LinuxDistro) => {
    setProgress(prev => ({
      ...prev,
      distro,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Generate and download script
  const downloadScript = () => {
    if (!currentStage) return;

    const commands = currentStage.commands
      .filter(cmd => cmd.platforms.includes(progress.platform))
      .filter(cmd => !cmd.distros || !progress.distro || cmd.distros.includes(progress.distro))
      .map(cmd => `# ${cmd.description}\n${cmd.command}`)
      .join('\n\n');

    const script = `#!/bin/bash
# LFS Installation Wizard - Stage ${currentStage.id}: ${currentStage.title}
# Generated on ${new Date().toISOString()}
# Platform: ${progress.platform}
${progress.distro ? `# Distro: ${progress.distro}` : ''}

set -e  # Exit on error

${commands}

echo "Stage ${currentStage.id} complete!"
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lfs-stage-${currentStage.id}.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading wizard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <DottedSurface className="opacity-20" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/build" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-bold text-lg">LFS Installation Wizard</h1>
                <p className="text-sm text-gray-400">Stage {progress.currentStage} of {TOTAL_STAGES}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress indicator (desktop) */}
              <div className="hidden md:block">
                <ProgressIndicator
                  completedCount={completedStages.size}
                  totalStages={TOTAL_STAGES}
                  currentStage={progress.currentStage}
                />
              </div>

              {/* Platform selector */}
              <select
                value={progress.platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                <option value="windows">Windows (WSL)</option>
                <option value="linux">Linux</option>
                <option value="macos">macOS</option>
              </select>

              {/* Distro selector (Linux only) */}
              {progress.platform === 'linux' && (
                <select
                  value={progress.distro || ''}
                  onChange={(e) => setDistro(e.target.value as LinuxDistro)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select Distro</option>
                  <option value="ubuntu">Ubuntu</option>
                  <option value="debian">Debian</option>
                  <option value="fedora">Fedora</option>
                  <option value="arch">Arch</option>
                  <option value="other">Other</option>
                </select>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-80 shrink-0">
            <div className="sticky top-24">
              <ProgressSidebar
                stages={STAGES}
                currentStage={progress.currentStage}
                completedStages={completedStages}
                onStageClick={goToStage}
                isStageAccessible={isStageAccessible}
              />

              {/* Reset button */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Progress
              </button>
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {showSidebar && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/80" onClick={() => setShowSidebar(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-black border-r border-white/10 p-4 overflow-y-auto">
                <ProgressSidebar
                  stages={STAGES}
                  currentStage={progress.currentStage}
                  completedStages={completedStages}
                  onStageClick={goToStage}
                  isStageAccessible={isStageAccessible}
                />
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 max-w-3xl">
            {currentStage ? (
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StageContent
                  stage={currentStage}
                  platform={progress.platform}
                  distro={progress.distro}
                  isComplete={completedStages.has(currentStage.id)}
                  onMarkComplete={markStageComplete}
                  onNextStage={goToNextStage}
                  hasNextStage={currentStage.id < TOTAL_STAGES}
                  onDownloadScript={downloadScript}
                />
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Stage not found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reset Progress?</h3>
            <p className="text-gray-400 mb-6">
              This will clear all your progress and start from the beginning. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetAllProgress}
                className="flex-1 px-4 py-2 bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
