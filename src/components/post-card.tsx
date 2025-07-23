'use client';

import { Post } from '@/types';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share, Shield } from 'lucide-react';
import { useVotes } from '@/hooks/useVotes';
import { useState, useEffect, useRef } from 'react';
import { ModerationActions } from './moderation-actions';

/**
 * Props for the PostCard component
 */
interface PostCardProps {
  /** Post data to display */
  post: Post;
  /** Optional callback when user votes on the post */
  onVote?: (postId: string, voteType: 'upvote' | 'downvote') => void;
  /** Whether the current user is a moderator */
  isModerator?: boolean;
  /** Callback when a post is removed by moderator */
  onRemove?: (postId: string, reason: string) => void;
  /** Callback when a user is banned by moderator */
  onBanUser?: (userId: string, reason: string, isPermanent: boolean) => void;
  /** Callback when a user is muted by moderator */
  onMuteUser?: (userId: string, reason: string, isPermanent: boolean) => void;
}

/**
 * PostCard component for displaying individual posts in a feed
 * 
 * This component renders a complete post card with:
 * - Post title, content, and metadata
 * - Voting functionality with optimistic updates
 * - Comment count and sharing options
 * - Moderation actions for moderators
 * - Visual feedback for vote changes
 * - Special display for removed posts
 * 
 * @param props - Component props
 * @returns JSX element representing a post card
 * 
 * @example
 * ```tsx
 * <PostCard 
 *   post={postData}
 *   isModerator={true}
 *   onVote={(postId, voteType) => console.log(`${voteType} on ${postId}`)}
 *   onRemove={(postId, reason) => handlePostRemoval(postId, reason)}
 * />
 * ```
 */
export function PostCard({ 
  post, 
  onVote, 
  isModerator = false, 
  onRemove, 
  onBanUser, 
  onMuteUser 
}: PostCardProps) {
  // Integrate useVotes hook
  const {
    upvotes,
    downvotes,
    score,
    userVote,
    isSubmitting,
    submitVote,
  } = useVotes({
    targetId: post.id,
    targetType: 'post',
    initialUpvotes: post.upvotes,
    initialDownvotes: post.downvotes,
    onVoteChange: (voteType) => {
      if (onVote && voteType) onVote(post.id, voteType);
    },
  });

  const [flash, setFlash] = useState(false);
  const prevScore = useRef(score);

  /**
   * Effect to trigger flash animation when score changes
   * 
   * @example
   * ```tsx
   * // This effect runs automatically when the score changes
   * // It adds a yellow background flash for 400ms
   * useEffect(() => {
   *   if (score !== prevScore.current) {
   *     setFlash(true);
   *     const timeout = setTimeout(() => setFlash(false), 400);
   *     prevScore.current = score;
   *     return () => clearTimeout(timeout);
   *   }
   * }, [score]);
   * ```
   */
  useEffect(() => {
    if (score !== prevScore.current) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 400);
      prevScore.current = score;
      return () => clearTimeout(timeout);
    }
  }, [score]);

  // Show removed post content
  if (post.isRemoved) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600 font-medium">Post removed by moderator</span>
        </div>
        {post.removalReason && (
          <div className="text-sm text-gray-600 mb-2">Reason: {post.removalReason}</div>
        )}
        <div className="text-sm text-gray-500">
          Removed on {post.removedAt ? formatRelativeTime(post.removedAt) : 'unknown date'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center mr-2">
          <Button
            aria-label="upvote"
            size="icon"
            className={`mb-1 ${userVote === 'upvote' ? 'text-orange-500' : ''}`}
            onClick={() => submitVote('upvote')}
            disabled={isSubmitting}
          >
            <ArrowBigUp />
          </Button>
          <div
            className={`font-bold text-center min-w-[2rem] transition-colors duration-300 ${
              flash ? 'bg-yellow-200 animate-pulse' : ''
            }`}
            data-testid="post-score"
          >
            {formatNumber(score)}
          </div>
          <Button
            aria-label="downvote"
            size="icon"
            className={`mt-1 ${userVote === 'downvote' ? 'text-blue-500' : ''}`}
            onClick={() => submitVote('downvote')}
            disabled={isSubmitting}
          >
            <ArrowBigDown />
          </Button>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-700">{post.authorId}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{formatRelativeTime(post.createdAt)}</span>
            </div>
            {isModerator && (
              <ModerationActions
                targetId={post.id}
                targetType="post"
                authorId={post.authorId}
                subredditId={post.subredditId}
                isModerator={isModerator}
                onRemove={onRemove}
                onBanUser={onBanUser}
                onMuteUser={onMuteUser}
              />
            )}
          </div>
          <div className="text-lg font-bold mb-1">{post.title}</div>
          <div className="text-gray-700 mb-2 line-clamp-3">{post.content}</div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> 0
            </span>
            <span className="flex items-center gap-1">
              <Share className="w-4 h-4" /> Share
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 