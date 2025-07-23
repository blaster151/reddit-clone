'use client';

import { Post } from '@/types';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share, Shield } from 'lucide-react';
import { useVotes } from '@/hooks/useVotes';
import { useState, useEffect, useRef } from 'react';
import { ModerationActions } from './moderation-actions';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { generateAccessibleLabel, generateDescribedBy } from '@/components/ui/accessibility';

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
 * - Mobile-responsive design with touch-friendly interactions
 * - Keyboard navigation and accessibility features
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

  // Keyboard navigation for voting buttons
  const { handleKeyDown } = useKeyboardNavigation({
    itemsCount: 2, // upvote and downvote buttons
    onEnter: (index) => {
      if (index === 0) submitVote('upvote');
      else if (index === 1) submitVote('downvote');
    },
    shortcuts: {
      'ArrowUp': () => submitVote('upvote'),
      'ArrowDown': () => submitVote('downvote'),
      'KeyU': () => submitVote('upvote'),
      'KeyD': () => submitVote('downvote'),
    }
  });

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

  // Generate accessible labels
  const upvoteLabel = generateAccessibleLabel('upvote', 'post', `by ${post.authorId}`);
  const downvoteLabel = generateAccessibleLabel('downvote', 'post', `by ${post.authorId}`);
  const commentLabel = generateAccessibleLabel('view', 'comments', `for post by ${post.authorId}`);
  const shareLabel = generateAccessibleLabel('share', 'post', `by ${post.authorId}`);

  // Show removed post content
  if (post.isRemoved) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4"
        role="article"
        aria-label={`Removed post by ${post.authorId}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
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
    <article 
      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors"
      role="article"
      aria-labelledby={`post-title-${post.id}`}
      aria-describedby={`post-content-${post.id}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Voting Section - Mobile Optimized */}
        <div className="flex flex-col items-center mr-2 sm:mr-3 flex-shrink-0" role="group" aria-label="Voting controls">
          <Button
            aria-label={upvoteLabel}
            size="icon"
            className={`mb-1 h-8 w-8 sm:h-10 sm:w-10 ${userVote === 'upvote' ? 'text-orange-500' : ''}`}
            onClick={() => submitVote('upvote')}
            disabled={isSubmitting}
            aria-pressed={userVote === 'upvote'}
            aria-describedby={generateDescribedBy(post.id, 'upvote')}
          >
            <ArrowBigUp className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </Button>
          <div
            className={`font-bold text-center min-w-[2rem] transition-colors duration-300 text-sm sm:text-base ${
              flash ? 'bg-yellow-200 animate-pulse' : ''
            }`}
            data-testid="post-score"
            role="status"
            aria-live="polite"
            aria-label={`Score: ${formatNumber(score)}`}
          >
            {formatNumber(score)}
          </div>
          <Button
            aria-label={downvoteLabel}
            size="icon"
            className={`mt-1 h-8 w-8 sm:h-10 sm:w-10 ${userVote === 'downvote' ? 'text-blue-500' : ''}`}
            onClick={() => submitVote('downvote')}
            disabled={isSubmitting}
            aria-pressed={userVote === 'downvote'}
            aria-describedby={generateDescribedBy(post.id, 'downvote')}
          >
            <ArrowBigDown className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header with metadata and moderation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-700">{post.authorId}</span>
              <span className="text-xs text-gray-400 hidden sm:inline" aria-hidden="true">•</span>
              <time 
                className="text-xs text-gray-500" 
                dateTime={post.createdAt.toISOString()}
                aria-label={`Posted ${formatRelativeTime(post.createdAt)}`}
              >
                {formatRelativeTime(post.createdAt)}
              </time>
            </div>
            {isModerator && (
              <div className="flex-shrink-0">
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
              </div>
            )}
          </div>

          {/* Title and Content */}
          <h2 
            id={`post-title-${post.id}`}
            className="text-base sm:text-lg font-bold mb-2 line-clamp-2 sm:line-clamp-none"
          >
            {post.title}
          </h2>
          <div 
            id={`post-content-${post.id}`}
            className="text-gray-700 mb-3 line-clamp-3 sm:line-clamp-none text-sm sm:text-base"
          >
            {post.content}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500" role="group" aria-label="Post actions">
            <button 
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
              aria-label={commentLabel}
              onClick={() => console.log('View comments')}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">0 comments</span>
              <span className="sm:hidden">0</span>
            </button>
            <button 
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
              aria-label={shareLabel}
              onClick={() => console.log('Share post')}
            >
              <Share className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden descriptions for screen readers */}
      <div id={generateDescribedBy(post.id, 'upvote')} className="sr-only">
        Upvote this post. Current score is {formatNumber(score)}.
      </div>
      <div id={generateDescribedBy(post.id, 'downvote')} className="sr-only">
        Downvote this post. Current score is {formatNumber(score)}.
      </div>
    </article>
  );
} 