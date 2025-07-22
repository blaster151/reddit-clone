import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostCard } from '../post-card';
import * as useVotesModule from '@/hooks/useVotes';

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorId: 'user1',
  subredditId: 'sub1',
  upvotes: 10,
  downvotes: 2,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

describe('PostCard useVotes integration', () => {
  it('displays vote state from useVotes', () => {
    jest.spyOn(useVotesModule, 'useVotes').mockReturnValue({
      upvotes: 11,
      downvotes: 2,
      score: 9,
      userVote: 'upvote',
      isSubmitting: false,
      submitVote: jest.fn(),
    });
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByLabelText(/upvote/i)).toHaveClass('text-orange-500');
  });

  it('calls submitVote when upvote/downvote is clicked', () => {
    const submitVote = jest.fn();
    jest.spyOn(useVotesModule, 'useVotes').mockReturnValue({
      upvotes: 10,
      downvotes: 2,
      score: 8,
      userVote: null,
      isSubmitting: false,
      submitVote,
    });
    render(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByLabelText(/upvote/i));
    expect(submitVote).toHaveBeenCalledWith('upvote');
    fireEvent.click(screen.getByLabelText(/downvote/i));
    expect(submitVote).toHaveBeenCalledWith('downvote');
  });

  it('disables buttons when isSubmitting is true', () => {
    jest.spyOn(useVotesModule, 'useVotes').mockReturnValue({
      upvotes: 10,
      downvotes: 2,
      score: 8,
      userVote: null,
      isSubmitting: true,
      submitVote: jest.fn(),
    });
    render(<PostCard post={mockPost} />);
    expect(screen.getByLabelText(/upvote/i)).toBeDisabled();
    expect(screen.getByLabelText(/downvote/i)).toBeDisabled();
  });

  it('shows optimistic update for score', async () => {
    let score = 8;
    const submitVote = jest.fn(() => {
      score = 9;
    });
    jest.spyOn(useVotesModule, 'useVotes').mockImplementation(() => ({
      upvotes: score + 2,
      downvotes: 2,
      score,
      userVote: null,
      isSubmitting: false,
      submitVote,
    }));
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/upvote/i));
    await waitFor(() => {
      expect(screen.getByText('9')).toBeInTheDocument();
    });
  });
}); 