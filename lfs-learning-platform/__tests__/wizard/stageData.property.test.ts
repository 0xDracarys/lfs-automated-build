/**
 * Property-Based Tests for Stage Data
 * 
 * Feature: lfs-installer-wizard
 * Property 5: Distro-Specific Command Selection
 * Property 9: Time Estimate Validity
 * 
 * Validates: Requirements 3.2, 3.3, 3.4, 18.1, 18.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { STAGES, getFilteredCommands, getStageById } from '@/lib/data/wizard-stages';
import { Platform, LinuxDistro, TOTAL_STAGES } from '@/lib/types/wizard';

// Arbitraries
const platformArb = fc.constantFrom<Platform>('windows', 'linux', 'macos');
const distroArb = fc.constantFrom<LinuxDistro>('ubuntu', 'debian', 'fedora', 'arch', 'other');
const stageIdArb = fc.integer({ min: 1, max: TOTAL_STAGES });

// Valid time estimate patterns
const TIME_ESTIMATE_PATTERN = /^\d+(-\d+)?\s*(min|hour|hours)$/i;

describe('Stage Data - Property Tests', () => {
  /**
   * Property 5: Distro-Specific Command Selection
   * For any Linux distro type, the dependency installation commands SHALL match
   * the correct package manager (apt for Ubuntu/Debian, dnf for Fedora, pacman for Arch).
   */
  describe('Distro-Specific Commands', () => {
    it('should return apt commands for Ubuntu/Debian', () => {
      fc.assert(
        fc.property(stageIdArb, (stageId) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          // Get commands for Ubuntu
          const ubuntuCommands = getFilteredCommands(stage, 'linux', 'ubuntu');
          const debianCommands = getFilteredCommands(stage, 'linux', 'debian');

          // Check that any distro-specific commands use apt
          for (const cmd of ubuntuCommands) {
            if (cmd.distros?.includes('ubuntu') && !cmd.distros?.includes('fedora')) {
              // Ubuntu-specific commands should use apt
              if (cmd.command.includes('install')) {
                expect(cmd.command).toMatch(/apt|apt-get/);
              }
            }
          }

          for (const cmd of debianCommands) {
            if (cmd.distros?.includes('debian') && !cmd.distros?.includes('fedora')) {
              if (cmd.command.includes('install')) {
                expect(cmd.command).toMatch(/apt|apt-get/);
              }
            }
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should return dnf commands for Fedora', () => {
      fc.assert(
        fc.property(stageIdArb, (stageId) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const fedoraCommands = getFilteredCommands(stage, 'linux', 'fedora');

          for (const cmd of fedoraCommands) {
            if (cmd.distros?.includes('fedora') && !cmd.distros?.includes('ubuntu')) {
              if (cmd.command.includes('install') || cmd.command.includes('groupinstall')) {
                expect(cmd.command).toMatch(/dnf|yum/);
              }
            }
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should return pacman commands for Arch', () => {
      fc.assert(
        fc.property(stageIdArb, (stageId) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const archCommands = getFilteredCommands(stage, 'linux', 'arch');

          for (const cmd of archCommands) {
            if (cmd.distros?.includes('arch') && !cmd.distros?.includes('ubuntu')) {
              if (cmd.command.includes('-S')) {
                expect(cmd.command).toMatch(/pacman/);
              }
            }
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should filter out commands for non-matching distros', () => {
      fc.assert(
        fc.property(stageIdArb, distroArb, (stageId, distro) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const filteredCommands = getFilteredCommands(stage, 'linux', distro);

          // All returned commands should either:
          // 1. Have no distro restriction, OR
          // 2. Include the specified distro
          for (const cmd of filteredCommands) {
            if (cmd.distros) {
              expect(cmd.distros).toContain(distro);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should filter out Linux commands for Windows platform', () => {
      fc.assert(
        fc.property(stageIdArb, (stageId) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          const windowsCommands = getFilteredCommands(stage, 'windows', null);

          // All returned commands should include 'windows' in platforms
          for (const cmd of windowsCommands) {
            expect(cmd.platforms).toContain('windows');
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 9: Time Estimate Validity
   * For any stage, the estimated time SHALL be a positive duration string
   * in a valid format (e.g., "15 min", "2-4 hours").
   */
  describe('Time Estimate Validity', () => {
    it('should have valid time estimate format for all stages', () => {
      for (const stage of STAGES) {
        // Time estimate should match pattern like "15 min", "2-4 hours", "1 hour"
        expect(stage.estimatedTime).toMatch(TIME_ESTIMATE_PATTERN);
      }
    });

    it('should have non-empty time estimates for all stages', () => {
      fc.assert(
        fc.property(stageIdArb, (stageId) => {
          const stage = getStageById(stageId);
          if (!stage) return;

          expect(stage.estimatedTime).toBeTruthy();
          expect(stage.estimatedTime.length).toBeGreaterThan(0);
        }),
        { numRuns: 50 }
      );
    });

    it('should have valid disk space format for all stages', () => {
      for (const stage of STAGES) {
        // Disk space should be "0" or match pattern like "2 GB", "100 MB"
        expect(stage.diskSpace).toMatch(/^0$|^\d+\s*(GB|MB|KB)$/i);
      }
    });
  });
});

describe('Stage Data - Structure Tests', () => {
  it('should have exactly 12 stages', () => {
    expect(STAGES.length).toBe(TOTAL_STAGES);
  });

  it('should have sequential stage IDs from 1 to 12', () => {
    for (let i = 0; i < STAGES.length; i++) {
      expect(STAGES[i].id).toBe(i + 1);
    }
  });

  it('should have all required fields for each stage', () => {
    for (const stage of STAGES) {
      expect(stage.id).toBeDefined();
      expect(stage.title).toBeTruthy();
      expect(stage.shortTitle).toBeTruthy();
      expect(stage.description).toBeTruthy();
      expect(stage.estimatedTime).toBeTruthy();
      expect(stage.diskSpace).toBeDefined();
      expect(Array.isArray(stage.prerequisites)).toBe(true);
      expect(Array.isArray(stage.commands)).toBe(true);
      expect(Array.isArray(stage.troubleshooting)).toBe(true);
    }
  });

  it('should have valid prerequisites (all lower than stage ID)', () => {
    for (const stage of STAGES) {
      for (const prereq of stage.prerequisites) {
        expect(prereq).toBeLessThan(stage.id);
        expect(prereq).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('should have commands with required fields', () => {
    for (const stage of STAGES) {
      for (const cmd of stage.commands) {
        expect(cmd.id).toBeTruthy();
        expect(cmd.description).toBeTruthy();
        expect(cmd.command).toBeDefined();
        expect(Array.isArray(cmd.platforms)).toBe(true);
        expect(cmd.platforms.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have unique command IDs within each stage', () => {
    for (const stage of STAGES) {
      const ids = stage.commands.map(cmd => cmd.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });

  it('should have Stage 1 with no prerequisites', () => {
    const stage1 = getStageById(1);
    expect(stage1).toBeDefined();
    expect(stage1!.prerequisites).toEqual([]);
  });

  it('should have each stage (2-12) depend on the previous stage', () => {
    for (let i = 2; i <= TOTAL_STAGES; i++) {
      const stage = getStageById(i);
      expect(stage).toBeDefined();
      expect(stage!.prerequisites).toContain(i - 1);
    }
  });
});

describe('Stage Data - Command Filtering', () => {
  it('should return empty array for invalid stage ID', () => {
    const stage = getStageById(999);
    expect(stage).toBeUndefined();
  });

  it('should return commands for valid platform', () => {
    const stage = getStageById(1);
    expect(stage).toBeDefined();

    const windowsCommands = getFilteredCommands(stage!, 'windows', null);
    const linuxCommands = getFilteredCommands(stage!, 'linux', 'ubuntu');

    // Both should have some commands
    expect(windowsCommands.length).toBeGreaterThan(0);
    expect(linuxCommands.length).toBeGreaterThan(0);
  });

  it('should filter commands correctly by platform', () => {
    fc.assert(
      fc.property(stageIdArb, platformArb, (stageId, platform) => {
        const stage = getStageById(stageId);
        if (!stage) return;

        const commands = getFilteredCommands(stage, platform, null);

        // All returned commands should support the platform
        for (const cmd of commands) {
          expect(cmd.platforms).toContain(platform);
        }
      }),
      { numRuns: 100 }
    );
  });
});
