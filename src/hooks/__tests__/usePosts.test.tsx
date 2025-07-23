import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '../usePosts';

// Mock fetch globally
global.fetch = jest.fn();

const mockPosts = [
  { id: '1', title: 'Test Post', content: 'Hello', authorId: 'u1', subredditId: 's1', upvotes: 1, downvotes: 0, score: 1, isRemoved: false, createdAt: new Date(), updatedAt: new Date() },
];

describe('usePosts', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('fetches posts and updates state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ posts: mockPosts }),
    });

    const { result } = renderHook(() => usePosts());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts.length).toBe(1);
    expect(result.current.posts[0].title).toBe('Test Post');
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePosts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.posts.length).toBe(0);
  });
}); 