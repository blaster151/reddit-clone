import { useState } from 'react';
import { PostCard } from './post-card';
import { usePosts } from '@/hooks/usePosts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PostCardSkeleton } from '@/components/ui/skeleton';

export function PostFeed() {
  const { posts, loading, error } = usePosts();
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
        <div className="flex justify-center py-4">
          <LoadingSpinner text="Loading posts..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
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

  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 mb-4">No posts yet. Be the first to post!</div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded">
          Create Post
        </button>
      </div>
    );
  }

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div className="space-y-4">
      {visiblePosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            data-testid="load-more"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
} 