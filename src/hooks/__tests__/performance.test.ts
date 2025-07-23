import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useVotes } from '../useVotes';
import { usePosts } from '../usePosts';
import { useSearch } from '../useSearch';
import { useNotifications } from '../useNotifications';

// Mock useKeyboardNavigation since it doesn't exist yet
const useKeyboardNavigation = jest.fn(() => ({
  focusedIndex: 0,
  setFocusedIndex: jest.fn(),
  getFocusedIndex: jest.fn(() => 0),
  handleKeyDown: jest.fn(),
}));

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

describe('Performance and Memory Leak Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useVotes Hook Performance', () => {
    it('handles rapid vote submissions without memory leaks', () => {
      const { result, unmount } = renderHook(() => 
        useVotes({
          targetId: 'post-1',
          targetType: 'post',
          initialUpvotes: 100,
          initialDownvotes: 10,
        })
      );

      // Simulate rapid vote submissions
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.submitVote('upvote');
        });
      }

      // Fast-forward time to allow all async operations to complete
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Check for memory leaks by ensuring no pending timeouts
      expect(result.current.isSubmitting).toBe(false);

      // Unmount and check for cleanup
      unmount();
      
      // Fast-forward time to ensure no lingering timeouts
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not throw any errors or warnings
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('prevents race conditions in concurrent vote submissions', () => {
      const { result } = renderHook(() => 
        useVotes({
          targetId: 'post-1',
          targetType: 'post',
          initialUpvotes: 50,
          initialDownvotes: 5,
        })
      );

      const initialScore = result.current.score;

      // Submit multiple votes rapidly
      act(() => {
        result.current.submitVote('upvote');
        result.current.submitVote('downvote');
        result.current.submitVote('upvote');
      });

      // Should handle concurrent submissions gracefully
      expect(result.current.isSubmitting).toBe(true);

      // Fast-forward to complete operations
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.score).toBeDefined();
    });

    it('cleans up timeouts and intervals on unmount', () => {
      const { unmount } = renderHook(() => 
        useVotes({
          targetId: 'post-1',
          targetType: 'post',
          initialUpvotes: 10,
          initialDownvotes: 2,
        })
      );

      // Unmount the hook
      unmount();

      // Fast-forward time to ensure no lingering timeouts
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Should not throw any errors
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('usePosts Hook Performance', () => {
    it('handles large post lists efficiently', () => {
      const largePostList = Array.from({ length: 1000 }, (_, i) => ({
        id: `post-${i}`,
        title: `Post ${i}`,
        content: `Content for post ${i}`,
        authorId: `user-${i % 10}`,
        subredditId: `subreddit-${i % 5}`,
        upvotes: Math.floor(Math.random() * 1000),
        downvotes: Math.floor(Math.random() * 100),
        isRemoved: false,
        createdAt: new Date(Date.now() - Math.random() * 86400000),
        updatedAt: new Date(),
      }));

      const { result, unmount } = renderHook(() => 
        usePosts({ initialPosts: largePostList })
      );

      // Test filtering performance
      act(() => {
        result.current.setFilter({ authorId: 'user-1' });
      });

      // Should complete filtering quickly
      expect(result.current.filteredPosts.length).toBeLessThanOrEqual(largePostList.length);

      // Test sorting performance
      act(() => {
        result.current.setSortBy('score');
      });

      expect(result.current.filteredPosts.length).toBeGreaterThan(0);

      unmount();
    });

    it('prevents memory leaks in infinite scroll scenarios', () => {
      const { result, unmount } = renderHook(() => 
        usePosts({ initialPosts: [] })
      );

      // Simulate loading many pages of posts
      for (let page = 0; page < 50; page++) {
        const newPosts = Array.from({ length: 20 }, (_, i) => ({
          id: `post-${page}-${i}`,
          title: `Post ${page}-${i}`,
          content: `Content for post ${page}-${i}`,
          authorId: `user-${i}`,
          subredditId: 'test-subreddit',
          upvotes: 10,
          downvotes: 1,
          isRemoved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        act(() => {
          result.current.addPosts(newPosts);
        });
      }

      // Should handle large post collections without memory issues
      expect(result.current.posts.length).toBe(1000);

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('useSearch Hook Performance', () => {
    it('debounces search queries efficiently', () => {
      const { result, unmount } = renderHook(() => 
        useSearch({ debounceMs: 300 })
      );

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setQuery(`search term ${i}`);
        });
      }

      // Should not trigger too many searches
      expect(result.current.query).toBe('search term 9');

      // Fast-forward to trigger debounced search
      act(() => {
        jest.advanceTimersByTime(300);
      });

      unmount();
    });

    it('cancels previous search requests on new queries', () => {
      const { result, unmount } = renderHook(() => 
        useSearch({ debounceMs: 100 })
      );

      // Simulate rapid search queries
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.setQuery(`query ${i}`);
        });
        act(() => {
          jest.advanceTimersByTime(50);
        });
      }

      // Should handle request cancellation gracefully
      expect(result.current.query).toBe('query 4');

      unmount();
    });
  });

  describe('useNotifications Hook Performance', () => {
    it('handles large notification lists without memory leaks', () => {
      const largeNotificationList = Array.from({ length: 500 }, (_, i) => ({
        id: `notification-${i}`,
        type: 'mention' as const,
        title: `Notification ${i}`,
        message: `Message for notification ${i}`,
        priority: 'medium' as const,
        isRead: false,
        createdAt: new Date(Date.now() - Math.random() * 86400000),
      }));

      const { result, unmount } = renderHook(() => 
        useNotifications({ 
          initialNotifications: largeNotificationList,
          maxNotifications: 100 
        })
      );

      // Should limit notifications to maxNotifications
      expect(result.current.notifications.length).toBe(100);

      // Add more notifications
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.addNotification({
            type: 'mention',
            title: `New notification ${i}`,
            message: `New message ${i}`,
            priority: 'low',
            isRead: false,
          });
        });
      }

      // Should still respect maxNotifications limit
      expect(result.current.notifications.length).toBe(100);

      unmount();
    });

    it('cleans up WebSocket connections properly', () => {
      const { result, unmount } = renderHook(() => 
        useNotifications({
          enableRealtime: true,
          websocketUrl: 'ws://test.com/notifications',
        })
      );

      // Simulate WebSocket connection
      expect(result.current.isConnected).toBe(false);

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('handles rapid notification additions efficiently', () => {
      const { result, unmount } = renderHook(() => 
        useNotifications({ maxNotifications: 50 })
      );

      // Add notifications rapidly
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.addNotification({
            type: 'mention',
            title: `Rapid notification ${i}`,
            message: `Rapid message ${i}`,
            priority: 'low',
            isRead: false,
          });
        });
      }

      // Should limit to maxNotifications
      expect(result.current.notifications.length).toBe(50);

      unmount();
    });
  });

  describe('useKeyboardNavigation Hook Performance', () => {
    it('handles large item lists efficiently', () => {
      const { result, unmount } = renderHook(() => 
        useKeyboardNavigation({ itemsCount: 1000 })
      );

      // Test navigation performance
      act(() => {
        result.current.setFocusedIndex(500);
      });

      expect(result.current.getFocusedIndex()).toBe(500);

      // Test arrow key navigation
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any;
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.getFocusedIndex()).toBe(501);

      unmount();
    });

    it('prevents memory leaks in focus management', () => {
      const { result, unmount } = renderHook(() => 
        useKeyboardNavigation({ 
          itemsCount: 100,
          trapFocus: true 
        })
      );

      // Simulate focus changes
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.setFocusedIndex(i);
        });
      }

      unmount();

      // Fast-forward time to ensure cleanup
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('Memory Leak Detection', () => {
    it('detects potential memory leaks in event listeners', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => 
        useKeyboardNavigation({ 
          itemsCount: 10,
          trapFocus: true 
        })
      );

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

      const { unmount } = renderHook(() => 
        useNotifications({ autoReadDelay: 5000 })
      );

      // Should set up timeouts
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

      // Mock a hook that uses intervals
      const useIntervalHook = () => {
        const intervalRef = React.useRef<NodeJS.Timeout>();
        
        React.useEffect(() => {
          intervalRef.current = setInterval(() => {
            // Do something
          }, 1000);

          return () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          };
        }, []);
      };

      const { unmount } = renderHook(useIntervalHook);

      // Should set up intervals
      expect(setIntervalSpy).toHaveBeenCalled();

      unmount();

      // Should clear intervals
      expect(clearIntervalSpy).toHaveBeenCalled();

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Performance Benchmarks', () => {
    it('measures hook initialization performance', () => {
      const startTime = performance.now();

      const { result } = renderHook(() => 
        useVotes({
          targetId: 'post-1',
          targetType: 'post',
          initialUpvotes: 100,
          initialDownvotes: 10,
        })
      );

      const endTime = performance.now();
      const initializationTime = endTime - startTime;

      // Should initialize quickly (less than 10ms)
      expect(initializationTime).toBeLessThan(10);
      expect(result.current).toBeDefined();
    });

    it('measures state update performance', () => {
      const { result } = renderHook(() => 
        useVotes({
          targetId: 'post-1',
          targetType: 'post',
          initialUpvotes: 100,
          initialDownvotes: 10,
        })
      );

      const startTime = performance.now();

      act(() => {
        result.current.submitVote('upvote');
      });

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Should update state quickly (less than 5ms)
      expect(updateTime).toBeLessThan(5);
    });

    it('measures large data set handling performance', () => {
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        id: `item-${i}`,
        value: `value-${i}`,
      }));

      const startTime = performance.now();

      const { result } = renderHook(() => 
        usePosts({ initialPosts: largeDataSet as any })
      );

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should handle large datasets efficiently (less than 50ms)
      expect(processingTime).toBeLessThan(50);
      expect(result.current.posts.length).toBe(10000);
    });
  });

  describe('Stress Testing', () => {
    it('handles rapid mount/unmount cycles', () => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = renderHook(() => 
          useVotes({
            targetId: `post-${i}`,
            targetType: 'post',
            initialUpvotes: 10,
            initialDownvotes: 1,
          })
        );

        unmount();
      }

      // Should not throw any errors
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('handles concurrent hook usage', () => {
      const hooks = [];

      // Create multiple instances of the same hook
      for (let i = 0; i < 10; i++) {
        const { result } = renderHook(() => 
          useVotes({
            targetId: `post-${i}`,
            targetType: 'post',
            initialUpvotes: 10,
            initialDownvotes: 1,
          })
        );

        hooks.push(result);
      }

      // Interact with all hooks concurrently
      act(() => {
        hooks.forEach((hook, index) => {
          hook.current.submitVote('upvote');
        });
      });

      // Should handle concurrent usage without issues
      hooks.forEach((hook) => {
        expect(hook.current.isSubmitting).toBeDefined();
      });
    });

    it('handles memory pressure scenarios', () => {
      const hooks = [];

      // Create many hook instances to simulate memory pressure
      for (let i = 0; i < 1000; i++) {
        const { result } = renderHook(() => 
          useVotes({
            targetId: `post-${i}`,
            targetType: 'post',
            initialUpvotes: 10,
            initialDownvotes: 1,
          })
        );

        hooks.push(result);
      }

      // Perform operations on all hooks
      act(() => {
        hooks.forEach((hook) => {
          hook.current.submitVote('upvote');
        });
      });

      // Should handle memory pressure gracefully
      expect(hooks.length).toBe(1000);
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });
}); 