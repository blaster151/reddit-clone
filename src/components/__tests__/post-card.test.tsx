import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../post-card';
import { Post } from '@/types';

const mockPost: Post = {
  id: '1',
  title: 'Test Post Title',
  content: 'This is a test post content that should be displayed properly.',
  authorId: 'user1',
  author: {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    karma: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  subredditId: 'sub1',
  subreddit: {
    id: 'sub1',
    name: 'testsubreddit',
    description: 'A test subreddit',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  upvotes: 42,
  downvotes: 5,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

describe('PostCard', () => {
  const mockOnVote = jest.fn();

  beforeEach(() => {
    mockOnVote.mockClear();
  });

  it('renders post with correct title and content', () => {
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test post content that should be displayed properly.')).toBeInTheDocument();
  });

  it('displays post metadata correctly', () => {
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('r/testsubreddit')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument(); // upvotes - downvotes
  });

  it('calls onVote when upvote button is clicked', () => {
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    const upvoteButton = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteButton);

    expect(mockOnVote).toHaveBeenCalledWith('1', 'upvote');
  });

  it('calls onVote when downvote button is clicked', () => {
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    const downvoteButton = screen.getByLabelText(/downvote/i);
    fireEvent.click(downvoteButton);

    expect(mockOnVote).toHaveBeenCalledWith('1', 'downvote');
  });

  it('displays vote count correctly', () => {
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    // Should show upvotes - downvotes = 42 - 5 = 37
    expect(screen.getByText('37')).toBeInTheDocument();
  });

  it('handles posts with zero votes', () => {
    const postWithZeroVotes = {
      ...mockPost,
      upvotes: 0,
      downvotes: 0,
    };

    render(<PostCard post={postWithZeroVotes} onVote={mockOnVote} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles posts with negative vote scores', () => {
    const postWithNegativeVotes = {
      ...mockPost,
      upvotes: 5,
      downvotes: 10,
    };

    render(<PostCard post={postWithNegativeVotes} onVote={mockOnVote} />);

    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('displays comment count correctly', () => {
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    // Should show comment count (assuming 0 for this test)
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders without onVote prop', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('handles long titles gracefully', () => {
    const postWithLongTitle = {
      ...mockPost,
      title: 'This is a very long post title that should be handled properly by the component without breaking the layout or causing overflow issues',
    };

    render(<PostCard post={postWithLongTitle} onVote={mockOnVote} />);

    expect(screen.getByText(/This is a very long post title/)).toBeInTheDocument();
  });

  it('handles empty content', () => {
    const postWithEmptyContent = {
      ...mockPost,
      content: '',
    };

    render(<PostCard post={postWithEmptyContent} onVote={mockOnVote} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    // Should not crash or show undefined content
  });
}); 