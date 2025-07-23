import { useEffect, useState } from 'react';
import { Post } from '@/types';

/**
 * Custom hook for fetching and managing posts data
 * 
 * This hook provides a simple interface for fetching posts from the API
 * with automatic loading states and error handling.
 * 
 * @returns Object containing posts data, loading state, and error state
 * 
 * @example
 * ```tsx
 * function PostFeed() {
 *   const { posts, loading, error } = usePosts();
 *   
 *   if (loading) return <div>Loading posts...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       {posts.map(post => (
 *         <PostCard key={post.id} post={post} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches posts from the API
     * 
     * Sets loading state, makes API request, and updates posts state.
     * Handles errors gracefully and sets appropriate error messages.
     */
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        // Placeholder: Replace with real API call
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return { 
    /** Array of posts fetched from the API */
    posts, 
    /** Whether posts are currently being fetched */
    loading, 
    /** Error message if posts fetching failed */
    error 
  };
} 