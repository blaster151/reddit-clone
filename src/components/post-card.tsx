'use client';

import { Post } from '@/types';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share } from 'lucide-react';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, voteType: 'upvote' | 'downvote') => void;
}

export function PostCard({ post, onVote }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (userVote === voteType) {
      // Remove vote
      setUserVote(null);
      if (voteType === 'upvote') {
        setUpvotes(upvotes - 1);
      } else {
        setDownvotes(downvotes - 1);
      }
    } else {
      // Add or change vote
      if (userVote === 'upvote') {
        setUpvotes(upvotes - 1);
      } else if (userVote === 'downvote') {
        setDownvotes(downvotes - 1);
      }

      setUserVote(voteType);
      if (voteType === 'upvote') {
        setUpvotes(upvotes + 1);
      } else {
        setDownvotes(downvotes + 1);
      }
    }

    onVote?.(post.id, voteType);
  };

  const score = upvotes - downvotes;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex gap-3">
        {/* Voting */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 hover:bg-orange-100 ${
              userVote === 'upvote' ? 'text-orange-500' : 'text-gray-400'
            }`}
            onClick={() => handleVote('upvote')}
          >
            <ArrowBigUp className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-gray-900">{formatNumber(score)}</span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 hover:bg-blue-100 ${
              userVote === 'downvote' ? 'text-blue-500' : 'text-gray-400'
            }`}
            onClick={() => handleVote('downvote')}
          >
            <ArrowBigDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-900">r/subreddit</span>
            <span>•</span>
            <span>Posted by u/username</span>
            <span>•</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>

          {post.content && (
            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(0)} Comments</span>
            </button>
            <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 