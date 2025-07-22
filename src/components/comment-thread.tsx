import { useEffect, useState } from 'react';

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
  replies?: Comment[];
}

interface CommentThreadProps {
  postId: string;
  fetchComments: (postId: string) => Promise<Comment[]>;
}

export function CommentThread({ postId, fetchComments }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
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

  function renderComments(comments: Comment[], parentId?: string, level = 0) {
    return comments
      .filter((c) => c.parentCommentId === parentId)
      .map((comment) => (
        <div key={comment.id} style={{ marginLeft: level * 24 }} className="mb-4">
          <div className="bg-gray-100 rounded p-3">
            <div className="text-sm text-gray-700">{comment.content}</div>
            <div className="text-xs text-gray-500 mt-1">by {comment.authorId}</div>
          </div>
          {renderComments(comments, comment.id, level + 1)}
        </div>
      ));
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading comments...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  if (!comments || comments.length === 0) {
    return <div className="p-4 text-center text-gray-400">No comments yet. Be the first to comment!</div>;
  }
  return <div>{renderComments(comments)}</div>;
} 