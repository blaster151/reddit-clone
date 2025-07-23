import { useState, useEffect } from 'react';
import { Comment as CommentType } from '@/types';
import { Comment } from './comment';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CommentSkeleton } from '@/components/ui/skeleton';

interface CommentThreadProps {
  postId: string;
  fetchComments: (postId: string) => Promise<CommentType[]>;
}

export function CommentThread({ postId, fetchComments }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchComments(postId)
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load comments');
        setLoading(false);
      });
  }, [postId, fetchComments]);

  function renderComments(comments: CommentType[], parentId?: string, level = 0) {
    return comments
      .filter((c) => c.parentCommentId === parentId)
      .map((comment) => (
        <div key={comment.id} style={{ marginLeft: level * 24 }} className="mb-4">
          <Comment comment={comment} />
          {renderComments(comments, comment.id, level + 1)}
        </div>
      ));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <CommentSkeleton key={index} />
        ))}
        <div className="flex justify-center py-4">
          <LoadingSpinner text="Loading comments..." />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-orange-500 hover:text-orange-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (!comments || comments.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-400 mb-4">No comments yet. Be the first to comment!</div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded">
          Add Comment
        </button>
      </div>
    );
  }
  
  return <div>{renderComments(comments)}</div>;
} 