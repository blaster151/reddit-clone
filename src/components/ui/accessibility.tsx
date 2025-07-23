import React from 'react';

/**
 * Props for the VisuallyHidden component
 */
interface VisuallyHiddenProps {
  /** Content to be hidden visually but available to screen readers */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VisuallyHidden component for screen reader-only content
 * 
 * This component hides content visually while keeping it accessible to screen readers.
 * Useful for providing additional context or instructions that shouldn't be visible.
 * 
 * @param props - Component props
 * @returns JSX element with visually hidden content
 * 
 * @example
 * ```tsx
 * <button>
 *   <span>Submit</span>
 *   <VisuallyHidden>Submit the form data</VisuallyHidden>
 * </button>
 * ```
 */
export function VisuallyHidden({ children, className = '' }: VisuallyHiddenProps) {
  return (
    <span
      className={`sr-only ${className}`}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {children}
    </span>
  );
}

/**
 * Props for the LiveRegion component
 */
interface LiveRegionProps {
  /** Content to announce to screen readers */
  children: React.ReactNode;
  /** ARIA live region politeness level */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Additional CSS classes */
  className?: string;
}

/**
 * LiveRegion component for screen reader announcements
 * 
 * This component creates an ARIA live region that announces content changes
 * to screen readers. Useful for notifications, status updates, and dynamic content.
 * 
 * @param props - Component props
 * @returns JSX element with live region functionality
 * 
 * @example
 * ```tsx
 * <LiveRegion politeness="polite">
 *   {notificationMessage}
 * </LiveRegion>
 * ```
 */
export function LiveRegion({ 
  children, 
  politeness = 'polite', 
  className = '' 
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {children}
    </div>
  );
}

/**
 * Props for the SkipLink component
 */
interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId: string;
  /** Link text */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkipLink component for keyboard navigation accessibility
 * 
 * This component creates a skip link that allows keyboard users to jump
 * to the main content, bypassing navigation menus and other repetitive content.
 * 
 * @param props - Component props
 * @returns JSX element with skip link functionality
 * 
 * @example
 * ```tsx
 * <SkipLink targetId="main-content">
 *   Skip to main content
 * </SkipLink>
 * ```
 */
export function SkipLink({ targetId, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-orange-600 ${className}`}
    >
      {children}
    </a>
  );
}

/**
 * Props for the FocusTrap component
 */
interface FocusTrapProps {
  /** Content to trap focus within */
  children: React.ReactNode;
  /** Whether focus trap is active */
  active?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FocusTrap component for modal and dropdown accessibility
 * 
 * This component traps focus within its children, preventing focus from
 * escaping to elements outside the component. Essential for modals and dropdowns.
 * 
 * @param props - Component props
 * @returns JSX element with focus trap functionality
 * 
 * @example
 * ```tsx
 * <FocusTrap active={isModalOpen}>
 *   <div className="modal-content">
 *     <button>Close</button>
 *   </div>
 * </FocusTrap>
 * ```
 */
export function FocusTrap({ children, active = true, className = '' }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

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
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Utility function to generate accessible button labels
 * 
 * @param action - The action being performed
 * @param target - The target of the action
 * @param context - Additional context
 * @returns Accessible label string
 * 
 * @example
 * ```tsx
 * const label = generateAccessibleLabel('upvote', 'post', 'by John Doe');
 * // Returns: "Upvote post by John Doe"
 * ```
 */
export function generateAccessibleLabel(
  action: string, 
  target: string, 
  context?: string
): string {
  const label = `${action} ${target}`;
  return context ? `${label} ${context}` : label;
}

/**
 * Utility function to generate ARIA-describedby IDs
 * 
 * @param baseId - Base ID for the element
 * @param description - Description type
 * @returns Unique ID for ARIA-describedby
 * 
 * @example
 * ```tsx
 * const describedBy = generateDescribedBy('post-123', 'error');
 * // Returns: "post-123-error-description"
 * ```
 */
export function generateDescribedBy(baseId: string, description: string): string {
  return `${baseId}-${description}-description`;
}

/**
 * Utility function to generate ARIA-labelledby IDs
 * 
 * @param baseId - Base ID for the element
 * @param label - Label type
 * @returns Unique ID for ARIA-labelledby
 * 
 * @example
 * ```tsx
 * const labelledBy = generateLabelledBy('post-123', 'title');
 * // Returns: "post-123-title-label"
 * ```
 */
export function generateLabelledBy(baseId: string, label: string): string {
  return `${baseId}-${label}-label`;
} 