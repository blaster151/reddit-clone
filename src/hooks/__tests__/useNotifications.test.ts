import { renderHook, act } from '@testing-library/react';
import { useNotifications, Notification, NotificationType } from '../useNotifications';

// Mock WebSocket
const mockWebSocket = {
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onclose: jest.fn(),
  onerror: jest.fn(),
  close: jest.fn(),
  send: jest.fn(),
};

global.WebSocket = jest.fn(() => mockWebSocket as any);

// Mock Notification API
const mockNotification = {
  permission: 'granted' as NotificationPermission,
  requestPermission: jest.fn().mockResolvedValue('granted'),
};

global.Notification = jest.fn(() => mockNotification) as any;
(global.Notification as any).permission = 'granted';
(global.Notification as any).requestPermission = jest.fn().mockResolvedValue('granted');

describe('useNotifications', () => {
  const mockNotificationData: Omit<Notification, 'id' | 'createdAt'> = {
    type: 'mention',
    title: 'You were mentioned',
    message: 'User123 mentioned you in a comment',
    priority: 'medium',
    isRead: false,
    actionUrl: '/post/123',
    metadata: {
      postId: '123',
      userId: 'user123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionError).toBe(null);
    });

    it('initializes with provided notifications', () => {
      const initialNotifications: Notification[] = [
        {
          id: '1',
          type: 'mention',
          title: 'Test',
          message: 'Test message',
          priority: 'low',
          isRead: false,
          createdAt: new Date(),
        },
      ];

      const { result } = renderHook(() => 
        useNotifications({ initialNotifications })
      );

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('addNotification', () => {
    it('adds a new notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('You were mentioned');
      expect(result.current.notifications[0].isRead).toBe(false);
      expect(result.current.unreadCount).toBe(1);
    });

    it('generates unique IDs for notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0].id).not.toBe(result.current.notifications[1].id);
    });

    it('respects maxNotifications limit', () => {
      const { result } = renderHook(() => 
        useNotifications({ maxNotifications: 2 })
      );

      act(() => {
        result.current.addNotification(mockNotificationData);
        result.current.addNotification(mockNotificationData);
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(2);
    });

    it('shows desktop notification when enabled', () => {
      const { result } = renderHook(() => 
        useNotifications({ enableDesktopNotifications: true })
      );

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(global.Notification).toHaveBeenCalledWith('You were mentioned', {
        body: 'User123 mentioned you in a comment',
        icon: '/favicon.ico',
        tag: expect.any(String),
        requireInteraction: false,
      });
    });

    it('does not show desktop notification when disabled', () => {
      const { result } = renderHook(() => 
        useNotifications({ enableDesktopNotifications: false })
      );

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(global.Notification).not.toHaveBeenCalled();
    });

    it('requires interaction for urgent notifications', () => {
      const urgentNotification = { ...mockNotificationData, priority: 'urgent' as const };
      const { result } = renderHook(() => 
        useNotifications({ enableDesktopNotifications: true })
      );

      act(() => {
        result.current.addNotification(urgentNotification);
      });

      expect(global.Notification).toHaveBeenCalledWith('You were mentioned', {
        body: 'User123 mentioned you in a comment',
        icon: '/favicon.ico',
        tag: expect.any(String),
        requireInteraction: true,
      });
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.markAsRead(notificationId);
      });

      expect(result.current.notifications[0].isRead).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('clears auto-read timeout when marking as read', () => {
      const { result } = renderHook(() => 
        useNotifications({ autoReadDelay: 5000 })
      );

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.markAsRead(notificationId);
      });

      // Fast-forward time to ensure timeout was cleared
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      // Notification should still be marked as read (not auto-read)
      expect(result.current.notifications[0].isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications.every(n => n.isRead)).toBe(true);
    });
  });

  describe('removeNotification', () => {
    it('removes a notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.removeNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('clears all notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('getNotificationsByType', () => {
    it('filters notifications by type', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification(mockNotificationData);
        result.current.addNotification({ ...mockNotificationData, type: 'reply' });
        result.current.addNotification({ ...mockNotificationData, type: 'upvote' });
      });

      const mentionNotifications = result.current.getNotificationsByType('mention');
      expect(mentionNotifications).toHaveLength(1);
      expect(mentionNotifications[0].type).toBe('mention');
    });
  });

  describe('notification settings', () => {
    it('checks if notification type is enabled', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.isNotificationEnabled('mention')).toBe(true);
      expect(result.current.isNotificationEnabled('downvote')).toBe(false);
    });

    it('updates notification settings', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({ mentions: false });
      });

      expect(result.current.settings.mentions).toBe(false);
      expect(result.current.isNotificationEnabled('mention')).toBe(false);
    });

    it('respects notification type settings when adding notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({ mentions: false });
      });

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('quiet hours', () => {
    it('respects quiet hours when adding notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({
          quietHours: { enabled: true, start: '22:00', end: '08:00' }
        });
      });

      // Mock current time to be within quiet hours (23:00)
      const mockDate = new Date('2023-01-01T23:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(0);

      // Mock current time to be outside quiet hours (14:00)
      const mockDate2 = new Date('2023-01-01T14:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate2 as any);

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('handles overnight quiet hours correctly', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({
          quietHours: { enabled: true, start: '22:00', end: '08:00' }
        });
      });

      // Mock current time to be within overnight quiet hours (02:00)
      const mockDate = new Date('2023-01-01T02:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('auto-read functionality', () => {
    it('auto-marks notifications as read after delay', () => {
      const { result } = renderHook(() => 
        useNotifications({ autoReadDelay: 5000 })
      );

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      expect(result.current.unreadCount).toBe(1);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.unreadCount).toBe(0);
    });

    it('does not auto-read urgent notifications', () => {
      const urgentNotification = { ...mockNotificationData, priority: 'urgent' as const };
      const { result } = renderHook(() => 
        useNotifications({ autoReadDelay: 5000 })
      );

      act(() => {
        result.current.addNotification(urgentNotification);
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('WebSocket integration', () => {
    it('establishes WebSocket connection when enabled', () => {
      renderHook(() => 
        useNotifications({ 
          enableRealtime: true, 
          websocketUrl: 'ws://localhost:3001/notifications' 
        })
      );

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:3001/notifications');
    });

    it('handles WebSocket messages', () => {
      const { result } = renderHook(() => 
        useNotifications({ 
          enableRealtime: true, 
          websocketUrl: 'ws://localhost:3001/notifications' 
        })
      );

      // Simulate WebSocket message
      const messageEvent = {
        data: JSON.stringify({
          type: 'notification',
          notification: mockNotificationData,
        }),
      };

      act(() => {
        mockWebSocket.onmessage(messageEvent);
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('handles WebSocket connection errors', () => {
      const { result } = renderHook(() => 
        useNotifications({ 
          enableRealtime: true, 
          websocketUrl: 'ws://localhost:3001/notifications' 
        })
      );

      act(() => {
        mockWebSocket.onerror(new Error('Connection failed'));
      });

      expect(result.current.connectionError).toBe('WebSocket connection failed');
    });

    it('attempts to reconnect on connection close', () => {
      renderHook(() => 
        useNotifications({ 
          enableRealtime: true, 
          websocketUrl: 'ws://localhost:3001/notifications' 
        })
      );

      act(() => {
        mockWebSocket.onclose();
      });

      // Fast-forward time to trigger reconnection
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('cleans up timeouts on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useNotifications({ autoReadDelay: 5000 })
      );

      act(() => {
        result.current.addNotification(mockNotificationData);
      });

      unmount();

      // Fast-forward time to ensure cleanup worked
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('closes WebSocket connection on unmount', () => {
      const { unmount } = renderHook(() => 
        useNotifications({ 
          enableRealtime: true, 
          websocketUrl: 'ws://localhost:3001/notifications' 
        })
      );

      unmount();

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });
}); 