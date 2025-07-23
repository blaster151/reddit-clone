import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentCard } from '../comment-card';
import * as useVotesModule from '@/hooks/useVotes';

const mockComment = {
  id: 'c1',
  content: 'Test comment',
  authorId: 'user1',
  postId: 'p1',
  upvotes: 3,
  downvotes: 1,
  isRemoved: false,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

describe('CommentCard useVotes integration', () => {
  it('displays vote state from useVotes', () => {
    jest.spyOn(useVotesModule, 'useVotes').mockReturnValue({
      upvotes: 4,
      downvotes: 1,
      score: 3,
      userVote: 'upvote',
      isSubmitting: false,
      submitVote: jest.fn(() => Promise.resolve()),
    });
    render(<CommentCard comment={mockComment} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByLabelText(/upvote/i)).toHaveClass('text-orange-500');
  });

  it('calls submitVote when upvote/downvote is clicked', () => {
    const submitVote = jest.fn(() => Promise.resolve());
    jest.spyOn(useVotesModule, 'useVotes').mockReturnValue({
      upvotes: 3,
      downvotes: 1,
      score: 2,
      userVote: null,
      isSubmitting: false,
      submitVote,
    });
    render(<CommentCard comment={mockComment} />);
    fireEvent.click(screen.getByLabelText(/upvote/i));
    expect(submitVote).toHaveBeenCalledWith('upvote');
    fireEvent.click(screen.getByLabelText(/downvote/i));
    expect(submitVote).toHaveBeenCalledWith('downvote');
  });

  it('disables buttons when isSubmitting is true', () => {
    jest.spyOn(useVotesModule, 'useVotes').mockReturnValue({
      upvotes: 3,
      downvotes: 1,
      score: 2,
      userVote: null,
      isSubmitting: true,
      submitVote: jest.fn(() => Promise.resolve()),
    });
    render(<CommentCard comment={mockComment} />);
    expect(screen.getByLabelText(/upvote/i)).toBeDisabled();
    expect(screen.getByLabelText(/downvote/i)).toBeDisabled();
  });

  it('shows optimistic update for score', async () => {
    let score = 2;
    const submitVote = jest.fn(() => {
      score = 3;
      return Promise.resolve();
    });
    jest.spyOn(useVotesModule, 'useVotes').mockImplementation(() => ({
      upvotes: score + 1,
      downvotes: 1,
      score,
      userVote: null,
      isSubmitting: false,
      submitVote,
    }));
    render(<CommentCard comment={mockComment} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/upvote/i));
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
}); 