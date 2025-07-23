import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  const mockOnEscape = jest.fn();
  const mockOnEnter = jest.fn();
  const mockShortcuts = {
    'Ctrl+S': jest.fn(),
    'KeyA': jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('returns expected interface', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(result.current).toHaveProperty('handleKeyDown');
      expect(result.current).toHaveProperty('focusFirstItem');
      expect(result.current).toHaveProperty('focusLastItem');
      expect(result.current).toHaveProperty('focusItem');
      expect(result.current).toHaveProperty('getFocusedIndex');
      expect(result.current).toHaveProperty('setFocusedIndex');
      expect(result.current).toHaveProperty('focusTrapRef');
    });

    it('initializes with default values', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(result.current.getFocusedIndex()).toBe(-1);
      expect(result.current.focusTrapRef.current).toBeNull();
    });
  });

  describe('Escape key handling', () => {
    it('calls onEscape when Escape key is pressed', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ onEscape: mockOnEscape })
      );

      const event = new KeyboardEvent('keydown', { key: 'Escape' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnEscape).toHaveBeenCalled();
    });

    it('does not call onEscape when not provided', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      const event = new KeyboardEvent('keydown', { key: 'Escape' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Enter key handling', () => {
    it('calls onEnter with current index when Enter is pressed', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ onEnter: mockOnEnter, itemsCount: 3 })
      );

      // Set focused index first
      act(() => {
        result.current.setFocusedIndex(1);
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnEnter).toHaveBeenCalledWith(1);
    });

    it('does not call onEnter when no item is focused', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ onEnter: mockOnEnter, itemsCount: 3 })
      );

      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockOnEnter).not.toHaveBeenCalled();
    });
  });

  describe('arrow key navigation', () => {
    it('navigates to next item with ArrowDown', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.setFocusedIndex(0);
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.getFocusedIndex()).toBe(1);
    });

    it('navigates to previous item with ArrowUp', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.setFocusedIndex(1);
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.getFocusedIndex()).toBe(0);
    });

    it('wraps to first item when navigating past last item', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.getFocusedIndex()).toBe(0);
    });

    it('wraps to last item when navigating before first item', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.setFocusedIndex(0);
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.getFocusedIndex()).toBe(2);
    });

    it('does not navigate when itemsCount is 0', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 0 })
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Home and End key navigation', () => {
    it('focuses first item with Home key', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      const event = new KeyboardEvent('keydown', { key: 'Home' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.getFocusedIndex()).toBe(0);
    });

    it('focuses last item with End key', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.setFocusedIndex(0);
      });

      const event = new KeyboardEvent('keydown', { key: 'End' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.getFocusedIndex()).toBe(2);
    });
  });

  describe('custom shortcuts', () => {
    it('calls custom shortcut handler', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ shortcuts: mockShortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 'KeyA' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockShortcuts['KeyA']).toHaveBeenCalled();
    });

    it('handles modifier key shortcuts', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ shortcuts: mockShortcuts })
      );

      const event = new KeyboardEvent('keydown', { 
        key: 'S', 
        ctrlKey: true 
      }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockShortcuts['Ctrl+S']).toHaveBeenCalled();
    });

    it('does not call shortcut when not defined', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ shortcuts: mockShortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 'KeyB' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    it('focuses first item correctly', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.focusFirstItem();
      });

      expect(result.current.getFocusedIndex()).toBe(0);
    });

    it('focuses last item correctly', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.focusLastItem();
      });

      expect(result.current.getFocusedIndex()).toBe(2);
    });

    it('focuses specific item correctly', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.focusItem(1);
      });

      expect(result.current.getFocusedIndex()).toBe(1);
    });

    it('does not focus item outside valid range', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 3 })
      );

      act(() => {
        result.current.focusItem(5);
      });

      expect(result.current.getFocusedIndex()).toBe(-1);
    });
  });

  describe('disabled state', () => {
    it('does not handle keys when disabled', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ 
          enabled: false, 
          onEscape: mockOnEscape,
          itemsCount: 3 
        })
      );

      const event = new KeyboardEvent('keydown', { key: 'Escape' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockOnEscape).not.toHaveBeenCalled();
    });
  });
}); 