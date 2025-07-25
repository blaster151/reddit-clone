import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../ui/loading-spinner';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
    const icon = spinner.querySelector('svg');
    expect(icon).toHaveClass('w-6', 'h-6');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status', { hidden: true });
    const icon = spinner.querySelector('svg');
    expect(icon).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status', { hidden: true });
    const icon = spinner.querySelector('svg');
    expect(icon).toHaveClass('w-8', 'h-8');
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading posts..." />);
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders without text when not provided', () => {
    render(<LoadingSpinner />);
    const container = screen.getByRole('status', { hidden: true });
    expect(container.children).toHaveLength(1); // Only the icon, no text
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = screen.getByRole('status', { hidden: true });
    expect(container).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner text="Loading posts..." />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
}); 