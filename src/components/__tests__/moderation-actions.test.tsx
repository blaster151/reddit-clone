import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModerationActions } from '../moderation-actions';
import { Post, Comment } from '@/types';

describe('ModerationActions', () => {
  const mockPost: Post = {
    id: 'post-1',
    title: 'Test Post',
    content: 'Test content',
    authorId: 'user-1',
    subredditId: 'subreddit-1',
    upvotes: 10,
    downvotes: 2,
    isRemoved: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Test comment',
    authorId: 'user-1',
    postId: 'post-1',
    upvotes: 5,
    downvotes: 1,
    isRemoved: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const defaultProps = {
    targetId: 'post-1',
    targetType: 'post' as const,
    authorId: 'user-1',
    subredditId: 'subreddit-1',
    isModerator: true,
    onRemove: jest.fn(),
    onBanUser: jest.fn(),
    onMuteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render moderation actions for posts', () => {
      render(<ModerationActions {...defaultProps} />);

      expect(screen.getByText(/moderate/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ban user/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mute user/i })).toBeInTheDocument();
    });

    it('should render moderation actions for comments', () => {
      render(<ModerationActions {...defaultProps} targetType="comment" />);

      expect(screen.getByText(/moderate/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ban user/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mute user/i })).toBeInTheDocument();
    });

    it('should show content type in remove confirmation', () => {
      render(<ModerationActions {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(screen.getByText(/remove this post/i)).toBeInTheDocument();
    });

    it('should show comment type in remove confirmation', () => {
      render(<ModerationActions {...defaultProps} targetType="comment" />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(screen.getByText(/remove this comment/i)).toBeInTheDocument();
    });
  });

  describe('Remove Action', () => {
    it('should call onRemove when confirmed', async () => {
      const mockOnRemove = jest.fn();
      render(<ModerationActions {...defaultProps} onRemove={mockOnRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith('post-1', 'post');
      });
    });

    it('should not call onRemove when cancelled', () => {
      const mockOnRemove = jest.fn();
      render(<ModerationActions {...defaultProps} onRemove={mockOnRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnRemove).not.toHaveBeenCalled();
    });

    it('should close confirmation dialog after action', async () => {
      const mockOnRemove = jest.fn();
      render(<ModerationActions {...defaultProps} onRemove={mockOnRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirm remove/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Ban Action', () => {
    it('should call onBanUser when confirmed', async () => {
      const mockOnBanUser = jest.fn();
      render(<ModerationActions {...defaultProps} onBanUser={mockOnBanUser} />);

      const banButton = screen.getByRole('button', { name: /ban user/i });
      fireEvent.click(banButton);

      const confirmButton = screen.getByRole('button', { name: /confirm ban/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBanUser).toHaveBeenCalledWith('user-1', 'subreddit-1');
      });
    });

    it('should not call onBanUser when cancelled', () => {
      const mockOnBanUser = jest.fn();
      render(<ModerationActions {...defaultProps} onBanUser={mockOnBanUser} />);

      const banButton = screen.getByRole('button', { name: /ban user/i });
      fireEvent.click(banButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnBanUser).not.toHaveBeenCalled();
    });
  });

  describe('Mute Action', () => {
    it('should call onMuteUser when confirmed', async () => {
      const mockOnMuteUser = jest.fn();
      render(<ModerationActions {...defaultProps} onMuteUser={mockOnMuteUser} />);

      const muteButton = screen.getByRole('button', { name: /mute user/i });
      fireEvent.click(muteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm mute/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnMuteUser).toHaveBeenCalledWith('user-1', 'subreddit-1');
      });
    });

    it('should not call onMuteUser when cancelled', () => {
      const mockOnMuteUser = jest.fn();
      render(<ModerationActions {...defaultProps} onMuteUser={mockOnMuteUser} />);

      const muteButton = screen.getByRole('button', { name: /mute user/i });
      fireEvent.click(muteButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnMuteUser).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ModerationActions {...defaultProps} />);

      expect(screen.getByRole('button', { name: /moderate/i })).toHaveAttribute('aria-expanded');
      expect(screen.getByRole('button', { name: /remove/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /ban user/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /mute user/i })).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', () => {
      render(<ModerationActions {...defaultProps} />);

      const moderateButton = screen.getByRole('button', { name: /moderate/i });
      moderateButton.focus();

      expect(moderateButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing callback functions', () => {
      render(<ModerationActions {...defaultProps} onRemove={undefined} onBanUser={undefined} onMuteUser={undefined} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
      fireEvent.click(confirmButton);

      // Should not throw error
      expect(screen.queryByText(/confirm remove/i)).not.toBeInTheDocument();
    });

    it('should handle long content IDs', () => {
      const longContentId = 'a'.repeat(100);
      render(<ModerationActions {...defaultProps} targetId={longContentId} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      const confirmButton = screen.getByRole('button', { name: /confirm remove/i });
      fireEvent.click(confirmButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith(longContentId, 'post');
    });

    it('should handle special characters in user ID', () => {
      const specialUserId = 'user-123@example.com';
      render(<ModerationActions {...defaultProps} authorId={specialUserId} />);

      const banButton = screen.getByRole('button', { name: /ban user/i });
      fireEvent.click(banButton);

      const confirmButton = screen.getByRole('button', { name: /confirm ban/i });
      fireEvent.click(confirmButton);

      expect(defaultProps.onBanUser).toHaveBeenCalledWith(specialUserId, 'subreddit-1');
    });
  });
}); 