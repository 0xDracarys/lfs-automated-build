'use client';

/**
 * CommandBlock Component
 * 
 * Displays a shell command with copy-to-clipboard functionality.
 * Used throughout the wizard to show executable commands.
 */

import { useState } from 'react';
import { Copy, Check, AlertTriangle, Shield } from 'lucide-react';

interface CommandBlockProps {
  /** The command to display */
  command: string;
  /** Optional description of what the command does */
  description?: string;
  /** Whether the command can be copied (default: true) */
  copyable?: boolean;
  /** Whether this command requires sudo/admin privileges */
  requiresSudo?: boolean;
  /** Optional warning message to display */
  warning?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * Copy text to clipboard
 * Returns true if successful, false otherwise
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CommandBlock({
  command,
  description,
  copyable = true,
  requiresSudo = false,
  warning,
  className = '',
}: CommandBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(command);
    
    if (success) {
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  // Check if command is a comment (starts with #)
  const isComment = command.trim().startsWith('#');

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      {/* Description */}
      {description && (
        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
          <p className="text-sm text-gray-300">{description}</p>
        </div>
      )}

      {/* Warning */}
      {warning && (
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-400">{warning}</p>
        </div>
      )}

      {/* Command */}
      <div className="relative bg-black/50 group">
        {/* Sudo indicator */}
        {requiresSudo && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded text-xs text-orange-400">
            <Shield className="h-3 w-3" />
            sudo
          </div>
        )}

        {/* Command text */}
        <pre className={`p-4 ${requiresSudo ? 'pt-10' : ''} overflow-x-auto`}>
          <code className={`text-sm font-mono ${isComment ? 'text-gray-500' : 'text-green-400'}`}>
            {command}
          </code>
        </pre>

        {/* Copy button */}
        {copyable && !isComment && (
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : copyError
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100'
            }`}
            title={copied ? 'Copied!' : copyError ? 'Failed to copy' : 'Copy to clipboard'}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Multi-line command block for displaying multiple commands
 */
interface MultiCommandBlockProps {
  commands: Array<{
    command: string;
    description?: string;
  }>;
  title?: string;
  copyable?: boolean;
  className?: string;
}

export function MultiCommandBlock({
  commands,
  title,
  copyable = true,
  className = '',
}: MultiCommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const allCommands = commands
    .map(c => c.command)
    .filter(cmd => !cmd.trim().startsWith('#'))
    .join('\n');

  const handleCopyAll = async () => {
    const success = await copyToClipboard(allCommands);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-white/10 ${className}`}>
      {/* Header */}
      {title && (
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-medium text-white">{title}</h4>
          {copyable && (
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy All
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Commands */}
      <div className="bg-black/50 p-4 space-y-3">
        {commands.map((cmd, index) => (
          <div key={index}>
            {cmd.description && (
              <p className="text-xs text-gray-500 mb-1"># {cmd.description}</p>
            )}
            <code className={`text-sm font-mono ${
              cmd.command.trim().startsWith('#') ? 'text-gray-500' : 'text-green-400'
            }`}>
              {cmd.command}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommandBlock;
