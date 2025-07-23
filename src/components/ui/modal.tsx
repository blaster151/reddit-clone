import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Props for the Modal component
 */
interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title for accessibility */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** CSS class names to apply to the modal */
  className?: string;
  /** CSS class names to apply to the overlay */
  overlayClassName?: string;
  /** CSS class names to apply to the content */
  contentClassName?: string;
  /** Whether to close modal on overlay click */
  closeOnOverlayClick?: boolean;
  /** Whether to close modal on escape key */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to prevent body scroll when modal is open */
  preventScroll?: boolean;
  /** Custom close button text */
  closeButtonText?: string;
  /** Whether to focus the first focusable element on open */
  autoFocus?: boolean;
  /** Whether to return focus to the previous element on close */
  returnFocus?: boolean;
}

/**
 * Accessible modal component with comprehensive keyboard and screen reader support
 * 
 * This component provides:
 * - Proper focus management (traps focus within modal)
 * - Keyboard navigation (Escape to close, Tab to cycle)
 * - ARIA attributes for screen readers
 * - Click outside to close functionality
 * - Body scroll prevention
 * - Multiple size options
 * - Customizable styling
 * 
 * @param props - Component props
 * @returns JSX element representing the modal
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <p>Are you sure you want to proceed?</p>
 *   <button onClick={handleConfirm}>Confirm</button>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  overlayClassName,
  contentClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = 'md',
  preventScroll = true,
  closeButtonText = 'Close',
  autoFocus = true,
  returnFocus = true
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  /**
   * Gets all focusable elements within the modal
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
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
      modalRef.current.querySelectorAll(focusableSelectors.join(', '))
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
      
      if (autoFocus) {
        firstFocusableElement.current.focus();
      }
    }
  }, [getFocusableElements, autoFocus]);

  /**
   * Handles keyboard events for accessibility
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (closeOnEscape) {
          event.preventDefault();
          onClose();
        }
        break;
      
      case 'Tab':
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        
        if (event.shiftKey) {
          // Shift + Tab: move backwards
          if (document.activeElement === firstFocusableElement.current) {
            event.preventDefault();
            lastFocusableElement.current?.focus();
          }
        } else {
          // Tab: move forwards
          if (document.activeElement === lastFocusableElement.current) {
            event.preventDefault();
            firstFocusableElement.current?.focus();
          }
        }
        break;
    }
  }, [isOpen, closeOnEscape, onClose, getFocusableElements]);

  /**
   * Handles overlay click
   */
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  /**
   * Prevents body scroll when modal is open
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
   * Manages focus when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Set up focus management after a brief delay to ensure DOM is ready
      const timer = setTimeout(setupFocusManagement, 0);
      
      return () => clearTimeout(timer);
    } else if (returnFocus && previousActiveElement.current) {
      // Return focus to the previous element
      previousActiveElement.current.focus();
    }
  }, [isOpen, setupFocusManagement, returnFocus]);

  /**
   * Sets up keyboard event listeners
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        'transition-opacity duration-200',
        overlayClassName
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full mx-4',
          'border border-gray-200 dark:border-gray-700',
          'focus:outline-none',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={closeButtonText}
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div
          id="modal-description"
          className={cn('p-6', contentClassName)}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Props for the ConfirmModal component
 */
interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  /** Message to display */
  message: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Variant for the confirm button */
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Whether the confirm action is loading */
  isLoading?: boolean;
}

/**
 * Pre-built confirmation modal with standard layout
 * 
 * @param props - Component props
 * @returns JSX element representing the confirmation modal
 */
export function ConfirmModal({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
  onClose,
  ...modalProps
}: ConfirmModalProps) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel?.();
      onClose();
    }
  };

  return (
    <Modal {...modalProps} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              {
                'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': confirmVariant === 'default',
                'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500': confirmVariant === 'destructive',
                'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500': confirmVariant === 'outline',
                'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500': confirmVariant === 'secondary',
                'text-gray-700 hover:bg-gray-100 focus:ring-gray-500': confirmVariant === 'ghost',
                'text-blue-600 hover:text-blue-700 focus:ring-blue-500': confirmVariant === 'link'
              }
            )}
            type="button"
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
} 