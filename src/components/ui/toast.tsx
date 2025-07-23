import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

/**
 * Props for the Toast component
 */
interface ToastProps {
  /** Toast notification data */
  toast: Toast;
  /** Function to remove the toast */
  onRemove: (id: string) => void;
  /** Position of the toast (top-right, top-left, bottom-right, bottom-left) */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Toast notification component
 * 
 * This component displays a single toast notification with:
 * - Different styles for success, error, info, and warning types
 * - Auto-dismiss functionality with configurable duration
 * - Manual dismiss button
 * - Smooth enter/exit animations
 * - Accessible design with proper ARIA labels
 * 
 * @param props - Component props including toast data and callbacks
 * @returns JSX element representing the toast notification
 * 
 * @example
 * ```tsx
 * <Toast 
 *   toast={{ id: '1', type: 'success', message: 'Post created successfully!' }}
 *   onRemove={(id) => console.log('Removing toast:', id)}
 * />
 * ```
 */
export function Toast({ toast, onRemove, position = 'top-right' }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.persistent) return;

    const timer = setTimeout(() => {
      handleRemove();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, toast.persistent]);

  // Show toast on mount
  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(showTimer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match the exit animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getToastStyles = () => {
    const baseStyles = 'flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm transition-all duration-300 ease-in-out';
    
    const typeStyles = {
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    const positionStyles = {
      'top-right': 'translate-x-full opacity-0',
      'top-left': '-translate-x-full opacity-0',
      'bottom-right': 'translate-x-full opacity-0',
      'bottom-left': '-translate-x-full opacity-0',
    };

    const visibleStyles = {
      'top-right': 'translate-x-0 opacity-100',
      'top-left': 'translate-x-0 opacity-100',
      'bottom-right': 'translate-x-0 opacity-100',
      'bottom-left': 'translate-x-0 opacity-100',
    };

    const exitingStyles = {
      'top-right': 'translate-x-full opacity-0',
      'top-left': '-translate-x-full opacity-0',
      'bottom-right': 'translate-x-full opacity-0',
      'bottom-left': '-translate-x-full opacity-0',
    };

    return cn(
      baseStyles,
      typeStyles[toast.type],
      isVisible 
        ? visibleStyles[position] 
        : isExiting 
          ? exitingStyles[position] 
          : positionStyles[position]
    );
  };

  return (
    <div
      className={getToastStyles()}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-testid={`toast-${toast.type}`}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-medium mb-1" data-testid="toast-title">
            {toast.title}
          </h4>
        )}
        <p className="text-sm" data-testid="toast-message">
          {toast.message}
        </p>
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
        data-testid="toast-dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Props for the ToastContainer component
 */
interface ToastContainerProps {
  /** Array of toast notifications to display */
  toasts: Toast[];
  /** Function to remove a toast */
  onRemove: (id: string) => void;
  /** Position of the toast container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
}

/**
 * Toast container component
 * 
 * This component manages multiple toast notifications with:
 * - Positioned container for toast stacking
 * - Maximum toast limit to prevent screen overflow
 * - Proper z-index and positioning
 * - Accessibility features for screen readers
 * 
 * @param props - Component props including toast array and callbacks
 * @returns JSX element representing the toast container
 * 
 * @example
 * ```tsx
 * <ToastContainer 
 *   toasts={toasts}
 *   onRemove={removeToast}
 *   position="top-right"
 *   maxToasts={5}
 * />
 * ```
 */
export function ToastContainer({ 
  toasts, 
  onRemove, 
  position = 'top-right',
  maxToasts = 5 
}: ToastContainerProps) {
  const visibleToasts = toasts.slice(0, maxToasts);

  const getContainerStyles = () => {
    const baseStyles = 'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none';
    
    const positionStyles = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
    };

    return cn(baseStyles, positionStyles[position]);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div 
      className={getContainerStyles()}
      aria-label="Notifications"
      data-testid="toast-container"
    >
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast 
            toast={toast} 
            onRemove={onRemove} 
            position={position}
          />
        </div>
      ))}
    </div>
  );
} 