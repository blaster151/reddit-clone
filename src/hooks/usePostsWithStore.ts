import { useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { usePosts as usePostsStore } from '@/store';

export function usePostsWithStore() {
  const {
    posts,
    currentPost,
    isLoading,
    error,
    hasMore,
    page,
    setPosts,
    addPost,
    updatePost,
    removePost,
    setCurrentPost,
    setPostsLoading,
    setPostsError,
    setHasMore,
    setPage,
    loadMorePosts,
  } = usePostsStore();

  const fetchPosts = useCallback(async (subredditId?: string) => {
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const url = subredditId 
        ? `/api/posts?subredditId=${subredditId}&page=${page}`
        : `/api/posts?page=${page}`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts([...posts, ...(data.posts || [])]);
      }
      
      setHasMore(data.hasMore !== false);
      setPostsError(null);
    } catch (err: any) {
      setPostsError(err.message || 'Failed to fetch posts');
    } finally {
      setPostsLoading(false);
    }
  }, [page, posts, setPosts, setPostsLoading, setPostsError, setHasMore]);

  const createPost = useCallback(async (postData: Partial<Post>) => {
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      addPost(newPost.post);
      setPostsError(null);
      return newPost.post;
    } catch (err: any) {
      setPostsError(err.message || 'Failed to create post');
      throw err;
    } finally {
      setPostsLoading(false);
    }
  }, [addPost, setPostsLoading, setPostsError]);

  const fetchPostById = useCallback(async (postId: string) => {
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      setCurrentPost(data.post);
      setPostsError(null);
      return data.post;
    } catch (err: any) {
      setPostsError(err.message || 'Failed to fetch post');
      throw err;
    } finally {
      setPostsLoading(false);
    }
  }, [setCurrentPost, setPostsLoading, setPostsError]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [hasMore, isLoading, loadMorePosts]);

  const refreshPosts = useCallback(() => {
    setPage(1);
    setHasMore(true);
    // This will trigger a re-fetch on next render
  }, [setPage, setHasMore]);

  return {
    posts,
    currentPost,
    isLoading,
    error,
    hasMore,
    page,
    fetchPosts,
    createPost,
    fetchPostById,
    updatePost,
    removePost,
    loadMore,
    refreshPosts,
    setCurrentPost,
  };
} 