import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostFeed } from '../post-feed';
import { usePosts } from '@/store';
import { Post } from '@/types';

// Mock the store
jest.mock('@/store', () => ({
  usePosts: jest.fn(),
}));

const mockUsePosts = usePosts as jest.MockedFunction<typeof usePosts>;

describe('Zustand Store Integration', () => {
  const mockPost: Post = {
    id: 'post-1',
    title: 'Test Post',
    content: 'Test content',
    authorId: 'user-1',
    subredditId: 'subreddit-1',
    upvotes: 10,
    downvotes: 2,
    isRemoved: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockUsePosts.mockClear();
  });

  describe('PostFeed with Zustand Store', () => {
    it('should render posts from store state', () => {
      mockUsePosts.mockReturnValue({
        posts: [mockPost],
        currentPost: null,
        isLoading: false,
        error: null,
        hasMore: false,
        page: 1,
        setPosts: jest.fn(),
        addPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: jest.fn(),
      });

      render(<PostFeed />);

      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should show loading state from store', () => {
      mockUsePosts.mockReturnValue({
        posts: [],
        currentPost: null,
        isLoading: true,
        error: null,
        hasMore: false,
        page: 1,
        setPosts: jest.fn(),
        addPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: jest.fn(),
      });

      render(<PostFeed />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error state from store', () => {
      mockUsePosts.mockReturnValue({
        posts: [],
        currentPost: null,
        isLoading: false,
        error: 'Failed to fetch posts',
        hasMore: false,
        page: 1,
        setPosts: jest.fn(),
        addPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: jest.fn(),
      });

      render(<PostFeed />);

      expect(screen.getByText('Failed to fetch posts')).toBeInTheDocument();
    });

    it('should call store actions when user interacts', () => {
      const mockLoadMorePosts = jest.fn();
      const mockUpdatePost = jest.fn();

      mockUsePosts.mockReturnValue({
        posts: [mockPost],
        currentPost: null,
        isLoading: false,
        error: null,
        hasMore: true,
        page: 1,
        setPosts: jest.fn(),
        addPost: jest.fn(),
        updatePost: mockUpdatePost,
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: mockLoadMorePosts,
      });

      render(<PostFeed />);

      // Test load more functionality
      const loadMoreButton = screen.getByText(/load more/i);
      fireEvent.click(loadMoreButton);

      expect(mockLoadMorePosts).toHaveBeenCalled();
    });

    it('should handle empty posts state', () => {
      mockUsePosts.mockReturnValue({
        posts: [],
        currentPost: null,
        isLoading: false,
        error: null,
        hasMore: false,
        page: 1,
        setPosts: jest.fn(),
        addPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: jest.fn(),
      });

      render(<PostFeed />);

      expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    });
  });

  describe('Store State Updates', () => {
    it('should re-render when store state changes', async () => {
      const mockSetPosts = jest.fn();
      let currentPosts: Post[] = [];

      mockUsePosts.mockImplementation(() => ({
        posts: currentPosts,
        currentPost: null,
        isLoading: false,
        error: null,
        hasMore: false,
        page: 1,
        setPosts: mockSetPosts,
        addPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: jest.fn(),
      }));

      const { rerender } = render(<PostFeed />);

      // Initially no posts
      expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();

      // Update posts in store
      currentPosts = [mockPost];
      mockUsePosts.mockImplementation(() => ({
        posts: currentPosts,
        currentPost: null,
        isLoading: false,
        error: null,
        hasMore: false,
        page: 1,
        setPosts: mockSetPosts,
        addPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
        setCurrentPost: jest.fn(),
        setPostsLoading: jest.fn(),
        setPostsError: jest.fn(),
        setHasMore: jest.fn(),
        setPage: jest.fn(),
        loadMorePosts: jest.fn(),
      }));

      rerender(<PostFeed />);

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
      });
    });
  });
}); 