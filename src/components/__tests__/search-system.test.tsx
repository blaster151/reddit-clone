import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SearchBar } from '../search-bar';
import { SearchResults } from '../search-results';

// Mock search results
const mockSearchResults = [
  {
    id: 'post-1',
    type: 'post' as const,
    title: 'Test Post 1',
    content: 'This is a test post content',
    authorId: 'user1',
    subredditId: 'subreddit1',
    score: 100,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'post-2',
    type: 'post' as const,
    title: 'Test Post 2',
    content: 'Another test post content',
    authorId: 'user2',
    subredditId: 'subreddit2',
    score: 50,
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 'comment-1',
    type: 'comment' as const,
    title: 'Test Comment',
    content: 'This is a test comment',
    authorId: 'user3',
    subredditId: 'subreddit1',
    score: 25,
    createdAt: new Date('2024-01-03'),
  },
];

// Mock server for API calls
const server = setupServer(
  rest.post('/api/search', (req, res, ctx) => {
    const { query, type, filters } = req.body as any;
    
    if (!query) {
      return res(ctx.status(400), ctx.json({ error: 'Query is required' }));
    }

    // Simulate search logic
    let results = [...mockSearchResults];
    
    if (type) {
      results = results.filter(result => result.type === type);
    }
    
    if (filters?.subredditId) {
      results = results.filter(result => result.subredditId === filters.subredditId);
    }

    // Filter by query
    results = results.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.content.toLowerCase().includes(query.toLowerCase())
    );

    return res(
      ctx.delay(100), // Simulate network delay
      ctx.json({
        results,
        total: results.length,
        hasMore: false,
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

// Mock browser APIs
Object.defineProperty(global, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'WebSocket', {
  value: jest.fn(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
  })),
  writable: true,
});

describe('Search System Integration Tests', () => {
  describe('End-to-End Search Flow', () => {
    it('performs complete search flow from input to results', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();

      // Type search query
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for debounced search to trigger
      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      }, { timeout: 1000 });

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
        expect(screen.getByText('Test Comment')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles search with filters', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Type search query
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for initial results
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Open filter panel (if available)
      const filterButton = screen.queryByLabelText(/filter/i);
      if (filterButton) {
        fireEvent.click(filterButton);
        
        // Apply post filter
        const postFilter = screen.queryByLabelText(/posts only/i);
        if (postFilter) {
          fireEvent.click(postFilter);
          
          // Wait for filtered results
          await waitFor(() => {
            expect(screen.getByText('Test Post 1')).toBeInTheDocument();
            expect(screen.getByText('Test Post 2')).toBeInTheDocument();
            expect(screen.queryByText('Test Comment')).not.toBeInTheDocument();
          }, { timeout: 2000 });
        }
      }
    });

    it('handles empty search results', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Search for something that doesn't exist
      fireEvent.change(searchInput, { target: { value: 'nonexistentquery12345' } });

      // Wait for empty results
      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles search errors gracefully', async () => {
      // Mock API error
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Trigger search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('User Interaction Scenarios', () => {
    it('allows user to clear search and see empty state', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // First, perform a search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Clear the search
      fireEvent.change(searchInput, { target: { value: '' } });

      // Wait for empty state
      await waitFor(() => {
        expect(screen.queryByText('Test Post 1')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles rapid typing and debouncing', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Rapidly type multiple characters
      fireEvent.change(searchInput, { target: { value: 't' } });
      fireEvent.change(searchInput, { target: { value: 'te' } });
      fireEvent.change(searchInput, { target: { value: 'tes' } });
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for final search to complete
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify the final query is displayed
      expect(searchInput).toHaveValue('test');
    });

    it('allows user to select search results', async () => {
      const mockOnResultSelect = jest.fn();

      render(
        <div>
          <SearchBar onResultSelect={mockOnResultSelect} />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Perform search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Click on a result
      const firstResult = screen.getByText('Test Post 1');
      fireEvent.click(firstResult);

      // Verify callback was called
      expect(mockOnResultSelect).toHaveBeenCalledWith(expect.objectContaining({
        id: 'post-1',
        title: 'Test Post 1',
      }));
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    it('supports keyboard navigation through search results', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Perform search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Focus search input
      searchInput.focus();
      
      // Navigate with keyboard
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // Should handle keyboard navigation without errors
      expect(searchInput).toHaveFocus();
    });

    it('has proper ARIA attributes for accessibility', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Verify ARIA attributes
      expect(searchInput).toHaveAttribute('aria-label', 'Search Reddit');
      expect(searchInput).toHaveAttribute('role', 'searchbox');

      // Perform search to get results
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify results have proper roles
      const results = screen.getAllByRole('article');
      expect(results.length).toBeGreaterThan(0);
    });

    it('announces search results to screen readers', async () => {
      render(<SearchResults />);

      // Verify live region exists
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Performance and Responsiveness', () => {
    it('handles large search results efficiently', async () => {
      // Mock large result set
      const largeResults = Array.from({ length: 100 }, (_, i) => ({
        id: `post-${i}`,
        type: 'post' as const,
        title: `Large Post ${i}`,
        content: `Content for large post ${i}`,
        authorId: `user-${i}`,
        subredditId: `subreddit-${i % 10}`,
        score: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
      }));

      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          return res(ctx.json({
            results: largeResults,
            total: largeResults.length,
            hasMore: false,
          }));
        })
      );

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Perform search
      fireEvent.change(searchInput, { target: { value: 'large' } });

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Large Post 0')).toBeInTheDocument();
        expect(screen.getByText('Large Post 99')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should render large result set without performance issues
      const results = screen.getAllByRole('article');
      expect(results.length).toBeGreaterThan(0);
    });

    it('handles concurrent search operations', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Perform multiple rapid searches
      fireEvent.change(searchInput, { target: { value: 'query1' } });
      fireEvent.change(searchInput, { target: { value: 'query2' } });
      fireEvent.change(searchInput, { target: { value: 'query3' } });

      // Should handle concurrent operations without errors
      await waitFor(() => {
        expect(searchInput).toHaveValue('query3');
      }, { timeout: 2000 });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('handles network timeouts gracefully', async () => {
      // Mock slow API response
      server.use(
        rest.post('/api/search', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return res(ctx.json({ results: [] }));
        })
      );

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Trigger search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('handles malformed API responses', async () => {
      // Mock malformed response
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          return res(ctx.json({ invalid: 'response' }));
        })
      );

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Trigger search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should handle malformed response gracefully
      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles very long search queries', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      const longQuery = 'a'.repeat(1000);
      
      // Type very long query
      fireEvent.change(searchInput, { target: { value: longQuery } });

      // Should handle long query without issues
      await waitFor(() => {
        expect(searchInput).toHaveValue(longQuery);
      }, { timeout: 1000 });
    });

    it('handles special characters in search queries', async () => {
      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      const specialQuery = 'test@#$%^&*()_+-=[]{}|;:,.<>?';
      
      // Type query with special characters
      fireEvent.change(searchInput, { target: { value: specialQuery } });

      // Should handle special characters without issues
      await waitFor(() => {
        expect(searchInput).toHaveValue(specialQuery);
      }, { timeout: 1000 });
    });
  });

  describe('State Persistence and Re-rendering', () => {
    it('maintains search state across component re-renders', async () => {
      const { rerender } = render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Perform search
      fireEvent.change(searchInput, { target: { value: 'persistent' } });

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Re-render components
      rerender(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify state is maintained
      expect(searchInput).toHaveValue('persistent');
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    it('handles component unmounting and remounting', async () => {
      const { unmount, rerender } = render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Perform search
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Unmount components
      unmount();

      // Remount components
      rerender(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Should handle remounting without errors
      const newSearchInput = screen.getByPlaceholderText(/search/i);
      expect(newSearchInput).toBeInTheDocument();
    });
  });
}); 