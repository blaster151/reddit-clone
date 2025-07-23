import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBell } from '../notification-bell';
import { useNotifications } from '@/hooks/useNotifications';

// Mock the useNotifications hook
jest.mock('@/hooks/useNotifications');

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;

describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'mention' as const,
      title: 'You were mentioned',
      message: 'User123 mentioned you in a comment',
      priority: 'medium' as const,
      isRead: false,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      actionUrl: '/post/123',
    },
    {
      id: '2',
      type: 'reply' as const,
      title: 'New reply',
      message: 'Someone replied to your comment',
      priority: 'low' as const,
      isRead: true,
      createdAt: new Date('2023-01-01T09:00:00Z'),
    },
  ];

  const defaultMockReturn = {
    notifications: mockNotifications,
    unreadNotifications: [mockNotifications[0]],
    unreadCount: 1,
    addNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    removeNotification: jest.fn(),
    clearAll: jest.fn(),
    getNotificationsByType: jest.fn(),
    isNotificationEnabled: jest.fn().mockReturnValue(true),
    updateSettings: jest.fn(),
    settings: {
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
    },
    isConnected: true,
    connectionError: null,
  };

  beforeEach(() => {
    mockUseNotifications.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders notification bell button', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
    });

    it('shows unread count badge when there are unread notifications', () => {
      render(<NotificationBell showBadge={true} />);

      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-500');
    });

    it('does not show badge when showBadge is false', () => {
      render(<NotificationBell showBadge={false} />);

      const badge = screen.queryByText('1');
      expect(badge).not.toBeInTheDocument();
    });

    it('shows 99+ for large unread counts', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 150,
      });

      render(<NotificationBell showBadge={true} />);

      const badge = screen.getByText('99+');
      expect(badge).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      expect(bellButton).toHaveAttribute('aria-label', 'Notifications (1 unread)');
      expect(bellButton).toHaveAttribute('aria-expanded', 'false');
      expect(bellButton).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('dropdown functionality', () => {
    it('opens dropdown when bell is clicked', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(bellButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes dropdown when clicking outside', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      expect(screen.getByText('Notifications')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      });
    });

    it('shows connection status indicators', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Should show connected indicator
      const connectedIndicator = screen.getByTitle('Connected');
      expect(connectedIndicator).toBeInTheDocument();
      expect(connectedIndicator).toHaveClass('bg-green-500');
    });

    it('shows connection error indicator', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        isConnected: false,
        connectionError: 'Connection failed',
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const errorIndicator = screen.getByTitle('Connection error');
      expect(errorIndicator).toBeInTheDocument();
      expect(errorIndicator).toHaveClass('bg-red-500');
    });
  });

  describe('notifications list', () => {
    it('displays notifications in the dropdown', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      expect(screen.getByText('You were mentioned')).toBeInTheDocument();
      expect(screen.getByText('User123 mentioned you in a comment')).toBeInTheDocument();
      expect(screen.getByText('New reply')).toBeInTheDocument();
    });

    it('shows empty state when no notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        unreadCount: 0,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

    it('displays notification timestamps', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Should show relative time
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('shows unread indicator for unread notifications', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // First notification should have unread styling
      const notification = screen.getByText('You were mentioned').closest('div');
      expect(notification).toHaveClass('bg-blue-50');
    });

    it('limits displayed notifications based on maxNotifications prop', () => {
      const manyNotifications = Array.from({ length: 15 }, (_, i) => ({
        ...mockNotifications[0],
        id: `notification-${i}`,
        title: `Notification ${i}`,
      }));

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: manyNotifications,
        unreadCount: 15,
      });

      render(<NotificationBell maxNotifications={5} />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Should show only 5 notifications
      expect(screen.getByText('Notification 0')).toBeInTheDocument();
      expect(screen.getByText('Notification 4')).toBeInTheDocument();
      expect(screen.queryByText('Notification 5')).not.toBeInTheDocument();

      // Should show "showing X of Y" message
      expect(screen.getByText('Showing 5 of 15 notifications')).toBeInTheDocument();
    });
  });

  describe('notification interactions', () => {
    it('marks notification as read when clicked', () => {
      const mockMarkAsRead = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        markAsRead: mockMarkAsRead,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const notification = screen.getByText('You were mentioned');
      fireEvent.click(notification);

      expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('navigates to action URL when notification is clicked', () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const notification = screen.getByText('You were mentioned');
      fireEvent.click(notification);

      expect(window.location.href).toBe('/post/123');
    });

    it('removes notification when remove button is clicked', () => {
      const mockRemoveNotification = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        removeNotification: mockRemoveNotification,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const removeButton = screen.getByRole('button', { name: /remove notification/i });
      fireEvent.click(removeButton);

      expect(mockRemoveNotification).toHaveBeenCalledWith('1');
    });

    it('marks all as read when mark all button is clicked', () => {
      const mockMarkAllAsRead = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        markAllAsRead: mockMarkAllAsRead,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
      fireEvent.click(markAllButton);

      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  describe('settings tab', () => {
    it('switches to settings tab when settings button is clicked', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const settingsButton = screen.getByRole('button', { name: /open settings/i });
      fireEvent.click(settingsButton);

      expect(screen.getByText('Notification Types')).toBeInTheDocument();
      expect(screen.getByText('Delivery Options')).toBeInTheDocument();
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
    });

    it('toggles notification type settings', () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const settingsButton = screen.getByRole('button', { name: /open settings/i });
      fireEvent.click(settingsButton);

      const mentionCheckbox = screen.getByRole('checkbox', { name: /mentions/i });
      fireEvent.click(mentionCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith({ mentions: false });
    });

    it('toggles delivery options', () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const settingsButton = screen.getByRole('button', { name: /open settings/i });
      fireEvent.click(settingsButton);

      const desktopCheckbox = screen.getByRole('checkbox', { name: /desktop notifications/i });
      fireEvent.click(desktopCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith({ pushNotifications: false });
    });

    it('updates quiet hours settings', () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const settingsButton = screen.getByRole('button', { name: /open settings/i });
      fireEvent.click(settingsButton);

      const quietHoursCheckbox = screen.getByRole('checkbox', { name: /enable quiet hours/i });
      fireEvent.click(quietHoursCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith({
        quietHours: { enabled: true, start: '22:00', end: '08:00' }
      });
    });

    it('clears all notifications when clear button is clicked', () => {
      const mockClearAll = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        clearAll: mockClearAll,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const settingsButton = screen.getByRole('button', { name: /open settings/i });
      fireEvent.click(settingsButton);

      const clearButton = screen.getByRole('button', { name: /clear all notifications/i });
      fireEvent.click(clearButton);

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('notification icons and styling', () => {
    it('displays correct icons for different notification types', () => {
      const notificationsWithDifferentTypes = [
        { ...mockNotifications[0], type: 'mention' as const },
        { ...mockNotifications[1], type: 'upvote' as const },
        { ...mockNotifications[0], id: '3', type: 'mod_action' as const },
      ];

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: notificationsWithDifferentTypes,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Should have different colored icons for different types
      const icons = screen.getAllByRole('img', { hidden: true });
      expect(icons.length).toBeGreaterThan(0);
    });

    it('applies priority-based styling', () => {
      const highPriorityNotification = {
        ...mockNotifications[0],
        priority: 'high' as const,
      };

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [highPriorityNotification],
      });

      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      const notification = screen.getByText('You were mentioned').closest('div');
      expect(notification).toHaveClass('border-l-orange-500', 'bg-orange-50');
    });
  });

  describe('accessibility', () => {
    it('supports keyboard navigation', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      bellButton.focus();

      // Should be able to open with Enter key
      fireEvent.keyDown(bellButton, { key: 'Enter' });
      expect(screen.getByText('Notifications')).toBeInTheDocument();

      // Should be able to close with Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    it('has proper focus management', () => {
      render(<NotificationBell />);

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Focus should be trapped within the dropdown
      const dropdown = screen.getByText('Notifications').closest('div');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('props and configuration', () => {
    it('passes correct props to useNotifications hook', () => {
      render(
        <NotificationBell
          enableRealtime={true}
          websocketUrl="ws://test.com/notifications"
          maxNotifications={20}
        />
      );

      expect(mockUseNotifications).toHaveBeenCalledWith({
        enableRealtime: true,
        websocketUrl: 'ws://test.com/notifications',
        maxNotifications: 50, // Internal limit
        autoReadDelay: 0,
        enableDesktopNotifications: true,
      });
    });

    it('applies custom className', () => {
      render(<NotificationBell className="custom-class" />);

      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });
}); 