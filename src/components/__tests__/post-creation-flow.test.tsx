import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePostForm } from '../create-post-form';
import { PostCard } from '../post-card';
import { usePosts } from '@/hooks/usePosts';
import { PostFeed } from '../post-feed';

// Mock the hooks
jest.mock('@/hooks/usePosts');

global.fetch = jest.fn();

describe('Post Creation Flow Integration', () => {
  const mockSubreddits = [
    { id: '1', name: 'testsubreddit', description: 'Test subreddit' },
    { id: '2', name: 'anothersub', description: 'Another subreddit' },
  ];

  const mockPosts = [
    {
      id: '1',
      title: 'Existing Post',
      content: 'This is an existing post',
      authorId: 'user1',
      subredditId: '1',
      upvotes: 10,
      downvotes: 2,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (usePosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      loading: false,
      error: null,
    });
  });

  it('completes full post creation flow successfully', async () => {
    const mockCreatedPost = {
      id: 'new-post-123',
      title: 'New Test Post',
      content: 'This is a new test post content',
      authorId: 'user1',
      subredditId: '1',
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ post: mockCreatedPost }),
    });

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /post/i });

    fireEvent.change(titleInput, { target: { value: 'New Test Post' } });
    fireEvent.change(contentTextarea, { target: { value: 'This is a new test post content' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for form submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Test Post',
        content: 'This is a new test post content',
        subredditId: '1',
      });
    });

    // Verify API was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Test Post',
        content: 'This is a new test post content',
        subredditId: '1',
        authorId: 'mock-user-id',
      }),
    });

    // Verify form was reset
    expect(titleInput).toHaveValue('');
    expect(contentTextarea).toHaveValue('');
  });

  it('handles API failure during post creation', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /post/i });

    fireEvent.change(titleInput, { target: { value: 'Test Post' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
    });

    // Form should remain enabled for retry
    expect(submitButton).not.toBeDisabled();
    expect(titleInput).toHaveValue('Test Post');
    expect(contentTextarea).toHaveValue('Test content');
  });

  it('handles server error response during post creation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid post data' }),
    });

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /post/i });

    fireEvent.change(titleInput, { target: { value: 'Test Post' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
    });

    // Form should remain enabled for retry
    expect(submitButton).not.toBeDisabled();
  });

  it('handles validation errors during form submission', async () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const submitButton = screen.getByRole('button', { name: /post/i });

    // Submit empty form
    fireEvent.click(submitButton);

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    // API should not be called
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles network timeout during post creation', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    // Fill out the form
    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /post/i });

    fireEvent.change(titleInput, { target: { value: 'Test Post' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for timeout error
    await waitFor(() => {
      expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
    }, { timeout: 200 });

    // Form should remain enabled for retry
    expect(submitButton).not.toBeDisabled();
  });

  it('handles malformed API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    render(
      <CreatePostForm
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /create post/i });

    // Fill out the form
    fireEvent.change(titleInput, { target: { value: 'Test Post' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Should handle the error gracefully without crashing
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles form cancellation correctly', async () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    // Fill out the form partially
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Partial Post' } });

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Should call onCancel callback
    expect(mockOnCancel).toHaveBeenCalled();

    // API should not be called
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles rapid successive form submissions', async () => {
    const mockCreatedPost = {
      id: 'new-post-123',
      title: 'Test Post',
      content: 'Test content',
      authorId: 'user1',
      subredditId: '1',
      upvotes: 0,
      downvotes: 0,
      isRemoved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ post: mockCreatedPost }),
    });

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <CreatePostForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        subreddits={mockSubreddits}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    const submitButton = screen.getByRole('button', { name: /create post/i });

    // Fill out form
    fireEvent.change(titleInput, { target: { value: 'Test Post' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    // Submit multiple times rapidly
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // Should handle gracefully without crashing
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
}); 