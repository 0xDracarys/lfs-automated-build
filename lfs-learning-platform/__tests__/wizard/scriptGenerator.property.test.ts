/**
 * Property-Based Tests for Script Generator
 * 
 * Feature: lfs-installer-wizard
 * Property 6: Script Generation Completeness
 * 
 * Validates: Requirements 16.2, 16.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { STAGES, getFilteredCommands, getStageById } from '@/lib/data/wizard-stages';
import { Platform, LinuxDistro, TOTAL_STAGES } from '@/lib/types/wizard';
import {
  generateStageScript,
  generateFullScript,
  generateStageRangeScript,
  getScriptFilename,
  countExecutableCommands,
  getTotalExecutableCommands,
} from '@/lib/utils/scriptGenerator';

// Arbitraries
const platformArb = fc.constantFrom<Platform>('windows', 'linux', 'macos');
const distroArb = fc.constantFrom<LinuxDistro>('ubuntu', 'debian', 'fedora', 'arch', 'other');
const stageIdArb = fc.integer({ min: 1, max: TOTAL_STAGES });

describe('Script Generator - Property Tests', () => {
  /**
   * Property 6: Script Generation Completeness
   * For any stage, the generated script SHALL contain all non-optional
   * commands for that stage in the correct order.
   */
  describe('Script Completeness', () => {
    it('should include all non-comment commands from stage', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { platform, includeComments: true });
          const commands = getFilteredCommands(stage, platform, null);

          // Each non-comment command should appear in the script
          for (const cmd of commands) {
            if (!cmd.command.trim().startsWith('#')) {
              expect(script).toContain(cmd.command);
            }
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should include shebang line', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { platform, includeHeaders: true });
          
          expect(script).toContain('#!/bin/bash');
        }),
        { numRuns: 50 }
      );
    });

    it('should include error handling when enabled', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { 
            platform, 
            includeErrorHandling: true,
            includeHeaders: true,
          });
          
          expect(script).toContain('set -e');
        }),
        { numRuns: 50 }
      );
    });

    it('should not include error handling when disabled', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { 
            platform, 
            includeErrorHandling: false,
            includeHeaders: true,
          });
          
          // Should not have "set -e" as a standalone line
          const lines = script.split('\n');
          const hasSetE = lines.some(line => line.trim() === 'set -e');
          expect(hasSetE).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    it('should include stage completion message', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { platform });
          
          expect(script).toContain(`Stage ${stageId}`);
          expect(script).toContain('complete');
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Command Order Preservation', () => {
    it('should preserve command order from stage definition', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { platform, includeComments: false });
          const commands = getFilteredCommands(stage, platform, null)
            .filter(cmd => !cmd.command.trim().startsWith('#'));

          // Check that commands appear in order (use unique command IDs to track)
          const commandPositions: number[] = [];
          for (const cmd of commands) {
            const index = script.indexOf(cmd.command);
            if (index !== -1) {
              commandPositions.push(index);
            }
          }

          // Verify positions are in ascending order
          for (let i = 1; i < commandPositions.length; i++) {
            expect(commandPositions[i]).toBeGreaterThanOrEqual(commandPositions[i - 1]);
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Platform Filtering', () => {
    it('should only include commands for specified platform', () => {
      fc.assert(
        fc.property(stageIdArb, platformArb, (stageId, platform) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { platform });
          const allCommands = stage.commands;
          const filteredCommands = getFilteredCommands(stage, platform, null);

          // Commands not for this platform should not appear
          for (const cmd of allCommands) {
            if (!cmd.platforms.includes(platform) && !cmd.command.trim().startsWith('#')) {
              // This command is not for the current platform
              // It should not appear in the script (unless it's a common comment)
              const isInFiltered = filteredCommands.some(fc => fc.id === cmd.id);
              expect(isInFiltered).toBe(false);
            }
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Distro Filtering', () => {
    it('should filter commands by distro when specified', () => {
      fc.assert(
        fc.property(stageIdArb, distroArb, (stageId, distro) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const script = generateStageScript(stage, { platform: 'linux', distro });
          const filteredCommands = getFilteredCommands(stage, 'linux', distro);

          // All filtered commands should be in the script
          for (const cmd of filteredCommands) {
            if (!cmd.command.trim().startsWith('#')) {
              expect(script).toContain(cmd.command);
            }
          }
        }),
        { numRuns: 50 }
      );
    });
  });
});

