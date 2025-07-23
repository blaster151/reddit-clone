import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/posts
 * 
 * Retrieves a paginated list of posts with optional filtering by subreddit.
 * 
 * @param req - NextRequest object containing query parameters
 * @param req.url - URL with query parameters for pagination and filtering
 * 
 * @example
 * ```typescript
 * // Get first page of posts
 * GET(new NextRequest('http://localhost/api/posts'))
 * 
 * // Get posts from specific subreddit with pagination
 * GET(new NextRequest('http://localhost/api/posts?subredditId=s1&page=2&pageSize=5'))
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with posts array and pagination metadata
 * 
 * @response
 * ```json
 * {
 *   "posts": [
 *     {
 *       "id": "1",
 *       "title": "Hello World",
 *       "content": "This is the first post!",
 *       "authorId": "u1",
 *       "subredditId": "s1",
 *       "upvotes": 10,
 *       "downvotes": 2,
 *       "createdAt": "2024-01-01T10:00:00.000Z",
 *       "updatedAt": "2024-01-01T10:00:00.000Z"
 *     }
 *   ],
 *   "page": 1,
 *   "pageSize": 10,
 *   "total": 2,
 *   "totalPages": 1
 * }
 * ```
 * 
 * @throws {Error} - If there's an error processing the request
 */
export async function GET(req: NextRequest) {
  // Parse query params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const subredditId = searchParams.get('subredditId');

  // Static posts for demonstration
  let posts = [
    {
      id: '1',
      title: 'Hello World',
      content: 'This is the first post!',
      authorId: 'u1',
      subredditId: 's1',
      upvotes: 10,
      downvotes: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Second Post',
      content: 'Another post for testing.',
      authorId: 'u2',
      subredditId: 's2',
      upvotes: 5,
      downvotes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Filtering
  if (subredditId) {
    posts = posts.filter((p) => p.subredditId === subredditId);
  }

  // Pagination
  const start = (page - 1) * pageSize;
  const paginated = posts.slice(start, start + pageSize);

  const response = NextResponse.json({
    posts: paginated,
    page,
    pageSize,
    total: posts.length,
    totalPages: Math.ceil(posts.length / pageSize),
  });
  response.headers.set('Cache-Control', 'public, max-age=60');
  return response;
} 