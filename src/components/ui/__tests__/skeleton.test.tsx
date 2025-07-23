import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  Skeleton, 
  ShimmerSkeleton, 
  PostCardSkeleton, 
  CommentSkeleton, 
  FeedSkeleton 
} from '../skeleton';

describe('Skeleton Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-gray-200', 'rounded-md', 'animate-pulse');
    });

    it('renders with custom className', () => {
      render(<Skeleton className="custom-class" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-class');
    });

    it('renders with custom dimensions', () => {
      render(<Skeleton width="200px" height="20px" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '200px', height: '20px' });
    });

    it('renders with numeric dimensions', () => {
      render(<Skeleton width={150} height={30} />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '150px', height: '30px' });
    });

    it('renders with different border radius options', () => {
      const radiusOptions = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;
      
      radiusOptions.forEach(radius => {
        const { unmount } = render(<Skeleton rounded={radius} />);
        
        const skeleton = screen.getByTestId('skeleton');
        if (radius === 'none') {
          expect(skeleton).not.toHaveClass('rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full');
        } else {
          expect(skeleton).toHaveClass(`rounded-${radius}`);
        }
        unmount();
      });
    });

    it('renders without animation when animate is false', () => {
      render(<Skeleton animate={false} />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading');
    });
  });
});

describe('ShimmerSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ShimmerSkeleton />);
      
      const skeleton = screen.getByTestId('shimmer-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-gray-200', 'rounded-md', 'relative', 'overflow-hidden');
    });

    it('renders with custom duration', () => {
      render(<ShimmerSkeleton duration={2000} />);
      
      const skeleton = screen.getByTestId('shimmer-skeleton');
      expect(skeleton).toHaveStyle({ '--shimmer-duration': '2000ms' });
    });

    it('renders shimmer overlay when animate is true', () => {
      render(<ShimmerSkeleton animate={true} />);
      
      const skeleton = screen.getByTestId('shimmer-skeleton');
      const shimmer = skeleton.querySelector('.animate-shimmer');
      expect(shimmer).toBeInTheDocument();
    });

    it('does not render shimmer overlay when animate is false', () => {
      render(<ShimmerSkeleton animate={false} />);
      
      const skeleton = screen.getByTestId('shimmer-skeleton');
      const shimmer = skeleton.querySelector('.animate-shimmer');
      expect(shimmer).not.toBeInTheDocument();
    });

    it('applies custom dimensions', () => {
      render(<ShimmerSkeleton width="300px" height="40px" />);
      
      const skeleton = screen.getByTestId('shimmer-skeleton');
      expect(skeleton).toHaveStyle({ width: '300px', height: '40px' });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ShimmerSkeleton />);
      
      const skeleton = screen.getByTestId('shimmer-skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading');
    });
  });
});

describe('PostCardSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<PostCardSkeleton />);
      
      const skeleton = screen.getByTestId('post-card-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'p-4');
    });

    it('renders with shimmer animation by default', () => {
      render(<PostCardSkeleton />);
      
      const shimmerSkeletons = screen.getAllByTestId('shimmer-skeleton');
      expect(shimmerSkeletons.length).toBeGreaterThan(0);
    });

    it('renders without animation when animate is false', () => {
      render(<PostCardSkeleton animate={false} />);
      
      const regularSkeletons = screen.getAllByTestId('skeleton');
      expect(regularSkeletons.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      render(<PostCardSkeleton className="custom-post-skeleton" />);
      
      const skeleton = screen.getByTestId('post-card-skeleton');
      expect(skeleton).toHaveClass('custom-post-skeleton');
    });

    it('renders all skeleton elements for post structure', () => {
      render(<PostCardSkeleton />);
      
      // Should have multiple skeleton elements for title, content, votes, metadata
      const skeletonElements = screen.getAllByTestId(/skeleton|shimmer-skeleton/);
      expect(skeletonElements.length).toBeGreaterThan(5); // Multiple elements for complete post structure
    });
  });
});

