/**
 * Example Test File Demonstrating Testing Patterns and Best Practices
 * 
 * This file serves as a practical example of the testing patterns documented
 * in docs/testing-patterns.md. It shows real-world implementations of the
 * patterns and conventions used throughout the Reddit clone project.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { PostCard } from '../post-card';
import { Comment } from '../comment';
import { usePosts } from '@/hooks/usePosts';
import { GET } from '@/app/api/posts/route';
import { NextRequest } from 'next/server';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// MSW Server Setup for API mocking
const server = setupServer(
  http.get('/api/posts', () => {
    return HttpResponse.json({
      posts: [
        {
          id: '1',
          title: 'Example Post',
          content: 'This is an example post content',
          authorId: 'user1',
          subredditId: 'sub1',
          upvotes: 10,
          downvotes: 2,
          isRemoved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
  }),
  http.post('/api/votes', () => {
    return HttpResponse.json({
      vote: {
        id: 'vote1',
        userId: 'user1',
        targetId: 'post1',
        targetType: 'post',
        voteType: 'upvote',
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock data for testing
const mockPost = {
  id: '1',
  title: 'Test Post Title',
  content: 'This is a test post content that should be displayed properly.',
  authorId: 'user1',
  subredditId: 'sub1',
  upvotes: 42,
  downvotes: 5,
  isRemoved: false,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

const mockComment = {
  id: 'comment-1',
  content: 'This is a test comment with some content.',
  authorId: 'user123',
  postId: 'post-1',
  upvotes: 15,
  downvotes: 3,
  isRemoved: false,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

/**
 * Component Testing Patterns Example
 * 
 * Demonstrates the standard structure and patterns for testing React components
 */
