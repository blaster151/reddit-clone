import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Toast, ToastContainer } from '../toast';
import { ToastType } from '../toast';

// Mock timers for testing animations and auto-dismiss
jest.useFakeTimers();

describe('Toast Component', () => {
  const mockToast = {
    id: 'test-toast',
    type: 'success' as ToastType,
    message: 'Test message',
    title: 'Test title',
    duration: 5000,
    persistent: false,
  };

  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Rendering', () => {
    it('renders toast with all required elements', () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-title')).toHaveTextContent('Test title');
      expect(screen.getByTestId('toast-message')).toHaveTextContent('Test message');
      expect(screen.getByTestId('toast-dismiss')).toBeInTheDocument();
    });

    it('renders toast without title when not provided', () => {
      const toastWithoutTitle = { ...mockToast, title: undefined };
      render(<Toast toast={toastWithoutTitle} onRemove={mockOnRemove} />);
      
      expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument();
      expect(screen.getByTestId('toast-message')).toHaveTextContent('Test message');
    });

    it('renders different toast types with correct styling', () => {
      const toastTypes: ToastType[] = ['success', 'error', 'info', 'warning'];
      
      toastTypes.forEach(type => {
        const { unmount } = render(
          <Toast toast={{ ...mockToast, type }} onRemove={mockOnRemove} />
        );
        
        expect(screen.getByTestId(`toast-${type}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('applies correct position styles', () => {
      const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;
      
      positions.forEach(position => {
        const { unmount } = render(
          <Toast toast={mockToast} onRemove={mockOnRemove} position={position} />
        );
        
        const toast = screen.getByTestId('toast-success');
        expect(toast).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      const toast = screen.getByTestId('toast-success');
      expect(toast).toHaveAttribute('role', 'alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('has accessible dismiss button', () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      const dismissButton = screen.getByTestId('toast-dismiss');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('can be dismissed with keyboard', () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      const dismissButton = screen.getByTestId('toast-dismiss');
      dismissButton.focus();
      
      fireEvent.keyDown(dismissButton, { key: 'Enter' });
      expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
    });
  });

  describe('User Interactions', () => {
    it('calls onRemove when dismiss button is clicked', () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      const dismissButton = screen.getByTestId('toast-dismiss');
      fireEvent.click(dismissButton);
      
      expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
    });

    it('auto-dismisses after specified duration', async () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
      });
    });

    it('does not auto-dismiss persistent toasts', () => {
      const persistentToast = { ...mockToast, persistent: true };
      render(<Toast toast={persistentToast} onRemove={mockOnRemove} />);
      
      // Fast-forward time beyond the duration
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(mockOnRemove).not.toHaveBeenCalled();
    });

    it('uses default duration when not specified', async () => {
      const toastWithoutDuration = { ...mockToast, duration: undefined };
      render(<Toast toast={toastWithoutDuration} onRemove={mockOnRemove} />);
      
      // Fast-forward time to default duration (5000ms)
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
      });
    });
  });

  describe('Animations', () => {
    it('shows toast with animation after mount', async () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      // Initially hidden
      const toast = screen.getByTestId('toast-success');
      expect(toast).toHaveClass('opacity-0');
      
      // Fast-forward to show animation
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(toast).toHaveClass('opacity-100');
      });
    });

    it('exits with animation when dismissed', async () => {
      render(<Toast toast={mockToast} onRemove={mockOnRemove} />);
      
      // Show the toast first
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      const dismissButton = screen.getByTestId('toast-dismiss');
      fireEvent.click(dismissButton);
      
      // Should start exit animation
      const toast = screen.getByTestId('toast-success');
      expect(toast).toHaveClass('opacity-0');
      
      // Fast-forward to complete exit animation
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
      });
    });
  });
});

describe('ToastContainer Component', () => {
  const mockToasts = [
    {
      id: 'toast-1',
      type: 'success' as ToastType,
      message: 'Success message',
      title: 'Success',
    },
    {
      id: 'toast-2',
      type: 'error' as ToastType,
      message: 'Error message',
      title: 'Error',
    },
  ];

  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all toasts in container', () => {
      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />);
      
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
    });

    it('renders nothing when no toasts provided', () => {
      const { container } = render(<ToastContainer toasts={[]} onRemove={mockOnRemove} />);
      expect(container.firstChild).toBeNull();
    });

    it('respects maxToasts limit', () => {
      const manyToasts = Array.from({ length: 10 }, (_, i) => ({
        id: `toast-${i}`,
        type: 'info' as ToastType,
        message: `Message ${i}`,
      }));
      
      render(<ToastContainer toasts={manyToasts} onRemove={mockOnRemove} maxToasts={3} />);
      
      const infoToasts = screen.getAllByTestId(/toast-info/);
      expect(infoToasts).toHaveLength(3);
    });

    it('applies correct position styles', () => {
      const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;
      
      positions.forEach(position => {
        const { unmount } = render(
          <ToastContainer toasts={mockToasts} onRemove={mockOnRemove} position={position} />
        );
        
        const container = screen.getByTestId('toast-container');
        expect(container).toHaveClass('fixed', 'z-50', 'flex', 'flex-col');
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', () => {
      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />);
      
      const container = screen.getByTestId('toast-container');
      expect(container).toHaveAttribute('aria-label', 'Notifications');
    });

    it('maintains pointer events for toasts while disabling for container', () => {
      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />);
      
      const container = screen.getByTestId('toast-container');
      const toastWrappers = container.querySelectorAll('.pointer-events-auto');
      
      expect(container).toHaveClass('pointer-events-none');
      expect(toastWrappers).toHaveLength(2);
    });
  });

  describe('Toast Management', () => {
    it('passes onRemove callback to individual toasts', () => {
      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />);
      
      const dismissButtons = screen.getAllByTestId('toast-dismiss');
      fireEvent.click(dismissButtons[0]);
      
      expect(mockOnRemove).toHaveBeenCalledWith('toast-1');
    });

    it('handles multiple toast dismissals', () => {
      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />);
      
      const dismissButtons = screen.getAllByTestId('toast-dismiss');
      
      fireEvent.click(dismissButtons[0]);
      fireEvent.click(dismissButtons[1]);
      
      expect(mockOnRemove).toHaveBeenCalledTimes(2);
      expect(mockOnRemove).toHaveBeenCalledWith('toast-1');
      expect(mockOnRemove).toHaveBeenCalledWith('toast-2');
    });
  });
}); 