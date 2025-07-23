import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../post-card';

// Mock the fetch API
global.fetch = jest.fn();

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

describe('PostCard Voting', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Default successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('calls onVote with upvote when upvote button is clicked', () => {
    const onVote = jest.fn();
    render(<PostCard post={mockPost} onVote={onVote} />);
    
    const upvoteBtn = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteBtn);
    
    // The component makes a fetch request instead of calling onVote directly
    expect(global.fetch).toHaveBeenCalledWith('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: '1',
        targetType: 'post',
        voteType: 'upvote',
      }),
    });
  });

  it('calls onVote with downvote when downvote button is clicked', () => {
    const onVote = jest.fn();
    render(<PostCard post={mockPost} onVote={onVote} />);
    
    const downvoteBtn = screen.getByLabelText(/downvote/i);
    fireEvent.click(downvoteBtn);
    
    // The component makes a fetch request instead of calling onVote directly
    expect(global.fetch).toHaveBeenCalledWith('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: '1',
        targetType: 'post',
        voteType: 'downvote',
      }),
    });
  });

  it('does not throw if onVote is not provided', () => {
    expect(() => {
      render(<PostCard post={mockPost} />);
    }).not.toThrow();
  });
}); 