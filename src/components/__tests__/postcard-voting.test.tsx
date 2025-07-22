import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../post-card';

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

describe('PostCard Voting', () => {
  it('calls onVote with upvote when upvote button is clicked', () => {
    const onVote = jest.fn();
    render(<PostCard post={mockPost} onVote={onVote} />);
    const upvoteBtn = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteBtn);
    expect(onVote).toHaveBeenCalledWith('1', 'upvote');
  });

  it('calls onVote with downvote when downvote button is clicked', () => {
    const onVote = jest.fn();
    render(<PostCard post={mockPost} onVote={onVote} />);
    const downvoteBtn = screen.getByLabelText(/downvote/i);
    fireEvent.click(downvoteBtn);
    expect(onVote).toHaveBeenCalledWith('1', 'downvote');
  });

  it('does not throw if onVote is not provided', () => {
    render(<PostCard post={mockPost} />);
    const upvoteBtn = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteBtn);
    const downvoteBtn = screen.getByLabelText(/downvote/i);
    fireEvent.click(downvoteBtn);
    // No error should be thrown
  });
}); 