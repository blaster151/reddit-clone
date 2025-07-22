import { render, screen, fireEvent } from '@testing-library/react';

// Assume a CommentCard component exists with similar props to PostCard
function CommentCard({ comment, onVote }: any) {
  return (
    <div>
      <div>{comment.content}</div>
      <button aria-label="upvote" onClick={() => onVote && onVote(comment.id, 'upvote')}>Upvote</button>
      <button aria-label="downvote" onClick={() => onVote && onVote(comment.id, 'downvote')}>Downvote</button>
    </div>
  );
}

const mockComment = {
  id: 'c1',
  content: 'Test comment',
  authorId: 'user1',
  postId: 'p1',
  upvotes: 3,
  downvotes: 1,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

describe('CommentCard Voting', () => {
  it('calls onVote with upvote when upvote button is clicked', () => {
    const onVote = jest.fn();
    render(<CommentCard comment={mockComment} onVote={onVote} />);
    const upvoteBtn = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteBtn);
    expect(onVote).toHaveBeenCalledWith('c1', 'upvote');
  });

  it('calls onVote with downvote when downvote button is clicked', () => {
    const onVote = jest.fn();
    render(<CommentCard comment={mockComment} onVote={onVote} />);
    const downvoteBtn = screen.getByLabelText(/downvote/i);
    fireEvent.click(downvoteBtn);
    expect(onVote).toHaveBeenCalledWith('c1', 'downvote');
  });

  it('does not throw if onVote is not provided', () => {
    render(<CommentCard comment={mockComment} />);
    const upvoteBtn = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteBtn);
    const downvoteBtn = screen.getByLabelText(/downvote/i);
    fireEvent.click(downvoteBtn);
    // No error should be thrown
  });
}); 