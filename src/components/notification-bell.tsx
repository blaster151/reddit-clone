'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Check, X, Clock, AlertCircle, MessageCircle, ThumbsUp, ThumbsDown, Shield, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification, NotificationType } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/utils';
import { FocusTrap } from '@/components/ui/accessibility';

/**
 * Props for the NotificationBell component
 */
interface NotificationBellProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the notification count badge */
  showBadge?: boolean;
  /** Maximum number of notifications to show in dropdown */
  maxNotifications?: number;
  /** Whether to enable real-time updates */
  enableRealtime?: boolean;
  /** WebSocket URL for real-time notifications */
  websocketUrl?: string;
}

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'mention':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'reply':
      return <MessageCircle className="w-4 h-4 text-green-500" />;
    case 'upvote':
      return <ThumbsUp className="w-4 h-4 text-orange-500" />;
    case 'downvote':
      return <ThumbsDown className="w-4 h-4 text-blue-500" />;
    case 'mod_action':
      return <Shield className="w-4 h-4 text-red-500" />;
    case 'subreddit_update':
      return <Users className="w-4 h-4 text-purple-500" />;
    case 'system':
      return <Info className="w-4 h-4 text-gray-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

/**
 * Get priority color for notification
 */
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500 bg-red-50';
    case 'high':
      return 'border-l-orange-500 bg-orange-50';
    case 'medium':
      return 'border-l-yellow-500 bg-yellow-50';
    case 'low':
      return 'border-l-gray-500 bg-gray-50';
    default:
      return 'border-l-gray-300 bg-white';
  }
};

/**
 * NotificationBell component for displaying and managing notifications
 * 
 * This component provides:
 * - Notification count badge
 * - Dropdown with notification list
 * - Real-time notification updates
 * - Notification settings panel
 * - Mark as read functionality
 * - Notification filtering by type
 * 
 * @param props - Component props
 * @returns JSX element representing the notification bell
 * 
 * @example
 * ```tsx
 * <NotificationBell 
 *   showBadge={true}
 *   maxNotifications={10}
 *   enableRealtime={true}
 *   websocketUrl="ws://localhost:3001/notifications"
 * />
 * ```
 */
export function NotificationBell({
  className = '',
  showBadge = true,
  maxNotifications = 10,
  enableRealtime = false,
  websocketUrl,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
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
  } = useNotifications({
    enableRealtime,
    websocketUrl,
    maxNotifications: 50,
    autoReadDelay: 0, // Don't auto-read in bell component
    enableDesktopNotifications: true,
  });

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  /**
   * Toggle notification type setting
   */
  const toggleNotificationType = (type: NotificationType) => {
    const settingKey = type === 'mention' ? 'mentions' :
                      type === 'reply' ? 'replies' :
                      type === 'upvote' ? 'upvotes' :
                      type === 'downvote' ? 'downvotes' :
                      type === 'mod_action' ? 'modActions' :
                      type === 'subreddit_update' ? 'subredditUpdates' :
                      'systemMessages';
    
    updateSettings({ [settingKey]: !settings[settingKey] });
  };

  /**
   * Get display notifications (limited by maxNotifications)
   */
  const displayNotifications = notifications.slice(0, maxNotifications);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <FocusTrap active={true}>
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {isConnected && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                )}
                {connectionError && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="Connection error" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(activeTab === 'notifications' ? 'settings' : 'notifications')}
                  aria-label={activeTab === 'notifications' ? 'Open settings' : 'View notifications'}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    aria-label="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'notifications' ? (
                /* Notifications Tab */
                <div>
                  {displayNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {displayNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                  <time className="text-xs text-gray-500">
                                    {formatRelativeTime(notification.createdAt)}
                                  </time>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    aria-label="Remove notification"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                              {!notification.isRead && (
                                <div className="mt-1">
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {notifications.length > maxNotifications && (
                    <div className="p-4 text-center border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Showing {maxNotifications} of {notifications.length} notifications
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Settings Tab */
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                    <div className="space-y-2">
                      {(['mention', 'reply', 'upvote', 'downvote', 'mod_action', 'subreddit_update', 'system'] as NotificationType[]).map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isNotificationEnabled(type)}
                            onChange={() => toggleNotificationType(type)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(type)}
                            <span className="text-sm text-gray-700 capitalize">
                              {type.replace('_', ' ')}s
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Options</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.pushNotifications}
                          onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Desktop notifications</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Email notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Quiet Hours</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.quietHours.enabled}
                          onChange={(e) => updateSettings({ 
                            quietHours: { ...settings.quietHours, enabled: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Enable quiet hours</span>
                      </label>
                      {settings.quietHours.enabled && (
                        <div className="flex items-center gap-2 ml-6">
                          <input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => updateSettings({
                              quietHours: { ...settings.quietHours, start: e.target.value }
                            })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <input
                            type="time"
                            value={settings.quietHours.end}
                            onChange={(e) => updateSettings({
                              quietHours: { ...settings.quietHours, end: e.target.value }
                            })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="w-full"
                    >
                      Clear all notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FocusTrap>
      )}
    </div>
  );
} 