import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/posts/create
 * 
 * Creates a new post with the provided data.
 * 
 * @param req - NextRequest object containing the post data in the request body
 * @param req.body - JSON object containing post creation data
 * @param req.body.title - The title of the post (required)
 * @param req.body.content - The content/body of the post (required)
 * @param req.body.authorId - The ID of the user creating the post (required)
 * @param req.body.subredditId - The ID of the subreddit where the post will be created (required)
 * 
 * @example
 * ```typescript
 * // Create a new post
 * const response = await fetch('/api/posts/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     title: 'My First Post',
 *     content: 'This is the content of my post',
 *     authorId: 'user123',
 *     subredditId: 'subreddit456'
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with the created post data
 * 
 * @response
 * ```json
 * {
 *   "post": {
 *     "id": "abc123",
 *     "title": "My First Post",
 *     "content": "This is the content of my post",
 *     "authorId": "user123",
 *     "subredditId": "subreddit456",
 *     "upvotes": 0,
 *     "downvotes": 0,
 *     "createdAt": "2024-01-01T10:00:00.000Z",
 *     "updatedAt": "2024-01-01T10:00:00.000Z"
 *   }
 * }
 * ```
 * 
 * @throws {Error} - If there's an error processing the request or invalid data
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  // In a real app, validate and save to DB
  const post = {
    id: Math.random().toString(36).slice(2),
    title: body.title,
    content: body.content,
    authorId: body.authorId,
    subredditId: body.subredditId,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json({ post }, { status: 201 });
} 