describe('Component Testing Patterns Example', () => {
  describe('PostCard Component', () => {
    const mockOnVote = jest.fn();

    beforeEach(() => {
      mockOnVote.mockClear();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Rendering', () => {
      it('renders post with correct title and content', () => {
        render(<PostCard post={mockPost} onVote={mockOnVote} />);

        expect(screen.getByText('Test Post Title')).toBeInTheDocument();
        expect(screen.getByText('This is a test post content that should be displayed properly.')).toBeInTheDocument();
      });

      it('displays post metadata correctly', () => {
        render(<PostCard post={mockPost} onVote={mockOnVote} />);

        expect(screen.getByText('37')).toBeInTheDocument(); // upvotes - downvotes
      });

      it('handles posts with zero votes', () => {
        const postWithZeroVotes = {
          ...mockPost,
          upvotes: 0,
          downvotes: 0,
        };

        render(<PostCard post={postWithZeroVotes} onVote={mockOnVote} />);

        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    describe('Interactions', () => {
      it('calls onVote when upvote button is clicked', () => {
        render(<PostCard post={mockPost} onVote={mockOnVote} />);

        const upvoteButton = screen.getByLabelText(/upvote/i);
        fireEvent.click(upvoteButton);

        expect(mockOnVote).toHaveBeenCalledWith('1', 'upvote');
      });

      it('calls onVote when downvote button is clicked', () => {
        render(<PostCard post={mockPost} onVote={mockOnVote} />);

        const downvoteButton = screen.getByLabelText(/downvote/i);
        fireEvent.click(downvoteButton);

        expect(mockOnVote).toHaveBeenCalledWith('1', 'downvote');
      });
    });

    describe('Edge Cases', () => {
      it('handles posts with negative vote scores', () => {
        const postWithNegativeVotes = {
          ...mockPost,
          upvotes: 5,
          downvotes: 10,
        };

        render(<PostCard post={postWithNegativeVotes} onVote={mockOnVote} />);

        expect(screen.getByText('-5')).toBeInTheDocument();
      });

      it('does not throw if onVote is not provided', () => {
        render(<PostCard post={mockPost} />);
        
        const upvoteButton = screen.getByLabelText(/upvote/i);
        fireEvent.click(upvoteButton);
        
        // Should not throw error
        expect(upvoteButton).toBeInTheDocument();
      });
    });

    describe('Accessibility', () => {
      it('should not have accessibility violations', async () => {
        const { container } = render(<PostCard post={mockPost} onVote={mockOnVote} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('supports keyboard navigation', () => {
        render(<PostCard post={mockPost} onVote={mockOnVote} />);
        
        const upvoteButton = screen.getByLabelText(/upvote/i);
        upvoteButton.focus();
        
        fireEvent.keyDown(upvoteButton, { key: 'Enter' });
        expect(mockOnVote).toHaveBeenCalledWith('1', 'upvote');
      });
    });
  });

  describe('Comment Component', () => {
    describe('Rendering', () => {
      it('renders comment with basic information', () => {
        render(<Comment comment={mockComment} />);
        
        expect(screen.getByText('This is a test comment with some content.')).toBeInTheDocument();
        expect(screen.getByText('u/user123')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument(); // score: 15 - 3
      });

      it('applies nested styling when isNested is true', () => {
        render(<Comment comment={mockComment} isNested={true} />);
        
        const commentContainer = screen.getByText('This is a test comment with some content.').closest('.comment');
        expect(commentContainer).toHaveClass('ml-6', 'border-l-2', 'border-gray-200', 'pl-4');
      });
    });

    describe('Interactions', () => {
      it('calls onVote when upvote button is clicked', () => {
        const onVote = jest.fn();
        render(<Comment comment={mockComment} onVote={onVote} />);
        
        const upvoteButton = screen.getByLabelText('Upvote comment');
        fireEvent.click(upvoteButton);
        
        expect(onVote).toHaveBeenCalledWith('comment-1', 'upvote');
      });

      it('applies upvoted styling when user has upvoted', () => {
        render(<Comment comment={mockComment} userVote="upvote" />);
        
        const upvoteButton = screen.getByLabelText('Upvote comment');
        expect(upvoteButton).toHaveClass('text-orange-500');
      });
    });
  });
});

/**
 * Hook Testing Patterns Example
 * 
 * Demonstrates how to test custom React hooks using renderHook
 */
describe('Hook Testing Patterns Example', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePosts Hook', () => {
    it('returns initial state', () => {
      const { result } = renderHook(() => usePosts());

      expect(result.current.posts).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('fetches posts and updates state', async () => {
      const { result } = renderHook(() => usePosts());

      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.posts.length).toBe(1);
      expect(result.current.posts[0].title).toBe('Example Post');
      expect(result.current.error).toBeNull();
    });

    it('handles fetch error', async () => {
      server.use(
        http.get('/api/posts', () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() => usePosts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.posts.length).toBe(0);
    });
  });
});

/**
 * API Route Testing Patterns Example
 * 
 * Demonstrates how to test Next.js API routes
 */
describe('API Route Testing Patterns Example', () => {
  describe('GET /api/posts', () => {
    const createMockRequest = (url: string): NextRequest => {
      return new NextRequest(url);
    };

    it('returns a JSON response with posts array', async () => {
      const req = createMockRequest('http://localhost/api/posts');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.posts.length).toBeGreaterThan(0);
    });

    it('returns posts with required fields', async () => {
      const req = createMockRequest('http://localhost/api/posts');
      const response = await GET(req);
      const { posts } = await response.json();

      for (const post of posts) {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('authorId');
        expect(post).toHaveProperty('subredditId');
        expect(post).toHaveProperty('upvotes');
        expect(post).toHaveProperty('downvotes');
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('updatedAt');
      }
    });

    it('returns paginated posts with correct metadata', async () => {
      const req = createMockRequest('http://localhost/api/posts?page=1&pageSize=5');
      const response = await GET(req);
      const data = await response.json();

      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(5);
      expect(data.total).toBeGreaterThan(0);
      expect(data.totalPages).toBeGreaterThan(0);
    });

    it('sets Cache-Control header for caching', async () => {
      const req = createMockRequest('http://localhost/api/posts');
      const response = await GET(req);

      expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
    });
  });
});

/**
 * Integration Testing Example
 * 
 * Demonstrates testing component integration with hooks and APIs
 */
describe('Integration Testing Example', () => {
  it('integrates PostCard with voting functionality', async () => {
    const mockOnVote = jest.fn();
    
    render(<PostCard post={mockPost} onVote={mockOnVote} />);

    // Verify initial render
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument(); // Initial score

    // Simulate user interaction
    const upvoteButton = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteButton);

    // Verify callback was called
    expect(mockOnVote).toHaveBeenCalledWith('1', 'upvote');
  });

  it('integrates Comment with voting and reply functionality', () => {
    const mockOnVote = jest.fn();
    const mockOnReply = jest.fn();

    render(
      <Comment 
        comment={mockComment} 
        onVote={mockOnVote}
        onReply={mockOnReply}
        currentUserId="current-user"
      />
    );

    // Test voting integration
    const upvoteButton = screen.getByLabelText('Upvote comment');
    fireEvent.click(upvoteButton);
    expect(mockOnVote).toHaveBeenCalledWith('comment-1', 'upvote');

    // Test reply integration
    const replyButton = screen.getByText(/reply/i);
    fireEvent.click(replyButton);
    expect(mockOnReply).toHaveBeenCalledWith('comment-1');
  });
});

/**
 * Performance Testing Example
 * 
 * Demonstrates how to test component performance
 */
describe('Performance Testing Example', () => {
  it('renders large lists efficiently', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      ...mockPost,
      id: `post-${i}`,
      title: `Post ${i}`,
    }));

    const startTime = performance.now();
    
    // In a real test, you would render a list component here
    // render(<PostList posts={largeData} />);
    
    const endTime = performance.now();

    // Performance assertion (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});

/**
 * Error Boundary Testing Example
 * 
 * Demonstrates testing error handling and recovery
 */
describe('Error Boundary Testing Example', () => {
  it('handles component errors gracefully', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // In a real test, you would render a component that throws an error
    // and verify the error boundary catches it and shows fallback UI
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

/**
 * Accessibility Testing Example
 * 
 * Demonstrates comprehensive accessibility testing
 */
describe('Accessibility Testing Example', () => {
  it('ensures all components meet accessibility standards', async () => {
    const { container: postCardContainer } = render(
      <PostCard post={mockPost} onVote={jest.fn()} />
    );
    
    const postCardResults = await axe(postCardContainer);
    expect(postCardResults).toHaveNoViolations();

    const { container: commentContainer } = render(
      <Comment comment={mockComment} />
    );
    
    const commentResults = await axe(commentContainer);
    expect(commentResults).toHaveNoViolations();
  });

  it('supports screen reader navigation', () => {
    render(<PostCard post={mockPost} onVote={jest.fn()} />);

    // Verify semantic HTML structure
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upvote/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /downvote/i })).toBeInTheDocument();
  });
});

/**
 * Mocking Strategies Example
 * 
 * Demonstrates different mocking approaches
 */
describe('Mocking Strategies Example', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mocks API calls with MSW', async () => {
    // MSW is already set up above, this test demonstrates usage
    const response = await fetch('/api/posts');
    const data = await response.json();

    expect(data.posts).toBeDefined();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it('mocks module functions', () => {
    // Example of mocking a utility function
    const mockFormatDate = jest.fn().mockReturnValue('Jan 1, 2024');
    
    // In a real test, you would mock the actual module
    // jest.spyOn(utilsModule, 'formatDate').mockImplementation(mockFormatDate);
    
    expect(mockFormatDate()).toBe('Jan 1, 2024');
  });

  it('mocks async operations', async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue('success');
    
    const result = await mockAsyncFunction();
    
    expect(result).toBe('success');
    expect(mockAsyncFunction).toHaveBeenCalled();
  });
});

/**
 * Test Organization Example
 * 
 * Demonstrates proper test organization and structure
 */
describe('Test Organization Example', () => {
  // Group related tests using describe blocks
  describe('User Authentication Flow', () => {
    describe('Login Process', () => {
      it('validates user credentials', () => {
        // Test implementation
      });

      it('handles invalid credentials', () => {
        // Test implementation
      });

      it('redirects on successful login', () => {
        // Test implementation
      });
    });

    describe('Registration Process', () => {
      it('validates registration data', () => {
        // Test implementation
      });

      it('creates new user account', () => {
        // Test implementation
      });
    });
  });

  describe('Content Management', () => {
    describe('Post Creation', () => {
      it('validates post data', () => {
        // Test implementation
      });

      it('saves post to database', () => {
        // Test implementation
      });
    });

    describe('Comment System', () => {
      it('allows nested comments', () => {
        // Test implementation
      });

      it('handles comment moderation', () => {
        // Test implementation
      });
    });
  });
});

/**
 * Best Practices Summary
 * 
 * This section demonstrates the key best practices in action
 */
describe('Best Practices Summary', () => {
  it('follows AAA pattern (Arrange-Act-Assert)', () => {
    // Arrange
    const mockHandler = jest.fn();
    const testData = { id: '1', title: 'Test' };

    // Act
    render(<PostCard post={testData} onVote={mockHandler} />);
    fireEvent.click(screen.getByLabelText(/upvote/i));

    // Assert
    expect(mockHandler).toHaveBeenCalledWith('1', 'upvote');
  });

  it('tests one thing at a time', () => {
    // This test focuses only on rendering
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('uses descriptive test names', () => {
    // The test name clearly describes what is being tested
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('37')).toBeInTheDocument(); // Score calculation
  });

  it('handles async operations properly', async () => {
    const { result } = renderHook(() => usePosts());

    // Wait for async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toBeDefined();
  });

  it('cleans up after tests', () => {
    // This test demonstrates proper cleanup
    const mockHandler = jest.fn();
    render(<PostCard post={mockPost} onVote={mockHandler} />);
    
    // Test implementation...
    
    // Cleanup is handled in afterEach block
  });
}); 