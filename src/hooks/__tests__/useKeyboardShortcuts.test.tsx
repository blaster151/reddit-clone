import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts, useRedditShortcuts, DEFAULT_SHORTCUTS } from '../useKeyboardShortcuts';

// Mock DOM events
const createKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent => {
  return {
    key,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    preventDefault: jest.fn(),
    target: document.createElement('div'),
    ...options
  } as KeyboardEvent;
};

describe('useKeyboardShortcuts', () => {
  let mockHandlers: Record<string, jest.Mock>;

  beforeEach(() => {
    mockHandlers = {
      upvote: jest.fn(),
      downvote: jest.fn(),
      reply: jest.fn(),
      submit: jest.fn(),
      cancel: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      search: jest.fn(),
      refresh: jest.fn(),
      help: jest.fn()
    };
  });

  describe('Basic functionality', () => {
    it('initializes with default enabled state', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      expect(result.current.isEnabled()).toBe(true);
    });

    it('initializes with custom enabled state', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote },
        enabled: false
      }));

      expect(result.current.isEnabled()).toBe(false);
    });

    it('toggles enabled state', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      act(() => {
        result.current.toggleShortcuts();
      });

      expect(result.current.isEnabled()).toBe(false);

      act(() => {
        result.current.toggleShortcuts();
      });

      expect(result.current.isEnabled()).toBe(true);
    });

    it('sets enabled state explicitly', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      act(() => {
        result.current.setShortcutsEnabled(false);
      });

      expect(result.current.isEnabled()).toBe(false);

      act(() => {
        result.current.setShortcutsEnabled(true);
      });

      expect(result.current.isEnabled()).toBe(true);
    });
  });

  describe('Key matching', () => {
    it('matches simple key combinations', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      const event = createKeyboardEvent('k');
      act(() => {
        // Simulate keydown event
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.upvote).toHaveBeenCalledWith(event);
    });

    it('matches modifier key combinations', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { submit: { key: 'Ctrl+Enter', description: 'Submit' } },
        handlers: { submit: mockHandlers.submit }
      }));

      const event = createKeyboardEvent('Enter', { ctrlKey: true });
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.submit).toHaveBeenCalledWith(event);
    });

    it('does not match when modifiers are missing', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { submit: { key: 'Ctrl+Enter', description: 'Submit' } },
        handlers: { submit: mockHandlers.submit }
      }));

      const event = createKeyboardEvent('Enter', { ctrlKey: false });
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.submit).not.toHaveBeenCalled();
    });

    it('matches special keys', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { cancel: { key: 'Escape', description: 'Cancel' } },
        handlers: { cancel: mockHandlers.cancel }
      }));

      const event = createKeyboardEvent('Escape');
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.cancel).toHaveBeenCalledWith(event);
    });

    it('matches arrow keys', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { next: { key: 'ArrowDown', description: 'Next' } },
        handlers: { next: mockHandlers.next }
      }));

      const event = createKeyboardEvent('ArrowDown');
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.next).toHaveBeenCalledWith(event);
    });
  });

  describe('Event handling', () => {
    it('prevents default behavior by default', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      const event = createKeyboardEvent('k');
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not prevent default when configured not to', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { refresh: { key: 'F5', description: 'Refresh', preventDefault: false } },
        handlers: { refresh: mockHandlers.refresh }
      }));

      const event = createKeyboardEvent('F5');
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not trigger shortcuts when disabled', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote },
        enabled: false
      }));

      const event = createKeyboardEvent('k');
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.upvote).not.toHaveBeenCalled();
    });

    it('does not trigger shortcuts in input fields', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      const input = document.createElement('input');
      const event = createKeyboardEvent('k', { target: input });
      
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.upvote).not.toHaveBeenCalled();
    });

    it('does not trigger shortcuts in textarea fields', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      const textarea = document.createElement('textarea');
      const event = createKeyboardEvent('k', { target: textarea });
      
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.upvote).not.toHaveBeenCalled();
    });

    it('does not trigger shortcuts in contenteditable elements', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote }
      }));

      const div = document.createElement('div');
      div.contentEditable = 'true';
      const event = createKeyboardEvent('k', { target: div });
      
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockHandlers.upvote).not.toHaveBeenCalled();
    });
  });

  describe('Help functionality', () => {
    it('toggles help when ? is pressed', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote },
        showHelp: true
      }));

      const event = createKeyboardEvent('?');
      
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.helpVisible).toBe(true);
    });

    it('dispatches help toggle event', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote },
        showHelp: true
      }));

      const event = createKeyboardEvent('?');
      
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'shortcuts-help-toggle',
          detail: { visible: true }
        })
      );

      mockDispatchEvent.mockRestore();
    });

    it('does not show help when showHelp is false', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts: { upvote: { key: 'k', description: 'Upvote' } },
        handlers: { upvote: mockHandlers.upvote },
        showHelp: false
      }));

      const event = createKeyboardEvent('?');
      
      act(() => {
        const handleKeyDown = (result.current as any).handleKeyDown;
        if (handleKeyDown) handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Shortcut management', () => {
    it('returns help information for all shortcuts', () => {
      const shortcuts = {
        upvote: { key: 'k', description: 'Upvote post' },
        downvote: { key: 'j', description: 'Downvote post' }
      };

      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts,
        handlers: { upvote: mockHandlers.upvote, downvote: mockHandlers.downvote }
      }));

      const help = result.current.getShortcutHelp();
      
      expect(help).toHaveLength(2);
      expect(help).toContainEqual({
        action: 'upvote',
        key: 'k',
        description: 'Upvote post'
      });
      expect(help).toContainEqual({
        action: 'downvote',
        key: 'j',
        description: 'Downvote post'
      });
    });

    it('filters out disabled shortcuts', () => {
      const shortcuts = {
        upvote: { key: 'k', description: 'Upvote post', enabled: true },
        downvote: { key: 'j', description: 'Downvote post', enabled: false }
      };

      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts,
        handlers: { upvote: mockHandlers.upvote, downvote: mockHandlers.downvote }
      }));

      const help = result.current.getShortcutHelp();
      
      expect(help).toHaveLength(1);
      expect(help[0].action).toBe('upvote');
    });

    it('registers new shortcuts', () => {
      const shortcuts: Record<string, any> = {};
      
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts,
        handlers: {}
      }));

      act(() => {
        result.current.registerShortcut('upvote' as any, {
          key: 'x',
          description: 'Custom action'
        });
      });

      expect(shortcuts.custom).toEqual({
        key: 'x',
        description: 'Custom action'
      });
    });

    it('unregisters shortcuts', () => {
      const shortcuts = {
        upvote: { key: 'k', description: 'Upvote post' }
      };
      
      const { result } = renderHook(() => useKeyboardShortcuts({
        shortcuts,
        handlers: {}
      }));

      act(() => {
        result.current.unregisterShortcut('upvote');
      });

      expect(shortcuts.upvote).toBeUndefined();
    });
  });
});

