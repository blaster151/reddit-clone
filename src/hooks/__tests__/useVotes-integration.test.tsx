import { renderHook, act, waitFor } from '@testing-library/react';
import { useVotes } from '../useVotes';

global.fetch = jest.fn();

describe('useVotes Integration Tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('completes full voting flow with API success', async () => {
    const mockResponse = { success: true, vote: { type: 'upvote', count: 43 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    // Initial state
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(37);
    expect(result.current.userVote).toBeNull();

    // Submit upvote
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Optimistic update should be applied immediately
    expect(result.current.upvotes).toBe(43);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(38);
    expect(result.current.userVote).toBe('upvote');
    expect(result.current.isSubmitting).toBe(false);

    // Verify API was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: 'post1',
        targetType: 'post',
        voteType: 'upvote',
      }),
    });
  });

  it('handles API failure with optimistic rollback', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    // Submit upvote
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Should rollback to original state on error
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(37);
    expect(result.current.userVote).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles vote change from upvote to downvote', async () => {
    const mockResponse = { success: true, vote: { type: 'downvote', count: 6 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    // First upvote
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Change to downvote
    await act(async () => {
      await result.current.submitVote('downvote');
    });

    // Should show downvote state
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(6);
    expect(result.current.score).toBe(36);
    expect(result.current.userVote).toBe('downvote');
  });

  it('handles vote removal', async () => {
    const mockResponse = { success: true, vote: { type: null, count: 5 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    // Submit upvote first
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Then remove vote by clicking upvote again
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Should return to original state
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(37);
    expect(result.current.userVote).toBeNull();
  });

  it('handles concurrent vote submissions', async () => {
    const mockResponse = { success: true, vote: { type: 'upvote', count: 43 } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    // Submit multiple votes rapidly
    await act(async () => {
      await Promise.all([
        result.current.submitVote('upvote'),
        result.current.submitVote('downvote'),
        result.current.submitVote('upvote'),
      ]);
    });

    // Should handle gracefully without crashing
    expect(result.current.isSubmitting).toBe(false);
  });

  it('calls onVoteChange callback when vote changes', async () => {
    const mockOnVoteChange = jest.fn();
    const mockResponse = { success: true, vote: { type: 'upvote', count: 43 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
        onVoteChange: mockOnVoteChange,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    expect(mockOnVoteChange).toHaveBeenCalledWith('upvote');
  });

  it('handles comment voting correctly', async () => {
    const mockResponse = { success: true, vote: { type: 'upvote', count: 11 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'comment1',
        targetType: 'comment',
        initialUpvotes: 10,
        initialDownvotes: 2,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    expect(result.current.upvotes).toBe(11);
    expect(result.current.downvotes).toBe(2);
    expect(result.current.score).toBe(9);

    // Verify API was called with comment target
    expect(global.fetch).toHaveBeenCalledWith('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: 'comment1',
        targetType: 'comment',
        voteType: 'upvote',
      }),
    });
  });

  it('handles server error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid vote' }),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Should rollback on server error
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(37);
    expect(result.current.userVote).toBeNull();
  });

  it('handles network timeout gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Should rollback on timeout
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(37);
    expect(result.current.userVote).toBeNull();
  });

  it('maintains state consistency across multiple vote operations', async () => {
    const mockResponses = [
      { success: true, vote: { type: 'upvote', count: 43 } },
      { success: true, vote: { type: 'downvote', count: 6 } },
      { success: true, vote: { type: null, count: 5 } },
    ];

    mockResponses.forEach((response, index) => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      });
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post1',
        targetType: 'post',
        initialUpvotes: 42,
        initialDownvotes: 5,
      })
    );

    // Upvote
    await act(async () => {
      await result.current.submitVote('upvote');
    });
    expect(result.current.userVote).toBe('upvote');

    // Change to downvote
    await act(async () => {
      await result.current.submitVote('downvote');
    });
    expect(result.current.userVote).toBe('downvote');

    // Remove vote
    await act(async () => {
      await result.current.submitVote('downvote');
    });
    expect(result.current.userVote).toBeNull();

    // Final state should be consistent
    expect(result.current.upvotes).toBe(42);
    expect(result.current.downvotes).toBe(5);
    expect(result.current.score).toBe(37);
  });
}); 