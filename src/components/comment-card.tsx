import { useVotes } from '@/hooks/useVotes';
import { ArrowBigUp, ArrowBigDown, Shield } from 'lucide-react';
import { ModerationActions } from './moderation-actions';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string;
  upvotes: number;
  downvotes: number;
  isRemoved: boolean;
  removedById?: string;
  removedAt?: Date;
  removalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentCardProps {
  comment: Comment;
  onVote?: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  isModerator?: boolean;
  onRemove?: (commentId: string, reason: string) => void;
  onBanUser?: (userId: string, reason: string, isPermanent: boolean) => void;
  onMuteUser?: (userId: string, reason: string, isPermanent: boolean) => void;
}

export function CommentCard({ 
  comment, 
  onVote, 
  isModerator = false, 
  onRemove, 
  onBanUser, 
  onMuteUser 
}: CommentCardProps) {
  const {
    upvotes,
    downvotes,
    score,
    userVote,
    isSubmitting,
    submitVote,
  } = useVotes({
    targetId: comment.id,
    targetType: 'comment',
    initialUpvotes: comment.upvotes,
    initialDownvotes: comment.downvotes,
    onVoteChange: (voteType) => {
      if (onVote && voteType) onVote(comment.id, voteType);
    },
  });

  // Show removed comment content
  if (comment.isRemoved) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600 font-medium">Comment removed by moderator</span>
        </div>
        {comment.removalReason && (
          <div className="text-sm text-gray-600 mb-2">Reason: {comment.removalReason}</div>
        )}
        <div className="text-sm text-gray-500">
          Removed on {comment.removedAt ? new Date(comment.removedAt).toLocaleDateString() : 'unknown date'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center mr-2">
          <button
            aria-label="upvote"
            className={`mb-1 ${userVote === 'upvote' ? 'text-orange-500' : ''}`}
            onClick={() => submitVote('upvote')}
            disabled={isSubmitting}
          >
            <ArrowBigUp />
          </button>
          <div className="font-bold text-center min-w-[2rem]">{score}</div>
          <button
            aria-label="downvote"
            className={`mt-1 ${userVote === 'downvote' ? 'text-blue-500' : ''}`}
            onClick={() => submitVote('downvote')}
            disabled={isSubmitting}
          >
            <ArrowBigDown />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-gray-700">{comment.content}</div>
            {isModerator && (
              <ModerationActions
                targetId={comment.id}
                targetType="comment"
                authorId={comment.authorId}
                subredditId="" // We'll need to pass this from parent
                isModerator={isModerator}
                onRemove={onRemove}
                onBanUser={onBanUser}
                onMuteUser={onMuteUser}
              />
            )}
          </div>
          <div className="text-xs text-gray-500">by {comment.authorId}</div>
        </div>
      </div>
    </div>
  );
} 