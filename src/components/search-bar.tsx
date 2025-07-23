'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSearch, SearchFilter, SearchType } from '@/hooks/useSearch';

/**
 * Props for the SearchBar component
 */
interface SearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** Optional callback when a search result is selected */
  onResultSelect?: (result: any) => void;
}

/**
 * Advanced search bar component with dropdown results and filters
 * 
 * This component provides a comprehensive search interface with:
 * - Real-time search with debouncing
 * - Dropdown search results with rich previews
 * - Advanced filtering options (type, date range, subreddit, author)
 * - Loading states and error handling
 * - Keyboard navigation support
 * - Click outside to close functionality
 * 
 * @param props - Component props including placeholder, className, and result selection callback
 * @returns JSX element representing the search bar with dropdown
 * 
 * @example
 * ```tsx
 * <SearchBar 
 *   placeholder="Search posts and comments..."
 *   onResultSelect={(result) => navigateToResult(result)}
 * />
 * ```
 */
export function SearchBar({ placeholder = "Search Reddit", className = "", onResultSelect }: SearchBarProps) {
  const { query, setQuery, results, loading, filters, updateFilters } = useSearch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to handle clicking outside the search bar to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handles input value changes and manages dropdown visibility
   * 
   * @param value - New input value
   * 
   * @example
   * ```tsx
   * // Update search query and show dropdown if query has content
   * const handleInputChange = (value: string) => {
   *   setQuery(value);
   *   setIsDropdownOpen(value.length > 0);
   * };
   * 
   * // Usage in JSX
   * <input 
   *   onChange={(e) => handleInputChange(e.target.value)}
   *   placeholder="Search..."
   * />
   * ```
   */
  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsDropdownOpen(value.length > 0);
  };

  /**
   * Handles selection of a search result
   * 
   * Calls the onResultSelect callback and closes the dropdown
   * 
   * @param result - Selected search result
   * 
   * @example
   * ```tsx
   * // Handle result selection and cleanup
   * const handleResultClick = (result: any) => {
   *   onResultSelect?.(result);
   *   setIsDropdownOpen(false);
   *   setQuery('');
   * };
   * 
   * // Usage in JSX
   * <div onClick={() => handleResultClick(searchResult)}>
   *   {searchResult.title}
   * </div>
   * ```
   */
  const handleResultClick = (result: any) => {
    onResultSelect?.(result);
    setIsDropdownOpen(false);
    setQuery('');
  };

  /**
   * Updates search filters
   * 
   * @param key - Filter key to update
   * @param value - New filter value
   * 
   * @example
   * ```tsx
   * // Update specific filter
   * const handleFilterChange = (key: keyof SearchFilter, value: any) => {
   *   updateFilters({ [key]: value });
   * };
   * 
   * // Usage examples
   * handleFilterChange('type', 'post');
   * handleFilterChange('subreddit', 'programming');
   * handleFilterChange('dateRange', 'week');
   * 
   * // Usage in JSX
   * <select onChange={(e) => handleFilterChange('type', e.target.value)}>
   *   <option value="post">Posts</option>
   *   <option value="comment">Comments</option>
   * </select>
   * ```
   */
  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    updateFilters({ [key]: value });
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20 bg-gray-100 border-gray-200 focus:bg-white"
          onFocus={() => setIsDropdownOpen(query.length > 0)}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && <LoadingSpinner size="sm" />}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInputChange('')}
              className="h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-6 px-2 ${showFilters ? 'bg-orange-100 text-orange-600' : ''}`}
            aria-label="Filter search results"
          >
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value as SearchType)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="post">Posts</option>
                <option value="comment">Comments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="score">Score</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange || 'all'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="day">Past Day</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subreddit</label>
              <Input
                placeholder="Filter by subreddit"
                value={filters.subreddit || ''}
                onChange={(e) => handleFilterChange('subreddit', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center">
              <LoadingSpinner text="Searching..." />
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {result.type}
                        </span>
                        <span className="text-sm text-gray-500">by u/{result.authorId}</span>
                        {result.subredditId && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">r/{result.subredditId}</span>
                          </>
                        )}
                      </div>
                      {result.title && (
                        <div className="font-medium text-gray-900 mb-1 line-clamp-1">
                          {result.title}
                        </div>
                      )}
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {result.content}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>Score: {result.score}</span>
                        <span>•</span>
                        <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query && !loading ? (
            <div className="p-4 text-center text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 