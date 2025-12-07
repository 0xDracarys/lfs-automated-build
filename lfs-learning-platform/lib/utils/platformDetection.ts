/**
 * Platform Detection Utility
 * 
 * Detects the user's operating system from the browser's user agent string.
 * Used to show platform-specific instructions in the wizard.
 */

import { Platform, PlatformDetectionResult } from '@/lib/types/wizard';

/**
 * Detects the operating system from a user agent string.
 * 
 * @param userAgent - The browser's user agent string (defaults to navigator.userAgent)
 * @returns The detected platform: 'windows', 'linux', or 'macos'
 * 
 * Property 1: Platform Detection Consistency
 * For any user agent string, this function SHALL return exactly one of:
 * 'windows', 'linux', or 'macos', and the result SHALL be deterministic
 * for the same input.
 */
export function detectPlatform(userAgent?: string): Platform {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const lowerUA = ua.toLowerCase();
  
  // Check for Windows first (most common)
  if (lowerUA.includes('win')) {
    return 'windows';
  }
  
  // Check for macOS (before Linux, as Mac UA can contain 'linux' in some cases)
  if (lowerUA.includes('mac') || lowerUA.includes('darwin')) {
    return 'macos';
  }
  
  // Check for Linux
  if (
    lowerUA.includes('linux') ||
    lowerUA.includes('x11') ||
    lowerUA.includes('ubuntu') ||
    lowerUA.includes('debian') ||
    lowerUA.includes('fedora') ||
    lowerUA.includes('arch')
  ) {
    return 'linux';
  }
  
  // Default to Linux (most likely for LFS users)
  return 'linux';
}

/**
 * Detects the platform with additional metadata.
 * 
 * @param userAgent - The browser's user agent string
 * @returns Detection result with platform, confidence, and raw user agent
 */
export function detectPlatformWithDetails(userAgent?: string): PlatformDetectionResult {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const platform = detectPlatform(ua);
  
  // Calculate confidence based on how clear the detection is
  let confidence = 0.5; // Default confidence
  const lowerUA = ua.toLowerCase();
  
  if (platform === 'windows') {
    if (lowerUA.includes('windows nt')) {
      confidence = 0.95;
    } else if (lowerUA.includes('win')) {
      confidence = 0.8;
    }
  } else if (platform === 'macos') {
    if (lowerUA.includes('macintosh') || lowerUA.includes('mac os x')) {
      confidence = 0.95;
    } else if (lowerUA.includes('mac')) {
      confidence = 0.8;
    }
  } else if (platform === 'linux') {
    if (lowerUA.includes('linux')) {
      confidence = 0.9;
    } else if (lowerUA.includes('x11')) {
      confidence = 0.7;
    }
  }
  
  return {
    platform,
    confidence,
    userAgent: ua,
  };
}

/**
 * Gets a human-readable name for a platform.
 * 
 * @param platform - The platform identifier
 * @returns Human-readable platform name
 */
export function getPlatformDisplayName(platform: Platform): string {
  switch (platform) {
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'macos':
      return 'macOS';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the recommended shell for a platform.
 * 
 * @param platform - The platform identifier
 * @returns Recommended shell name
 */
export function getRecommendedShell(platform: Platform): string {
  switch (platform) {
    case 'windows':
      return 'WSL (Ubuntu)';
    case 'linux':
      return 'Bash';
    case 'macos':
      return 'Terminal (Bash/Zsh)';
    default:
      return 'Bash';
  }
}

/**
 * Checks if a platform can natively build LFS.
 * 
 * @param platform - The platform identifier
 * @returns Whether the platform can build LFS natively
 */
export function canBuildNatively(platform: Platform): boolean {
  return platform === 'linux';
}

/**
 * Gets setup instructions summary for a platform.
 * 
 * @param platform - The platform identifier
 * @returns Brief setup instructions
 */
export function getSetupSummary(platform: Platform): string {
  switch (platform) {
    case 'windows':
      return 'You will need to install Windows Subsystem for Linux (WSL) with Ubuntu to build LFS.';
    case 'linux':
      return 'Your system can build LFS natively. You will need to install some development packages.';
    case 'macos':
      return 'macOS cannot build LFS natively. You will need to use a Linux virtual machine or Docker.';
    default:
      return 'Please select your operating system to see setup instructions.';
  }
}
