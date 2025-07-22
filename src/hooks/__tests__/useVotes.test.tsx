import { renderHook, act, waitFor } from '@testing-library/react';
import { useVotes } from '../useVotes';

// Mock the API call
global.fetch = jest.fn();

describe('useVotes', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        initialUpvotes: 10,
        initialDownvotes: 2,
      })
    );

    expect(result.current.upvotes).toBe(10);
    expect(result.current.downvotes).toBe(2);
    expect(result.current.score).toBe(8);
    expect(result.current.userVote).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('submits upvote successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        initialUpvotes: 5,
        initialDownvotes: 1,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    expect(result.current.upvotes).toBe(6);
    expect(result.current.downvotes).toBe(1);
    expect(result.current.score).toBe(5);
    expect(result.current.userVote).toBe('upvote');
    expect(global.fetch).toHaveBeenCalledWith('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: 'post-1',
        targetType: 'post',
        voteType: 'upvote',
      }),
    });
  });

  it('submits downvote successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        initialUpvotes: 5,
        initialDownvotes: 1,
      })
    );

    await act(async () => {
      await result.current.submitVote('downvote');
    });

    expect(result.current.upvotes).toBe(5);
    expect(result.current.downvotes).toBe(2);
    expect(result.current.score).toBe(3);
    expect(result.current.userVote).toBe('downvote');
  });

  it('removes vote when clicking same vote type', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        initialUpvotes: 5,
        initialDownvotes: 1,
      })
    );

    // First upvote
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Remove upvote
    await act(async () => {
      await result.current.submitVote('upvote');
    });

    expect(result.current.upvotes).toBe(5);
    expect(result.current.downvotes).toBe(1);
    expect(result.current.score).toBe(4);
    expect(result.current.userVote).toBeNull();
  });

  it('changes vote from upvote to downvote', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        initialUpvotes: 5,
        initialDownvotes: 1,
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

    expect(result.current.upvotes).toBe(5);
    expect(result.current.downvotes).toBe(2);
    expect(result.current.score).toBe(3);
    expect(result.current.userVote).toBe('downvote');
  });

  it('handles API errors and reverts optimistic updates', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        initialUpvotes: 5,
        initialDownvotes: 1,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    // Should revert to initial state on error
    expect(result.current.upvotes).toBe(5);
    expect(result.current.downvotes).toBe(1);
    expect(result.current.score).toBe(4);
    expect(result.current.userVote).toBeNull();
  });

  it('calls onVoteChange callback when vote changes', async () => {
    const mockOnVoteChange = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'post-1',
        targetType: 'post',
        onVoteChange: mockOnVoteChange,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    expect(mockOnVoteChange).toHaveBeenCalledWith('upvote');
  });

  it('works with comment targets', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() =>
      useVotes({
        targetId: 'comment-1',
        targetType: 'comment',
        initialUpvotes: 3,
        initialDownvotes: 0,
      })
    );

    await act(async () => {
      await result.current.submitVote('upvote');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: 'comment-1',
        targetType: 'comment',
        voteType: 'upvote',
      }),
    });
  });
}); 