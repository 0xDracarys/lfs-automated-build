'use client';

/**
 * ProgressSidebar Component
 * 
 * Displays the list of all wizard stages with their completion status.
 * Allows navigation between unlocked stages.
 */

import { 
  CheckCircle, 
  Lock, 
  Circle, 
  ChevronRight,
  Monitor,
  FolderOpen,
  Download,
  User,
  Settings,
  Wrench,
  Terminal,
  Package,
  FileText,
  Cpu,
  HardDrive,
} from 'lucide-react';
import { StageInfo, StageStatus } from '@/lib/types/wizard';

interface ProgressSidebarProps {
  /** All stage information */
  stages: StageInfo[];
  /** Currently active stage */
  currentStage: number;
  /** Set of completed stage IDs */
  completedStages: Set<number>;
  /** Callback when a stage is clicked */
  onStageClick: (stage: number) => void;
  /** Function to check if a stage is accessible */
  isStageAccessible: (stage: number) => boolean;
  /** Optional className */
  className?: string;
}

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  FolderOpen,
  Download,
  User,
  Settings,
  Wrench,
  Terminal,
  Package,
  FileText,
  Cpu,
  HardDrive,
  CheckCircle,
};

function getStageStatus(
  stageId: number,
  currentStage: number,
  completedStages: Set<number>,
  isAccessible: boolean
): StageStatus {
  if (completedStages.has(stageId)) {
    return 'complete';
  }
  if (currentStage === stageId) {
    return 'in-progress';
  }
  if (isAccessible) {
    return 'available';
  }
  return 'locked';
}

function StageIcon({ 
  status, 
  iconName 
}: { 
  status: StageStatus; 
  iconName?: string;
}) {
  if (status === 'complete') {
    return <CheckCircle className="h-5 w-5 text-green-400" />;
  }
  if (status === 'locked') {
    return <Lock className="h-5 w-5 text-gray-600" />;
  }
  
  // Use custom icon if provided
  if (iconName && iconMap[iconName]) {
    const Icon = iconMap[iconName];
    return <Icon className={`h-5 w-5 ${status === 'in-progress' ? 'text-blue-400' : 'text-gray-400'}`} />;
  }
  
  return <Circle className={`h-5 w-5 ${status === 'in-progress' ? 'text-blue-400' : 'text-gray-400'}`} />;
}

export function ProgressSidebar({
  stages,
  currentStage,
  completedStages,
  onStageClick,
  isStageAccessible,
  className = '',
}: ProgressSidebarProps) {
  const completedCount = completedStages.size;
  const totalStages = stages.length;
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden ${className}`}>
      {/* Progress Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Progress</h3>
          <span className="text-sm text-gray-400">
            {completedCount}/{totalStages} stages
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{progressPercent}% complete</p>
      </div>

      {/* Stage List */}
      <div className="p-2">
        {stages.map((stage) => {
          const isAccessible = isStageAccessible(stage.id);
          const status = getStageStatus(stage.id, currentStage, completedStages, isAccessible);
          const isClickable = status !== 'locked';
          const isCurrent = currentStage === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => isClickable && onStageClick(stage.id)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isCurrent
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : isClickable
                  ? 'hover:bg-white/5'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Stage Number & Icon */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'complete'
                  ? 'bg-green-500/20'
                  : status === 'in-progress'
                  ? 'bg-blue-500/20'
                  : status === 'available'
                  ? 'bg-white/10'
                  : 'bg-white/5'
              }`}>
                <StageIcon status={status} iconName={stage.icon} />
              </div>

              {/* Stage Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    status === 'complete'
                      ? 'text-green-400'
                      : status === 'in-progress'
                      ? 'text-blue-400'
                      : 'text-gray-500'
                  }`}>
                    Stage {stage.id}
                  </span>
                  {status === 'complete' && (
                    <span className="text-xs text-green-400">✓</span>
                  )}
                </div>
                <p className={`text-sm truncate ${
                  isCurrent ? 'text-white font-medium' : 'text-gray-300'
                }`}>
                  {stage.shortTitle}
                </p>
              </div>

              {/* Arrow for current/available */}
              {isClickable && (
                <ChevronRight className={`h-4 w-4 shrink-0 ${
                  isCurrent ? 'text-blue-400' : 'text-gray-600'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact progress indicator for mobile/header
 */
export function ProgressIndicator({
  completedCount,
  totalStages,
  currentStage,
}: {
  completedCount: number;
  totalStages: number;
  currentStage: number;
}) {
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: totalStages }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i + 1 < currentStage
                ? 'bg-green-500'
                : i + 1 === currentStage
                ? 'bg-blue-500'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-400">{progressPercent}%</span>
    </div>
  );
}

export default ProgressSidebar;
