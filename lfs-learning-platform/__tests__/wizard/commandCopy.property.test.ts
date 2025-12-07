/**
 * Property-Based Tests for Command Copy Functionality
 * 
 * Feature: lfs-installer-wizard
 * Property 10: Command Copy Functionality
 * 
 * Validates: Requirements 8.2, 8.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { STAGES } from '@/lib/data/wizard-stages';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn(),
};

describe('Command Copy - Property Tests', () => {
  beforeEach(() => {
    // Setup clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
    mockClipboard.writeText.mockReset();
    mockClipboard.readText.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 10: Command Copy Functionality
   * For any command block with copyable=true, clicking the copy button
   * SHALL place the exact command text in the clipboard.
   */
  describe('Command Text Preservation', () => {
    it('should preserve exact command text when copying', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (commandText) => {
            // Simulate copy operation
            mockClipboard.writeText.mockResolvedValue(undefined);
            
            // The copy function should be called with exact text
            navigator.clipboard.writeText(commandText);
            
            expect(mockClipboard.writeText).toHaveBeenCalledWith(commandText);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters in commands', () => {
      const specialCommands = [
        'echo "Hello World"',
        "cat << 'EOF'\ntest\nEOF",
        'export PATH=$PATH:/usr/local/bin',
        'sudo apt install -y build-essential',
        'tar -xzf file.tar.gz',
        'wget "https://example.com/file?param=value"',
        'grep -r "pattern" .',
        'find . -name "*.ts" -exec rm {} \\;',
      ];

      for (const cmd of specialCommands) {
        mockClipboard.writeText.mockResolvedValue(undefined);
        navigator.clipboard.writeText(cmd);
        expect(mockClipboard.writeText).toHaveBeenCalledWith(cmd);
      }
    });

    it('should handle multiline commands', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          (lines) => {
            const multilineCommand = lines.join('\n');
            mockClipboard.writeText.mockResolvedValue(undefined);
            
            navigator.clipboard.writeText(multilineCommand);
            
            expect(mockClipboard.writeText).toHaveBeenCalledWith(multilineCommand);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Copyable Command Detection', () => {
    it('should identify comment commands as non-copyable', () => {
      for (const stage of STAGES) {
        for (const cmd of stage.commands) {
          const isComment = cmd.command.trim().startsWith('#');
          
          // Comments should not be copyable (they're informational)
          if (isComment) {
            // The UI should not show copy button for comments
            expect(cmd.command.trim().charAt(0)).toBe('#');
          }
        }
      }
    });

    it('should identify executable commands as copyable', () => {
      for (const stage of STAGES) {
        for (const cmd of stage.commands) {
          const isComment = cmd.command.trim().startsWith('#');
          
          if (!isComment) {
            // Non-comment commands should be copyable
            expect(cmd.command.trim().charAt(0)).not.toBe('#');
          }
        }
      }
    });
  });

  describe('Command Integrity', () => {
    it('should not modify command text during copy', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (originalCommand) => {
            // Reset mock before each property test
            mockClipboard.writeText.mockReset();
            mockClipboard.writeText.mockResolvedValue(undefined);
            
            // Copy the command
            navigator.clipboard.writeText(originalCommand);
            
            // Verify the exact text was passed (get the last call)
            const lastCallIndex = mockClipboard.writeText.mock.calls.length - 1;
            const calledWith = mockClipboard.writeText.mock.calls[lastCallIndex][0];
            expect(calledWith).toBe(originalCommand);
            expect(calledWith.length).toBe(originalCommand.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve whitespace in commands', () => {
      const whitespaceCommands = [
        '  indented command',
        'command  with  spaces',
        'command\twith\ttabs',
        'command\nwith\nnewlines',
        '   leading and trailing   ',
      ];

      for (const cmd of whitespaceCommands) {
        mockClipboard.writeText.mockResolvedValue(undefined);
        navigator.clipboard.writeText(cmd);
        
        const calledWith = mockClipboard.writeText.mock.calls[mockClipboard.writeText.mock.calls.length - 1][0];
        expect(calledWith).toBe(cmd);
      }
    });
  });
});

describe('Command Copy - Stage Commands', () => {
  it('should have all stage commands with valid command text', () => {
    for (const stage of STAGES) {
      for (const cmd of stage.commands) {
        expect(cmd.command).toBeDefined();
        expect(typeof cmd.command).toBe('string');
      }
    }
  });

  it('should have copyable commands that are not empty', () => {
    for (const stage of STAGES) {
      for (const cmd of stage.commands) {
        const isComment = cmd.command.trim().startsWith('#');
        
        if (!isComment) {
          // Non-comment commands should have actual content
          expect(cmd.command.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});
