import { render, screen, fireEvent } from '@testing-library/react';
import { PostFeed } from '../post-feed';
import { usePosts } from '@/hooks/usePosts';

jest.mock('@/hooks/usePosts');

const makePosts = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${i + 1}`,
    title: `Post ${i + 1}`,
    content: `Content ${i + 1}`,
    authorId: `user${i + 1}`,
    subredditId: 'sub1',
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  }));

describe('PostFeed Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows only PAGE_SIZE posts initially', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: makePosts(12), loading: false, error: null });
    render(<PostFeed />);
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 5')).toBeInTheDocument();
    expect(screen.queryByText('Post 6')).not.toBeInTheDocument();
    expect(screen.getByTestId('load-more')).toBeInTheDocument();
  });

  it('loads more posts when Load More is clicked', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: makePosts(12), loading: false, error: null });
    render(<PostFeed />);
    const loadMore = screen.getByTestId('load-more');
    fireEvent.click(loadMore);
    expect(screen.getByText('Post 6')).toBeInTheDocument();
    expect(screen.getByText('Post 10')).toBeInTheDocument();
    expect(screen.queryByText('Post 11')).not.toBeInTheDocument();
  });

  it('loads all posts after multiple clicks', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: makePosts(12), loading: false, error: null });
    render(<PostFeed />);
    const loadMore = screen.getByTestId('load-more');
    fireEvent.click(loadMore);
    fireEvent.click(loadMore);
    expect(screen.getByText('Post 11')).toBeInTheDocument();
    expect(screen.getByText('Post 12')).toBeInTheDocument();
    expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
  });

  it('does not show Load More if posts <= PAGE_SIZE', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: makePosts(3), loading: false, error: null });
    render(<PostFeed />);
    expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
  });

  it('handles empty posts', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: [], loading: false, error: null });
    render(<PostFeed />);
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });
}); 