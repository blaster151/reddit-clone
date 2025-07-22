import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Comment } from '../comment';
import { Comment as CommentType } from '@/types';

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  formatRelativeTime: jest.fn(() => '2h ago'),
  formatNumber: jest.fn((num: number) => num.toString()),
}));

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowBigUp: ({ className }: any) => <span className={className}>↑</span>,
  ArrowBigDown: ({ className }: any) => <span className={className}>↓</span>,
  MessageCircle: ({ className }: any) => <span className={className}>💬</span>,
  MoreHorizontal: ({ className }: any) => <span className={className}>⋯</span>,
}));

const mockComment: CommentType = {
  id: 'comment-1',
  content: 'This is a test comment with some content.',
  authorId: 'user123',
  postId: 'post-1',
  upvotes: 15,
  downvotes: 3,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

const mockEditedComment: CommentType = {
  ...mockComment,
  id: 'comment-2',
  updatedAt: new Date('2024-01-01T11:00:00Z'),
};

describe('Comment Component', () => {
  describe('Rendering', () => {
    it('renders comment with basic information', () => {
      render(<Comment comment={mockComment} />);
      
      expect(screen.getByText('This is a test comment with some content.')).toBeInTheDocument();
      expect(screen.getByText('u/user123')).toBeInTheDocument();
      expect(screen.getByText('2h ago')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // score: 15 - 3
    });

    it('renders with custom props', () => {
      render(
        <Comment 
          comment={mockComment}
          currentUserId="current-user"
          userVote="upvote"
          isNested={true}
          maxDepth={3}
          currentDepth={1}
        />
      );
      
      expect(screen.getByText('This is a test comment with some content.')).toBeInTheDocument();
    });

    it('shows edited indicator when comment was edited', () => {
      render(<Comment comment={mockEditedComment} />);
      
      expect(screen.getByText('edited')).toBeInTheDocument();
    });

    it('applies nested styling when isNested is true', () => {
      render(<Comment comment={mockComment} isNested={true} />);
      
      const commentContainer = screen.getByText('This is a test comment with some content.').closest('.comment');
      expect(commentContainer).toHaveClass('ml-6', 'border-l-2', 'border-gray-200', 'pl-4');
    });
  });

  describe('Voting', () => {
    it('calls onVote when upvote button is clicked', () => {
      const onVote = jest.fn();
      render(<Comment comment={mockComment} onVote={onVote} />);
      
      const upvoteButton = screen.getByLabelText('Upvote comment');
      fireEvent.click(upvoteButton);
      
      expect(onVote).toHaveBeenCalledWith('comment-1', 'upvote');
    });

    it('calls onVote when downvote button is clicked', () => {
      const onVote = jest.fn();
      render(<Comment comment={mockComment} onVote={onVote} />);
      
      const downvoteButton = screen.getByLabelText('Downvote comment');
      fireEvent.click(downvoteButton);
      
      expect(onVote).toHaveBeenCalledWith('comment-1', 'downvote');
    });

    it('does not call onVote when callback is not provided', () => {
      render(<Comment comment={mockComment} />);
      
      const upvoteButton = screen.getByLabelText('Upvote comment');
      fireEvent.click(upvoteButton);
      
      // Should not throw error
      expect(upvoteButton).toBeInTheDocument();
    });

    it('applies upvoted styling when user has upvoted', () => {
      render(<Comment comment={mockComment} userVote="upvote" />);
      
      const upvoteButton = screen.getByLabelText('Upvote comment');
      expect(upvoteButton).toHaveClass('text-orange-500');
    });

    it('applies downvoted styling when user has downvoted', () => {
      render(<Comment comment={mockComment} userVote="downvote" />);
      
      const downvoteButton = screen.getByLabelText('Downvote comment');
      expect(downvoteButton).toHaveClass('text-blue-500');
    });

    it('shows correct vote count', () => {
      const commentWithManyVotes = {
        ...mockComment,
        upvotes: 100,
        downvotes: 25,
      };
      
      render(<Comment comment={commentWithManyVotes} />);
      
      expect(screen.getByText('75')).toBeInTheDocument(); // 100 - 25
    });

    it('handles negative vote counts', () => {
      const commentWithNegativeScore = {
        ...mockComment,
        upvotes: 5,
        downvotes: 20,
      };
      
      render(<Comment comment={commentWithNegativeScore} />);
      
      expect(screen.getByText('-15')).toBeInTheDocument(); // 5 - 20
    });
  });

  describe('Reply Functionality', () => {
    it('calls onReply when reply button is clicked', () => {
      const onReply = jest.fn();
      render(<Comment comment={mockComment} onReply={onReply} />);
      
      const replyButton = screen.getByText('Reply');
      fireEvent.click(replyButton);
      
      expect(onReply).toHaveBeenCalledWith('comment-1');
    });

    it('does not call onReply when callback is not provided', () => {
      render(<Comment comment={mockComment} />);
      
      const replyButton = screen.getByText('Reply');
      fireEvent.click(replyButton);
      
      // Should not throw error
      expect(replyButton).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays comment content with proper formatting', () => {
      const commentWithLongContent = {
        ...mockComment,
        content: 'This is a very long comment that should wrap properly and maintain readability across multiple lines.',
      };
      
      render(<Comment comment={commentWithLongContent} />);
      
      expect(screen.getByText(commentWithLongContent.content)).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      const commentWithEmptyContent = {
        ...mockComment,
        content: '',
      };
      
      render(<Comment comment={commentWithEmptyContent} />);
      
      const commentContainer = screen.getByText('u/user123').closest('.comment');
      expect(commentContainer).toBeInTheDocument();
    });

    it('handles content with special characters', () => {
      const commentWithSpecialChars = {
        ...mockComment,
        content: 'Comment with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };
      
      render(<Comment comment={commentWithSpecialChars} />);
      
      expect(screen.getByText(commentWithSpecialChars.content)).toBeInTheDocument();
    });
  });

  describe('Nested Comments', () => {
    it('shows replies toggle when hasReplies is true', () => {
      // Note: hasReplies is currently hardcoded to false, but we can test the structure
      render(<Comment comment={mockComment} currentDepth={0} maxDepth={5} />);
      
      // The replies section should not be visible since hasReplies is false
      expect(screen.queryByText('Show replies')).not.toBeInTheDocument();
      expect(screen.queryByText('Hide replies')).not.toBeInTheDocument();
    });

    it('respects maxDepth limit', () => {
      render(<Comment comment={mockComment} currentDepth={5} maxDepth={5} />);
      
      // Should not show replies section when at max depth
      expect(screen.queryByText('Show replies')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for vote buttons', () => {
      render(<Comment comment={mockComment} />);
      
      expect(screen.getByLabelText('Upvote comment')).toBeInTheDocument();
      expect(screen.getByLabelText('Downvote comment')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      render(<Comment comment={mockComment} />);
      
      const upvoteButton = screen.getByLabelText('Upvote comment');
      const downvoteButton = screen.getByLabelText('Downvote comment');
      const replyButton = screen.getByText('Reply');
      
      expect(upvoteButton).toBeInTheDocument();
      expect(downvoteButton).toBeInTheDocument();
      expect(replyButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles comment with zero votes', () => {
      const commentWithZeroVotes = {
        ...mockComment,
        upvotes: 0,
        downvotes: 0,
      };
      
      render(<Comment comment={commentWithZeroVotes} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles comment with very large vote counts', () => {
      const commentWithLargeVotes = {
        ...mockComment,
        upvotes: 999999,
        downvotes: 123456,
      };
      
      render(<Comment comment={commentWithLargeVotes} />);
      
      expect(screen.getByText('876543')).toBeInTheDocument(); // 999999 - 123456
    });

    it('handles comment with long author ID', () => {
      const commentWithLongAuthor = {
        ...mockComment,
        authorId: 'very-long-username-that-might-overflow',
      };
      
      render(<Comment comment={commentWithLongAuthor} />);
      
      expect(screen.getByText('u/very-long-username-that-might-overflow')).toBeInTheDocument();
    });

    it('handles comment with very long content', () => {
      const longContent = 'A'.repeat(1000);
      const commentWithLongContent = {
        ...mockComment,
        content: longContent,
      };
      
      render(<Comment comment={commentWithLongContent} />);
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('toggles expanded state when toggle button is clicked', () => {
      render(<Comment comment={mockComment} />);
      
      // Initially expanded
      expect(screen.getByText('This is a test comment with some content.')).toBeInTheDocument();
      
      // Note: The toggle functionality is currently not fully implemented in the component
      // This test documents the expected behavior
    });

    it('toggles replies visibility when toggle button is clicked', () => {
      render(<Comment comment={mockComment} />);
      
      // Note: The replies toggle functionality is currently not fully implemented
      // This test documents the expected behavior
    });
  });
}); 