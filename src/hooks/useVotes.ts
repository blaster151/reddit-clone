import { useState, useCallback } from 'react';
import { VoteType, VoteTarget } from '@/types';

interface UseVotesProps {
  targetId: string;
  targetType: VoteTarget;
  initialUpvotes?: number;
  initialDownvotes?: number;
  onVoteChange?: (voteType: VoteType | null) => void;
}

export function useVotes({
  targetId,
  targetType,
  initialUpvotes = 0,
  initialDownvotes = 0,
  onVoteChange,
}: UseVotesProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitVote = useCallback(async (voteType: VoteType) => {
    setIsSubmitting(true);
    
    // Optimistic update
    const previousVote = userVote;
    const newUpvotes = upvotes;
    const newDownvotes = downvotes;
    
    if (previousVote === voteType) {
      // Remove vote
      setUserVote(null);
      if (voteType === 'upvote') {
        setUpvotes(newUpvotes - 1);
      } else {
        setDownvotes(newDownvotes - 1);
      }
    } else {
      // Add or change vote
      if (previousVote === 'upvote') {
        setUpvotes(newUpvotes - 1);
      } else if (previousVote === 'downvote') {
        setDownvotes(newDownvotes - 1);
      }

      setUserVote(voteType);
      if (voteType === 'upvote') {
        setUpvotes(newUpvotes + 1);
      } else {
        setDownvotes(newDownvotes + 1);
      }
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          voteType: previousVote === voteType ? null : voteType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const result = await response.json();
      onVoteChange?.(previousVote === voteType ? null : voteType);
    } catch (error) {
      // Revert optimistic update on error
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      setUserVote(null);
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [targetId, targetType, upvotes, downvotes, userVote, initialUpvotes, initialDownvotes, onVoteChange]);

  const score = upvotes - downvotes;

  return {
    upvotes,
    downvotes,
    score,
    userVote,
    isSubmitting,
    submitVote,
  };
} 