describe('useRedditShortcuts', () => {
  let mockHandlers: Record<string, jest.Mock>;

  beforeEach(() => {
    mockHandlers = {
      upvote: jest.fn(),
      downvote: jest.fn(),
      reply: jest.fn(),
      submit: jest.fn()
    };
  });

  it('uses default Reddit shortcuts', () => {
    const { result } = renderHook(() => useRedditShortcuts(mockHandlers));

    expect(result.current.isEnabled()).toBe(true);
    
    const help = result.current.getShortcutHelp();
    expect(help.length).toBeGreaterThan(0);
    
    // Check for default shortcuts
    const upvoteShortcut = help.find(s => s.action === 'upvote');
    expect(upvoteShortcut).toBeDefined();
    expect(upvoteShortcut?.key).toBe('k');
  });

  it('handles default shortcuts correctly', () => {
    const { result } = renderHook(() => useRedditShortcuts(mockHandlers));

    const event = createKeyboardEvent('k');
    act(() => {
      const handleKeyDown = (result.current as any).handleKeyDown;
      if (handleKeyDown) handleKeyDown(event);
    });

    expect(mockHandlers.upvote).toHaveBeenCalledWith(event);
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() => useRedditShortcuts(mockHandlers, {
      enabled: false
    }));

    expect(result.current.isEnabled()).toBe(false);
  });
});

describe('DEFAULT_SHORTCUTS', () => {
  it('contains all expected shortcuts', () => {
    const expectedActions = [
      'upvote', 'downvote', 'reply', 'submit', 'cancel',
      'next', 'previous', 'search', 'refresh', 'help'
    ];

    expectedActions.forEach(action => {
      expect(DEFAULT_SHORTCUTS[action]).toBeDefined();
      expect(DEFAULT_SHORTCUTS[action]?.key).toBeDefined();
      expect(DEFAULT_SHORTCUTS[action]?.description).toBeDefined();
    });
  });

  it('has correct key mappings', () => {
    expect(DEFAULT_SHORTCUTS.upvote?.key).toBe('k');
    expect(DEFAULT_SHORTCUTS.downvote?.key).toBe('j');
    expect(DEFAULT_SHORTCUTS.reply?.key).toBe('r');
    expect(DEFAULT_SHORTCUTS.submit?.key).toBe('Ctrl+Enter');
    expect(DEFAULT_SHORTCUTS.cancel?.key).toBe('Escape');
    expect(DEFAULT_SHORTCUTS.next?.key).toBe('ArrowDown');
    expect(DEFAULT_SHORTCUTS.previous?.key).toBe('ArrowUp');
    expect(DEFAULT_SHORTCUTS.search?.key).toBe('Ctrl+k');
    expect(DEFAULT_SHORTCUTS.refresh?.key).toBe('F5');
    expect(DEFAULT_SHORTCUTS.help?.key).toBe('?');
  });

  it('has meaningful descriptions', () => {
    Object.values(DEFAULT_SHORTCUTS).forEach(shortcut => {
      if (shortcut) {
        expect(shortcut.description).toBeTruthy();
        expect(shortcut.description.length).toBeGreaterThan(0);
      }
    });
  });
}); 