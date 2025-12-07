/**
 * Property-Based Tests for Wizard Storage
 * 
 * Feature: lfs-installer-wizard, Property 2: Progress Persistence Round-Trip
 * Validates: Requirements 15.1, 15.2
 * 
 * For any valid wizard progress state, saving to localStorage and then
 * loading SHALL produce an equivalent progress state.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  saveProgress,
  loadProgress,
  clearProgress,
  hasStoredProgress,
  exportProgress,
  importProgress,
} from '@/lib/utils/wizardStorage';
import { WizardProgress, Platform, LinuxDistro, WIZARD_STORAGE_KEY } from '@/lib/types/wizard';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

// Arbitraries for generating test data
const platformArb = fc.constantFrom<Platform>('windows', 'linux', 'macos');
const distroArb = fc.constantFrom<LinuxDistro | null>('ubuntu', 'debian', 'fedora', 'arch', 'other', null);
const stageIdArb = fc.integer({ min: 1, max: 12 });
const completedStagesArb = fc.array(stageIdArb, { minLength: 0, maxLength: 12 })
  .map(stages => [...new Set(stages)].sort((a, b) => a - b)); // Unique and sorted

// Generate valid ISO date strings
const isoDateArb = fc.integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31 in ms
  .map(ms => new Date(ms).toISOString());

const wizardProgressArb: fc.Arbitrary<WizardProgress> = fc.record({
  completedStages: completedStagesArb,
  currentStage: stageIdArb,
  platform: platformArb,
  distro: distroArb,
  startedAt: isoDateArb,
  lastUpdated: isoDateArb,
});

describe('Wizard Storage - Property Tests', () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  /**
   * Property 2: Progress Persistence Round-Trip
   * For any valid wizard progress state, saving and then loading
   * SHALL produce an equivalent progress state.
   */
  it('should round-trip any valid progress through save/load', () => {
    fc.assert(
      fc.property(wizardProgressArb, (progress) => {
        // Save the progress
        const saveResult = saveProgress(progress);
        expect(saveResult).toBe(true);

        // Load it back
        const loaded = loadProgress();
        expect(loaded).not.toBeNull();

        // Verify all fields match
        expect(loaded!.completedStages).toEqual(progress.completedStages);
        expect(loaded!.currentStage).toBe(progress.currentStage);
        expect(loaded!.platform).toBe(progress.platform);
        expect(loaded!.distro).toBe(progress.distro);
        expect(loaded!.startedAt).toBe(progress.startedAt);
        expect(loaded!.lastUpdated).toBe(progress.lastUpdated);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple saves should preserve latest state
   */
  it('should preserve the latest state after multiple saves', () => {
    fc.assert(
      fc.property(
        fc.array(wizardProgressArb, { minLength: 1, maxLength: 5 }),
        (progressList) => {
          // Save each progress in sequence
          for (const progress of progressList) {
            saveProgress(progress);
          }

          // Load should return the last saved progress
          const loaded = loadProgress();
          const lastProgress = progressList[progressList.length - 1];

          expect(loaded).not.toBeNull();
          expect(loaded!.completedStages).toEqual(lastProgress.completedStages);
          expect(loaded!.currentStage).toBe(lastProgress.currentStage);
          expect(loaded!.platform).toBe(lastProgress.platform);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Clear should remove all progress
   */
  it('should return null after clearing progress', () => {
    fc.assert(
      fc.property(wizardProgressArb, (progress) => {
        // Save progress
        saveProgress(progress);
        expect(loadProgress()).not.toBeNull();

        // Clear progress
        clearProgress();

        // Load should return null
        expect(loadProgress()).toBeNull();
        expect(hasStoredProgress()).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: hasStoredProgress should be consistent with loadProgress
   */
  it('should have consistent hasStoredProgress and loadProgress', () => {
    fc.assert(
      fc.property(wizardProgressArb, fc.boolean(), (progress, shouldSave) => {
        clearProgress();

        if (shouldSave) {
          saveProgress(progress);
        }

        const hasProgress = hasStoredProgress();
        const loaded = loadProgress();

        // hasStoredProgress should match whether loadProgress returns data
        expect(hasProgress).toBe(loaded !== null);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Export/Import round-trip
   */
  it('should round-trip through export/import', () => {
    fc.assert(
      fc.property(wizardProgressArb, (progress) => {
        // Save original progress
        saveProgress(progress);

        // Export to JSON
        const exported = exportProgress();
        expect(exported).not.toBeNull();

        // Clear and import
        clearProgress();
        const importResult = importProgress(exported!);
        expect(importResult).toBe(true);

        // Verify imported matches original
        const loaded = loadProgress();
        expect(loaded).not.toBeNull();
        expect(loaded!.completedStages).toEqual(progress.completedStages);
        expect(loaded!.currentStage).toBe(progress.currentStage);
        expect(loaded!.platform).toBe(progress.platform);
      }),
      { numRuns: 50 }
    );
  });
});

describe('Wizard Storage - Edge Cases', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return null when no progress is stored', () => {
    expect(loadProgress()).toBeNull();
  });

  it('should handle corrupted JSON gracefully', () => {
    localStorageMock.setItem(WIZARD_STORAGE_KEY, 'not valid json');
    expect(loadProgress()).toBeNull();
  });

  it('should handle missing fields gracefully', () => {
    localStorageMock.setItem(WIZARD_STORAGE_KEY, JSON.stringify({ version: 1, progress: {} }));
    expect(loadProgress()).toBeNull();
  });

  it('should handle invalid platform gracefully', () => {
    const invalidProgress = {
      version: 1,
      progress: {
        completedStages: [],
        currentStage: 1,
        platform: 'invalid',
        distro: null,
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };
    localStorageMock.setItem(WIZARD_STORAGE_KEY, JSON.stringify(invalidProgress));
    expect(loadProgress()).toBeNull();
  });
});
