import { useState } from 'react';
import { VoteType } from '@/types';

export function useOptimisticVote(initialVote: VoteType | null, initialCount: number) {
  const [vote, setVote] = useState<VoteType | null>(initialVote);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const voteOptimistically = (newVote: VoteType) => {
    setPending(true);
    let delta = 0;
    if (vote === newVote) {
      // Undo vote
      setVote(null);
      delta = newVote === 'upvote' ? -1 : 1;
    } else {
      // Change or add vote
      if (vote === null) {
        delta = newVote === 'upvote' ? 1 : -1;
      } else {
        delta = newVote === 'upvote' ? 2 : -2;
      }
      setVote(newVote);
    }
    setCount((c) => c + delta);
    // Simulate async server confirmation
    setTimeout(() => setPending(false), 300);
  };

  return { vote, count, pending, voteOptimistically };
} 