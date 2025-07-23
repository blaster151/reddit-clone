import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Notification types supported by the system
 */
export type NotificationType = 
  | 'mention' 
  | 'reply' 
  | 'upvote' 
  | 'downvote' 
  | 'mod_action' 
  | 'subreddit_update' 
  | 'system';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  metadata?: {
    postId?: string;
    commentId?: string;
    subredditId?: string;
    userId?: string;
    [key: string]: any;
  };
}

/**
 * Notification settings interface
 */
export interface NotificationSettings {
  mentions: boolean;
  replies: boolean;
  upvotes: boolean;
  downvotes: boolean;
  modActions: boolean;
  subredditUpdates: boolean;
  systemMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

/**
 * Options for the useNotifications hook
 */
interface UseNotificationsOptions {
  /** Initial notifications to load */
  initialNotifications?: Notification[];
  /** Whether to enable real-time updates */
  enableRealtime?: boolean;
  /** WebSocket URL for real-time notifications */
  websocketUrl?: string;
  /** Maximum number of notifications to keep in memory */
  maxNotifications?: number;
  /** Auto-mark as read after this many seconds */
  autoReadDelay?: number;
  /** Whether to show desktop notifications */
  enableDesktopNotifications?: boolean;
}

/**
 * Return type for the useNotifications hook
 */
interface UseNotificationsReturn {
  /** All notifications */
  notifications: Notification[];
  /** Unread notifications */
  unreadNotifications: Notification[];
  /** Number of unread notifications */
  unreadCount: number;
  /** Add a new notification */
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  /** Mark notification as read */
  markAsRead: (notificationId: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => void;
  /** Remove a notification */
  removeNotification: (notificationId: string) => void;
  /** Clear all notifications */
  clearAll: () => void;
  /** Get notifications by type */
  getNotificationsByType: (type: NotificationType) => Notification[];
  /** Check if notifications are enabled for a type */
  isNotificationEnabled: (type: NotificationType) => boolean;
  /** Update notification settings */
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  /** Current notification settings */
  settings: NotificationSettings;
  /** Whether real-time connection is active */
  isConnected: boolean;
  /** Connection error if any */
  connectionError: string | null;
}

/**
 * Default notification settings
 */
const defaultSettings: NotificationSettings = {
  mentions: true,
  replies: true,
  upvotes: true,
  downvotes: false,
  modActions: true,
  subredditUpdates: true,
  systemMessages: true,
  emailNotifications: false,
  pushNotifications: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

/**
 * Generate a unique notification ID
 */
const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if current time is within quiet hours
 */
const isInQuietHours = (settings: NotificationSettings): boolean => {
  if (!settings.quietHours.enabled) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Handles overnight quiet hours (e.g., 22:00 to 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
};

/**
 * Custom hook for managing user notifications
 * 
 * This hook provides comprehensive notification management including:
 * - Real-time notification updates via WebSocket
 * - Notification filtering and grouping
 * - Read/unread status management
 * - Notification settings and preferences
 * - Desktop notification support
 * - Quiet hours functionality
 * 
 * @param options - Configuration options for the notification system
 * @returns Object with notification state and management functions
 * 
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   addNotification,
 *   markAsRead
 * } = useNotifications({
 *   enableRealtime: true,
 *   websocketUrl: 'ws://localhost:3001/notifications'
 * });
 * ```
 */
export function useNotifications({
  initialNotifications = [],
  enableRealtime = false,
  websocketUrl,
  maxNotifications = 100,
  autoReadDelay = 5000,
  enableDesktopNotifications = true,
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const autoReadTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Add a new notification
   */
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    // Check if notifications are enabled for this type
    if (!isNotificationEnabled(notificationData.type)) {
      return;
    }

    // Check quiet hours
    if (isInQuietHours(settings)) {
      return;
    }

    const newNotification: Notification = {
      ...notificationData,
      id: generateNotificationId(),
      createdAt: new Date(),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the latest notifications
      return updated.slice(0, maxNotifications);
    });

    // Show desktop notification if enabled
    if (enableDesktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
        requireInteraction: newNotification.priority === 'urgent',
      });
    }

    // Auto-mark as read after delay (except for urgent notifications)
    if (autoReadDelay > 0 && newNotification.priority !== 'urgent') {
      const timeout = setTimeout(() => {
        markAsRead(newNotification.id);
      }, autoReadDelay);
      
      autoReadTimeoutsRef.current.set(newNotification.id, timeout);
    }
  }, [settings, enableDesktopNotifications, autoReadDelay, maxNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );

    // Clear auto-read timeout if it exists
    const timeout = autoReadTimeoutsRef.current.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      autoReadTimeoutsRef.current.delete(notificationId);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );

    // Clear all auto-read timeouts
    autoReadTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    autoReadTimeoutsRef.current.clear();
  }, []);

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );

    // Clear auto-read timeout if it exists
    const timeout = autoReadTimeoutsRef.current.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      autoReadTimeoutsRef.current.delete(notificationId);
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    
    // Clear all auto-read timeouts
    autoReadTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    autoReadTimeoutsRef.current.clear();
  }, []);

  /**
   * Get notifications by type
   */
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  /**
   * Check if notifications are enabled for a type
   */
  const isNotificationEnabled = useCallback((type: NotificationType): boolean => {
    switch (type) {
      case 'mention':
        return settings.mentions;
      case 'reply':
        return settings.replies;
      case 'upvote':
        return settings.upvotes;
      case 'downvote':
        return settings.downvotes;
      case 'mod_action':
        return settings.modActions;
      case 'subreddit_update':
        return settings.subredditUpdates;
      case 'system':
        return settings.systemMessages;
      default:
        return true;
    }
  }, [settings]);

  /**
   * Update notification settings
   */
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Request desktop notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  /**
   * Setup WebSocket connection for real-time notifications
   */
  useEffect(() => {
    if (!enableRealtime || !websocketUrl) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(websocketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              addNotification(data.notification);
            }
          } catch (error) {
            console.error('Failed to parse notification data:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          setConnectionError('WebSocket connection failed');
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        setConnectionError('Failed to establish WebSocket connection');
        console.error('WebSocket connection error:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enableRealtime, websocketUrl, addNotification]);

  /**
   * Request notification permission on mount
   */
  useEffect(() => {
    if (enableDesktopNotifications) {
      requestNotificationPermission();
    }
  }, [enableDesktopNotifications, requestNotificationPermission]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      autoReadTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      autoReadTimeoutsRef.current.clear();
    };
  }, []);

  // Computed values
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    isNotificationEnabled,
    updateSettings,
    settings,
    isConnected,
    connectionError,
  };
} 