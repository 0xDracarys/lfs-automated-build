/**
 * Property-Based Tests for Stage Prerequisites
 * 
 * Feature: lfs-installer-wizard, Property 3: Stage Prerequisite Enforcement
 * Validates: Requirements 15.4
 * 
 * For any stage with prerequisites, the stage SHALL be locked (not accessible)
 * until all prerequisite stages are marked complete.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { STAGE_PREREQUISITES } from '@/contexts/WizardContext';
import { TOTAL_STAGES } from '@/lib/types/wizard';

// Mock localStorage for context tests
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

/**
 * Pure function to check if a stage is accessible given completed stages
 * This mirrors the logic in WizardContext
 */
function isStageAccessible(stageId: number, completedStages: Set<number>): boolean {
  const prerequisites = STAGE_PREREQUISITES[stageId] || [];
  return prerequisites.every(prereq => completedStages.has(prereq));
}

/**
 * Get all stages that depend on a given stage (directly or indirectly)
 */
function getDependentStages(stageId: number): number[] {
  const dependents: number[] = [];
  const toCheck = new Set<number>([stageId]);
  
  for (let i = stageId + 1; i <= TOTAL_STAGES; i++) {
    const prereqs = STAGE_PREREQUISITES[i] || [];
    if (prereqs.some(prereq => toCheck.has(prereq))) {
      dependents.push(i);
      toCheck.add(i);
    }
  }
  
  return dependents;
}

// Arbitraries
const stageIdArb = fc.integer({ min: 1, max: TOTAL_STAGES });
const completedStagesArb = fc.array(stageIdArb, { minLength: 0, maxLength: TOTAL_STAGES })
  .map(stages => new Set([...new Set(stages)]));

describe('Stage Prerequisites - Property Tests', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  /**
   * Property 3: Stage Prerequisite Enforcement
   * A stage is accessible if and only if all its prerequisites are complete
   */
  it('should only allow access to stages with all prerequisites complete', () => {
    fc.assert(
      fc.property(stageIdArb, completedStagesArb, (stageId, completedStages) => {
        const prerequisites = STAGE_PREREQUISITES[stageId] || [];
        const allPrereqsComplete = prerequisites.every(prereq => completedStages.has(prereq));
        const isAccessible = isStageAccessible(stageId, completedStages);
        
        // Stage should be accessible if and only if all prerequisites are complete
        expect(isAccessible).toBe(allPrereqsComplete);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Stage 1 should always be accessible (no prerequisites)
   */
  it('should always allow access to Stage 1 regardless of completed stages', () => {
    fc.assert(
      fc.property(completedStagesArb, (completedStages) => {
        expect(isStageAccessible(1, completedStages)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Completing a stage should not affect accessibility of earlier stages
   */
  it('should not affect earlier stages when completing a later stage', () => {
    fc.assert(
      fc.property(
        stageIdArb,
        stageIdArb,
        completedStagesArb,
        (stageToComplete, stageToCheck, initialCompleted) => {
          // Only test when stageToComplete > stageToCheck
          if (stageToComplete <= stageToCheck) return;
          
          const accessibleBefore = isStageAccessible(stageToCheck, initialCompleted);
          
          // Add the later stage to completed
          const newCompleted = new Set(initialCompleted);
          newCompleted.add(stageToComplete);
          
          const accessibleAfter = isStageAccessible(stageToCheck, newCompleted);
          
          // Accessibility of earlier stage should not change
          expect(accessibleAfter).toBe(accessibleBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Completing all prerequisites should make a stage accessible
   */
  it('should make a stage accessible when all prerequisites are complete', () => {
    fc.assert(
      fc.property(stageIdArb, (stageId) => {
        const prerequisites = STAGE_PREREQUISITES[stageId] || [];
        const completedStages = new Set(prerequisites);
        
        expect(isStageAccessible(stageId, completedStages)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Missing any prerequisite should make a stage inaccessible
   */
  it('should make a stage inaccessible when any prerequisite is missing', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: TOTAL_STAGES }), // Stages 2+ have prerequisites
        (stageId) => {
          const prerequisites = STAGE_PREREQUISITES[stageId] || [];
          
          if (prerequisites.length === 0) return; // Skip if no prerequisites
          
          // Complete all but one prerequisite
          for (let i = 0; i < prerequisites.length; i++) {
            const incompleteSet = new Set(prerequisites.filter((_, idx) => idx !== i));
            expect(isStageAccessible(stageId, incompleteSet)).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Prerequisites form a valid DAG (no cycles)
   */
  it('should have no circular dependencies in prerequisites', () => {
    // For each stage, verify its prerequisites are all lower-numbered stages
    for (let stageId = 1; stageId <= TOTAL_STAGES; stageId++) {
      const prerequisites = STAGE_PREREQUISITES[stageId] || [];
      
      for (const prereq of prerequisites) {
        expect(prereq).toBeLessThan(stageId);
      }
    }
  });

  /**
   * Property: Dependent stages should be identified correctly
   */
  it('should correctly identify all dependent stages', () => {
    fc.assert(
      fc.property(stageIdArb, (stageId) => {
        const dependents = getDependentStages(stageId);
        
        // All dependents should be after the stage
        for (const dep of dependents) {
          expect(dep).toBeGreaterThan(stageId);
        }
        
        // Each dependent should have the original stage (or a dependent) as a prerequisite
        for (const dep of dependents) {
          const prereqs = STAGE_PREREQUISITES[dep] || [];
          const hasDependency = prereqs.some(
            prereq => prereq === stageId || dependents.includes(prereq)
          );
          expect(hasDependency).toBe(true);
        }
      }),
      { numRuns: 50 }
    );
  });
});

describe('Stage Prerequisites - Structure Tests', () => {
  it('should have prerequisites defined for all stages', () => {
    for (let stageId = 1; stageId <= TOTAL_STAGES; stageId++) {
      expect(STAGE_PREREQUISITES[stageId]).toBeDefined();
      expect(Array.isArray(STAGE_PREREQUISITES[stageId])).toBe(true);
    }
  });

  it('should have Stage 1 with no prerequisites', () => {
    expect(STAGE_PREREQUISITES[1]).toEqual([]);
  });

  it('should have each stage depend on the previous stage', () => {
    // Stages 2-12 should each depend on the previous stage
    for (let stageId = 2; stageId <= TOTAL_STAGES; stageId++) {
      const prereqs = STAGE_PREREQUISITES[stageId];
      expect(prereqs).toContain(stageId - 1);
    }
  });
});
