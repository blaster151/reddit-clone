import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CommentForm } from '../comment-form';

// Mock the API call
global.fetch = jest.fn();

describe('CommentForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders form fields correctly', () => {
    render(<CommentForm postId="post-1" />);
    
    expect(screen.getByPlaceholderText(/what are your thoughts/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post comment/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty content', async () => {
    render(<CommentForm postId="post-1" />);
    
    const submitButton = screen.getByRole('button', { name: /post comment/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ comment: { id: '1', content: 'Test comment' } }),
    });

    render(<CommentForm postId="post-1" onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /post comment/i });
    
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'This is a test comment' },
      });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'This is a test comment',
          postId: 'post-1',
          parentCommentId: undefined,
        }),
      });
    });
  });

  it('submits form with parent comment ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ comment: { id: '1', content: 'Test reply' } }),
    });

    render(<CommentForm postId="post-1" parentCommentId="comment-1" />);
    
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /post comment/i });
    
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'This is a reply' },
      });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'This is a reply',
          postId: 'post-1',
          parentCommentId: 'comment-1',
        }),
      });
    });
  });

  it('handles submission errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CommentForm postId="post-1" />);
    
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /post comment/i });
    
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'Test comment' },
      });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    render(<CommentForm postId="post-1" onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button during submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<CommentForm postId="post-1" />);
    
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /post comment/i });
    
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'Test comment' },
      });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/posting/i)).toBeInTheDocument();
    });
  });

  it('uses custom placeholder text', () => {
    render(<CommentForm postId="post-1" placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText(/custom placeholder/i)).toBeInTheDocument();
  });
}); 