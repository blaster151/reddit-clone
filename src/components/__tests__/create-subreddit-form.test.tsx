import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateSubredditForm } from '../create-subreddit-form';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('CreateSubredditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders all form fields correctly', () => {
    render(<CreateSubredditForm />);
    
    expect(screen.getByLabelText(/community name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/community type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create community/i })).toBeInTheDocument();
  });

  it('shows character counters for name and description', () => {
    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    const descriptionTextarea = screen.getByLabelText(/description/i);
    
    fireEvent.change(nameInput, { target: { value: 'test' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'test description' } });
    
    expect(screen.getByText('4/21 characters')).toBeInTheDocument();
    expect(screen.getByText('16/500 characters')).toBeInTheDocument();
  });

  it('shows URL preview when name is entered', () => {
    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    fireEvent.change(nameInput, { target: { value: 'MyCommunity' } });
    
    expect(screen.getByText('URL: reddit.com/r/MyCommunity')).toBeInTheDocument();
  });

  it('validates name format in real-time', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ available: true })
    });

    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    
    // Test invalid characters
    fireEvent.change(nameInput, { target: { value: 'test-community' } });
    
    await waitFor(() => {
      expect(screen.getByText(/name can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
    });
  });

  it('checks name availability via API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ available: false, error: 'This community name is already taken' })
    });

    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    fireEvent.change(nameInput, { target: { value: 'existingcommunity' } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/subreddits/check-name?name=existingcommunity')
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/this community name is already taken/i)).toBeInTheDocument();
    });
  });

  it('shows loading spinner during name check', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ available: true })
      }), 100))
    );

    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    fireEvent.change(nameInput, { target: { value: 'newcommunity' } });
    
    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<CreateSubredditForm />);
    
    const submitButton = screen.getByRole('button', { name: /create community/i });
    
    // Should be disabled initially
    expect(submitButton).toBeDisabled();
    
    // Fill in required fields
    const nameInput = screen.getByLabelText(/community name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    
    fireEvent.change(nameInput, { target: { value: 'testcommunity' } });
    fireEvent.change(categorySelect, { target: { value: 'Technology' } });
    
    // Mock successful name check
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ available: true })
    });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('submits form successfully and redirects', async () => {
    // Mock name availability check
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true })
      })
      // Mock form submission
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: '123',
          name: 'testcommunity',
          description: 'Test description',
          type: 'public',
          category: 'Technology'
        })
      });

    render(<CreateSubredditForm />);
    
    // Fill form
    const nameInput = screen.getByLabelText(/community name/i);
    const descriptionTextarea = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);
    
    fireEvent.change(nameInput, { target: { value: 'testcommunity' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
    fireEvent.change(categorySelect, { target: { value: 'Technology' } });
    
    // Wait for name validation
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create community/i });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/community created/i)).toBeInTheDocument();
    });
    
    // Should redirect after success
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/r/testcommunity');
    }, { timeout: 3000 });
  });

  it('handles submission errors gracefully', async () => {
    // Mock name availability check
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true })
      })
      // Mock form submission error
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create community' })
      });

    render(<CreateSubredditForm />);
    
    // Fill form
    const nameInput = screen.getByLabelText(/community name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    
    fireEvent.change(nameInput, { target: { value: 'testcommunity' } });
    fireEvent.change(categorySelect, { target: { value: 'Technology' } });
    
    // Wait for name validation
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create community/i });
    fireEvent.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create community/i)).toBeInTheDocument();
    });
  });

  it('works as modal with close functionality', () => {
    const mockOnClose = jest.fn();
    render(<CreateSubredditForm isModal={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('prevents submission when name is not available', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ available: false, error: 'Name taken' })
    });

    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    const categorySelect = screen.getByLabelText(/category/i);
    
    fireEvent.change(nameInput, { target: { value: 'takenname' } });
    fireEvent.change(categorySelect, { target: { value: 'Technology' } });
    
    await waitFor(() => {
      expect(screen.getByText(/name taken/i)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: /create community/i });
    expect(submitButton).toBeDisabled();
  });

  it('handles network errors during name check', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CreateSubredditForm />);
    
    const nameInput = screen.getByLabelText(/community name/i);
    fireEvent.change(nameInput, { target: { value: 'testcommunity' } });
    
    // Should handle error gracefully without breaking the form
    await waitFor(() => {
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
      expect(screen.queryByText('✗')).not.toBeInTheDocument();
    });
  });
}); 