import { useEffect, useCallback, useRef } from 'react';

/**
 * Types of keyboard shortcuts supported
 */
export type ShortcutAction = 
  | 'upvote' 
  | 'downvote' 
  | 'reply' 
  | 'submit' 
  | 'cancel' 
  | 'next' 
  | 'previous' 
  | 'search' 
  | 'refresh' 
  | 'help';

/**
 * Configuration for a keyboard shortcut
 */
export interface ShortcutConfig {
  /** The key combination (e.g., 'k', 'Ctrl+k', 'Alt+Enter') */
  key: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Description of what the shortcut does */
  description: string;
  /** Whether the shortcut should be active */
  enabled?: boolean;
}

/**
 * Handler function for keyboard shortcuts
 */
export type ShortcutHandler = (event: KeyboardEvent) => void;

/**
 * Configuration object for all shortcuts
 */
export interface ShortcutsConfig {
  [action: string]: ShortcutConfig | undefined;
}

/**
 * Props for the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsProps {
  /** Configuration for all shortcuts */
  shortcuts: ShortcutsConfig;
  /** Handler functions for each shortcut action */
  handlers: Partial<Record<ShortcutAction, ShortcutHandler>>;
  /** Whether shortcuts are enabled globally */
  enabled?: boolean;
  /** Target element to listen for shortcuts (defaults to document) */
  target?: HTMLElement | null;
  /** Whether to show help overlay when '?' is pressed */
  showHelp?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * 
 * This hook provides a comprehensive keyboard shortcut system with:
 * - Configurable key combinations
 * - Action-based handlers
 * - Global enable/disable functionality
 * - Help system integration
 * - Accessibility considerations
 * 
 * @param props - Configuration and handlers for shortcuts
 * @returns Object with shortcut management functions
 * 
 * @example
 * ```tsx
 * const { isEnabled, toggleShortcuts, getShortcutHelp } = useKeyboardShortcuts({
 *   shortcuts: {
 *     upvote: { key: 'k', description: 'Upvote current post' },
 *     reply: { key: 'r', description: 'Reply to current post' },
 *     submit: { key: 'Ctrl+Enter', description: 'Submit form' }
 *   },
 *   handlers: {
 *     upvote: () => handleUpvote(),
 *     reply: () => handleReply(),
 *     submit: () => handleSubmit()
 *   }
 * });
 * ```
 */
