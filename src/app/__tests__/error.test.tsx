import { render, screen, fireEvent } from '@testing-library/react';
import Error from '../error';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('Error', () => {
  const mockError = {
    name: 'Error',
    message: 'Test error message',
    stack: 'Error: Test error message\n    at test.js:1:1',
  } as Error & { digest?: string };
  
  const mockReset = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
    (console.error as jest.Mock).mockClear();
  });

  it('renders error page with correct content', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });

  it('calls reset function when Try Again button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('has correct link for Go Home button', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logs error to console', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('Global error caught:', mockError);
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    expect(screen.getByText(/Message: Test error message/)).toBeInTheDocument();

    // Restore original environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('does not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();

    // Restore original environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('displays error digest when available', () => {
    const errorWithDigest = {
      name: 'Error',
      message: 'Test error',
      stack: 'Error: Test error\n    at test.js:1:1',
      digest: 'abc123',
    } as Error & { digest?: string };

    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(<Error error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText(/Digest: abc123/)).toBeInTheDocument();
    expect(screen.getByText(/reference error code: abc123/)).toBeInTheDocument();

    // Restore original environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('displays error stack trace in development mode', () => {
    const errorWithStack = {
      name: 'Error',
      message: 'Test error',
      stack: 'Error: Test error\n    at test.js:1:1',
    } as Error & { digest?: string };

    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(<Error error={errorWithStack} reset={mockReset} />);

    expect(screen.getByText(/Stack:/)).toBeInTheDocument();
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    // Restore original environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('renders contact support link', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const contactLink = screen.getByRole('link', { name: /contact support/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('has proper styling classes', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const container = screen.getByText('Something went wrong!').closest('div');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'items-center', 'justify-center');
  });
}); 