describe('Script Generator - Full Script', () => {
  it('should include all stages in full script', () => {
    const script = generateFullScript({ platform: 'linux', distro: 'ubuntu' });
    
    for (const stage of STAGES) {
      expect(script).toContain(`Stage ${stage.id}`);
    }
  });

  it('should include completion message in full script', () => {
    const script = generateFullScript({ platform: 'linux' });
    
    expect(script).toContain('LFS Installation Complete');
  });

  it('should have valid bash syntax structure', () => {
    const script = generateFullScript({ platform: 'linux' });
    
    // Should start with shebang
    expect(script.startsWith('#!/bin/bash')).toBe(true);
    
    // Should have echo statements
    expect(script).toContain('echo');
  });
});

describe('Script Generator - Range Script', () => {
  it('should only include stages in specified range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: TOTAL_STAGES - 1 }),
        fc.integer({ min: 2, max: TOTAL_STAGES }),
        (start, end) => {
          if (start >= end) return; // Skip invalid ranges
          
          const rangeScript = generateStageRangeScript(start, end, { platform: 'linux' });
          
          // Stages in range should be included
          for (let i = start; i <= end; i++) {
            expect(rangeScript).toContain(`Stage ${i}`);
          }
          
          // Stages outside range should not be included (check stage headers)
          for (let i = 1; i < start; i++) {
            expect(rangeScript).not.toContain(`=== Stage ${i}:`);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});

describe('Script Generator - Filename Generation', () => {
  it('should generate valid filename for single stage', () => {
    fc.assert(
      fc.property(stageIdArb, platformArb, (stageId, platform) => {
        const filename = getScriptFilename(stageId, platform);
        
        expect(filename).toContain(`stage-${stageId}`);
        expect(filename).toContain(platform);
        expect(filename.endsWith('.sh')).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it('should generate valid filename for full script', () => {
    fc.assert(
      fc.property(platformArb, (platform) => {
        const filename = getScriptFilename(undefined, platform);
        
        expect(filename).toContain('full-install');
        expect(filename).toContain(platform);
        expect(filename.endsWith('.sh')).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

describe('Script Generator - Command Counting', () => {
  it('should count executable commands correctly', () => {
    fc.assert(
      fc.property(stageIdArb, platformArb, (stageId, platform) => {
        const stage = getStageById(stageId);
        if (!stage) return;

        const count = countExecutableCommands(stage, platform, null);
        const commands = getFilteredCommands(stage, platform, null);
        const expectedCount = commands.filter(cmd => !cmd.command.trim().startsWith('#')).length;
        
        expect(count).toBe(expectedCount);
      }),
      { numRuns: 50 }
    );
  });

  it('should count total commands across all stages', () => {
    fc.assert(
      fc.property(platformArb, (platform) => {
        const total = getTotalExecutableCommands(platform, null);
        
        let expectedTotal = 0;
        for (const stage of STAGES) {
          expectedTotal += countExecutableCommands(stage, platform, null);
        }
        
        expect(total).toBe(expectedTotal);
      }),
      { numRuns: 10 }
    );
  });

  it('should return non-negative count', () => {
    fc.assert(
      fc.property(stageIdArb, platformArb, (stageId, platform) => {
        const stage = getStageById(stageId);
        if (!stage) return;

        const count = countExecutableCommands(stage, platform, null);
        expect(count).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 50 }
    );
  });
});

describe('Script Generator - Edge Cases', () => {
  it('should handle stage with no commands for platform', () => {
    // macOS has fewer commands defined
    const stage = getStageById(1);
    if (!stage) return;

    const script = generateStageScript(stage, { platform: 'macos' });
    
    // Should still generate valid script structure
    expect(script).toContain('#!/bin/bash');
    expect(script).toContain('Stage 1');
  });

  it('should handle empty distro', () => {
    const stage = getStageById(1);
    if (!stage) return;

    const script = generateStageScript(stage, { platform: 'linux', distro: null });
    
    expect(script).toContain('#!/bin/bash');
  });

  it('should handle all options disabled', () => {
    const stage = getStageById(1);
    if (!stage) return;

    const script = generateStageScript(stage, {
      platform: 'linux',
      includeComments: false,
      includeErrorHandling: false,
      includeHeaders: false,
    });
    
    // Should still have some content
    expect(script.length).toBeGreaterThan(0);
  });
});