export function useKeyboardShortcuts({
  shortcuts,
  handlers,
  enabled = true,
  target = null,
  showHelp = true
}: UseKeyboardShortcutsProps) {
  const isEnabledRef = useRef(enabled);
  const helpVisibleRef = useRef(false);

  /**
   * Parses a key combination string into a normalized format
   */
  const parseKey = useCallback((key: string): string => {
    return key.toLowerCase().replace(/\s+/g, '');
  }, []);

  /**
   * Checks if a keyboard event matches a key combination
   */
  const matchesKey = useCallback((event: KeyboardEvent, key: string): boolean => {
    const normalizedKey = parseKey(key);
    const eventKey = event.key.toLowerCase();
    
    // Handle special keys
    if (normalizedKey.includes('ctrl+') && !event.ctrlKey) return false;
    if (normalizedKey.includes('alt+') && !event.altKey) return false;
    if (normalizedKey.includes('shift+') && !event.shiftKey) return false;
    if (normalizedKey.includes('meta+') && !event.metaKey) return false;
    
    // Extract the main key
    const mainKey = normalizedKey.split('+').pop() || '';
    
    // Handle special key mappings
    const keyMap: Record<string, string> = {
      'enter': 'enter',
      'space': ' ',
      'escape': 'escape',
      'tab': 'tab',
      'backspace': 'backspace',
      'delete': 'delete',
      'arrowup': 'arrowup',
      'arrowdown': 'arrowdown',
      'arrowleft': 'arrowleft',
      'arrowright': 'arrowright',
      'home': 'home',
      'end': 'end',
      'pageup': 'pageup',
      'pagedown': 'pagedown'
    };
    
    const expectedKey = keyMap[mainKey] || mainKey;
    return eventKey === expectedKey;
  }, [parseKey]);

  /**
   * Handles keyboard events and triggers appropriate shortcuts
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabledRef.current) return;
    
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true'
    )) {
      return;
    }

    // Check for help shortcut
    if (showHelp && event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      helpVisibleRef.current = !helpVisibleRef.current;
      // Trigger help toggle event
      window.dispatchEvent(new CustomEvent('shortcuts-help-toggle', { 
        detail: { visible: helpVisibleRef.current } 
      }));
      return;
    }

    // Check each shortcut
    Object.entries(shortcuts).forEach(([action, config]) => {
      if (!config || !config.enabled !== false) return;
      
      if (matchesKey(event, config.key)) {
        if (config.preventDefault !== false) {
          event.preventDefault();
        }
        
        const handler = handlers[action as ShortcutAction];
        if (handler) {
          handler(event);
        }
      }
    });
  }, [shortcuts, handlers, matchesKey, showHelp]);

  /**
   * Enables or disables shortcuts
   */
  const toggleShortcuts = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
  }, []);

  /**
   * Sets the enabled state of shortcuts
   */
  const setShortcutsEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  /**
   * Gets the current enabled state
   */
  const isEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  /**
   * Gets help information for all shortcuts
   */
  const getShortcutHelp = useCallback(() => {
    return Object.entries(shortcuts)
      .filter(([_, config]) => config && config.enabled !== false)
      .map(([action, config]) => ({
        action: action as ShortcutAction,
        key: config!.key,
        description: config!.description
      }));
  }, [shortcuts]);

  /**
   * Registers a new shortcut
   */
  const registerShortcut = useCallback((action: ShortcutAction, config: ShortcutConfig) => {
    shortcuts[action] = config;
  }, [shortcuts]);

  /**
   * Unregisters a shortcut
   */
  const unregisterShortcut = useCallback((action: ShortcutAction) => {
    delete shortcuts[action];
  }, [shortcuts]);

  // Set up event listeners
  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const targetElement = target || document;
    
    const handleKeyDownWrapper = (event: Event) => {
      handleKeyDown(event as KeyboardEvent);
    };
    
    targetElement.addEventListener('keydown', handleKeyDownWrapper);
    
    return () => {
      targetElement.removeEventListener('keydown', handleKeyDownWrapper);
    };
  }, [handleKeyDown, target]);

  return {
    isEnabled,
    toggleShortcuts,
    setShortcutsEnabled,
    getShortcutHelp,
    registerShortcut,
    unregisterShortcut,
    helpVisible: helpVisibleRef.current
  };
}

/**
 * Default keyboard shortcuts for common Reddit-like actions
 */
export const DEFAULT_SHORTCUTS: ShortcutsConfig = {
  upvote: {
    key: 'k',
    description: 'Upvote current post/comment',
    preventDefault: true
  },
  downvote: {
    key: 'j',
    description: 'Downvote current post/comment',
    preventDefault: true
  },
  reply: {
    key: 'r',
    description: 'Reply to current post/comment',
    preventDefault: true
  },
  submit: {
    key: 'Ctrl+Enter',
    description: 'Submit form',
    preventDefault: true
  },
  cancel: {
    key: 'Escape',
    description: 'Cancel current action',
    preventDefault: true
  },
  next: {
    key: 'ArrowDown',
    description: 'Navigate to next item',
    preventDefault: true
  },
  previous: {
    key: 'ArrowUp',
    description: 'Navigate to previous item',
    preventDefault: true
  },
  search: {
    key: 'Ctrl+k',
    description: 'Focus search bar',
    preventDefault: true
  },
  refresh: {
    key: 'F5',
    description: 'Refresh page',
    preventDefault: false
  },
  help: {
    key: '?',
    description: 'Show keyboard shortcuts help',
    preventDefault: true
  }
};

/**
 * Hook for managing keyboard shortcuts with default Reddit-like shortcuts
 * 
 * @param handlers - Handler functions for shortcut actions
 * @param options - Additional options for the hook
 * @returns Shortcut management functions
 */
export function useRedditShortcuts(
  handlers: Partial<Record<ShortcutAction, ShortcutHandler>>,
  options: Omit<UseKeyboardShortcutsProps, 'shortcuts' | 'handlers'> = {}
) {
  return useKeyboardShortcuts({
    shortcuts: DEFAULT_SHORTCUTS,
    handlers,
    ...options
  });
} 