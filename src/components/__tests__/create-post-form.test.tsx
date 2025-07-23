import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePostForm } from '../create-post-form';

// Mock the API call
global.fetch = jest.fn();

const mockSubreddits = [
  { id: '1', name: 'programming' },
  { id: '2', name: 'webdev' },
];

describe('CreatePostForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders form fields correctly', () => {
    render(<CreatePostForm subreddits={mockSubreddits} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subreddit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<CreatePostForm subreddits={mockSubreddits} />);
    
    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: { id: '1', title: 'Test Post' } }),
    });

    render(<CreatePostForm onSubmit={mockOnSubmit} subreddits={mockSubreddits} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Post Title' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test post content' },
    });
    fireEvent.change(screen.getByLabelText(/subreddit/i), {
      target: { value: '1' },
    });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Post Title',
          content: 'Test post content',
          subredditId: '1',
          authorId: 'mock-user-id',
        }),
      });
    });
  });

  it('handles submission errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CreatePostForm subreddits={mockSubreddits} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Post Title' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test post content' },
    });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    render(<CreatePostForm onCancel={mockOnCancel} subreddits={mockSubreddits} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button during submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<CreatePostForm subreddits={mockSubreddits} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Post Title' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test post content' },
    });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
  });
}); 