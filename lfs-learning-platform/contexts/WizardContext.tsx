'use client';

/**
 * Wizard Context Provider
 * 
 * Manages the state for the LFS Installation Wizard including:
 * - Current stage navigation
 * - Completed stages tracking
 * - Platform and distro selection
 * - Progress persistence to localStorage
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Platform,
  LinuxDistro,
  WizardProgress,
  WizardContextType,
  StageStatus,
  DEFAULT_PROGRESS,
  TOTAL_STAGES,
} from '@/lib/types/wizard';
import { loadProgress, saveProgress, clearProgress } from '@/lib/utils/wizardStorage';
import { detectPlatform } from '@/lib/utils/platformDetection';

// Stage prerequisites map - which stages must be complete before each stage
const STAGE_PREREQUISITES: Record<number, number[]> = {
  1: [],           // Platform Setup - no prerequisites
  2: [1],          // Mount Point - needs Platform Setup
  3: [2],          // Source Downloads - needs Mount Point
  4: [3],          // LFS User - needs Source Downloads
  5: [4],          // Cross-Toolchain - needs LFS User
  6: [5],          // Temporary Tools - needs Cross-Toolchain
  7: [6],          // Chroot Setup - needs Temporary Tools
  8: [7],          // Basic System Build - needs Chroot Setup
  9: [8],          // System Configuration - needs Basic System Build
  10: [9],         // Kernel Compilation - needs System Configuration
  11: [10],        // GRUB Bootloader - needs Kernel Compilation
  12: [11],        // Final Steps - needs GRUB Bootloader
};

// Create the context with undefined default
const WizardContext = createContext<WizardContextType | undefined>(undefined);

/**
 * Hook to access the wizard context
 * @throws Error if used outside of WizardProvider
 */
export function useWizard(): WizardContextType {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

interface WizardProviderProps {
  children: React.ReactNode;
}

/**
 * Wizard Provider Component
 * 
 * Wraps the wizard pages and provides state management for:
 * - Stage navigation and completion
 * - Platform/distro selection
 * - Progress persistence
 */
export function WizardProvider({ children }: WizardProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<WizardProgress>(DEFAULT_PROGRESS);
  
  // Derived state
  const completedStages = useMemo(
    () => new Set(progress.completedStages),
    [progress.completedStages]
  );

  // Load progress from localStorage on mount
  useEffect(() => {
    const stored = loadProgress();
    if (stored) {
      setProgress(stored);
    } else {
      // Detect platform for new users
      const detectedPlatform = detectPlatform();
      setProgress(prev => ({
        ...prev,
        platform: detectedPlatform,
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }));
    }
    setIsLoading(false);
  }, []);

  // Save progress whenever it changes (after initial load)
  useEffect(() => {
    if (!isLoading) {
      saveProgress(progress);
    }
  }, [progress, isLoading]);

  /**
   * Check if a stage is accessible (all prerequisites complete)
   */
  const isStageAccessible = useCallback((stageId: number): boolean => {
    const prerequisites = STAGE_PREREQUISITES[stageId] || [];
    return prerequisites.every(prereq => completedStages.has(prereq));
  }, [completedStages]);

  /**
   * Get the status of a stage
   */
  const getStageStatus = useCallback((stageId: number): StageStatus => {
    if (completedStages.has(stageId)) {
      return 'complete';
    }
    if (progress.currentStage === stageId) {
      return 'in-progress';
    }
    if (isStageAccessible(stageId)) {
      return 'available';
    }
    return 'locked';
  }, [completedStages, progress.currentStage, isStageAccessible]);

  /**
   * Navigate to a specific stage
   */
  const setCurrentStage = useCallback((stageId: number) => {
    if (stageId < 1 || stageId > TOTAL_STAGES) {
      console.warn(`Invalid stage ID: ${stageId}`);
      return;
    }
    if (!isStageAccessible(stageId)) {
      console.warn(`Stage ${stageId} is not accessible yet`);
      return;
    }
    setProgress(prev => ({
      ...prev,
      currentStage: stageId,
      lastUpdated: new Date().toISOString(),
    }));
  }, [isStageAccessible]);

  /**
   * Mark a stage as complete
   */
  const markStageComplete = useCallback((stageId: number) => {
    if (stageId < 1 || stageId > TOTAL_STAGES) {
      console.warn(`Invalid stage ID: ${stageId}`);
      return;
    }
    setProgress(prev => {
      if (prev.completedStages.includes(stageId)) {
        return prev; // Already complete
      }
      const newCompleted = [...prev.completedStages, stageId].sort((a, b) => a - b);
      return {
        ...prev,
        completedStages: newCompleted,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  /**
   * Reset a stage and all stages that depend on it
   */
  const resetStage = useCallback((stageId: number) => {
    if (stageId < 1 || stageId > TOTAL_STAGES) {
      console.warn(`Invalid stage ID: ${stageId}`);
      return;
    }
    
    // Find all stages that depend on this stage (directly or indirectly)
    const stagesToReset = new Set<number>([stageId]);
    
    // Iterate through all stages and find dependents
    for (let i = stageId + 1; i <= TOTAL_STAGES; i++) {
      const prereqs = STAGE_PREREQUISITES[i] || [];
      // If any prerequisite is being reset, this stage must also be reset
      if (prereqs.some(prereq => stagesToReset.has(prereq))) {
        stagesToReset.add(i);
      }
    }
    
    setProgress(prev => {
      const newCompleted = prev.completedStages.filter(s => !stagesToReset.has(s));
      // If current stage is being reset, go back to the reset stage
      const newCurrentStage = stagesToReset.has(prev.currentStage) 
        ? stageId 
        : prev.currentStage;
      
      return {
        ...prev,
        completedStages: newCompleted,
        currentStage: newCurrentStage,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  /**
   * Reset all progress
   */
  const resetAllProgress = useCallback(() => {
    clearProgress();
    const detectedPlatform = detectPlatform();
    setProgress({
      ...DEFAULT_PROGRESS,
      platform: detectedPlatform,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  /**
   * Set the platform
   */
  const setPlatform = useCallback((platform: Platform) => {
    setProgress(prev => ({
      ...prev,
      platform,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  /**
   * Set the Linux distribution
   */
  const setDistro = useCallback((distro: LinuxDistro) => {
    setProgress(prev => ({
      ...prev,
      distro,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<WizardContextType>(() => ({
    currentStage: progress.currentStage,
    completedStages,
    platform: progress.platform,
    distro: progress.distro,
    progress,
    isLoading,
    setCurrentStage,
    markStageComplete,
    resetStage,
    resetAllProgress,
    setPlatform,
    setDistro,
    isStageAccessible,
    getStageStatus,
  }), [
    progress,
    completedStages,
    isLoading,
    setCurrentStage,
    markStageComplete,
    resetStage,
    resetAllProgress,
    setPlatform,
    setDistro,
    isStageAccessible,
    getStageStatus,
  ]);

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Export the stage prerequisites for testing
 */
export { STAGE_PREREQUISITES };
