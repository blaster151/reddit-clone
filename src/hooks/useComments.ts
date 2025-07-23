import { useState, useCallback, useEffect } from 'react';
import { Comment } from '@/types';

/**
 * Options for fetching and managing comments
 */
interface UseCommentsOptions {
  /** ID of the post to fetch comments for */
  postId?: string;
  /** ID of the parent comment for nested replies */
  parentCommentId?: string;
  /** Page number for pagination (1-based) */
  page?: number;
  /** Number of comments per page */
  pageSize?: number;
  /** Sort order for comments */
  sortBy?: 'new' | 'top' | 'controversial';
}

/**
 * Return type for the useComments hook
 */
interface UseCommentsReturn {
  /** Array of comments for the current post/thread */
  comments: Comment[];
  /** Whether a comment operation is in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Whether there are more comments to load */
  hasMore: boolean;
  /** Current page number */
  page: number;
  /** Function to fetch comments with optional filters */
  fetchComments: (options?: UseCommentsOptions) => Promise<void>;
  /** Function to create a new comment */
  createComment: (commentData: Partial<Comment>) => Promise<Comment>;
  /** Function to update an existing comment */
  updateComment: (commentId: string, updates: Partial<Comment>) => Promise<Comment>;
  /** Function to delete a comment */
  deleteComment: (commentId: string) => Promise<void>;
  /** Function to load the next page of comments */
  loadMore: () => void;
  /** Function to refresh the current comments */
  refreshComments: () => void;
}

/**
 * Custom hook for managing comments data and operations
 * 
 * This hook provides a complete comment management system including:
 * - Fetching comments with pagination and filtering
 * - Creating, updating, and deleting comments
 * - Loading states and error handling
 * - Optimistic updates for better UX
 * 
 * @param initialOptions - Initial options for comment fetching
 * @returns {UseCommentsReturn} Object containing comments state and functions
 * 
 * @example
 * ```tsx
 * function CommentThread({ postId }) {
 *   const { 
 *     comments, 
 *     isLoading, 
 *     createComment, 
 *     loadMore 
 *   } = useComments({ postId });
 *   
 *   const handleNewComment = async (content) => {
 *     await createComment({ content, postId });
 *   };
 * }
 * ```
 */
export function useComments(initialOptions: UseCommentsOptions = {}): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialOptions.page || 1);

  /**
   * Fetches comments from the API with optional filtering and pagination
   * 
   * @param options - Options for fetching comments
   * @throws {Error} When the API request fails
   */
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

  /**
   * Creates a new comment
   * 
   * @param commentData - Data for the new comment
   * @returns {Promise<Comment>} The created comment
   * @throws {Error} When the API request fails
   */
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

  /**
   * Updates an existing comment
   * 
   * @param commentId - ID of the comment to update
   * @param updates - Partial comment data to update
   * @returns {Promise<Comment>} The updated comment
   * @throws {Error} When the API request fails
   */
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

  /**
   * Deletes a comment
   * 
   * @param commentId - ID of the comment to delete
   * @throws {Error} When the API request fails
   */
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

  /**
   * Loads the next page of comments
   * 
   * Only loads if there are more comments available and no operation is in progress
   */
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchComments({ ...initialOptions, page: page + 1 });
    }
  }, [hasMore, isLoading, page, fetchComments, initialOptions]);

  /**
   * Refreshes the current comments by resetting to page 1
   */
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