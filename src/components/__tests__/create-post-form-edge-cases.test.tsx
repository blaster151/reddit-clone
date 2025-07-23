import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePostForm } from '../create-post-form';

global.fetch = jest.fn();

describe('CreatePostForm Edge Cases', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockSubreddits = [
    { id: '1', name: 'testsubreddit', description: 'Test subreddit' },
    { id: '2', name: 'anothersub', description: 'Another subreddit' },
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
    (global.fetch as jest.Mock).mockClear();
    
    // Default successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'mock-post-id', title: 'Test Title' }),
    });
  });

  it('shows validation error for empty title', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for title exceeding length limit', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const longTitle = 'A'.repeat(301); // Exceeds 300 character limit
    fireEvent.change(titleInput, { target: { value: longTitle } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title must be at most 300 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for title with only whitespace', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: '   \n\t   ' } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles very long content gracefully', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    
    const longContent = 'A'.repeat(10000); // Very long content
    fireEvent.change(contentTextarea, { target: { value: longContent } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: longContent,
        subredditId: '1',
      });
    });
  });

  it('handles HTML content safely', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    
    const htmlTitle = '<script>alert("xss")</script>Title';
    const htmlContent = '<script>alert("xss")</script><b>Bold content</b>';
    
    fireEvent.change(titleInput, { target: { value: htmlTitle } });
    fireEvent.change(contentTextarea, { target: { value: htmlContent } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: htmlTitle,
        content: htmlContent,
        subredditId: '1',
      });
    });
  });

  it('validates subreddit selection', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    // Try to submit without selecting a subreddit (though there's a default)
    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: '',
        subredditId: '1', // Should have default selection
      });
    });
  });

  it('handles empty subreddits list', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={[]}
      />
    );

    expect(screen.getByText(/no subreddits available/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles API failure gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
    });

    // Form should remain enabled for retry
    expect(submitButton).not.toBeDisabled();
  });

  it('handles network timeout', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles malformed API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invalid: 'response' }),
    });

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles rapid successive submissions', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create post/i });

    fireEvent.change(titleInput, { target: { value: 'First Title' } });
    fireEvent.click(submitButton);

    // Try to submit again immediately
    fireEvent.change(titleInput, { target: { value: 'Second Title' } });
    fireEvent.click(submitButton);

    // Should handle this gracefully without crashing
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });
  });

  it('handles form reset after successful submission', async () => {
    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Form should be reset after successful submission
    expect(titleInput).toHaveValue('');
    expect(contentTextarea).toHaveValue('');
  });
}); 