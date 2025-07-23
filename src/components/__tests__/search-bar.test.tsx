import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../search-bar';
import * as useSearchModule from '@/hooks/useSearch';

// Mock the useSearch hook
jest.mock('@/hooks/useSearch');

describe('SearchBar', () => {
  const mockUseSearch = {
    query: '',
    setQuery: jest.fn(),
    results: [],
    loading: false,
    error: null,
    filters: {
      type: 'all',
      sortBy: 'relevance',
    },
    updateFilters: jest.fn(),
    clearSearch: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchModule.useSearch as jest.Mock).mockReturnValue(mockUseSearch);
  });

  it('renders search input with placeholder', () => {
    render(<SearchBar placeholder="Search Reddit" />);
    expect(screen.getByPlaceholderText('Search Reddit')).toBeInTheDocument();
  });

  it('calls setQuery when input changes', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search Reddit');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    
    expect(mockUseSearch.setQuery).toHaveBeenCalledWith('test query');
  });

  it('shows loading spinner when loading', () => {
    (useSearchModule.useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      loading: true,
    });

    render(<SearchBar />);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows clear button when query is not empty', () => {
    (useSearchModule.useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      query: 'test query',
    });

    render(<SearchBar />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('clears query when clear button is clicked', () => {
    (useSearchModule.useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      query: 'test query',
    });

    render(<SearchBar />);
    const clearButton = screen.getByRole('button', { name: /clear/i });
    
    fireEvent.click(clearButton);
    
    expect(mockUseSearch.setQuery).toHaveBeenCalledWith('');
  });

  it('toggles filters panel when filter button is clicked', () => {
    render(<SearchBar />);
    const filterButton = screen.getByRole('button', { name: /filter/i });
    
    fireEvent.click(filterButton);
    
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('updates filters when filter options change', () => {
    render(<SearchBar />);
    const filterButton = screen.getByRole('button', { name: /filter/i });
    
    fireEvent.click(filterButton);
    
    const typeSelect = screen.getByDisplayValue('All');
    fireEvent.change(typeSelect, { target: { value: 'post' } });
    
    expect(mockUseSearch.updateFilters).toHaveBeenCalledWith({ type: 'post' });
  });

  it('shows search results dropdown when results are available', () => {
    const mockResults = [
      {
        id: '1',
        type: 'post',
        title: 'Test Post',
        content: 'Test content',
        authorId: 'user1',
        subredditId: 'test',
        score: 10,
        createdAt: new Date(),
      },
    ];

    (useSearchModule.useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      query: 'test',
      results: mockResults,
    });

    render(<SearchBar />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls onResultSelect when result is clicked', () => {
    const mockResults = [
      {
        id: '1',
        type: 'post',
        title: 'Test Post',
        content: 'Test content',
        authorId: 'user1',
        subredditId: 'test',
        score: 10,
        createdAt: new Date(),
      },
    ];

    const onResultSelect = jest.fn();

    (useSearchModule.useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      query: 'test',
      results: mockResults,
    });

    render(<SearchBar onResultSelect={onResultSelect} />);
    
    const resultItem = screen.getByText('Test Post');
    fireEvent.click(resultItem);
    
    expect(onResultSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('shows no results message when no results found', () => {
    (useSearchModule.useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      query: 'nonexistent',
      results: [],
    });

    render(<SearchBar />);
    
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SearchBar className="custom-class" />);
    const container = screen.getByPlaceholderText('Search Reddit').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('handles keyboard navigation', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search Reddit');
    
    fireEvent.focus(input);
    
    // Should show dropdown if there are results
    expect(input).toHaveFocus();
  });
}); 