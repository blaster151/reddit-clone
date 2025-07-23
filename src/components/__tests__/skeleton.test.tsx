import { render, screen } from '@testing-library/react';
import { Skeleton, PostCardSkeleton, CommentSkeleton } from '../ui/skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-gray-200');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-class" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });
});

describe('PostCardSkeleton', () => {
  it('renders post card skeleton structure', () => {
    render(<PostCardSkeleton />);
    expect(screen.getByTestId('post-card-skeleton')).toBeInTheDocument();
  });

  it('has proper skeleton elements', () => {
    render(<PostCardSkeleton />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(5); // Multiple skeleton elements
  });
});

describe('CommentSkeleton', () => {
  it('renders comment skeleton structure', () => {
    render(<CommentSkeleton />);
    expect(screen.getByTestId('comment-skeleton')).toBeInTheDocument();
  });

  it('has proper skeleton elements', () => {
    render(<CommentSkeleton />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(3); // Multiple skeleton elements
  });
}); 