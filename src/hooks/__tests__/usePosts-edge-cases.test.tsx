import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '../usePosts';

global.fetch = jest.fn();

describe('usePosts Edge Cases', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('handles API failure gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePosts());

    // Should start with loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should show error state
    expect(result.current.error).toBe('Failed to fetch posts');
    expect(result.current.posts).toEqual([]);
  });

  it('handles empty response correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ posts: [] }),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle empty posts array
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles malformed API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invalid: 'response' }),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle malformed response gracefully
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch posts');
  });

  it('handles server error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch posts');
    expect(result.current.posts).toEqual([]);
  });

  it('handles network timeout', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 200 });

    expect(result.current.error).toBe('Failed to fetch posts');
    expect(result.current.posts).toEqual([]);
  });

  it('handles partial response data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        posts: [
          { id: '1', title: 'Test Post', content: 'Test content' }
          // Missing required fields like authorId, subredditId, etc.
        ] 
      }),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle partial data gracefully
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('handles very large response', async () => {
    const largePostsArray = Array.from({ length: 1000 }, (_, i) => ({
      id: `post-${i}`,
      title: `Post ${i}`,
      content: `Content for post ${i}`,
      authorId: `user-${i}`,
      subredditId: 'sub1',
      upvotes: Math.floor(Math.random() * 100),
      downvotes: Math.floor(Math.random() * 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ posts: largePostsArray }),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle large dataset
    expect(result.current.posts).toHaveLength(1000);
    expect(result.current.error).toBeNull();
  });

  it('handles JSON parsing errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch posts');
    expect(result.current.posts).toEqual([]);
  });

  it('handles multiple rapid requests', async () => {
    const mockResponse = { posts: [{ id: '1', title: 'Test Post' }] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Create multiple hook instances rapidly
    const { result: result1 } = renderHook(() => usePosts());
    const { result: result2 } = renderHook(() => usePosts());
    const { result: result3 } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
      expect(result3.current.loading).toBe(false);
    });

    // All should succeed
    expect(result1.current.error).toBeNull();
    expect(result2.current.error).toBeNull();
    expect(result3.current.error).toBeNull();
  });

  it('handles posts with null or undefined values', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        posts: [
          { id: '1', title: null, content: undefined, authorId: 'user1' },
          { id: '2', title: 'Valid Post', content: 'Valid content', authorId: 'user2' }
        ] 
      }),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle null/undefined values gracefully
    expect(result.current.posts).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('handles posts with special characters in content', async () => {
    const postsWithSpecialChars = [
      {
        id: '1',
        title: 'Post with special chars: !@#$%^&*()',
        content: 'Content with unicode: 🚀🌟🎉 and special chars: ñáéíóú',
        authorId: 'user1',
        subredditId: 'sub1',
        upvotes: 10,
        downvotes: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ posts: postsWithSpecialChars }),
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].title).toContain('!@#$%^&*()');
    expect(result.current.posts[0].content).toContain('🚀🌟🎉');
    expect(result.current.error).toBeNull();
  });
}); 