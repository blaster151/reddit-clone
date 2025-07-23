import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';
import { useUI } from '@/store';

// Mock the store
jest.mock('@/store', () => ({
  useUI: jest.fn(),
}));

const mockUseUI = useUI as jest.MockedFunction<typeof useUI>;

describe('useToast Hook', () => {
  const mockAddNotification = jest.fn();
  const mockRemoveNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUI.mockReturnValue({
      addNotification: mockAddNotification,
      removeNotification: mockRemoveNotification,
      notifications: [],
      theme: 'light',
      sidebarOpen: false,
      searchQuery: '',
      selectedSubreddit: null,
      setTheme: jest.fn(),
      toggleSidebar: jest.fn(),
      setSearchQuery: jest.fn(),
      setSelectedSubreddit: jest.fn(),
      markNotificationAsRead: jest.fn(),
      clearNotifications: jest.fn(),
    });
  });

  describe('showSuccess', () => {
    it('calls addNotification with success type and message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Operation completed successfully!');
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        message: 'Operation completed successfully!',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
    });

    it('calls addNotification with success type, message, and options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Operation completed successfully!', {
          title: 'Success',
          duration: 3000,
          persistent: false,
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        message: 'Operation completed successfully!',
        title: 'Success',
        duration: 3000,
        persistent: false,
      });
    });
  });

  describe('showError', () => {
    it('calls addNotification with error type and message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Something went wrong!');
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'error',
        message: 'Something went wrong!',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
    });

    it('calls addNotification with error type, message, and options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Something went wrong!', {
          title: 'Error',
          duration: 10000,
          persistent: true,
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'error',
        message: 'Something went wrong!',
        title: 'Error',
        duration: 10000,
        persistent: true,
      });
    });
  });

  describe('showInfo', () => {
    it('calls addNotification with info type and message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Here is some information.');
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'info',
        message: 'Here is some information.',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
    });

    it('calls addNotification with info type, message, and options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Here is some information.', {
          title: 'Information',
          duration: 7000,
          persistent: false,
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'info',
        message: 'Here is some information.',
        title: 'Information',
        duration: 7000,
        persistent: false,
      });
    });
  });

  describe('showWarning', () => {
    it('calls addNotification with warning type and message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Please be careful!');
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Please be careful!',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
    });

    it('calls addNotification with warning type, message, and options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Please be careful!', {
          title: 'Warning',
          duration: 8000,
          persistent: false,
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Please be careful!',
        title: 'Warning',
        duration: 8000,
        persistent: false,
      });
    });
  });

  describe('showToast', () => {
    it('calls addNotification with custom type and message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Custom success message');
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        message: 'Custom success message',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
    });

    it('calls addNotification with custom type, message, and options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('error', 'Custom error message', {
          title: 'Custom Error',
          duration: 5000,
          persistent: true,
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'error',
        message: 'Custom error message',
        title: 'Custom Error',
        duration: 5000,
        persistent: true,
      });
    });

    it('works with all toast types', () => {
      const { result } = renderHook(() => useToast());
      const toastTypes = ['success', 'error', 'info', 'warning'] as const;

      toastTypes.forEach(type => {
        act(() => {
          result.current.showToast(type, `${type} message`);
        });

        expect(mockAddNotification).toHaveBeenCalledWith({
          type,
          message: `${type} message`,
          title: undefined,
          duration: undefined,
          persistent: undefined,
        });
      });
    });
  });

  describe('removeToast', () => {
    it('calls removeNotification with the provided id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.removeToast('toast-id-123');
      });

      expect(mockRemoveNotification).toHaveBeenCalledWith('toast-id-123');
    });
  });

  describe('Hook Stability', () => {
    it('returns stable function references', () => {
      const { result, rerender } = renderHook(() => useToast());

      const firstRender = {
        showSuccess: result.current.showSuccess,
        showError: result.current.showError,
        showInfo: result.current.showInfo,
        showWarning: result.current.showWarning,
        showToast: result.current.showToast,
        removeToast: result.current.removeToast,
      };

      rerender();

      expect(result.current.showSuccess).toBe(firstRender.showSuccess);
      expect(result.current.showError).toBe(firstRender.showError);
      expect(result.current.showInfo).toBe(firstRender.showInfo);
      expect(result.current.showWarning).toBe(firstRender.showWarning);
      expect(result.current.showToast).toBe(firstRender.showToast);
      expect(result.current.removeToast).toBe(firstRender.removeToast);
    });
  });

  describe('Integration with Store', () => {
    it('uses the correct store functions', () => {
      renderHook(() => useToast());

      expect(mockUseUI).toHaveBeenCalled();
    });

    it('handles multiple toast calls correctly', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('First message');
        result.current.showError('Second message');
        result.current.showInfo('Third message');
      });

      expect(mockAddNotification).toHaveBeenCalledTimes(3);
      expect(mockAddNotification).toHaveBeenNthCalledWith(1, {
        type: 'success',
        message: 'First message',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
      expect(mockAddNotification).toHaveBeenNthCalledWith(2, {
        type: 'error',
        message: 'Second message',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
      expect(mockAddNotification).toHaveBeenNthCalledWith(3, {
        type: 'info',
        message: 'Third message',
        title: undefined,
        duration: undefined,
        persistent: undefined,
      });
    });
  });
}); 