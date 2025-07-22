import { useState } from 'react';
import { Comment as CommentType, VoteType } from '@/types';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { ArrowBigUp, ArrowBigDown, MessageCircle, MoreHorizontal } from 'lucide-react';

interface CommentProps {
  comment: CommentType;
  onVote?: (commentId: string, voteType: VoteType) => void;
  onReply?: (commentId: string) => void;
  currentUserId?: string;
  userVote?: VoteType | null;
  isNested?: boolean;
  maxDepth?: number;
  currentDepth?: number;
}

export function Comment({
  comment,
  onVote,
  onReply,
  currentUserId,
  userVote,
  isNested = false,
  maxDepth = 5,
  currentDepth = 0,
}: CommentProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReplies, setShowReplies] = useState(true);

  const score = comment.upvotes - comment.downvotes;
  const hasReplies = false; // This would be determined by checking for child comments

  const handleVote = (voteType: VoteType) => {
    if (onVote) {
      onVote(comment.id, voteType);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(comment.id);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const isUpvoted = userVote === 'upvote';
  const isDownvoted = userVote === 'downvote';

  return (
    <div className={`comment ${isNested ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex space-x-2">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-orange-100 ${
              isUpvoted ? 'text-orange-500' : 'text-gray-400'
            }`}
            onClick={() => handleVote('upvote')}
            aria-label="Upvote comment"
          >
            <ArrowBigUp className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium text-gray-700">
            {formatNumber(score)}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-blue-100 ${
              isDownvoted ? 'text-blue-500' : 'text-gray-400'
            }`}
            onClick={() => handleVote('downvote')}
            aria-label="Downvote comment"
          >
            <ArrowBigDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-900">u/{comment.authorId}</span>
            <span>•</span>
            <span>{formatRelativeTime(comment.createdAt)}</span>
            {comment.updatedAt > comment.createdAt && (
              <>
                <span>•</span>
                <span className="italic">edited</span>
              </>
            )}
          </div>

          {/* Comment body */}
          <div className="text-gray-900 mb-3">
            {isExpanded ? (
              <div className="whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            ) : (
              <button
                onClick={toggleExpanded}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                [deleted]
              </button>
            )}
          </div>

          {/* Comment actions */}
          <div className="flex items-center space-x-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 h-8 px-2"
              onClick={handleReply}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 h-8 px-2"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Nested replies */}
          {hasReplies && currentDepth < maxDepth && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 text-sm"
                onClick={toggleReplies}
              >
                {showReplies ? 'Hide' : 'Show'} replies
              </Button>
              
              {showReplies && (
                <div className="mt-2">
                  {/* This would render child comments recursively */}
                  {/* <CommentList comments={childComments} /> */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 