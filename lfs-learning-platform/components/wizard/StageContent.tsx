'use client';

/**
 * StageContent Component
 * 
 * Displays the content of a single wizard stage including:
 * - Stage header with title and metadata
 * - List of commands to execute
 * - Troubleshooting section
 * - Action buttons
 */

import { Clock, HardDrive, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { StageInfo, Platform, LinuxDistro } from '@/lib/types/wizard';
import { getFilteredCommands } from '@/lib/data/wizard-stages';
import { CommandBlock } from './CommandBlock';

interface StageContentProps {
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
  /** Whether there's a next stage */
  hasNextStage: boolean;
  /** Callback to download stage script */
  onDownloadScript: () => void;
}

export function StageContent({
  stage,
  platform,
  distro,
  isComplete,
  onMarkComplete,
  onNextStage,
  hasNextStage,
  onDownloadScript,
}: StageContentProps) {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  // Get commands filtered for current platform/distro
  const commands = getFilteredCommands(stage, platform, distro);

  return (
    <div className="space-y-6">
      {/* Stage Header */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-500/20 rounded text-xs font-medium text-blue-400">
                Stage {stage.id}
              </span>
              {isComplete && (
                <span className="px-2 py-1 bg-green-500/20 rounded text-xs font-medium text-green-400">
                  ✓ Complete
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{stage.title}</h2>
            <p className="text-gray-400">{stage.description}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{stage.estimatedTime}</span>
          </div>
          {stage.diskSpace !== '0' && (
            <div className="flex items-center gap-2 text-gray-400">
              <HardDrive className="h-4 w-4" />
              <span>{stage.diskSpace} required</span>
            </div>
          )}
        </div>
      </div>

      {/* Commands */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Steps</h3>
        
        {commands.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <p className="text-gray-400">No commands for your platform in this stage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commands.map((cmd, index) => (
              <div key={cmd.id} className="flex gap-4">
                {/* Step number */}
                <div className="shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Command block */}
                <div className="flex-1">
                  <CommandBlock
                    command={cmd.command}
                    description={cmd.description}
                    requiresSudo={cmd.requiresSudo}
                    warning={cmd.warningMessage}
                    copyable={!cmd.command.trim().startsWith('#')}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Troubleshooting */}
      {stage.troubleshooting.length > 0 && (
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="font-medium text-white">Common Issues & Solutions</span>
            </div>
            {showTroubleshooting ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {showTroubleshooting && (
            <div className="p-4 space-y-4">
              {stage.troubleshooting.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-yellow-400 mb-2">❓ {item.error}</p>
                  <p className="text-gray-300 text-sm mb-2">✅ {item.solution}</p>
                  {item.commands && item.commands.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.commands.map((cmd, cmdIndex) => (
                        <code key={cmdIndex} className="block text-xs text-green-400 bg-black/30 px-2 py-1 rounded">
                          {cmd}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
        {!isComplete ? (
          <button
            onClick={onMarkComplete}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
          >
            Mark as Complete
          </button>
        ) : hasNextStage ? (
          <button
            onClick={onNextStage}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Continue to Next Stage →
          </button>
        ) : (
          <div className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
            <span className="text-green-400 font-semibold">🎉 All stages complete!</span>
          </div>
        )}

        <button
          onClick={onDownloadScript}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-all"
        >
          Download Script
        </button>
      </div>
    </div>
  );
}

export default StageContent;
