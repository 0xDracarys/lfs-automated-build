/**
 * Wizard Storage Utility
 * 
 * Handles persistence of wizard progress to localStorage.
 * Includes schema versioning for future migrations.
 * 
 * Property 2: Progress Persistence Round-Trip
 * For any valid wizard progress state, saving to localStorage and then
 * loading SHALL produce an equivalent progress state.
 */

import {
  WizardProgress,
  StoredProgress,
  WIZARD_STORAGE_KEY,
  WIZARD_STORAGE_VERSION,
  DEFAULT_PROGRESS,
} from '@/lib/types/wizard';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a progress object has all required fields
 */
function isValidProgress(progress: unknown): progress is WizardProgress {
  if (!progress || typeof progress !== 'object') {
    return false;
  }
  
  const p = progress as Record<string, unknown>;
  
  return (
    Array.isArray(p.completedStages) &&
    typeof p.currentStage === 'number' &&
    typeof p.platform === 'string' &&
    ['windows', 'linux', 'macos'].includes(p.platform as string) &&
    (p.distro === null || typeof p.distro === 'string') &&
    typeof p.startedAt === 'string' &&
    typeof p.lastUpdated === 'string'
  );
}

/**
 * Migrate progress from older schema versions
 */
function migrateProgress(stored: StoredProgress): WizardProgress {
  // Currently only version 1, but this function handles future migrations
  if (stored.version === WIZARD_STORAGE_VERSION) {
    return stored.progress;
  }
  
  // Future migration logic would go here
  // For now, if version doesn't match, return the progress as-is
  // or reset to defaults if invalid
  if (isValidProgress(stored.progress)) {
    return stored.progress;
  }
  
  return DEFAULT_PROGRESS;
}

/**
 * Save wizard progress to localStorage
 * 
 * @param progress - The progress state to save
 * @returns true if saved successfully, false otherwise
 */
export function saveProgress(progress: WizardProgress): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }
  
  try {
    const stored: StoredProgress = {
      version: WIZARD_STORAGE_VERSION,
      progress,
    };
    
    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch (error) {
    console.error('Failed to save wizard progress:', error);
    return false;
  }
}

/**
 * Load wizard progress from localStorage
 * 
 * @returns The stored progress, or null if not found or invalid
 */
export function loadProgress(): WizardProgress | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  try {
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    
    const stored = JSON.parse(raw) as StoredProgress;
    
    // Validate the stored data
    if (!stored || typeof stored.version !== 'number' || !stored.progress) {
      console.warn('Invalid stored progress format, clearing');
      clearProgress();
      return null;
    }
    
    // Migrate if needed
    const progress = migrateProgress(stored);
    
    // Final validation
    if (!isValidProgress(progress)) {
      console.warn('Invalid progress data after migration, clearing');
      clearProgress();
      return null;
    }
    
    return progress;
  } catch (error) {
    console.error('Failed to load wizard progress:', error);
    clearProgress();
    return null;
  }
}

/**
 * Clear wizard progress from localStorage
 * 
 * @returns true if cleared successfully, false otherwise
 */
export function clearProgress(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    window.localStorage.removeItem(WIZARD_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear wizard progress:', error);
    return false;
  }
}

/**
 * Check if there is existing progress saved
 * 
 * @returns true if progress exists, false otherwise
 */
export function hasStoredProgress(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  return window.localStorage.getItem(WIZARD_STORAGE_KEY) !== null;
}

/**
 * Get the storage version of saved progress
 * 
 * @returns The version number, or null if no progress is saved
 */
export function getStoredVersion(): number | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  try {
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    
    const stored = JSON.parse(raw) as StoredProgress;
    return stored.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Export progress as JSON string (for debugging or backup)
 * 
 * @returns JSON string of the progress, or null if not available
 */
export function exportProgress(): string | null {
  const progress = loadProgress();
  if (!progress) {
    return null;
  }
  
  return JSON.stringify(progress, null, 2);
}

/**
 * Import progress from JSON string (for restoring backup)
 * 
 * @param json - JSON string of progress to import
 * @returns true if imported successfully, false otherwise
 */
export function importProgress(json: string): boolean {
  try {
    const progress = JSON.parse(json) as WizardProgress;
    
    if (!isValidProgress(progress)) {
      console.error('Invalid progress data in import');
      return false;
    }
    
    return saveProgress(progress);
  } catch (error) {
    console.error('Failed to import progress:', error);
    return false;
  }
}
