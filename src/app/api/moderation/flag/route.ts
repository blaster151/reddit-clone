import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

/**
 * Zod schema for validating flag request data.
 * Ensures all required fields are present and meet minimum requirements.
 */
const flagSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['post', 'comment']),
  userId: z.string().min(1),
  reason: z.string().min(3),
});

/**
 * POST /api/moderation/flag
 * 
 * Flags a post or comment for moderation review.
 * Validates input using Zod schema and creates a flag record for moderators.
 * 
 * @param req - NextRequest object containing the flag data in the request body
 * @param req.body - JSON object containing flag data
 * @param req.body.targetId - The ID of the post or comment being flagged (required)
 * @param req.body.targetType - The type of content being flagged: 'post' or 'comment' (required)
 * @param req.body.userId - The ID of the user reporting the content (required)
 * @param req.body.reason - The reason for flagging the content (required, minimum 3 characters)
 * 
 * @example
 * ```typescript
 * // Flag a post for inappropriate content
 * const response = await fetch('/api/moderation/flag', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     targetId: 'post123',
 *     targetType: 'post',
 *     userId: 'user456',
 *     reason: 'This post contains inappropriate content'
 *   })
 * });
 * 
 * // Flag a comment for spam
 * const response = await fetch('/api/moderation/flag', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     targetId: 'comment789',
 *     targetType: 'comment',
 *     userId: 'user456',
 *     reason: 'This comment appears to be spam'
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with flag confirmation
 * 
 * @response
 * ```json
 * {
 *   "success": true,
 *   "targetId": "post123",
 *   "targetType": "post",
 *   "userId": "user456",
 *   "reason": "This post contains inappropriate content"
 * }
 * ```
 * 
 * @throws {ZodError} - If validation fails (400 Bad Request)
 * @throws {Error} - If there's an internal server error (500 Internal Server Error)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = flagSchema.parse(body);
    // In a real app, save flag to DB
    return NextResponse.json({ success: true, ...validated }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 