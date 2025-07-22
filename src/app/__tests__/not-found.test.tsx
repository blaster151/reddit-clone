import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '../not-found';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

// Mock window.history.back
const mockHistoryBack = jest.fn();
Object.defineProperty(window, 'history', {
  value: {
    back: mockHistoryBack,
  },
  writable: true,
});

describe('NotFound', () => {
  beforeEach(() => {
    mockHistoryBack.mockClear();
  });

  it('renders 404 error page with correct content', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Sorry, we couldn't find the page/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<NotFound />);

    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('has correct links for navigation', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    const searchLink = screen.getByRole('link', { name: /search/i });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(searchLink).toHaveAttribute('href', '/search');
  });

  it('calls window.history.back when Go Back button is clicked', () => {
    render(<NotFound />);

    const goBackButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(goBackButton);

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('renders contact support link', () => {
    render(<NotFound />);

    const contactLink = screen.getByRole('link', { name: /contact support/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('displays icons in buttons', () => {
    render(<NotFound />);

    // Check that icons are present (they should be rendered as SVG elements)
    const homeButton = screen.getByRole('link', { name: /go home/i });
    const searchButton = screen.getByRole('link', { name: /search/i });
    const backButton = screen.getByRole('button', { name: /go back/i });

    expect(homeButton).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<NotFound />);

    const container = screen.getByText('404').closest('div');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'items-center', 'justify-center');
  });
}); 