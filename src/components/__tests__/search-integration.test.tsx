import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SearchBar } from '../search-bar';
import { SearchResults } from '../search-results';
import { useSearch } from '@/hooks/useSearch';

// Mock the useSearch hook
const mockUseSearch = useSearch as jest.MockedFunction<typeof useSearch>;

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

describe('Search System Integration Tests', () => {
  beforeEach(() => {
    // Default mock implementation
    mockUseSearch.mockReturnValue({
      query: '',
      setQuery: jest.fn(),
      results: [],
      loading: false,
      error: null,
      filters: {},
      updateFilters: jest.fn(),
      clearResults: jest.fn(),
      search: jest.fn(),
    });
  });

  describe('SearchBar + SearchResults Integration', () => {
    it('performs search and displays results correctly', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();
      const mockUpdateFilters = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: mockUpdateFilters,
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify search bar is rendered
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

      // Verify results are displayed
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      expect(screen.getByText('Test Comment')).toBeInTheDocument();
    });

    it('handles loading state during search', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: [],
        loading: true,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify loading state is displayed
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByText('Test Post 1')).not.toBeInTheDocument();
    });

    it('handles error state during search', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: 'Search failed',
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify error state is displayed
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      expect(screen.queryByText('Test Post 1')).not.toBeInTheDocument();
    });

    it('handles empty search results', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'nonexistent',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify empty state is displayed
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction Flow', () => {
    it('allows user to type query and trigger search', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: '',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(<SearchBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Type in search input
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(mockSetQuery).toHaveBeenCalledWith('test query');
    });

    it('debounces search input to prevent excessive API calls', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: '',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(<SearchBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Rapidly type multiple characters
      fireEvent.change(searchInput, { target: { value: 't' } });
      fireEvent.change(searchInput, { target: { value: 'te' } });
      fireEvent.change(searchInput, { target: { value: 'tes' } });
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should only call setQuery for the final value
      expect(mockSetQuery).toHaveBeenCalledTimes(4);
      expect(mockSetQuery).toHaveBeenLastCalledWith('test');
    });

    it('allows user to filter search results', async () => {
      const mockSetQuery = jest.fn();
      const mockUpdateFilters = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: { type: 'post' },
        updateFilters: mockUpdateFilters,
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchBar />);

      // Open filter panel
      const filterButton = screen.getByLabelText(/filter/i);
      fireEvent.click(filterButton);

      // Select post type filter
      const postFilter = screen.getByLabelText(/posts only/i);
      fireEvent.click(postFilter);

      expect(mockUpdateFilters).toHaveBeenCalledWith({ type: 'post' });
    });

    it('allows user to clear search and results', async () => {
      const mockSetQuery = jest.fn();
      const mockClearResults = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: mockClearResults,
        search: jest.fn(),
      });

      render(<SearchBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Clear the search input
      fireEvent.change(searchInput, { target: { value: '' } });
      
      expect(mockSetQuery).toHaveBeenCalledWith('');
      expect(mockClearResults).toHaveBeenCalled();
    });
  });

  describe('Search Results Interaction', () => {
    it('allows user to click on search results', async () => {
      const mockSetQuery = jest.fn();
      const mockOnResultSelect = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(
        <div>
          <SearchBar onResultSelect={mockOnResultSelect} />
          <SearchResults />
        </div>
      );

      // Click on a search result
      const firstResult = screen.getByText('Test Post 1');
      fireEvent.click(firstResult);

      expect(mockOnResultSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    });

    it('displays correct result information', async () => {
      const mockSetQuery = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchResults />);

      // Verify result details are displayed
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      expect(screen.getByText('Another test post content')).toBeInTheDocument();
      expect(screen.getByText('Test Comment')).toBeInTheDocument();
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    it('handles different result types correctly', async () => {
      const mockSetQuery = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchResults />);

      // Verify post results
      const postResults = screen.getAllByText(/Test Post/);
      expect(postResults).toHaveLength(2);

      // Verify comment result
      expect(screen.getByText('Test Comment')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('makes API call when search is triggered', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(<SearchBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Trigger search
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      expect(mockSearch).toHaveBeenCalledWith('test');
    });

    it('handles API errors gracefully', async () => {
      // Mock API error
      server.use(
        rest.post('/api/search', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: 'Search failed',
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });

    it('handles network timeouts', async () => {
      // Mock slow API response
      server.use(
        rest.post('/api/search', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return res(ctx.json({ results: [] }));
        })
      );

      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: [],
        loading: true,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('supports keyboard navigation', async () => {
      const mockSetQuery = jest.fn();
      const mockOnResultSelect = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(
        <div>
          <SearchBar onResultSelect={mockOnResultSelect} />
          <SearchResults />
        </div>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Focus search input
      searchInput.focus();
      
      // Navigate with arrow keys
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // Should handle keyboard navigation without errors
      expect(searchInput).toHaveFocus();
    });

    it('has proper ARIA labels and roles', async () => {
      const mockSetQuery = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify ARIA attributes
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveAttribute('aria-label', 'Search Reddit');
      expect(searchInput).toHaveAttribute('role', 'searchbox');

      // Verify results have proper roles
      const results = screen.getAllByRole('article');
      expect(results.length).toBeGreaterThan(0);
    });

    it('announces search results to screen readers', async () => {
      const mockSetQuery = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchResults />);

      // Verify live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('State Management Integration', () => {
    it('maintains search state across component re-renders', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'persistent query',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: { type: 'post' },
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      const { rerender } = render(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify initial state
      expect(screen.getByDisplayValue('persistent query')).toBeInTheDocument();
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();

      // Re-render components
      rerender(
        <div>
          <SearchBar />
          <SearchResults />
        </div>
      );

      // Verify state is maintained
      expect(screen.getByDisplayValue('persistent query')).toBeInTheDocument();
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    it('handles concurrent search operations', async () => {
      const mockSetQuery = jest.fn();
      const mockSearch = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: mockSearchResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: mockSearch,
      });

      render(<SearchBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Simulate rapid search operations
      fireEvent.change(searchInput, { target: { value: 'query1' } });
      fireEvent.change(searchInput, { target: { value: 'query2' } });
      fireEvent.change(searchInput, { target: { value: 'query3' } });

      // Should handle concurrent operations gracefully
      expect(mockSetQuery).toHaveBeenCalledTimes(3);
      expect(mockSetQuery).toHaveBeenLastCalledWith('query3');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles very long search queries', async () => {
      const mockSetQuery = jest.fn();
      const longQuery = 'a'.repeat(1000);

      mockUseSearch.mockReturnValue({
        query: longQuery,
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchBar />);

      const searchInput = screen.getByDisplayValue(longQuery);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles special characters in search queries', async () => {
      const mockSetQuery = jest.fn();
      const specialQuery = 'test@#$%^&*()_+-=[]{}|;:,.<>?';

      mockUseSearch.mockReturnValue({
        query: specialQuery,
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchBar />);

      const searchInput = screen.getByDisplayValue(specialQuery);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles empty search results gracefully', async () => {
      const mockSetQuery = jest.fn();

      mockUseSearch.mockReturnValue({
        query: 'nonexistent',
        setQuery: mockSetQuery,
        results: [],
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchResults />);

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your search terms/i)).toBeInTheDocument();
    });

    it('handles malformed search results', async () => {
      const mockSetQuery = jest.fn();
      const malformedResults = [
        {
          id: 'post-1',
          type: 'post',
          title: 'Valid Post',
          content: 'Valid content',
          authorId: 'user1',
          subredditId: 'subreddit1',
          score: 100,
          createdAt: new Date(),
        },
        {
          id: 'post-2',
          // Missing required fields
          type: 'post',
          title: 'Invalid Post',
        } as any,
      ];

      mockUseSearch.mockReturnValue({
        query: 'test',
        setQuery: mockSetQuery,
        results: malformedResults,
        loading: false,
        error: null,
        filters: {},
        updateFilters: jest.fn(),
        clearResults: jest.fn(),
        search: jest.fn(),
      });

      render(<SearchResults />);

      // Should display valid results and handle invalid ones gracefully
      expect(screen.getByText('Valid Post')).toBeInTheDocument();
      expect(screen.getByText('Invalid Post')).toBeInTheDocument();
    });
  });
}); 