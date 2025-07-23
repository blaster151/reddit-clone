import { useState, useEffect, useCallback } from 'react';
import { Post, Comment } from '@/types';

/** Type of content to search for */
export type SearchType = 'post' | 'comment' | 'all';

/**
 * Search filter options for refining search results
 */
export type SearchFilter = {
  /** Type of content to search for */
  type: SearchType;
  /** Specific subreddit to search within */
  subreddit?: string;
  /** Specific author to search for */
  author?: string;
  /** Date range for search results */
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  /** Sort order for search results */
  sortBy?: 'relevance' | 'date' | 'score';
};

/**
 * Individual search result item
 */
export interface SearchResult {
  /** Unique identifier for the result */
  id: string;
  /** Type of content (post or comment) */
  type: 'post' | 'comment';
  /** Title of the post (only for posts) */
  title?: string;
  /** Content text of the post or comment */
  content: string;
  /** ID of the author */
  authorId: string;
  /** ID of the subreddit (only for posts) */
  subredditId?: string;
  /** Score/votes of the content */
  score: number;
  /** When the content was created */
  createdAt: Date;
  /** ID of the parent post (only for comments) */
  postId?: string;
}

/**
 * Custom hook for managing search functionality
 * 
 * This hook provides a complete search system including:
 * - Debounced search queries
 * - Search result management
 * - Filter options and state
 * - Loading states and error handling
 * 
 * @returns Object containing search state and functions
 * 
 * @example
 * ```tsx
 * function SearchPage() {
 *   const { 
 *     query, 
 *     setQuery, 
 *     results, 
 *     loading, 
 *     filters, 
 *     updateFilters 
 *   } = useSearch();
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={query} 
 *         onChange={(e) => setQuery(e.target.value)} 
 *         placeholder="Search..." 
 *       />
 *       {loading && <div>Searching...</div>}
 *       {results.map(result => (
 *         <SearchResult key={result.id} result={result} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    sortBy: 'relevance',
  });

  /**
   * Performs a search with the given query and filters
   * 
   * @param searchQuery - The search term to look for
   * @param searchFilters - Optional filters to apply to the search
   * @throws {Error} When the search API request fails
   */
  const search = useCallback(async (searchQuery: string, searchFilters: SearchFilter) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          type: searchFilters.type,
          filters: searchFilters,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        search(query, filters);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, search]);

  /**
   * Updates the search filters
   * 
   * @param newFilters - Partial filter object to merge with current filters
   */
  const updateFilters = useCallback((newFilters: Partial<SearchFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clears the current search query and results
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    /** Current search query */
    query,
    /** Function to update the search query */
    setQuery,
    /** Array of search results */
    results,
    /** Whether a search is currently in progress */
    loading,
    /** Error message if search failed */
    error,
    /** Current search filters */
    filters,
    /** Function to update search filters */
    updateFilters,
    /** Function to clear the search */
    clearSearch,
    /** Function to perform a manual search */
    search,
  };
} 