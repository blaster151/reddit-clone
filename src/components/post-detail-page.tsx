import { useEffect, useState } from 'react';
import { PostCard } from './post-card';
import { CommentThread } from './comment-thread';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  subredditId: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

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

interface PostDetailPageProps {
  postId: string;
  fetchPost: (id: string) => Promise<Post>;
  fetchComments: (postId: string) => Promise<Comment[]>;
}

export function PostDetailPage({ postId, fetchPost, fetchComments }: PostDetailPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPost(postId)
      .then((p) => {
        setPost(p);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post');
        setLoading(false);
      });
  }, [postId, fetchPost]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading post...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!post) {
    return <div className="p-8 text-center text-gray-400">Post not found.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <PostCard post={post} />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        <CommentThread postId={post.id} fetchComments={fetchComments} />
      </div>
    </div>
  );
} 