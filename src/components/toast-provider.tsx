import React from 'react';
import { ToastContainer } from '@/components/ui/toast';
import { useUI } from '@/store';

/**
 * Toast provider component
 * 
 * This component integrates the toast notification system with the Zustand store.
 * It renders the ToastContainer and manages the display of notifications
 * throughout the application.
 * 
 * @returns JSX element that renders the toast container
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <div>
 *       <ToastProvider />
 *       <OtherComponents />
 *     </div>
 *   );
 * }
 * ```
 */
export function ToastProvider() {
  const { notifications, removeNotification } = useUI();

  // Convert store notifications to toast format
  const toasts = notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    duration: notification.duration,
    persistent: notification.persistent,
  }));

  return (
    <ToastContainer
      toasts={toasts}
      onRemove={removeNotification}
      position="top-right"
      maxToasts={5}
    />
  );
} 