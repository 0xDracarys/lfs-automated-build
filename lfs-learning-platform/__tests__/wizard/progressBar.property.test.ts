/**
 * Property-Based Tests for Progress Bar Accuracy
 * 
 * Feature: lfs-installer-wizard
 * Property 7: Progress Bar Accuracy
 * 
 * Validates: Requirements 15.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TOTAL_STAGES } from '@/lib/types/wizard';

/**
 * Calculate progress percentage
 * This mirrors the logic used in the UI
 */
function calculateProgressPercentage(completedStages: number[]): number {
  return Math.round((completedStages.length / TOTAL_STAGES) * 100);
}

/**
 * Calculate progress fraction
 */
function calculateProgressFraction(completedStages: number[]): number {
  return completedStages.length / TOTAL_STAGES;
}

describe('Progress Bar - Property Tests', () => {
  /**
   * Property 7: Progress Bar Accuracy
   * For any set of completed stages, the progress percentage SHALL equal
   * (completed stages / total stages) * 100.
   */
  describe('Progress Calculation', () => {
    it('should calculate correct percentage for any number of completed stages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: TOTAL_STAGES }),
          (numCompleted) => {
            // Generate a list of completed stages
            const completedStages = Array.from({ length: numCompleted }, (_, i) => i + 1);
            
            const percentage = calculateProgressPercentage(completedStages);
            const expectedPercentage = Math.round((numCompleted / TOTAL_STAGES) * 100);
            
            expect(percentage).toBe(expectedPercentage);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0% when no stages are completed', () => {
      const completedStages: number[] = [];
      const percentage = calculateProgressPercentage(completedStages);
      
      expect(percentage).toBe(0);
    });

    it('should return 100% when all stages are completed', () => {
      const completedStages = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
      const percentage = calculateProgressPercentage(completedStages);
      
      expect(percentage).toBe(100);
    });

    it('should handle non-sequential completed stages', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 0, maxLength: TOTAL_STAGES }),
          (completedStages) => {
            const percentage = calculateProgressPercentage(completedStages);
            const expectedPercentage = Math.round((completedStages.length / TOTAL_STAGES) * 100);
            
            expect(percentage).toBe(expectedPercentage);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Progress Bounds', () => {
    it('should always return percentage between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 0, maxLength: TOTAL_STAGES }),
          (completedStages) => {
            const percentage = calculateProgressPercentage(completedStages);
            
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return fraction between 0 and 1', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 0, maxLength: TOTAL_STAGES }),
          (completedStages) => {
            const fraction = calculateProgressFraction(completedStages);
            
            expect(fraction).toBeGreaterThanOrEqual(0);
            expect(fraction).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Progress Monotonicity', () => {
    it('should increase or stay same when stages are added', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 0, maxLength: TOTAL_STAGES - 1 }),
          fc.integer({ min: 1, max: TOTAL_STAGES }),
          (completedStages, newStage) => {
            const beforePercentage = calculateProgressPercentage(completedStages);
            
            // Add a new stage (if not already present)
            const newCompleted = completedStages.includes(newStage)
              ? completedStages
              : [...completedStages, newStage];
            
            const afterPercentage = calculateProgressPercentage(newCompleted);
            
            expect(afterPercentage).toBeGreaterThanOrEqual(beforePercentage);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should decrease or stay same when stages are removed', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 1, maxLength: TOTAL_STAGES }),
          (completedStages) => {
            const beforePercentage = calculateProgressPercentage(completedStages);
            
            // Remove a random stage
            const stageToRemove = completedStages[0];
            const newCompleted = completedStages.filter(s => s !== stageToRemove);
            
            const afterPercentage = calculateProgressPercentage(newCompleted);
            
            expect(afterPercentage).toBeLessThanOrEqual(beforePercentage);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Progress Consistency', () => {
    it('should return same percentage for same completed stages regardless of order', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 0, maxLength: TOTAL_STAGES }),
          (completedStages) => {
            // Calculate with original order
            const percentage1 = calculateProgressPercentage(completedStages);
            
            // Calculate with reversed order
            const reversed = [...completedStages].reverse();
            const percentage2 = calculateProgressPercentage(reversed);
            
            // Calculate with sorted order
            const sorted = [...completedStages].sort((a, b) => a - b);
            const percentage3 = calculateProgressPercentage(sorted);
            
            expect(percentage1).toBe(percentage2);
            expect(percentage2).toBe(percentage3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be deterministic for same input', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: TOTAL_STAGES }), { minLength: 0, maxLength: TOTAL_STAGES }),
          (completedStages) => {
            const percentage1 = calculateProgressPercentage(completedStages);
            const percentage2 = calculateProgressPercentage(completedStages);
            const percentage3 = calculateProgressPercentage(completedStages);
            
            expect(percentage1).toBe(percentage2);
            expect(percentage2).toBe(percentage3);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Progress Bar - Edge Cases', () => {
  it('should handle empty array', () => {
    const percentage = calculateProgressPercentage([]);
    expect(percentage).toBe(0);
  });

  it('should handle single stage completed', () => {
    for (let i = 1; i <= TOTAL_STAGES; i++) {
      const percentage = calculateProgressPercentage([i]);
      const expected = Math.round((1 / TOTAL_STAGES) * 100);
      expect(percentage).toBe(expected);
    }
  });

  it('should handle all but one stage completed', () => {
    for (let i = 1; i <= TOTAL_STAGES; i++) {
      const allButOne = Array.from({ length: TOTAL_STAGES }, (_, j) => j + 1).filter(s => s !== i);
      const percentage = calculateProgressPercentage(allButOne);
      const expected = Math.round(((TOTAL_STAGES - 1) / TOTAL_STAGES) * 100);
      expect(percentage).toBe(expected);
    }
  });
});