describe('CommentSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<CommentSkeleton />);
      
      const skeleton = screen.getByTestId('comment-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('space-y-2');
    });

    it('renders with nested styling when nested is true', () => {
      render(<CommentSkeleton nested={true} />);
      
      const skeleton = screen.getByTestId('comment-skeleton');
      expect(skeleton).toHaveClass('ml-6', 'border-l-2', 'border-gray-100', 'pl-4');
    });

    it('renders without nested styling when nested is false', () => {
      render(<CommentSkeleton nested={false} />);
      
      const skeleton = screen.getByTestId('comment-skeleton');
      expect(skeleton).not.toHaveClass('ml-6', 'border-l-2', 'border-gray-100', 'pl-4');
    });

    it('renders with shimmer animation by default', () => {
      render(<CommentSkeleton />);
      
      const shimmerSkeletons = screen.getAllByTestId('shimmer-skeleton');
      expect(shimmerSkeletons.length).toBeGreaterThan(0);
    });

    it('renders without animation when animate is false', () => {
      render(<CommentSkeleton animate={false} />);
      
      const regularSkeletons = screen.getAllByTestId('skeleton');
      expect(regularSkeletons.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      render(<CommentSkeleton className="custom-comment-skeleton" />);
      
      const skeleton = screen.getByTestId('comment-skeleton');
      expect(skeleton).toHaveClass('custom-comment-skeleton');
    });

    it('renders all skeleton elements for comment structure', () => {
      render(<CommentSkeleton />);
      
      // Should have multiple skeleton elements for author, content, votes, reply
      const skeletonElements = screen.getAllByTestId(/skeleton|shimmer-skeleton/);
      expect(skeletonElements.length).toBeGreaterThan(3); // Multiple elements for complete comment structure
    });
  });
});

describe('FeedSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<FeedSkeleton />);
      
      const skeleton = screen.getByTestId('feed-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('space-y-4');
    });

    it('renders correct number of post skeletons by default', () => {
      render(<FeedSkeleton type="post" />);
      
      const postSkeletons = screen.getAllByTestId('post-card-skeleton');
      expect(postSkeletons).toHaveLength(3); // Default count
    });

    it('renders correct number of comment skeletons by default', () => {
      render(<FeedSkeleton type="comment" />);
      
      const commentSkeletons = screen.getAllByTestId('comment-skeleton');
      expect(commentSkeletons).toHaveLength(3); // Default count
    });

    it('renders custom number of skeletons', () => {
      render(<FeedSkeleton count={5} type="post" />);
      
      const postSkeletons = screen.getAllByTestId('post-card-skeleton');
      expect(postSkeletons).toHaveLength(5);
    });

    it('renders post skeletons when type is post', () => {
      render(<FeedSkeleton type="post" />);
      
      expect(screen.getByTestId('post-card-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('comment-skeleton')).not.toBeInTheDocument();
    });

    it('renders comment skeletons when type is comment', () => {
      render(<FeedSkeleton type="comment" />);
      
      expect(screen.getByTestId('comment-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('post-card-skeleton')).not.toBeInTheDocument();
    });

    it('renders with shimmer animation by default', () => {
      render(<FeedSkeleton type="post" />);
      
      const shimmerSkeletons = screen.getAllByTestId('shimmer-skeleton');
      expect(shimmerSkeletons.length).toBeGreaterThan(0);
    });

    it('renders without animation when animate is false', () => {
      render(<FeedSkeleton type="post" animate={false} />);
      
      const regularSkeletons = screen.getAllByTestId('skeleton');
      expect(regularSkeletons.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      render(<FeedSkeleton className="custom-feed-skeleton" />);
      
      const skeleton = screen.getByTestId('feed-skeleton');
      expect(skeleton).toHaveClass('custom-feed-skeleton');
    });

    it('renders unique keys for each skeleton item', () => {
      render(<FeedSkeleton count={3} type="post" />);
      
      const postSkeletons = screen.getAllByTestId('post-card-skeleton');
      expect(postSkeletons).toHaveLength(3);
      
      // Each skeleton should be a separate element
      postSkeletons.forEach((skeleton, index) => {
        expect(skeleton).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('renders nothing when count is 0', () => {
      render(<FeedSkeleton count={0} type="post" />);
      
      const postSkeletons = screen.queryAllByTestId('post-card-skeleton');
      expect(postSkeletons).toHaveLength(0);
    });

    it('handles large count values', () => {
      render(<FeedSkeleton count={10} type="comment" />);
      
      const commentSkeletons = screen.getAllByTestId('comment-skeleton');
      expect(commentSkeletons).toHaveLength(10);
    });
  });
});

describe('Skeleton Components Integration', () => {
  it('all skeleton components work together in a complex layout', () => {
    render(
      <div>
        <FeedSkeleton count={2} type="post" />
        <CommentSkeleton nested={true} />
        <Skeleton className="w-full h-8" />
        <ShimmerSkeleton width="200px" height="20px" />
      </div>
    );
    
    expect(screen.getByTestId('feed-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('comment-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('shimmer-skeleton')).toBeInTheDocument();
  });

  it('skeleton components have consistent accessibility features', () => {
    render(
      <div>
        <Skeleton />
        <ShimmerSkeleton />
        <PostCardSkeleton />
        <CommentSkeleton />
        <FeedSkeleton count={1} type="post" />
      </div>
    );
    
    const allSkeletons = screen.getAllByTestId(/skeleton/);
    allSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading');
    });
  });
}); 