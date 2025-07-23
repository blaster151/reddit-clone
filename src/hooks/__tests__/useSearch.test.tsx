import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from '../useSearch';

// Mock fetch
global.fetch = jest.fn();

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.filters).toEqual({
      type: 'all',
      sortBy: 'relevance',
    });
  });

  it('updates query when setQuery is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    expect(result.current.query).toBe('test query');
  });

  it('debounces search requests', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    // Should not have called fetch yet due to debouncing
    expect(mockFetch).not.toHaveBeenCalled();

    // Fast-forward time to trigger debounced search
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test',
          type: 'all',
          filters: {
            type: 'all',
            sortBy: 'relevance',
          },
        }),
      });
    });
  });

  it('handles successful search response', async () => {
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

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it('handles search error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValueOnce(new Error('Search failed'));

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Search failed');
      expect(result.current.results).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.updateFilters({ type: 'post', sortBy: 'date' });
    });

    expect(result.current.filters).toEqual({
      type: 'post',
      sortBy: 'date',
    });
  });

  it('clears search when clearSearch is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('does not search when query is empty', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('triggers new search when filters change', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.updateFilters({ type: 'post' });
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
}); 