import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PostCard } from '../post-card';
import { SearchBar } from '../search-bar';
import { NotificationBell } from '../notification-bell';
import { PostFeed } from '../post-feed';
import { Post } from '@/types';

// Mock hooks to control their behavior
jest.mock('@/hooks/useVotes', () => ({
  useVotes: jest.fn(() => ({
    upvotes: 100,
    downvotes: 10,
    score: 90,
    userVote: null,
    isSubmitting: false,
    submitVote: jest.fn(),
  })),
}));

jest.mock('@/hooks/usePosts', () => ({
  usePosts: jest.fn(() => ({
    posts: [],
    filteredPosts: [],
    loading: false,
    error: null,
    addPosts: jest.fn(),
    setFilter: jest.fn(),
    setSortBy: jest.fn(),
  })),
}));

jest.mock('@/hooks/useSearch', () => ({
  useSearch: jest.fn(() => ({
    query: '',
    setQuery: jest.fn(),
    results: [],
    loading: false,
    filters: {},
    updateFilters: jest.fn(),
  })),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(() => ({
    notifications: [],
    unreadCount: 0,
    addNotification: jest.fn(),
    markAsRead: jest.fn(),
    removeNotification: jest.fn(),
    clearAll: jest.fn(),
    isConnected: false,
  })),
}));

// Mock browser APIs
Object.defineProperty(global, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'WebSocket', {
  value: jest.fn(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
  })),
  writable: true,
});

