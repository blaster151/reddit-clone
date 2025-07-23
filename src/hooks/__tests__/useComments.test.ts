import { renderHook, act, waitFor } from '@testing-library/react';
import { useComments } from '../useComments';
import { Comment } from '@/types';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data
const mockComment: Comment = {
  id: 'comment-1',
  content: 'Test comment',
  authorId: 'user-1',
  postId: 'post-1',
  upvotes: 5,
  downvotes: 1,
  isRemoved: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockComment2: Comment = {
  id: 'comment-2',
  content: 'Test comment 2',
  authorId: 'user-2',
  postId: 'post-1',
  upvotes: 3,
  downvotes: 0,
  isRemoved: false,
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
};

describe('useComments', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useComments());

      expect(result.current.comments).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasMore).toBe(true);
      expect(result.current.page).toBe(1);
    });

    it('should initialize with custom options', () => {
      const { result } = renderHook(() => 
        useComments({ 
          postId: 'post-1', 
          page: 2, 
          pageSize: 20,
          sortBy: 'top' 
        })
      );

      expect(result.current.page).toBe(2);
    });
  });

  describe('fetchComments', () => {
    it('should fetch comments successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: [mockComment, mockComment2],
          hasMore: false
        })
      });

      const { result } = renderHook(() => useComments({ postId: 'post-1' }));

      await waitFor(() => {
        expect(result.current.comments).toHaveLength(2);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      }, { timeout: 3000 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/comments?page=1&pageSize=10&sortBy=new&postId=post-1'
      );
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useComments({ postId: 'post-1' }));

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });
    });

    it('should handle non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useComments({ postId: 'post-1' }));

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch comments');
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const newComment: Comment = {
        ...mockComment,
        id: 'comment-3',
        content: 'New comment'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comment: newComment })
      });

      const { result } = renderHook(() => useComments());

      let createdComment: Comment | undefined;
      await act(async () => {
        createdComment = await result.current.createComment({
          content: 'New comment',
          postId: 'post-1',
          authorId: 'user-1'
        });
      });

      expect(createdComment!).toEqual(newComment);
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0]).toEqual(newComment);
      expect(result.current.error).toBeNull();

      expect(mockFetch).toHaveBeenCalledWith('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'New comment',
          postId: 'post-1',
          authorId: 'user-1'
        })
      });
    });

    it('should handle creation errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Creation failed'));

      const { result } = renderHook(() => useComments());

      await act(async () => {
        try {
          await result.current.createComment({
            content: 'New comment',
            postId: 'post-1'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Creation failed');
      expect(result.current.comments).toHaveLength(0);
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const updatedComment = { ...mockComment, content: 'Updated content' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comment: updatedComment })
      });

      const { result } = renderHook(() => useComments());

      let updated: Comment | undefined;
      await act(async () => {
        updated = await result.current.updateComment('comment-1', {
          content: 'Updated content'
        });
      });

      expect(updated!).toEqual(updatedComment);
      expect(result.current.error).toBeNull();

      expect(mockFetch).toHaveBeenCalledWith('/api/comments/comment-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated content' })
      });
    });

    it('should handle update errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useComments());

      await act(async () => {
        try {
          await result.current.updateComment('comment-1', {
            content: 'Updated content'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      const { result } = renderHook(() => useComments());

      await act(async () => {
        await result.current.deleteComment('comment-1');
      });

      expect(result.current.error).toBeNull();

      expect(mockFetch).toHaveBeenCalledWith('/api/comments/comment-1', {
        method: 'DELETE'
      });
    });

    it('should handle deletion errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Deletion failed'));

      const { result } = renderHook(() => useComments());

      await act(async () => {
        try {
          await result.current.deleteComment('comment-1');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Deletion failed');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: [],
          hasMore: false
        })
      });

      const { result } = renderHook(() => useComments({ postId: 'post-1' }));

      await waitFor(() => {
        expect(result.current.comments).toEqual([]);
        expect(result.current.hasMore).toBe(false);
      });
    });

    it('should handle missing comments in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hasMore: false
        })
      });

      const { result } = renderHook(() => useComments({ postId: 'post-1' }));

      await waitFor(() => {
        expect(result.current.comments).toEqual([]);
      });
    });

    it('should handle missing hasMore in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: [mockComment]
        })
      });

      const { result } = renderHook(() => useComments({ postId: 'post-1' }));

      await waitFor(() => {
        expect(result.current.hasMore).toBe(true); // Default value
      });
    });
  });
}); 