import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../index';
import { Post, Comment, User } from '@/types';

// Mock data
const mockUser: User = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  karma: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPost: Post = {
  id: 'post-1',
  title: 'Test Post',
  content: 'Test content',
  authorId: 'user-1',
  subredditId: 'subreddit-1',
  upvotes: 10,
  downvotes: 2,
  isRemoved: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockComment: Comment = {
  id: 'comment-1',
  content: 'Test comment',
  authorId: 'user-1',
  postId: 'post-1',
  upvotes: 5,
  downvotes: 1,
  isRemoved: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Zustand Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      userLoading: false,
      userError: null,
      posts: [],
      currentPost: null,
      postsLoading: false,
      postsError: null,
      comments: [],
      commentsLoading: false,
      commentsError: null,
      theme: 'light',
      sidebarOpen: false,
      searchQuery: '',
      selectedSubreddit: null,
      notifications: [],
      hasMore: true,
      page: 1,
    });
  });

  describe('User State Management', () => {
    it('should manage user state correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle logout correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle loading and error states', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUserLoading(true);
        result.current.setUserError('Test error');
      });

      expect(result.current.userLoading).toBe(true);
      expect(result.current.userError).toBe('Test error');
    });
  });

  describe('Posts State Management', () => {
    it('should manage posts state correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.posts).toEqual([]);

      act(() => {
        result.current.setPosts([mockPost]);
      });

      expect(result.current.posts).toEqual([mockPost]);
    });

    it('should add new posts correctly', () => {
      const { result } = renderHook(() => useAppStore());
      const newPost: Post = { ...mockPost, id: 'post-2' };

      act(() => {
        result.current.setPosts([mockPost]);
        result.current.addPost(newPost);
      });

      expect(result.current.posts).toHaveLength(2);
      expect(result.current.posts[0]).toEqual(newPost); // New post should be at the beginning
    });

    it('should update posts correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setPosts([mockPost]);
        result.current.updatePost('post-1', { title: 'Updated Title' });
      });

      expect(result.current.posts[0].title).toBe('Updated Title');
    });

    it('should remove posts correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setPosts([mockPost]);
        result.current.removePost('post-1');
      });

      expect(result.current.posts).toEqual([]);
    });

    it('should manage current post correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setCurrentPost(mockPost);
      });

      expect(result.current.currentPost).toEqual(mockPost);
    });

    it('should handle pagination correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.setPage(2);
        result.current.setHasMore(false);
      });

      expect(result.current.page).toBe(2);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('Comments State Management', () => {
    it('should manage comments state correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.comments).toEqual([]);

      act(() => {
        result.current.setComments([mockComment]);
      });

      expect(result.current.comments).toEqual([mockComment]);
    });

    it('should add new comments correctly', () => {
      const { result } = renderHook(() => useAppStore());
      const newComment: Comment = { ...mockComment, id: 'comment-2' };

      act(() => {
        result.current.setComments([mockComment]);
        result.current.addComment(newComment);
      });

      expect(result.current.comments).toHaveLength(2);
      expect(result.current.comments[0]).toEqual(newComment);
    });

    it('should update comments correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setComments([mockComment]);
        result.current.updateComment('comment-1', { content: 'Updated content' });
      });

      expect(result.current.comments[0].content).toBe('Updated content');
    });

    it('should remove comments correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setComments([mockComment]);
        result.current.removeComment('comment-1');
      });

      expect(result.current.comments).toEqual([]);
    });
  });

  describe('UI State Management', () => {
    it('should manage theme correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle sidebar correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.sidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(false);
    });

    it('should manage search query correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.searchQuery).toBe('');

      act(() => {
        result.current.setSearchQuery('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });

    it('should manage selected subreddit correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.selectedSubreddit).toBeNull();

      act(() => {
        result.current.setSelectedSubreddit('subreddit-1');
      });

      expect(result.current.selectedSubreddit).toBe('subreddit-1');
    });

    it('should manage notifications correctly', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.notifications).toEqual([]);

      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Test notification',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].message).toBe('Test notification');
      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[0].read).toBe(false);

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.markNotificationAsRead(notificationId);
      });

      expect(result.current.notifications[0].read).toBe(true);

      act(() => {
        result.current.removeNotification(notificationId);
      });

      expect(result.current.notifications).toEqual([]);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Test notification 1',
        });
        result.current.addNotification({
          type: 'error',
          message: 'Test notification 2',
        });
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('Store Integration', () => {
    it('should maintain state consistency across different actions', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setPosts([mockPost]);
        result.current.setTheme('dark');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.posts).toHaveLength(1);
      expect(result.current.theme).toBe('dark');
    });

    it('should handle logout clearing all relevant state', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setPosts([mockPost]);
        result.current.setComments([mockComment]);
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.posts).toEqual([]);
      expect(result.current.comments).toEqual([]);
    });
  });
}); 