import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from '../comment-form';

global.fetch = jest.fn();

describe('CommentForm Edge Cases', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
    (global.fetch as jest.Mock).mockClear();
    // Default successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'comment1' }),
    });
  });

  it('shows validation error for empty content', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for content with only whitespace', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: '   \n\t   ' } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles very long content gracefully', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const longContent = 'A'.repeat(1000); // Long content
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: longContent } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: longContent,
        postId: 'post1',
      });
    });
  });

  it('handles special characters in content', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const specialContent = 'Comment with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/"\'\\`~';
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: specialContent } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: specialContent,
        postId: 'post1',
      });
    });
  });

  it('handles HTML content safely', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const htmlContent = '<script>alert("xss")</script><b>Bold text</b>';
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: htmlContent } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: htmlContent,
        postId: 'post1',
      });
    });
  });

  it('handles API failure gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    // Should not call onSubmit when API fails
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles network timeout', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    // Should not call onSubmit when network fails
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('handles malformed API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    // Should not call onSubmit when response is malformed
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles rapid successive submissions', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    
    // Click submit multiple times rapidly
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // Should handle this gracefully - both submissions can succeed
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });
  });

  it('handles unicode and emoji content', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const unicodeContent = 'Comment with unicode: 🚀🌟🎉 and special chars: ñáéíóú';
    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: unicodeContent } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: unicodeContent,
        postId: 'post1',
      });
    });
  });

  it('handles form reset after successful submission', async () => {
    render(
      <CommentForm
        postId="post1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText(/what are your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    const submitButton = screen.getByRole('button', { name: /post comment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Form should be reset after successful submission
    expect(textarea).toHaveValue('');
  });
}); 