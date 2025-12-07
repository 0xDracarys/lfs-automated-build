/**
 * Property-Based Tests for Stage Reset Cascade
 * 
 * Feature: lfs-installer-wizard
 * Property 8: Stage Reset Cascade
 * 
 * Validates: Requirements 15.5 (implied from reset behavior)
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { STAGES } from '@/lib/data/wizard-stages';
import { TOTAL_STAGES } from '@/lib/types/wizard';

/**
 * Get all stages that depend on a given stage (directly or transitively)
 */
function getDependentStages(stageId: number): number[] {
  const dependents: number[] = [];
  
  for (const stage of STAGES) {
    if (stage.prerequisites.includes(stageId)) {
      dependents.push(stage.id);
      // Recursively get stages that depend on this dependent
      dependents.push(...getDependentStages(stage.id));
    }
  }
  
  return [...new Set(dependents)]; // Remove duplicates
}

/**
 * Simulate resetting a stage and all its dependents
 */
function resetStageWithCascade(
  completedStages: number[],
  stageToReset: number
): number[] {
  const dependents = getDependentStages(stageToReset);
  const stagesToRemove = new Set([stageToReset, ...dependents]);
  
  return completedStages.filter(s => !stagesToRemove.has(s));
}

/**
 * Check if a stage can be accessed given completed stages
 */
function canAccessStage(stageId: number, completedStages: Set<number>): boolean {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) return false;
  
  return stage.prerequisites.every(prereq => completedStages.has(prereq));
}

describe('Stage Reset Cascade - Property Tests', () => {
  /**
   * Property 8: Stage Reset Cascade
   * For any stage that is reset, all stages that depend on it
   * (have it as a prerequisite) SHALL also be reset.
   */
  describe('Cascade Reset', () => {
    it('should reset all dependent stages when a stage is reset', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: TOTAL_STAGES }),
          (stageToReset) => {
            // Start with all stages completed
            const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
            
            // Reset the stage
            const afterReset = resetStageWithCascade(allCompleted, stageToReset);
            
            // The reset stage should not be in completed
            expect(afterReset).not.toContain(stageToReset);
            
            // All dependent stages should also be reset
            const dependents = getDependentStages(stageToReset);
            for (const dependent of dependents) {
              expect(afterReset).not.toContain(dependent);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not reset stages that do not depend on the reset stage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: TOTAL_STAGES }),
          (stageToReset) => {
            // Start with all stages completed
            const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
            
            // Reset the stage
            const afterReset = resetStageWithCascade(allCompleted, stageToReset);
            
            // Stages before the reset stage should still be completed
            // (since they don't depend on it)
            for (let i = 1; i < stageToReset; i++) {
              const stage = STAGES.find(s => s.id === i);
              if (stage && !stage.prerequisites.includes(stageToReset)) {
                // This stage doesn't depend on the reset stage
                // It should still be completed
                expect(afterReset).toContain(i);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain valid prerequisite state after reset', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: TOTAL_STAGES }),
          (stageToReset) => {
            // Start with all stages completed
            const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
            
            // Reset the stage
            const afterReset = resetStageWithCascade(allCompleted, stageToReset);
            const completedSet = new Set(afterReset);
            
            // For each remaining completed stage, all its prerequisites should be completed
            for (const completedStage of afterReset) {
              const stage = STAGES.find(s => s.id === completedStage);
              if (stage) {
                for (const prereq of stage.prerequisites) {
                  expect(completedSet.has(prereq)).toBe(true);
                }
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Dependent Stage Calculation', () => {
    it('should correctly identify direct dependents', () => {
      // Stage 1 has no prerequisites, so stages 2+ depend on it
      const stage1Dependents = getDependentStages(1);
      
      // All stages 2-12 should depend on stage 1 (directly or transitively)
      for (let i = 2; i <= TOTAL_STAGES; i++) {
        expect(stage1Dependents).toContain(i);
      }
    });

    it('should return empty array for last stage', () => {
      const lastStageDependents = getDependentStages(TOTAL_STAGES);
      expect(lastStageDependents).toEqual([]);
    });

    it('should include transitive dependents', () => {
      // If stage 3 depends on stage 2, and stage 2 depends on stage 1,
      // then resetting stage 1 should also reset stage 3
      const stage1Dependents = getDependentStages(1);
      
      // Stage 3 should be in the dependents of stage 1
      expect(stage1Dependents).toContain(3);
    });
  });

  describe('Reset Idempotency', () => {
    it('should produce same result when reset is applied multiple times', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: TOTAL_STAGES }),
          (stageToReset) => {
            const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
            
            // Reset once
            const afterFirstReset = resetStageWithCascade(allCompleted, stageToReset);
            
            // Reset again (should have no effect since stage is already reset)
            const afterSecondReset = resetStageWithCascade(afterFirstReset, stageToReset);
            
            expect(afterFirstReset.sort()).toEqual(afterSecondReset.sort());
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Reset Completeness', () => {
    it('should reset exactly the right stages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: TOTAL_STAGES }),
          (stageToReset) => {
            const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
            const afterReset = resetStageWithCascade(allCompleted, stageToReset);
            
            const dependents = getDependentStages(stageToReset);
            const expectedRemoved = new Set([stageToReset, ...dependents]);
            const expectedRemaining = allCompleted.filter(s => !expectedRemoved.has(s));
            
            expect(afterReset.sort()).toEqual(expectedRemaining.sort());
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

describe('Stage Reset - Edge Cases', () => {
  it('should handle resetting stage 1 (resets all)', () => {
    const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
    const afterReset = resetStageWithCascade(allCompleted, 1);
    
    // All stages should be reset
    expect(afterReset).toEqual([]);
  });

  it('should handle resetting last stage (only resets itself)', () => {
    const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
    const afterReset = resetStageWithCascade(allCompleted, TOTAL_STAGES);
    
    // Only the last stage should be reset
    expect(afterReset.length).toBe(TOTAL_STAGES - 1);
    expect(afterReset).not.toContain(TOTAL_STAGES);
    expect(afterReset).toContain(TOTAL_STAGES - 1);
  });

  it('should handle resetting a stage that is not completed', () => {
    const partialCompleted = [1, 2, 3];
    const afterReset = resetStageWithCascade(partialCompleted, 5);
    
    // Should have no effect since stage 5 wasn't completed
    expect(afterReset.sort()).toEqual(partialCompleted.sort());
  });

  it('should handle empty completed stages', () => {
    const afterReset = resetStageWithCascade([], 1);
    expect(afterReset).toEqual([]);
  });
});

describe('Stage Access After Reset', () => {
  it('should make reset stage accessible if prerequisites are met', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: TOTAL_STAGES }),
        (stageToReset) => {
          const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
          const afterReset = resetStageWithCascade(allCompleted, stageToReset);
          const completedSet = new Set(afterReset);
          
          // The reset stage should be accessible (its prerequisites are still met)
          const canAccess = canAccessStage(stageToReset, completedSet);
          expect(canAccess).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should make dependent stages inaccessible after reset', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: TOTAL_STAGES - 1 }),
        (stageToReset) => {
          const allCompleted = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
          const afterReset = resetStageWithCascade(allCompleted, stageToReset);
          const completedSet = new Set(afterReset);
          
          // Direct dependents should be inaccessible
          const directDependents = STAGES.filter(s => s.prerequisites.includes(stageToReset));
          
          for (const dependent of directDependents) {
            const canAccess = canAccessStage(dependent.id, completedSet);
            expect(canAccess).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
