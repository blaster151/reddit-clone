import { useState, useCallback } from 'react';
import { VoteType, VoteTarget } from '@/types';

/**
 * Props for the useVotes hook
 */
interface UseVotesProps {
  /** ID of the target (post or comment) to vote on */
  targetId: string;
  /** Type of target (post or comment) */
  targetType: VoteTarget;
  /** Initial number of upvotes */
  initialUpvotes?: number;
  /** Initial number of downvotes */
  initialDownvotes?: number;
  /** Initial user vote state */
  initialUserVote?: VoteType | null;
  /** Optional callback when vote changes */
  onVoteChange?: (voteType: VoteType | null) => void;
}

/**
 * Custom hook for managing voting functionality on posts and comments
 * 
 * This hook provides a complete voting system including:
 * - Upvoting and downvoting with optimistic updates
 * - Vote state management and persistence
 * - Loading states during vote submission
 * - Automatic vote count calculations
 * 
 * @param props - Configuration options for the voting system
 * @returns Object containing vote state and submission function
 * 
 * @example
 * ```tsx
 * function PostCard({ post }) {
 *   const { upvotes, downvotes, score, userVote, submitVote } = useVotes({
 *     targetId: post.id,
 *     targetType: 'post',
 *     initialUpvotes: post.upvotes,
 *     initialDownvotes: post.downvotes,
 *   });
 *   
 *   return (
 *     <div>
 *       <button onClick={() => submitVote('upvote')}>Upvote</button>
 *       <span>{score}</span>
 *       <button onClick={() => submitVote('downvote')}>Downvote</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVotes({
  targetId,
  targetType,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote,
  onVoteChange,
}: UseVotesProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submits a vote to the API with optimistic updates
   * 
   * Performs optimistic updates for better UX, then syncs with the server.
   * If the server request fails, the optimistic update is reverted.
   * 
   * @param voteType - The type of vote to submit (upvote, downvote, or null to remove)
   * @throws {Error} When the API request fails
   * 
   * @example
   * ```tsx
   * const { submitVote, isSubmitting } = useVotes({
   *   targetId: 'post123',
   *   targetType: 'post'
   * });
   * 
   * // Submit an upvote
   * await submitVote('upvote');
   * 
   * // Submit a downvote
   * await submitVote('downvote');
   * 
   * // Handle vote submission errors
   * try {
   *   await submitVote('upvote');
   * } catch (error) {
   *   console.error('Vote failed:', error.message);
   *   // The optimistic update will be reverted automatically
   * }
   * 
   * // Check if vote is being submitted
   * if (isSubmitting) {
   *   return <button disabled>Submitting...</button>;
   * }
   * ```
   */
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

  /** Calculated score (upvotes - downvotes) */
  const score = upvotes - downvotes;

  return {
    /** Current number of upvotes */
    upvotes,
    /** Current number of downvotes */
    downvotes,
    /** Calculated score (upvotes - downvotes) */
    score,
    /** Current user's vote on this target */
    userVote,
    /** Whether a vote submission is in progress */
    isSubmitting,
    /** Function to submit a vote */
    submitVote,
  };
} 