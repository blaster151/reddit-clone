import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../post-card';
import * as useVotesModule from '@/hooks/useVotes';
import { act } from 'react-dom/test-utils';

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

describe('PostCard vote count animation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds flash class when score changes', () => {
    let score = 8;
    const submitVote = jest.fn(() => {
      score = 9;
      return Promise.resolve();
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
    const scoreDiv = screen.getByTestId('post-score');
    expect(scoreDiv.className).not.toContain('bg-yellow-200');
    fireEvent.click(screen.getByLabelText(/upvote/i));
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(scoreDiv.className).toContain('bg-yellow-200');
  });

  it('removes flash class after animation duration', () => {
    let score = 8;
    const submitVote = jest.fn(() => {
      score = 9;
      return Promise.resolve();
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
    const scoreDiv = screen.getByTestId('post-score');
    fireEvent.click(screen.getByLabelText(/upvote/i));
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(scoreDiv.className).not.toContain('bg-yellow-200');
  });
}); 