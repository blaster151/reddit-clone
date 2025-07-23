import { useCallback } from 'react';
import { useUI } from '@/store';
import { Toast, ToastType } from '@/components/ui/toast';

/**
 * Options for showing a toast notification
 */
export interface ShowToastOptions {
  /** Title of the toast (optional) */
  title?: string;
  /** Duration in milliseconds before auto-dismiss (default: 5000) */
  duration?: number;
  /** Whether the toast should persist until manually dismissed */
  persistent?: boolean;
}

/**
 * Custom hook for managing toast notifications
 * 
 * This hook provides a simple interface for showing toast notifications
 * that integrates with the Zustand store. It includes:
 * - Success, error, info, and warning toast types
 * - Configurable duration and persistence
 * - Automatic integration with the global store
 * - Type-safe API for toast creation
 * 
 * @returns Object containing functions to show different types of toasts
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showSuccess, showError, showInfo, showWarning } = useToast();
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       await submitForm();
 *       showSuccess('Form submitted successfully!');
 *     } catch (error) {
 *       showError('Failed to submit form', { title: 'Error' });
 *     }
 *   };
 *   
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */
export function useToast() {
  const { addNotification, removeNotification } = useUI();

  /**
   * Shows a success toast notification
   * 
   * @param message - The message to display
   * @param options - Optional configuration for the toast
   */
  const showSuccess = useCallback((message: string, options?: ShowToastOptions) => {
    addNotification({
      type: 'success',
      message,
      title: options?.title,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [addNotification]);

  /**
   * Shows an error toast notification
   * 
   * @param message - The message to display
   * @param options - Optional configuration for the toast
   */
  const showError = useCallback((message: string, options?: ShowToastOptions) => {
    addNotification({
      type: 'error',
      message,
      title: options?.title,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [addNotification]);

  /**
   * Shows an info toast notification
   * 
   * @param message - The message to display
   * @param options - Optional configuration for the toast
   */
  const showInfo = useCallback((message: string, options?: ShowToastOptions) => {
    addNotification({
      type: 'info',
      message,
      title: options?.title,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [addNotification]);

  /**
   * Shows a warning toast notification
   * 
   * @param message - The message to display
   * @param options - Optional configuration for the toast
   */
  const showWarning = useCallback((message: string, options?: ShowToastOptions) => {
    addNotification({
      type: 'warning',
      message,
      title: options?.title,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [addNotification]);

  /**
   * Shows a custom toast notification
   * 
   * @param type - The type of toast to show
   * @param message - The message to display
   * @param options - Optional configuration for the toast
   */
  const showToast = useCallback((type: ToastType, message: string, options?: ShowToastOptions) => {
    addNotification({
      type,
      message,
      title: options?.title,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [addNotification]);

  /**
   * Removes a specific toast notification
   * 
   * @param id - The ID of the toast to remove
   */
  const removeToast = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showToast,
    removeToast,
  };
} 