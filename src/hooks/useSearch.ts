import { useState, useEffect, useCallback } from 'react';
import { Post, Comment } from '@/types';

export type SearchType = 'post' | 'comment' | 'all';
export type SearchFilter = {
  type: SearchType;
  subreddit?: string;
  author?: string;
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'relevance' | 'date' | 'score';
};

export interface SearchResult {
  id: string;
  type: 'post' | 'comment';
  title?: string;
  content: string;
  authorId: string;
  subredditId?: string;
  score: number;
  createdAt: Date;
  postId?: string; // for comments
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    sortBy: 'relevance',
  });

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

  const updateFilters = useCallback((newFilters: Partial<SearchFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    filters,
    updateFilters,
    clearSearch,
    search,
  };
} 