import { useVotes } from '@/hooks/useVotes';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentCardProps {
  comment: Comment;
  onVote?: (commentId: string, voteType: 'upvote' | 'downvote') => void;
}

export function CommentCard({ comment, onVote }: CommentCardProps) {
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
          <div className="text-sm text-gray-700 mb-1">{comment.content}</div>
          <div className="text-xs text-gray-500">by {comment.authorId}</div>
        </div>
      </div>
    </div>
  );
} 