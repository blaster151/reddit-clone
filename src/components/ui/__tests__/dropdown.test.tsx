import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from '../dropdown';

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Dropdown Component', () => {
  const defaultProps = {
    trigger: <button>Open Menu</button>,
    children: [
      <DropdownItem key="1" onClick={() => {}}>Option 1</DropdownItem>,
      <DropdownItem key="2" onClick={() => {}}>Option 2</DropdownItem>
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders trigger element', () => {
      render(<Dropdown {...defaultProps} />);
      
      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('does not render menu when closed', () => {
      render(<Dropdown {...defaultProps} />);
      
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });

    it('renders menu when open', () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders with custom placement', () => {
      render(<Dropdown {...defaultProps} isOpen={true} placement="top" />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('renders without arrow when showArrow is false', () => {
      render(<Dropdown {...defaultProps} isOpen={true} showArrow={false} />);
      
      const menu = screen.getByRole('menu');
      // Arrow is rendered as a div with specific classes, so we check for those
      const arrow = menu.querySelector('.border-4');
      expect(arrow).not.toBeInTheDocument();
    });

    it('renders with custom arrow', () => {
      const customArrow = <div data-testid="custom-arrow">→</div>;
      render(<Dropdown {...defaultProps} isOpen={true} arrow={customArrow} />);
      
      expect(screen.getByTestId('custom-arrow')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes on trigger', () => {
      render(<Dropdown {...defaultProps} />);
      
      const trigger = screen.getByText('Open Menu').closest('[role="button"]');
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA attributes when open', () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const trigger = screen.getByText('Open Menu').closest('[role="button"]');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper menu role and orientation', () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('has proper menu item roles', () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(2);
    });

    it('handles disabled state', () => {
      render(<Dropdown {...defaultProps} disabled={true} />);
      
      const trigger = screen.getByText('Open Menu').closest('[role="button"]');
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} onToggle={onToggle} />);
      
      const trigger = screen.getByText('Open Menu').closest('[role="button"]');
      fireEvent.keyDown(trigger!, { key: 'Enter' });
      
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('opens dropdown on Space key', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} onToggle={onToggle} />);
      
      const trigger = screen.getByText('Open Menu').closest('[role="button"]');
      fireEvent.keyDown(trigger!, { key: ' ' });
      
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('closes dropdown on Escape key', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} isOpen={true} onToggle={onToggle} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('navigates with arrow keys', async () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const firstItem = screen.getByText('Option 1');
      const secondItem = screen.getByText('Option 2');
      
      // Focus should be on first item initially
      await waitFor(() => {
        expect(firstItem).toHaveFocus();
      });
      
      // Arrow down should go to next item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(secondItem).toHaveFocus();
      
      // Arrow up should go to previous item
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(firstItem).toHaveFocus();
    });

    it('wraps navigation at boundaries', async () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const firstItem = screen.getByText('Option 1');
      const secondItem = screen.getByText('Option 2');
      
      await waitFor(() => {
        expect(firstItem).toHaveFocus();
      });
      
      // Arrow up from first should go to last
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(secondItem).toHaveFocus();
      
      // Arrow down from last should go to first
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(firstItem).toHaveFocus();
    });

    it('navigates to first item on Home key', async () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const firstItem = screen.getByText('Option 1');
      const secondItem = screen.getByText('Option 2');
      
      // Focus second item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(secondItem).toHaveFocus();
      
      // Home should go to first item
      fireEvent.keyDown(document, { key: 'Home' });
      expect(firstItem).toHaveFocus();
    });

    it('navigates to last item on End key', async () => {
      render(<Dropdown {...defaultProps} isOpen={true} />);
      
      const firstItem = screen.getByText('Option 1');
      const secondItem = screen.getByText('Option 2');
      
      await waitFor(() => {
        expect(firstItem).toHaveFocus();
      });
      
      // End should go to last item
      fireEvent.keyDown(document, { key: 'End' });
      expect(secondItem).toHaveFocus();
    });
  });

  describe('Click Outside', () => {
    it('closes dropdown when clicking outside', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} isOpen={true} onToggle={onToggle} />);
      
      // Click outside
      fireEvent.click(document.body);
      
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('does not close when clicking inside trigger', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} isOpen={true} onToggle={onToggle} />);
      
      const trigger = screen.getByText('Open Menu');
      fireEvent.click(trigger);
      
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('does not close when clicking inside menu', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} isOpen={true} onToggle={onToggle} />);
      
      const menu = screen.getByRole('menu');
      fireEvent.click(menu);
      
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('does not close on click outside when closeOnClickOutside is false', () => {
      const onToggle = jest.fn();
      render(
        <Dropdown 
          {...defaultProps} 
          isOpen={true} 
          onToggle={onToggle}
          closeOnClickOutside={false}
        />
      );
      
      fireEvent.click(document.body);
      
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('returns focus to trigger when closed', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      
      const { rerender } = render(<Dropdown {...defaultProps} isOpen={true} />);
      
      // Close dropdown
      rerender(<Dropdown {...defaultProps} isOpen={false} />);
      
      expect(trigger).toHaveFocus();
      
      document.body.removeChild(trigger);
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} onToggle={onToggle} />);
      
      const trigger = screen.getByText('Open Menu');
      fireEvent.click(trigger);
      
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('works as controlled component', () => {
      const onToggle = jest.fn();
      render(<Dropdown {...defaultProps} isOpen={true} onToggle={onToggle} />);
      
      const trigger = screen.getByText('Open Menu');
      fireEvent.click(trigger);
      
      expect(onToggle).toHaveBeenCalledWith(false);
    });
  });
});

