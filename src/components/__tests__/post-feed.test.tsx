import { render, screen } from '@testing-library/react';
import { PostFeed } from '../post-feed';
import { usePosts } from '@/hooks/usePosts';

jest.mock('@/hooks/usePosts');

const mockPosts = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Content 1',
    authorId: 'user1',
    subredditId: 'sub1',
    upvotes: 10,
    downvotes: 2,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: '2',
    title: 'Test Post 2',
    content: 'Content 2',
    authorId: 'user2',
    subredditId: 'sub2',
    upvotes: 5,
    downvotes: 1,
    createdAt: new Date('2024-01-02T10:00:00Z'),
    updatedAt: new Date('2024-01-02T10:00:00Z'),
  },
];

describe('PostFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: [], loading: true, error: null });
    render(<PostFeed />);
    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: [], loading: false, error: 'Failed to fetch posts' });
    render(<PostFeed />);
    expect(screen.getByText(/failed to fetch posts/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: [], loading: false, error: null });
    render(<PostFeed />);
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });

  it('renders a list of posts', () => {
    (usePosts as jest.Mock).mockReturnValue({ posts: mockPosts, loading: false, error: null });
    render(<PostFeed />);
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });
}); 