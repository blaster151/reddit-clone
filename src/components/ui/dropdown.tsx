import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Props for the Dropdown component
 */
interface DropdownProps {
  /** Trigger element that opens the dropdown */
  trigger: React.ReactNode;
  /** Dropdown content */
  children: React.ReactNode;
  /** Whether the dropdown is open */
  isOpen?: boolean;
  /** Function called when dropdown opens/closes */
  onToggle?: (isOpen: boolean) => void;
  /** CSS class names to apply to the dropdown container */
  className?: string;
  /** CSS class names to apply to the dropdown menu */
  menuClassName?: string;
  /** CSS class names to apply to the trigger */
  triggerClassName?: string;
  /** Placement of the dropdown relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to close dropdown when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close dropdown when pressing escape */
  closeOnEscape?: boolean;
  /** Whether to close dropdown when selecting an item */
  closeOnSelect?: boolean;
  /** Whether to prevent body scroll when dropdown is open */
  preventScroll?: boolean;
  /** Whether to show arrow indicator */
  showArrow?: boolean;
  /** Custom arrow component */
  arrow?: React.ReactNode;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
}

/**
 * Accessible dropdown component with comprehensive keyboard and screen reader support
 * 
 * This component provides:
 * - Proper focus management
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - ARIA attributes for screen readers
 * - Click outside to close functionality
 * - Multiple placement options
 * - Customizable styling
 * - Portal rendering for proper z-index handling
 * 
 * @param props - Component props
 * @returns JSX element representing the dropdown
 * 
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<button>Open Menu</button>}
 *   placement="bottom"
 *   closeOnSelect={true}
 * >
 *   <DropdownItem onClick={() => console.log('Option 1')}>
 *     Option 1
 *   </DropdownItem>
 *   <DropdownItem onClick={() => console.log('Option 2')}>
 *     Option 2
 *   </DropdownItem>
 * </Dropdown>
 * ```
 */
export function Dropdown({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  className,
  menuClassName,
  triggerClassName,
  placement = 'bottom',
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSelect = true,
  preventScroll = false,
  showArrow = true,
  arrow,
  disabled = false
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(open);
    }
    onToggle?.(open);
  };

  // Placement classes
  const placementClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  // Arrow placement classes
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-200 dark:border-l-gray-700',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-200 dark:border-r-gray-700'
  };

  /**
   * Gets all focusable elements within the dropdown menu
   */
  const getFocusableElements = useCallback(() => {
    if (!menuRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return Array.from(
      menuRef.current.querySelectorAll(focusableSelectors.join(', '))
    ) as HTMLElement[];
  }, []);

  /**
   * Sets up focus management
   */
  const setupFocusManagement = useCallback(() => {
    const focusableElements = getFocusableElements();
    
    if (focusableElements.length > 0) {
      firstFocusableElement.current = focusableElements[0];
      lastFocusableElement.current = focusableElements[focusableElements.length - 1];
      firstFocusableElement.current.focus();
    }
  }, [getFocusableElements]);

  /**
   * Handles keyboard events for accessibility
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (closeOnEscape) {
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        focusableElements[nextIndex].focus();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const elements = getFocusableElements();
        if (elements.length === 0) return;
        
        const currentIdx = elements.indexOf(document.activeElement as HTMLElement);
        const prevIndex = currentIdx > 0 ? currentIdx - 1 : elements.length - 1;
        elements[prevIndex].focus();
        break;
      
      case 'Home':
        event.preventDefault();
        firstFocusableElement.current?.focus();
        break;
      
      case 'End':
        event.preventDefault();
        lastFocusableElement.current?.focus();
        break;
    }
  }, [isOpen, closeOnEscape, getFocusableElements]);

  /**
   * Handles trigger click
   */
  const handleTriggerClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen, setIsOpen]);

  /**
   * Handles click outside
   */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      closeOnClickOutside &&
      isOpen &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, [closeOnClickOutside, isOpen, setIsOpen]);

  /**
   * Prevents body scroll when dropdown is open
   */
  useEffect(() => {
    if (isOpen && preventScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  /**
   * Manages focus when dropdown opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Set up focus management after a brief delay to ensure DOM is ready
      const timer = setTimeout(setupFocusManagement, 0);
      
      return () => clearTimeout(timer);
    } else if (previousActiveElement.current) {
      // Return focus to the previous element
      previousActiveElement.current.focus();
    }
  }, [isOpen, setupFocusManagement]);

  /**
   * Sets up event listeners
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleClickOutside);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen, handleKeyDown, handleClickOutside]);

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className={cn('cursor-pointer', triggerClassName)}
        onClick={handleTriggerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 min-w-[8rem] bg-white dark:bg-gray-800 rounded-md shadow-lg',
            'border border-gray-200 dark:border-gray-700 py-1',
            'focus:outline-none',
            placementClasses[placement],
            menuClassName
          )}
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
        >
          {/* Arrow */}
          {showArrow && (
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-transparent',
                arrowClasses[placement]
              )}
              aria-hidden="true"
            >
              {arrow}
            </div>
          )}
          
          {/* Menu Items */}
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onSelect: () => {
                  if (closeOnSelect) {
                    setIsOpen(false);
                  }
                }
              } as any);
            }
            return child;
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * Props for the DropdownItem component
 */
interface DropdownItemProps {
  /** Item content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is selected */
  selected?: boolean;
  /** CSS class names to apply */
  className?: string;
  /** Icon to display before the content */
  icon?: React.ReactNode;
  /** Whether to show a divider after this item */
  divider?: boolean;
  /** Custom onSelect handler (used internally by Dropdown) */
  onSelect?: () => void;
}

/**
 * Individual dropdown item component
 * 
 * @param props - Component props
 * @returns JSX element representing a dropdown item
 */
export function DropdownItem({
  children,
  onClick,
  disabled = false,
  selected = false,
  className,
  icon,
  divider = false,
  onSelect
}: DropdownItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      onSelect?.();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center px-4 py-2 text-sm cursor-pointer',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
          'transition-colors duration-150',
          {
            'opacity-50 cursor-not-allowed': disabled,
            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300': selected,
            'text-gray-700 dark:text-gray-300': !selected && !disabled
          },
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-selected={selected}
      >
        {icon && (
          <span className="mr-2 w-4 h-4" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </div>
      {divider && (
        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      )}
    </>
  );
}

/**
 * Props for the DropdownDivider component
 */
interface DropdownDividerProps {
  /** CSS class names to apply */
  className?: string;
}

/**
 * Divider component for dropdown menus
 * 
 * @param props - Component props
 * @returns JSX element representing a dropdown divider
 */
export function DropdownDivider({ className }: DropdownDividerProps) {
  return (
    <div
      className={cn(
        'border-t border-gray-200 dark:border-gray-700 my-1',
        className
      )}
      role="separator"
    />
  );
}

/**
 * Props for the DropdownHeader component
 */
interface DropdownHeaderProps {
  /** Header content */
  children: React.ReactNode;
  /** CSS class names to apply */
  className?: string;
}

/**
 * Header component for dropdown menus
 * 
 * @param props - Component props
 * @returns JSX element representing a dropdown header
 */
export function DropdownHeader({ children, className }: DropdownHeaderProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
        className
      )}
      role="presentation"
    >
      {children}
    </div>
  );
} 