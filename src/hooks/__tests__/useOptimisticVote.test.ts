import { renderHook, act } from '@testing-library/react';
import { useOptimisticVote } from '../useOptimisticVote';

describe('useOptimisticVote', () => {
  it('handles upvote and undo', () => {
    const { result } = renderHook(() => useOptimisticVote(null, 0));
    act(() => result.current.voteOptimistically('upvote'));
    expect(result.current.vote).toBe('upvote');
    expect(result.current.count).toBe(1);
    act(() => result.current.voteOptimistically('upvote'));
    expect(result.current.vote).toBe(null);
    expect(result.current.count).toBe(0);
  });

  it('handles downvote and undo', () => {
    const { result } = renderHook(() => useOptimisticVote(null, 0));
    act(() => result.current.voteOptimistically('downvote'));
    expect(result.current.vote).toBe('downvote');
    expect(result.current.count).toBe(-1);
    act(() => result.current.voteOptimistically('downvote'));
    expect(result.current.vote).toBe(null);
    expect(result.current.count).toBe(0);
  });

  it('handles changing from upvote to downvote', () => {
    const { result } = renderHook(() => useOptimisticVote('upvote', 1));
    act(() => result.current.voteOptimistically('downvote'));
    expect(result.current.vote).toBe('downvote');
    expect(result.current.count).toBe(-1);
  });

  it('handles changing from downvote to upvote', () => {
    const { result } = renderHook(() => useOptimisticVote('downvote', -1));
    act(() => result.current.voteOptimistically('upvote'));
    expect(result.current.vote).toBe('upvote');
    expect(result.current.count).toBe(1);
  });

  it('sets pending state during optimistic update', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useOptimisticVote(null, 0));
    act(() => result.current.voteOptimistically('upvote'));
    expect(result.current.pending).toBe(true);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.pending).toBe(false);
    jest.useRealTimers();
  });
}); 