describe('DropdownItem Component', () => {
  const defaultProps = {
    children: 'Test Item',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<DropdownItem {...defaultProps} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      const icon = <span data-testid="icon">★</span>;
      render(<DropdownItem {...defaultProps} icon={icon} />);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with divider', () => {
      render(<DropdownItem {...defaultProps} divider={true} />);
      
      const item = screen.getByText('Test Item');
      const divider = item.parentElement?.nextElementSibling;
      expect(divider).toHaveClass('border-t');
    });

    it('renders as selected', () => {
      render(<DropdownItem {...defaultProps} selected={true} />);
      
      const item = screen.getByText('Test Item');
      expect(item).toHaveClass('bg-blue-50');
    });

    it('renders as disabled', () => {
      render(<DropdownItem {...defaultProps} disabled={true} />);
      
      const item = screen.getByText('Test Item');
      expect(item).toHaveClass('opacity-50');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<DropdownItem {...defaultProps} />);
      
      const item = screen.getByText('Test Item');
      expect(item).toHaveAttribute('role', 'menuitem');
      expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('has proper ARIA attributes when selected', () => {
      render(<DropdownItem {...defaultProps} selected={true} />);
      
      const item = screen.getByText('Test Item');
      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<DropdownItem {...defaultProps} disabled={true} />);
      
      const item = screen.getByText('Test Item');
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when clicked', () => {
      render(<DropdownItem {...defaultProps} />);
      
      const item = screen.getByText('Test Item');
      fireEvent.click(item);
      
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('calls onClick on Enter key', () => {
      render(<DropdownItem {...defaultProps} />);
      
      const item = screen.getByText('Test Item');
      fireEvent.keyDown(item, { key: 'Enter' });
      
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('calls onClick on Space key', () => {
      render(<DropdownItem {...defaultProps} />);
      
      const item = screen.getByText('Test Item');
      fireEvent.keyDown(item, { key: ' ' });
      
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('does not call onClick when disabled', () => {
      render(<DropdownItem {...defaultProps} disabled={true} />);
      
      const item = screen.getByText('Test Item');
      fireEvent.click(item);
      
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    it('calls onSelect when clicked', () => {
      const onSelect = jest.fn();
      render(<DropdownItem {...defaultProps} onSelect={onSelect} />);
      
      const item = screen.getByText('Test Item');
      fireEvent.click(item);
      
      expect(onSelect).toHaveBeenCalled();
    });
  });
});

describe('DropdownDivider Component', () => {
  it('renders with default styling', () => {
    render(<DropdownDivider />);
    
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('border-t');
  });

  it('renders with custom className', () => {
    render(<DropdownDivider className="custom-divider" />);
    
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('custom-divider');
  });

  it('has proper ARIA role', () => {
    render(<DropdownDivider />);
    
    const divider = screen.getByRole('separator');
    expect(divider).toBeInTheDocument();
  });
});

describe('DropdownHeader Component', () => {
  it('renders with default styling', () => {
    render(<DropdownHeader>Section Header</DropdownHeader>);
    
    expect(screen.getByText('Section Header')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<DropdownHeader className="custom-header">Section Header</DropdownHeader>);
    
    const header = screen.getByText('Section Header');
    expect(header).toHaveClass('custom-header');
  });

  it('has proper ARIA role', () => {
    render(<DropdownHeader>Section Header</DropdownHeader>);
    
    const header = screen.getByText('Section Header');
    expect(header).toHaveAttribute('role', 'presentation');
  });
}); 