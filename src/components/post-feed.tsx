import { PostCard } from './post-card';
import { usePosts } from '@/hooks/usePosts';

export function PostFeed() {
  const { posts, loading, error } = usePosts();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading posts...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="p-8 text-center text-gray-400">No posts yet. Be the first to post!</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
} 