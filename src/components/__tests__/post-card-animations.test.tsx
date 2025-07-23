import { render, screen } from '@testing-library/react';
import { PostCard } from '../post-card';
import * as useVotesModule from '@/hooks/useVotes';

// Mock the useVotes hook
jest.mock('@/hooks/useVotes');
const mockUseVotes = jest.mocked(useVotesModule.useVotes);

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorId: 'user1',
  subredditId: 'sub1',
  upvotes: 10,
  downvotes: 2,
  score: 8,
  isRemoved: false,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

describe('PostCard vote count animation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct score display', () => {
    mockUseVotes.mockReturnValue({
      upvotes: 10,
      downvotes: 2,
      score: 8,
      userVote: null,
      isSubmitting: false,
      submitVote: jest.fn(() => Promise.resolve()),
    });

    render(<PostCard post={mockPost} />);
    
    const scoreElement = screen.getByText('8');
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveAttribute('data-testid', 'post-score');
  });

  it('has proper accessibility attributes for voting', () => {
    mockUseVotes.mockReturnValue({
      upvotes: 10,
      downvotes: 2,
      score: 8,
      userVote: null,
      isSubmitting: false,
      submitVote: jest.fn(() => Promise.resolve()),
    });

    render(<PostCard post={mockPost} />);
    
    const upvoteButton = screen.getByLabelText(/upvote/i);
    const downvoteButton = screen.getByLabelText(/downvote/i);
    
    expect(upvoteButton).toBeInTheDocument();
    expect(downvoteButton).toBeInTheDocument();
    expect(upvoteButton).toHaveAttribute('aria-pressed', 'false');
    expect(downvoteButton).toHaveAttribute('aria-pressed', 'false');
  });
}); 