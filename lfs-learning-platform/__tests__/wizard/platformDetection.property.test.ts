/**
 * Property-Based Tests for Platform Detection
 * 
 * Feature: lfs-installer-wizard, Property 1: Platform Detection Consistency
 * Validates: Requirements 1.1, 1.2
 * 
 * For any user agent string, the platform detection function SHALL return
 * exactly one of: 'windows', 'linux', or 'macos', and the result SHALL be
 * deterministic for the same input.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { detectPlatform, detectPlatformWithDetails } from '@/lib/utils/platformDetection';
import { Platform } from '@/lib/types/wizard';

// Valid platforms that can be returned
const VALID_PLATFORMS: Platform[] = ['windows', 'linux', 'macos'];

describe('Platform Detection - Property Tests', () => {
  /**
   * Property 1: Platform Detection Consistency
   * For any user agent string, detectPlatform SHALL return exactly one of:
   * 'windows', 'linux', or 'macos'
   */
  it('should always return a valid platform for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (userAgent) => {
        const result = detectPlatform(userAgent);
        
        // Result must be one of the valid platforms
        expect(VALID_PLATFORMS).toContain(result);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1 (continued): Determinism
   * The same input SHALL always produce the same output
   */
  it('should be deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(fc.string(), (userAgent) => {
        const result1 = detectPlatform(userAgent);
        const result2 = detectPlatform(userAgent);
        const result3 = detectPlatform(userAgent);
        
        // All calls with same input must return same result
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Windows detection
   * User agents containing 'win' should detect as Windows
   */
  it('should detect Windows for user agents containing "win"', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (prefix, suffix) => {
          // Create a user agent with 'win' in it (but not 'darwin' or 'mac')
          const userAgent = `${prefix}win${suffix}`.replace(/mac|darwin/gi, 'xxx');
          const result = detectPlatform(userAgent);
          
          expect(result).toBe('windows');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: macOS detection
   * User agents containing 'mac' (without 'win' before it) should detect as macOS
   */
  it('should detect macOS for user agents containing "mac" without "win"', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (prefix, suffix) => {
          // Create a user agent with 'mac' but no 'win'
          const cleanPrefix = prefix.replace(/win/gi, 'xxx');
          const cleanSuffix = suffix.replace(/win/gi, 'xxx');
          const userAgent = `${cleanPrefix}mac${cleanSuffix}`;
          const result = detectPlatform(userAgent);
          
          expect(result).toBe('macos');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Linux detection
   * User agents containing 'linux' (without 'win' or 'mac') should detect as Linux
   */
  it('should detect Linux for user agents containing "linux" without "win" or "mac"', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (prefix, suffix) => {
          // Create a user agent with 'linux' but no 'win' or 'mac'
          const cleanPrefix = prefix.replace(/win|mac|darwin/gi, 'xxx');
          const cleanSuffix = suffix.replace(/win|mac|darwin/gi, 'xxx');
          const userAgent = `${cleanPrefix}linux${cleanSuffix}`;
          const result = detectPlatform(userAgent);
          
          expect(result).toBe('linux');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default to Linux
   * User agents without any platform indicators should default to Linux
   */
  it('should default to Linux for unrecognized user agents', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => 
          !s.toLowerCase().includes('win') &&
          !s.toLowerCase().includes('mac') &&
          !s.toLowerCase().includes('darwin') &&
          !s.toLowerCase().includes('linux') &&
          !s.toLowerCase().includes('x11') &&
          !s.toLowerCase().includes('ubuntu') &&
          !s.toLowerCase().includes('debian') &&
          !s.toLowerCase().includes('fedora') &&
          !s.toLowerCase().includes('arch')
        ),
        (userAgent) => {
          const result = detectPlatform(userAgent);
          
          // Should default to Linux
          expect(result).toBe('linux');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: detectPlatformWithDetails returns consistent platform
   * The detailed detection should return the same platform as simple detection
   */
  it('should return consistent platform between simple and detailed detection', () => {
    fc.assert(
      fc.property(fc.string(), (userAgent) => {
        const simpleResult = detectPlatform(userAgent);
        const detailedResult = detectPlatformWithDetails(userAgent);
        
        // Platform should match
        expect(detailedResult.platform).toBe(simpleResult);
        
        // Confidence should be between 0 and 1
        expect(detailedResult.confidence).toBeGreaterThanOrEqual(0);
        expect(detailedResult.confidence).toBeLessThanOrEqual(1);
        
        // User agent should be preserved
        expect(detailedResult.userAgent).toBe(userAgent);
      }),
      { numRuns: 100 }
    );
  });
});

// Example-based tests for known user agents
describe('Platform Detection - Example Tests', () => {
  const knownUserAgents = [
    { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', expected: 'windows' },
    { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', expected: 'macos' },
    { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', expected: 'linux' },
    { ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0', expected: 'linux' },
    { ua: '', expected: 'linux' }, // Empty string defaults to Linux
  ];

  knownUserAgents.forEach(({ ua, expected }) => {
    it(`should detect "${expected}" for user agent: ${ua.substring(0, 50)}...`, () => {
      expect(detectPlatform(ua)).toBe(expected);
    });
  });
});
