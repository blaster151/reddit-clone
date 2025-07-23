import { useState, useEffect } from 'react';
import { PostCard } from './post-card';
import { usePostsWithStore } from '@/hooks/usePostsWithStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PostCardSkeleton } from '@/components/ui/skeleton';

interface PostFeedProps {
  subredditId?: string;
}

export function PostFeed({ subredditId }: PostFeedProps) {
  const { 
    posts, 
    isLoading, 
    error, 
    hasMore, 
    fetchPosts, 
    loadMore 
  } = usePostsWithStore();
  
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Fetch posts on mount and when subredditId changes
  useEffect(() => {
    fetchPosts(subredditId);
  }, [fetchPosts, subredditId]);

  const handleLoadMore = () => {
    if (hasMore) {
      loadMore();
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  };

  if (isLoading && posts.length === 0) {
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

  if (error && posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => fetchPosts(subredditId)}
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

  return (
    <div className="space-y-4">
      {visiblePosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {isLoading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner text="Loading more posts..." />
        </div>
      )}
      
      {hasMore && visibleCount >= posts.length && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-2 px-6 rounded"
          >
            {isLoading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more posts to load
        </div>
      )}
    </div>
  );
} 