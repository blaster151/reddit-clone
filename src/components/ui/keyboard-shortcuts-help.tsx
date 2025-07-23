import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ShortcutAction, ShortcutConfig } from '@/hooks/useKeyboardShortcuts';

/**
 * Props for the KeyboardShortcutsHelp component
 */
interface KeyboardShortcutsHelpProps {
  /** Whether the help overlay is visible */
  visible: boolean;
  /** Function to close the help overlay */
  onClose: () => void;
  /** Configuration for all shortcuts */
  shortcuts: Record<string, ShortcutConfig>;
  /** CSS class names to apply */
  className?: string;
}

/**
 * Keyboard shortcuts help overlay component
 * 
 * This component displays a modal overlay showing all available
 * keyboard shortcuts in an organized, accessible format.
 * 
 * @param props - Component props
 * @returns JSX element representing the help overlay
 * 
 * @example
 * ```tsx
 * <KeyboardShortcutsHelp
 *   visible={showHelp}
 *   onClose={() => setShowHelp(false)}
 *   shortcuts={DEFAULT_SHORTCUTS}
 * />
 * ```
 */
export function KeyboardShortcutsHelp({
  visible,
  onClose,
  shortcuts,
  className
}: KeyboardShortcutsHelpProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    const handleHelpToggle = (event: CustomEvent) => {
      setIsVisible(event.detail.visible);
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('shortcuts-help-toggle', handleHelpToggle as EventListener);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('shortcuts-help-toggle', handleHelpToggle as EventListener);
    };
  }, [visible, onClose]);

  if (!isVisible) return null;

  /**
   * Formats a key combination for display
   */
  const formatKey = (key: string): string => {
    return key
      .replace('Ctrl+', '⌘')
      .replace('Alt+', '⌥')
      .replace('Shift+', '⇧')
      .replace('Meta+', '⌘')
      .replace('Enter', '↵')
      .replace('Escape', '⎋')
      .replace('ArrowUp', '↑')
      .replace('ArrowDown', '↓')
      .replace('ArrowLeft', '←')
      .replace('ArrowRight', '→')
      .replace('Space', 'Space')
      .replace('Tab', 'Tab')
      .replace('Backspace', '⌫')
      .replace('Delete', '⌦');
  };

  /**
   * Groups shortcuts by category
   */
  const groupedShortcuts = Object.entries(shortcuts).reduce((groups, [action, config]) => {
    if (!config || config.enabled === false) return groups;

    let category = 'General';
    
    if (['upvote', 'downvote'].includes(action)) {
      category = 'Voting';
    } else if (['reply', 'submit'].includes(action)) {
      category = 'Interaction';
    } else if (['next', 'previous'].includes(action)) {
      category = 'Navigation';
    } else if (['search', 'refresh'].includes(action)) {
      category = 'System';
    }

    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push({ action, ...config });
    return groups;
  }, {} as Record<string, Array<{ action: string } & ShortcutConfig>>);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        'transition-opacity duration-200',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden',
          'border border-gray-200 dark:border-gray-700'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="keyboard-shortcuts-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close keyboard shortcuts help"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map(({ action, key, description }) => (
                    <div
                      key={action}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {description}
                      </span>
                      <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-500">
                        {formatKey(key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-1 py-0.5 text-xs font-mono bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">⎋</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing keyboard shortcuts help overlay
 * 
 * @returns Object with help overlay state and functions
 */
export function useKeyboardShortcutsHelp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleHelpToggle = (event: CustomEvent) => {
      setVisible(event.detail.visible);
    };

    window.addEventListener('shortcuts-help-toggle', handleHelpToggle as EventListener);

    return () => {
      window.removeEventListener('shortcuts-help-toggle', handleHelpToggle as EventListener);
    };
  }, []);

  const showHelp = () => setVisible(true);
  const hideHelp = () => setVisible(false);
  const toggleHelp = () => setVisible(!visible);

  return {
    visible,
    showHelp,
    hideHelp,
    toggleHelp
  };
} 