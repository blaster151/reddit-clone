import { useEffect, useRef, useCallback } from 'react';

/**
 * Keyboard navigation hook for managing focus and keyboard shortcuts
 * 
 * This hook provides comprehensive keyboard navigation features including:
 * - Focus management for modals and dropdowns
 * - Keyboard shortcuts for common actions
 * - Arrow key navigation for lists and grids
 * - Escape key handling for closing modals/dropdowns
 * - Tab key management for accessibility
 * 
 * @param options - Configuration options for keyboard navigation
 * @returns Object with focus management functions and event handlers
 * 
 * @example
 * ```tsx
 * const { handleKeyDown, focusFirstItem, focusLastItem } = useKeyboardNavigation({
 *   onEscape: () => setModalOpen(false),
 *   onEnter: (index) => selectItem(index),
 *   itemsCount: 5
 * });
 * ```
 */
interface KeyboardNavigationOptions {
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  /** Callback when Enter key is pressed with current index */
  onEnter?: (index: number) => void;
  /** Number of focusable items */
  itemsCount?: number;
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Custom keyboard shortcuts */
  shortcuts?: Record<string, () => void>;
  /** Whether to trap focus within the component */
  trapFocus?: boolean;
}

interface KeyboardNavigationReturn {
  /** Key down event handler */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Focus the first focusable item */
  focusFirstItem: () => void;
  /** Focus the last focusable item */
  focusLastItem: () => void;
  /** Focus a specific item by index */
  focusItem: (index: number) => void;
  /** Get the current focused index */
  getFocusedIndex: () => number;
  /** Set the focused index */
  setFocusedIndex: (index: number) => void;
  /** Focus trap ref for modals */
  focusTrapRef: React.RefObject<HTMLDivElement | null>;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  itemsCount = 0,
  enabled = true,
  shortcuts = {},
  trapFocus = false
}: KeyboardNavigationOptions = {}): KeyboardNavigationReturn {
  const focusedIndex = useRef<number>(-1);
  const focusTrapRef = useRef<HTMLDivElement>(null);

  /**
   * Focus the first focusable item
   */
  const focusFirstItem = useCallback(() => {
    if (itemsCount > 0) {
      focusedIndex.current = 0;
      focusItem(0);
    }
  }, [itemsCount]);

  /**
   * Focus the last focusable item
   */
  const focusLastItem = useCallback(() => {
    if (itemsCount > 0) {
      focusedIndex.current = itemsCount - 1;
      focusItem(itemsCount - 1);
    }
  }, [itemsCount]);

  /**
   * Focus a specific item by index
   */
  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < itemsCount) {
      const focusableElements = focusTrapRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements[index]) {
        (focusableElements[index] as HTMLElement).focus();
        focusedIndex.current = index;
      }
    }
  }, [itemsCount]);

  /**
   * Get the current focused index
   */
  const getFocusedIndex = useCallback(() => {
    return focusedIndex.current;
  }, []);

  /**
   * Set the focused index
   */
  const setFocusedIndex = useCallback((index: number) => {
    if (index >= -1 && index < itemsCount) {
      focusedIndex.current = index;
    }
  }, [itemsCount]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled) return;

    const { key, ctrlKey, shiftKey, altKey } = event;

    // Handle Escape key
    if (key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Handle Enter key
    if (key === 'Enter' && onEnter && focusedIndex.current >= 0) {
      event.preventDefault();
      onEnter(focusedIndex.current);
      return;
    }

    // Handle arrow key navigation
    if (itemsCount > 0) {
      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (focusedIndex.current + 1) % itemsCount;
          focusItem(nextIndex);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = focusedIndex.current <= 0 ? itemsCount - 1 : focusedIndex.current - 1;
          focusItem(prevIndex);
          break;
        case 'Home':
          event.preventDefault();
          focusFirstItem();
          break;
        case 'End':
          event.preventDefault();
          focusLastItem();
          break;
      }
    }

    // Handle custom shortcuts
    const shortcutKey = [ctrlKey && 'Ctrl', shiftKey && 'Shift', altKey && 'Alt', key]
      .filter(Boolean)
      .join('+');
    
    if (shortcuts[shortcutKey]) {
      event.preventDefault();
      shortcuts[shortcutKey]();
    }
  }, [enabled, onEscape, onEnter, itemsCount, focusItem, focusFirstItem, focusLastItem, shortcuts]);

  /**
   * Handle focus trap for modals
   */
  useEffect(() => {
    if (!trapFocus || !focusTrapRef.current) return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = focusTrapRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [trapFocus]);

  return {
    handleKeyDown,
    focusFirstItem,
    focusLastItem,
    focusItem,
    getFocusedIndex,
    setFocusedIndex,
    focusTrapRef
  };
} 