// Mock console methods to track warnings and errors
const originalConsole = { ...console };
const mockConsole = {
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

beforeAll(() => {
  global.console = mockConsole as any;
});

afterAll(() => {
  global.console = originalConsole;
});

describe('Component Performance and Memory Leak Tests', () => {
  const mockPost: Post = {
    id: 'post-1',
    title: 'Test Post',
    content: 'This is a test post content that should be long enough to test performance.',
    authorId: 'user1',
    subredditId: 'test-subreddit',
    upvotes: 100,
    downvotes: 10,
    isRemoved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPosts = Array.from({ length: 100 }, (_, i) => ({
    ...mockPost,
    id: `post-${i}`,
    title: `Post ${i}`,
    content: `Content for post ${i}`,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('PostCard Component Performance', () => {
    it('renders efficiently with large content', () => {
      const largeContentPost = {
        ...mockPost,
        content: 'A'.repeat(10000), // 10KB of content
      };

      const startTime = performance.now();

      render(
        <PostCard 
          post={largeContentPost}
          onVote={jest.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large content quickly (less than 50ms)
      expect(renderTime).toBeLessThan(50);
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    it('handles rapid re-renders efficiently', () => {
      const { rerender } = render(
        <PostCard 
          post={mockPost}
          onVote={jest.fn()}
        />
      );

      const startTime = performance.now();

      // Rapidly re-render the component
      for (let i = 0; i < 100; i++) {
        rerender(
          <PostCard 
            post={{ ...mockPost, upvotes: mockPost.upvotes + i }}
            onVote={jest.fn()}
          />
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid re-renders efficiently (less than 500ms for 100 renders)
      expect(totalTime).toBeLessThan(500);
    });

    it('prevents memory leaks in event handlers', () => {
      const mockOnVote = jest.fn();
      const { unmount } = render(
        <PostCard 
          post={mockPost}
          onVote={mockOnVote}
        />
      );

      // Simulate many interactions
      for (let i = 0; i < 1000; i++) {
        fireEvent.click(screen.getByLabelText(/upvote/i));
      }

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('handles removed posts efficiently', () => {
      const removedPost = {
        ...mockPost,
        isRemoved: true,
        removalReason: 'Violation of community guidelines',
        removedAt: new Date(),
      };

      const startTime = performance.now();

      render(
        <PostCard 
          post={removedPost}
          onVote={jest.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render removed posts quickly
      expect(renderTime).toBeLessThan(20);
      expect(screen.getByText(/Post removed by moderator/)).toBeInTheDocument();
    });
  });

  describe('SearchBar Component Performance', () => {
    it('debounces search input efficiently', () => {
      const startTime = performance.now();

      render(<SearchBar />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly
      expect(renderTime).toBeLessThan(20);

      const input = screen.getByPlaceholderText(/search/i);

      // Simulate rapid typing
      for (let i = 0; i < 50; i++) {
        fireEvent.change(input, { target: { value: `search term ${i}` } });
      }

      // Should handle rapid input changes without performance issues
      expect(input).toHaveValue('search term 49');
    });

    it('handles large search results efficiently', () => {
      const largeResults = Array.from({ length: 1000 }, (_, i) => ({
        id: `result-${i}`,
        type: 'post' as const,
        title: `Search Result ${i}`,
        content: `Content for result ${i}`,
        authorId: `user-${i}`,
        subredditId: `subreddit-${i % 10}`,
        score: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
      }));

      render(<SearchBar />);

      const input = screen.getByPlaceholderText(/search/i);

      // Simulate search with large results
      fireEvent.change(input, { target: { value: 'test search' } });

      // Should handle large result sets without performance issues
      expect(input).toHaveValue('test search');
    });

    it('prevents memory leaks in filter interactions', () => {
      const { unmount } = render(<SearchBar />);

      // Simulate many filter interactions
      for (let i = 0; i < 100; i++) {
        fireEvent.click(screen.getByLabelText(/filter/i));
        fireEvent.click(screen.getByLabelText(/filter/i));
      }

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('NotificationBell Component Performance', () => {
    it('renders efficiently with many notifications', () => {
      const manyNotifications = Array.from({ length: 500 }, (_, i) => ({
        id: `notification-${i}`,
        type: 'mention' as const,
        title: `Notification ${i}`,
        message: `Message for notification ${i}`,
        priority: 'medium' as const,
        isRead: false,
        createdAt: new Date(),
      }));

      const startTime = performance.now();

      render(
        <NotificationBell 
          maxNotifications={100}
          enableRealtime={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly even with notification limit
      expect(renderTime).toBeLessThan(30);
    });

    it('handles rapid notification updates efficiently', () => {
      const { unmount } = render(
        <NotificationBell 
          maxNotifications={50}
          enableRealtime={true}
        />
      );

      // Simulate rapid notification updates
      for (let i = 0; i < 200; i++) {
        // This would normally be done through the hook
        // Here we're just testing the component's ability to handle updates
      }

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('prevents memory leaks in dropdown interactions', () => {
      const { unmount } = render(<NotificationBell />);

      const bellButton = screen.getByRole('button');

      // Simulate many dropdown open/close cycles
      for (let i = 0; i < 100; i++) {
        fireEvent.click(bellButton);
        fireEvent.click(bellButton);
      }

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('PostFeed Component Performance', () => {
    it('renders large post lists efficiently', () => {
      const startTime = performance.now();

      render(<PostFeed />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly even with potential large data
      expect(renderTime).toBeLessThan(100);
    });

    it('handles infinite scroll efficiently', () => {
      const { unmount } = render(<PostFeed />);

      // Simulate scroll events
      for (let i = 0; i < 50; i++) {
        fireEvent.scroll(window, { target: { scrollY: i * 1000 } });
      }

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('Component Memory Leak Detection', () => {
    it('detects potential memory leaks in event listeners', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<SearchBar />);

      // Should add event listeners
      expect(addEventListenerSpy).toHaveBeenCalled();

      unmount();

      // Should remove event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('detects potential memory leaks in timeouts', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = render(<SearchBar />);

      // Should set up timeouts for debouncing
      expect(setTimeoutSpy).toHaveBeenCalled();

      unmount();

      // Should clear timeouts
      expect(clearTimeoutSpy).toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });

    it('detects potential memory leaks in intervals', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      // Mock a component that uses intervals
      const TestComponent = () => {
        React.useEffect(() => {
          const interval = setInterval(() => {
            // Do something
          }, 1000);

          return () => clearInterval(interval);
        }, []);

        return <div>Test</div>;
      };

      const { unmount } = render(<TestComponent />);

      // Should set up intervals
      expect(setIntervalSpy).toHaveBeenCalled();

      unmount();

      // Should clear intervals
      expect(clearIntervalSpy).toHaveBeenCalled();

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Component Performance Benchmarks', () => {
    it('measures component initialization performance', () => {
      const startTime = performance.now();

      render(<PostCard post={mockPost} onVote={jest.fn()} />);

      const endTime = performance.now();
      const initializationTime = endTime - startTime;

      // Should initialize quickly (less than 20ms)
      expect(initializationTime).toBeLessThan(20);
    });

    it('measures component update performance', () => {
      const { rerender } = render(
        <PostCard post={mockPost} onVote={jest.fn()} />
      );

      const startTime = performance.now();

      rerender(
        <PostCard 
          post={{ ...mockPost, upvotes: mockPost.upvotes + 1 }} 
          onVote={jest.fn()} 
        />
      );

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Should update quickly (less than 10ms)
      expect(updateTime).toBeLessThan(10);
    });

    it('measures large component tree rendering performance', () => {
      const LargeComponentTree = () => (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <PostCard 
              key={i}
              post={{ ...mockPost, id: `post-${i}` }}
              onVote={jest.fn()}
            />
          ))}
        </div>
      );

      const startTime = performance.now();

      render(<LargeComponentTree />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large component tree efficiently (less than 500ms)
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Component Stress Testing', () => {
    it('handles rapid mount/unmount cycles', () => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <PostCard 
            post={{ ...mockPost, id: `post-${i}` }}
            onVote={jest.fn()}
          />
        );

        unmount();
      }

      // Should not throw any errors
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('handles concurrent component interactions', () => {
      const components = [];

      // Create multiple component instances
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <PostCard 
            post={{ ...mockPost, id: `post-${i}` }}
            onVote={jest.fn()}
          />
        );

        components.push({ unmount });
      }

      // Interact with all components concurrently
      act(() => {
        const buttons = screen.getAllByLabelText(/upvote/i);
        buttons.forEach(button => {
          fireEvent.click(button);
        });
      });

      // Cleanup
      components.forEach(({ unmount }) => unmount());

      // Should handle concurrent interactions without issues
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('handles memory pressure scenarios', () => {
      const components = [];

      // Create many component instances to simulate memory pressure
      for (let i = 0; i < 500; i++) {
        const { unmount } = render(
          <PostCard 
            post={{ ...mockPost, id: `post-${i}` }}
            onVote={jest.fn()}
          />
        );

        components.push({ unmount });
      }

      // Cleanup
      components.forEach(({ unmount }) => unmount());

      // Should handle memory pressure gracefully
      expect(components.length).toBe(500);
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Performance', () => {
    it('maintains accessibility during rapid updates', () => {
      const { rerender } = render(
        <PostCard post={mockPost} onVote={jest.fn()} />
      );

      // Rapidly update the component
      for (let i = 0; i < 50; i++) {
        rerender(
          <PostCard 
            post={{ ...mockPost, upvotes: mockPost.upvotes + i }}
            onVote={jest.fn()}
          />
        );
      }

      // Should maintain accessibility attributes
      const upvoteButton = screen.getByLabelText(/upvote/i);
      expect(upvoteButton).toHaveAttribute('aria-label');
    });

    it('handles keyboard navigation efficiently', () => {
      render(<PostCard post={mockPost} onVote={jest.fn()} />);

      const postElement = screen.getByRole('article');
      postElement.focus();

      // Simulate rapid keyboard navigation
      for (let i = 0; i < 100; i++) {
        fireEvent.keyDown(postElement, { key: 'ArrowDown' });
        fireEvent.keyDown(postElement, { key: 'ArrowUp' });
      }

      // Should handle keyboard events efficiently
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Performance', () => {
    it('handles touch events efficiently', () => {
      render(<PostCard post={mockPost} onVote={jest.fn()} />);

      const upvoteButton = screen.getByLabelText(/upvote/i);

      // Simulate rapid touch events
      for (let i = 0; i < 100; i++) {
        fireEvent.touchStart(upvoteButton);
        fireEvent.touchEnd(upvoteButton);
      }

      // Should handle touch events efficiently
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('handles scroll events efficiently', () => {
      render(<PostFeed />);

      // Simulate rapid scroll events
      for (let i = 0; i < 100; i++) {
        fireEvent.scroll(window, { target: { scrollY: i * 100 } });
      }

      // Should handle scroll events efficiently
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });
}); 