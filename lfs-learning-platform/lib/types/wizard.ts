/**
 * LFS Installer Wizard Type Definitions
 * 
 * These types define the data structures used throughout the wizard
 * for platform detection, stage management, progress tracking, and script generation.
 */

// ============================================================================
// Platform Types
// ============================================================================

/**
 * Supported operating systems for the wizard
 */
export type Platform = 'windows' | 'linux' | 'macos';

/**
 * Supported Linux distributions with specific package manager commands
 */
export type LinuxDistro = 'ubuntu' | 'debian' | 'fedora' | 'arch' | 'other';

/**
 * Boot type for GRUB installation
 */
export type BootType = 'bios' | 'uefi';

// ============================================================================
// Stage Types
// ============================================================================

/**
 * Status of a stage in the wizard
 */
export type StageStatus = 'locked' | 'available' | 'in-progress' | 'complete';

/**
 * A single command within a stage
 */
export interface StageCommand {
  /** Unique identifier for the command */
  id: string;
  /** Human-readable description of what the command does */
  description: string;
  /** The actual shell command to execute */
  command: string;
  /** Which platforms this command applies to */
  platforms: Platform[];
  /** If specified, only show for these Linux distros */
  distros?: LinuxDistro[];
  /** Whether this command is optional */
  isOptional?: boolean;
  /** Warning message to display before running this command */
  warningMessage?: string;
  /** Whether this command requires sudo/admin privileges */
  requiresSudo?: boolean;
}

/**
 * A troubleshooting item for common errors
 */
export interface TroubleshootingItem {
  /** The error message or symptom */
  error: string;
  /** How to fix the error */
  solution: string;
  /** Optional commands to help diagnose or fix the issue */
  commands?: string[];
}

/**
 * Complete information about a wizard stage
 */
export interface StageInfo {
  /** Unique stage identifier (1-12) */
  id: number;
  /** Full title of the stage */
  title: string;
  /** Short title for sidebar display */
  shortTitle: string;
  /** Detailed description of what this stage accomplishes */
  description: string;
  /** Estimated time to complete (e.g., "15-30 min", "2-4 hours") */
  estimatedTime: string;
  /** Disk space required for this stage */
  diskSpace: string;
  /** Stage IDs that must be complete before this stage is available */
  prerequisites: number[];
  /** Commands to execute in this stage */
  commands: StageCommand[];
  /** Common issues and their solutions */
  troubleshooting: TroubleshootingItem[];
  /** Optional icon name from lucide-react */
  icon?: string;
}

// ============================================================================
// Progress Types
// ============================================================================

/**
 * User's progress through the wizard
 */
export interface WizardProgress {
  /** Array of completed stage IDs */
  completedStages: number[];
  /** Currently active stage ID */
  currentStage: number;
  /** Detected or selected platform */
  platform: Platform;
  /** Selected Linux distribution (if on Linux) */
  distro: LinuxDistro | null;
  /** ISO timestamp when the wizard was started */
  startedAt: string;
  /** ISO timestamp of last progress update */
  lastUpdated: string;
}

/**
 * Schema for localStorage persistence
 */
export interface StoredProgress {
  /** Schema version for future migrations */
  version: number;
  /** The actual progress data */
  progress: WizardProgress;
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Wizard context state and actions
 */
export interface WizardContextType {
  /** Current stage being viewed */
  currentStage: number;
  /** Set of completed stage IDs */
  completedStages: Set<number>;
  /** Detected/selected platform */
  platform: Platform;
  /** Selected Linux distribution */
  distro: LinuxDistro | null;
  /** Full progress object */
  progress: WizardProgress;
  /** Whether the wizard is loading from storage */
  isLoading: boolean;
  
  // Actions
  /** Navigate to a specific stage */
  setCurrentStage: (stage: number) => void;
  /** Mark a stage as complete */
  markStageComplete: (stage: number) => void;
  /** Reset a stage (and dependent stages) */
  resetStage: (stage: number) => void;
  /** Reset all progress */
  resetAllProgress: () => void;
  /** Set the platform */
  setPlatform: (platform: Platform) => void;
  /** Set the Linux distribution */
  setDistro: (distro: LinuxDistro) => void;
  /** Check if a stage is accessible (prerequisites met) */
  isStageAccessible: (stage: number) => boolean;
  /** Get the status of a stage */
  getStageStatus: (stage: number) => StageStatus;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the CommandBlock component
 */
export interface CommandBlockProps {
  /** The command to display */
  command: string;
  /** Optional description */
  description?: string;
  /** Platform filter - only show if matches current platform */
  platform?: Platform;
  /** Whether the command can be copied */
  copyable?: boolean;
  /** Whether this command requires sudo */
  requiresSudo?: boolean;
  /** Optional warning message */
  warning?: string;
}

/**
 * Props for the ProgressSidebar component
 */
export interface ProgressSidebarProps {
  /** All stage information */
  stages: StageInfo[];
  /** Currently active stage */
  currentStage: number;
  /** Set of completed stage IDs */
  completedStages: Set<number>;
  /** Callback when a stage is clicked */
  onStageClick: (stage: number) => void;
}

/**
 * Props for the StageContent component
 */
export interface StageContentProps {
  /** The stage to display */
  stage: StageInfo;
  /** Current platform */
  platform: Platform;
  /** Current Linux distro (if applicable) */
  distro: LinuxDistro | null;
  /** Whether this stage is complete */
  isComplete: boolean;
  /** Callback to mark stage complete */
  onMarkComplete: () => void;
  /** Callback to go to next stage */
  onNextStage: () => void;
}

/**
 * Props for the StageActions component
 */
export interface StageActionsProps {
  /** Stage number for script generation */
  stageNumber: number;
  /** Whether this stage is complete */
  isComplete: boolean;
  /** Whether there's a next stage available */
  hasNextStage: boolean;
  /** Callback to mark complete */
  onMarkComplete: () => void;
  /** Callback to go to next stage */
  onNextStage: () => void;
  /** Callback to download stage script */
  onDownloadScript: () => void;
}

/**
 * Props for the TroubleshootingSection component
 */
export interface TroubleshootingSectionProps {
  /** Troubleshooting items to display */
  items: TroubleshootingItem[];
}

/**
 * Props for the ScriptGenerator
 */
export interface ScriptGeneratorOptions {
  /** Stage number to generate script for (undefined = all stages) */
  stageNumber?: number;
  /** Target platform */
  platform: Platform;
  /** Target Linux distro */
  distro?: LinuxDistro;
  /** Include comments in the script */
  includeComments?: boolean;
  /** Include error handling */
  includeErrorHandling?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Error type for wizard operations
 */
export interface WizardError {
  /** Error type */
  type: 'warning' | 'error';
  /** Error message */
  message: string;
  /** Optional action to resolve */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Platform detection result
 */
export interface PlatformDetectionResult {
  /** Detected platform */
  platform: Platform;
  /** Confidence level (0-1) */
  confidence: number;
  /** Raw user agent string */
  userAgent: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Current schema version for localStorage */
export const WIZARD_STORAGE_VERSION = 1;

/** localStorage key for wizard progress */
export const WIZARD_STORAGE_KEY = 'lfs-wizard-progress';

/** Total number of stages in the wizard */
export const TOTAL_STAGES = 12;

/** Default progress state */
export const DEFAULT_PROGRESS: WizardProgress = {
  completedStages: [],
  currentStage: 1,
  platform: 'linux',
  distro: null,
  startedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};
