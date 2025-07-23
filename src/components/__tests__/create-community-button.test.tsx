import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateCommunityButton } from '../create-community-button';

// Mock the Modal and CreateSubredditForm components
jest.mock('../ui/modal', () => ({
  Modal: ({ isOpen, onClose, children }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    ) : null
}));

jest.mock('../create-subreddit-form', () => ({
  CreateSubredditForm: ({ isModal, onClose }: any) => (
    <div data-testid="create-subreddit-form">
      <span>Create Subreddit Form</span>
      {isModal && onClose && (
        <button onClick={onClose}>Close Form</button>
      )}
    </div>
  )
}));

describe('CreateCommunityButton', () => {
  it('renders button with default props', () => {
    render(<CreateCommunityButton />);
    
    expect(screen.getByRole('button', { name: /create a new community/i })).toBeInTheDocument();
    expect(screen.getByText('Create Community')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('renders button with custom props', () => {
    render(
      <CreateCommunityButton 
        variant="outline"
        size="sm"
        showIcon={false}
        showText={false}
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button', { name: /create a new community/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('custom-class');
    expect(screen.queryByText('Create Community')).not.toBeInTheDocument();
    expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument();
  });

  it('opens modal when button is clicked', () => {
    render(<CreateCommunityButton />);
    
    const button = screen.getByRole('button', { name: /create a new community/i });
    fireEvent.click(button);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('create-subreddit-form')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    render(<CreateCommunityButton />);
    
    // Open modal
    const button = screen.getByRole('button', { name: /create a new community/i });
    fireEvent.click(button);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('passes correct props to CreateSubredditForm', () => {
    render(<CreateCommunityButton />);
    
    const button = screen.getByRole('button', { name: /create a new community/i });
    fireEvent.click(button);
    
    const form = screen.getByTestId('create-subreddit-form');
    expect(form).toBeInTheDocument();
    expect(screen.getByText('Create Subreddit Form')).toBeInTheDocument();
  });

  it('handles form close callback', async () => {
    render(<CreateCommunityButton />);
    
    // Open modal
    const button = screen.getByRole('button', { name: /create a new community/i });
    fireEvent.click(button);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    // Close form
    const closeFormButton = screen.getByRole('button', { name: /close form/i });
    fireEvent.click(closeFormButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('renders with different variants', () => {
    const { rerender } = render(<CreateCommunityButton variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('outline');
    
    rerender(<CreateCommunityButton variant="ghost" />);
    expect(screen.getByRole('button')).toHaveClass('ghost');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<CreateCommunityButton size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('sm');
    
    rerender(<CreateCommunityButton size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('lg');
  });
}); 