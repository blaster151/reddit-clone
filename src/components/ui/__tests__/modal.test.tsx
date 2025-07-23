import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, ConfirmModal } from '../modal';

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(<Modal {...defaultProps} />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders with custom size', () => {
      render(<Modal {...defaultProps} size="lg" />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('renders without close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      
      expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    });

    it('renders with custom close button text', () => {
      render(<Modal {...defaultProps} closeButtonText="Dismiss" />);
      
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Modal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('has proper heading structure', () => {
      render(<Modal {...defaultProps} />);
      
      const title = screen.getByText('Test Modal');
      expect(title).toHaveAttribute('id', 'modal-title');
      expect(title.tagName).toBe('H2');
    });

    it('has proper content description', () => {
      render(<Modal {...defaultProps} />);
      
      const content = screen.getByText('Modal content');
      expect(content).toHaveAttribute('id', 'modal-description');
    });

    it('has proper close button accessibility', () => {
      render(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveAttribute('type', 'button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes on Escape key when closeOnEscape is true', () => {
      render(<Modal {...defaultProps} closeOnEscape={true} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not close on Escape key when closeOnEscape is false', () => {
      render(<Modal {...defaultProps} closeOnEscape={false} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('traps focus within modal', async () => {
      render(
        <Modal {...defaultProps}>
          <button>First button</button>
          <button>Second button</button>
          <button>Third button</button>
        </Modal>
      );
      
      const firstButton = screen.getByText('First button');
      const thirdButton = screen.getByText('Third button');
      
      // Focus should be on first button initially
      await waitFor(() => {
        expect(firstButton).toHaveFocus();
      });
      
      // Tab should cycle through buttons
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(screen.getByText('Second button')).toHaveFocus();
      
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(thirdButton).toHaveFocus();
      
      // Tab from last element should go to first
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(firstButton).toHaveFocus();
    });

    it('handles Shift+Tab for reverse navigation', async () => {
      render(
        <Modal {...defaultProps}>
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      );
      
      const firstButton = screen.getByText('First button');
      const secondButton = screen.getByText('Second button');
      
      await waitFor(() => {
        expect(firstButton).toHaveFocus();
      });
      
      // Shift+Tab from first element should go to last
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(secondButton).toHaveFocus();
    });
  });

  describe('Click Outside', () => {
    it('closes on overlay click when closeOnOverlayClick is true', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={true} />);
      
      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not close on overlay click when closeOnOverlayClick is false', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={false} />);
      
      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking inside modal content', () => {
      render(<Modal {...defaultProps} />);
      
      const content = screen.getByText('Modal content');
      fireEvent.click(content);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('returns focus to previous element when closed', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();
      
      const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
      
      // Close modal
      rerender(<Modal {...defaultProps} isOpen={false} />);
      
      expect(button).toHaveFocus();
      
      document.body.removeChild(button);
    });

    it('does not auto-focus when autoFocus is false', async () => {
      render(<Modal {...defaultProps} autoFocus={false} />);
      
      // Wait a bit to ensure no auto-focus happens
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // No element should have focus
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('Body Scroll Prevention', () => {
    it('prevents body scroll when preventScroll is true', () => {
      render(<Modal {...defaultProps} preventScroll={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('does not prevent body scroll when preventScroll is false', () => {
      render(<Modal {...defaultProps} preventScroll={false} />);
      
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Modal {...defaultProps} className="custom-modal" />);
      
      const modal = screen.getByRole('dialog').querySelector('[role="document"]');
      expect(modal).toHaveClass('custom-modal');
    });

    it('applies custom overlay className', () => {
      render(<Modal {...defaultProps} overlayClassName="custom-overlay" />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('custom-overlay');
    });

    it('applies custom content className', () => {
      render(<Modal {...defaultProps} contentClassName="custom-content" />);
      
      const content = screen.getByText('Modal content');
      expect(content).toHaveClass('custom-content');
    });
  });
});

describe('ConfirmModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ConfirmModal {...defaultProps} />);
      
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('renders with custom button text', () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmText="Yes, proceed"
          cancelText="No, go back"
        />
      );
      
      expect(screen.getByText('Yes, proceed')).toBeInTheDocument();
      expect(screen.getByText('No, go back')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Button Variants', () => {
    it('renders with default variant', () => {
      render(<ConfirmModal {...defaultProps} />);
      
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-blue-600');
    });

    it('renders with destructive variant', () => {
      render(<ConfirmModal {...defaultProps} confirmVariant="destructive" />);
      
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('renders with outline variant', () => {
      render(<ConfirmModal {...defaultProps} confirmVariant="outline" />);
      
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('border-gray-300');
    });
  });

  describe('User Interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      render(<ConfirmModal {...defaultProps} />);
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel and onClose when cancel button is clicked', () => {
      render(<ConfirmModal {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not call handlers when loading', () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);
      
      const confirmButton = screen.getByText('Loading...');
      const cancelButton = screen.getByText('Cancel');
      
      fireEvent.click(confirmButton);
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('disables buttons when loading', () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);
      
      const confirmButton = screen.getByText('Loading...');
      const cancelButton = screen.getByText('Cancel');
      
      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button types', () => {
      render(<ConfirmModal {...defaultProps} />);
      
      const confirmButton = screen.getByText('Confirm');
      const cancelButton = screen.getByText('Cancel');
      
      expect(confirmButton).toHaveAttribute('type', 'button');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    it('has proper focus management', async () => {
      render(<ConfirmModal {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      
      // Cancel button should be focused first (it's the first focusable element)
      await waitFor(() => {
        expect(cancelButton).toHaveFocus();
      });
    });
  });
}); 