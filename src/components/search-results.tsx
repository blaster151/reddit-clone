'use client';

import { useState } from 'react';
import { PostCard } from './post-card';
import { Comment } from './comment';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PostCardSkeleton } from '@/components/ui/skeleton';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

/**
 * Props for the SearchResults component
 */
interface SearchResultsProps {
  /** Initial search query to pre-populate the search */
  initialQuery?: string;
  /** Optional callback when a search result is selected */
  onResultSelect?: (result: SearchResult) => void;
}

/**
 * Comprehensive search results page component
 * 
 * This component provides a full-featured search results interface with:
 * - Search results display for both posts and comments
 * - Advanced filtering options (type, date range, subreddit, author)
 * - Sorting options (relevance, date, score)
 * - Loading states with skeleton components
 * - Error handling with retry functionality
 * - Empty states for no results
 * - Responsive design with Tailwind CSS
 * 
 * @param props - Component props including initial query and result selection callback
 * @returns JSX element representing the search results page
 * 
 * @example
 * ```tsx
 * <SearchResults 
 *   initialQuery="react hooks"
 *   onResultSelect={(result) => navigateToResult(result)}
 * />
 * ```
 */
export function SearchResults({ initialQuery = '', onResultSelect }: SearchResultsProps) {
  const { query, setQuery, results, loading, error, filters, updateFilters } = useSearch();
  const [showFilters, setShowFilters] = useState(false);

  // Set initial query if provided
  useState(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  });

  /**
   * Updates search filters
   * 
   * @param key - Filter key to update
   * @param value - New filter value
   */
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    updateFilters({ [key]: value });
  };

  /**
   * Updates the sort order for search results
   * 
   * @param sortBy - New sort order (relevance, date, score)
   */
  const handleSortChange = (sortBy: string) => {
    updateFilters({ sortBy: sortBy as any });
  };

  /**
   * Renders individual search results as either PostCard or Comment components
   * 
   * @param result - Search result to render
   * @returns JSX element representing the search result
   */
  const renderResult = (result: SearchResult) => {
    if (result.type === 'post') {
      return (
        <PostCard
          key={result.id}
          post={{
            id: result.id,
            title: result.title || '',
            content: result.content,
            authorId: result.authorId,
            subredditId: result.subredditId || '',
            upvotes: result.score,
            downvotes: 0,
            isRemoved: false,
            createdAt: result.createdAt,
            updatedAt: result.createdAt,
          }}
        />
      );
    } else {
      return (
        <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <Comment
            comment={{
              id: result.id,
              content: result.content,
              authorId: result.authorId,
              postId: result.postId || '',
              upvotes: result.score,
              downvotes: 0,
              isRemoved: false,
              createdAt: result.createdAt,
              updatedAt: result.createdAt,
            }}
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
        <div className="flex justify-center py-4">
          <LoadingSpinner text="Searching..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <Button
          onClick={() => window.location.reload()}
          className="text-orange-500 hover:text-orange-600 underline"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Search Results
            </h1>
            {query && (
              <p className="text-gray-600">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-orange-100 text-orange-600' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm appearance-none pr-8"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="score">Score</option>
              </select>
              <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="post">Posts</option>
                  <option value="comment">Comments</option>
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
                <input
                  type="text"
                  placeholder="Filter by subreddit"
                  value={filters.subreddit || ''}
                  onChange={(e) => handleFilterChange('subreddit', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  placeholder="Filter by author"
                  value={filters.author || ''}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map(renderResult)}
        </div>
      ) : query ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">No results found for "{query}"</div>
          <div className="text-sm text-gray-500">
            Try adjusting your search terms or filters
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">Enter a search query to get started</div>
        </div>
      )}
    </div>
  );
} 