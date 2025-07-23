import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

/**
 * Zod schema for validating search request data.
 * Defines the structure and validation rules for search queries.
 */
const searchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['post', 'comment', 'all']).default('all'),
  filters: z.object({
    subreddit: z.string().optional(),
    author: z.string().optional(),
    dateRange: z.enum(['day', 'week', 'month', 'year', 'all']).optional(),
    sortBy: z.enum(['relevance', 'date', 'score']).optional(),
  }).optional(),
});

/**
 * Mock post data for demonstration purposes.
 * In a real application, this would be fetched from a database.
 */
const mockPosts = [
  {
    id: 'post-1',
    title: 'What\'s your favorite programming language and why?',
    content: 'I\'ve been coding for a few years now and I\'m curious to hear what languages other developers prefer. Personally, I love TypeScript for its type safety and JavaScript ecosystem compatibility.',
    authorId: 'user1',
    subredditId: 'programming',
    upvotes: 42,
    downvotes: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'post-2',
    title: 'Just finished building my first full-stack app!',
    content: 'After months of learning, I finally completed my first full-stack application using Next.js, TypeScript, and Tailwind CSS. The feeling of accomplishment is incredible!',
    authorId: 'user2',
    subredditId: 'webdev',
    upvotes: 128,
    downvotes: 1,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'post-3',
    title: 'Tips for staying productive while working from home',
    content: 'I\'ve been working remotely for over a year now and here are some strategies that have helped me stay focused and productive...',
    authorId: 'user3',
    subredditId: 'productivity',
    upvotes: 89,
    downvotes: 7,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

/**
 * Mock comment data for demonstration purposes.
 * In a real application, this would be fetched from a database.
 */
const mockComments = [
  {
    id: 'comment-1',
    content: 'TypeScript is definitely my favorite! The type safety has saved me so many bugs.',
    authorId: 'user4',
    postId: 'post-1',
    upvotes: 15,
    downvotes: 0,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'comment-2',
    content: 'Great job on your first full-stack app! Next.js is an excellent choice.',
    authorId: 'user5',
    postId: 'post-2',
    upvotes: 8,
    downvotes: 1,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

/**
 * Searches through posts and comments based on the provided query and filters.
 * 
 * @param query - The search query string to match against content
 * @param type - The type of content to search: 'post', 'comment', or 'all'
 * @param filters - Optional filters to apply to the search results
 * @param filters.subreddit - Filter results by subreddit ID
 * @param filters.author - Filter results by author ID
 * @param filters.dateRange - Filter results by date range
 * @param filters.sortBy - Sort results by relevance, date, or score
 * 
 * @returns Array of search results with metadata
 */
function searchContent(query: string, type: string, filters?: any) {
  const lowerQuery = query.toLowerCase();
  let results: any[] = [];

  // Search posts
  if (type === 'all' || type === 'post') {
    const postResults = mockPosts
      .filter(post => {
        const matchesQuery = post.title.toLowerCase().includes(lowerQuery) ||
                           post.content.toLowerCase().includes(lowerQuery);
        
        if (!matchesQuery) return false;
        
        // Apply filters
        if (filters?.subreddit && post.subredditId !== filters.subreddit) return false;
        if (filters?.author && post.authorId !== filters.author) return false;
        
        return true;
      })
      .map(post => ({
        id: post.id,
        type: 'post' as const,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        subredditId: post.subredditId,
        score: post.upvotes - post.downvotes,
        createdAt: post.createdAt,
      }));
    
    results.push(...postResults);
  }

  // Search comments
  if (type === 'all' || type === 'comment') {
    const commentResults = mockComments
      .filter(comment => {
        const matchesQuery = comment.content.toLowerCase().includes(lowerQuery);
        
        if (!matchesQuery) return false;
        
        // Apply filters
        if (filters?.author && comment.authorId !== filters.author) return false;
        
        return true;
      })
      .map(comment => ({
        id: comment.id,
        type: 'comment' as const,
        content: comment.content,
        authorId: comment.authorId,
        postId: comment.postId,
        score: comment.upvotes - comment.downvotes,
        createdAt: comment.createdAt,
      }));
    
    results.push(...commentResults);
  }

  // Sort results
  const sortBy = filters?.sortBy || 'relevance';
  if (sortBy === 'date') {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'score') {
    results.sort((a, b) => b.score - a.score);
  } else {
    // Relevance sorting (simple implementation)
    results.sort((a, b) => b.score - a.score);
  }

  return results;
}

/**
 * POST /api/search
 * 
 * Performs a full-text search across posts and comments with advanced filtering and sorting options.
 * Validates input using Zod schema and returns relevant search results.
 * 
 * @param req - NextRequest object containing the search parameters in the request body
 * @param req.body - JSON object containing search data
 * @param req.body.query - The search query string (required, minimum 1 character)
 * @param req.body.type - The type of content to search: 'post', 'comment', or 'all' (optional, defaults to 'all')
 * @param req.body.filters - Optional filters to apply to search results
 * @param req.body.filters.subreddit - Filter results by subreddit ID (optional)
 * @param req.body.filters.author - Filter results by author ID (optional)
 * @param req.body.filters.dateRange - Filter results by date range: 'day', 'week', 'month', 'year', 'all' (optional)
 * @param req.body.filters.sortBy - Sort results by: 'relevance', 'date', 'score' (optional, defaults to 'relevance')
 * 
 * @example
 * ```typescript
 * // Basic search
 * const response = await fetch('/api/search', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     query: 'programming'
 *   })
 * });
 * 
 * // Advanced search with filters
 * const response = await fetch('/api/search', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     query: 'TypeScript',
 *     type: 'post',
 *     filters: {
 *       subreddit: 'programming',
 *       author: 'user123',
 *       dateRange: 'week',
 *       sortBy: 'score'
 *     }
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with search results and metadata
 * 
 * @response
 * ```json
 * {
 *   "results": [
 *     {
 *       "id": "post-1",
 *       "type": "post",
 *       "title": "What's your favorite programming language and why?",
 *       "content": "I've been coding for a few years now...",
 *       "authorId": "user1",
 *       "subredditId": "programming",
 *       "score": 39,
 *       "createdAt": "2024-01-01T08:00:00.000Z"
 *     }
 *   ],
 *   "total": 1,
 *   "query": "TypeScript",
 *   "filters": {
 *     "subreddit": "programming",
 *     "sortBy": "score"
 *   }
 * }
 * ```
 * 
 * @throws {ZodError} - If validation fails (400 Bad Request)
 * @throws {Error} - If there's an internal server error (500 Internal Server Error)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = searchSchema.parse(body);
    
    const results = searchContent(validated.query, validated.type, validated.filters);
    
    return NextResponse.json({
      results,
      total: results.length,
      query: validated.query,
      filters: validated.filters,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 