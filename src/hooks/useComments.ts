import { useState, useCallback, useEffect } from 'react';
import { Comment } from '@/types';

interface UseCommentsOptions {
  postId?: string;
  parentCommentId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'new' | 'top' | 'controversial';
}

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  fetchComments: (options?: UseCommentsOptions) => Promise<void>;
  createComment: (commentData: Partial<Comment>) => Promise<Comment>;
  updateComment: (commentId: string, updates: Partial<Comment>) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;
  loadMore: () => void;
  refreshComments: () => void;
}

export function useComments(initialOptions: UseCommentsOptions = {}): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialOptions.page || 1);

  const fetchComments = useCallback(async (options: UseCommentsOptions = {}) => {
    const {
      postId,
      parentCommentId,
      page: pageNum = 1,
      pageSize = 10,
      sortBy = 'new'
    } = { ...initialOptions, ...options };

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy
      });

      if (postId) {
        params.append('postId', postId);
      }

      if (parentCommentId) {
        params.append('parentCommentId', parentCommentId);
      }

      const response = await fetch(`/api/comments?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setComments(data.comments || []);
      } else {
        setComments(prev => [...prev, ...(data.comments || [])]);
      }
      
      setHasMore(data.hasMore !== false);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, [initialOptions]);

  const createComment = useCallback(async (commentData: Partial<Comment>): Promise<Comment> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const newComment = await response.json();
      setComments(prev => [newComment.comment, ...prev]);
      return newComment.comment;
    } catch (err: any) {
      setError(err.message || 'Failed to create comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateComment = useCallback(async (commentId: string, updates: Partial<Comment>): Promise<Comment> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? updatedComment.comment : comment
        )
      );
      return updatedComment.comment;
    } catch (err: any) {
      setError(err.message || 'Failed to update comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchComments({ ...initialOptions, page: page + 1 });
    }
  }, [hasMore, isLoading, page, fetchComments, initialOptions]);

  const refreshComments = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchComments({ ...initialOptions, page: 1 });
  }, [fetchComments, initialOptions]);

  // Initial fetch
  useEffect(() => {
    if (initialOptions.postId) {
      fetchComments(initialOptions);
    }
  }, [initialOptions.postId, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    hasMore,
    page,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    loadMore,
    refreshComments,
  };
} 