import { NextRequest, NextResponse } from 'next/server';
import { voteSchemaInput } from '@/lib/validation';
import { handleApiError, ApiError } from '@/lib/api-error';

/**
 * POST /api/votes
 * 
 * Creates a new vote (upvote or downvote) for a post or comment.
 * Validates input using Zod schema and handles errors gracefully.
 * 
 * @param req - NextRequest object containing the vote data in the request body
 * @param req.body - JSON object containing vote creation data
 * @param req.body.userId - The ID of the user casting the vote (required, validated by voteSchemaInput)
 * @param req.body.targetId - The ID of the post or comment being voted on (required)
 * @param req.body.targetType - The type of content being voted on: 'post' or 'comment' (required)
 * @param req.body.voteType - The type of vote: 'upvote' or 'downvote' (required)
 * 
 * @example
 * ```typescript
 * // Upvote a post
 * const response = await fetch('/api/votes', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     userId: 'user123',
 *     targetId: 'post456',
 *     targetType: 'post',
 *     voteType: 'upvote'
 *   })
 * });
 * 
 * // Downvote a comment
 * const response = await fetch('/api/votes', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     userId: 'user123',
 *     targetId: 'comment789',
 *     targetType: 'comment',
 *     voteType: 'downvote'
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with the created vote data
 * 
 * @response
 * ```json
 * {
 *   "vote": {
 *     "id": "vote123",
 *     "userId": "user123",
 *     "targetId": "post456",
 *     "targetType": "post",
 *     "voteType": "upvote",
 *     "createdAt": "2024-01-01T10:00:00.000Z"
 *   }
 * }
 * ```
 * 
 * @throws {ZodError} - If validation fails (400 Bad Request)
 * @throws {ApiError} - If there's an API-specific error (400-500 status codes)
 * @throws {Error} - If there's an unexpected error (500 Internal Server Error)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate input
    const validated = voteSchemaInput.parse(body);
    // In a real app, validate and save to DB
    const vote = {
      id: Math.random().toString(36).slice(2),
      userId: validated.userId,
      targetId: validated.targetId,
      targetType: validated.targetType, // 'post' or 'comment'
      voteType: validated.voteType,     // 'upvote' or 'downvote'
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
} 