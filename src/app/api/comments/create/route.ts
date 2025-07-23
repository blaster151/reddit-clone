import { NextRequest, NextResponse } from 'next/server';
import { createCommentSchema } from '@/lib/validation';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/comments/create
 * 
 * Creates a new comment with the provided data. Supports both top-level comments and replies.
 * Validates input using Zod schema and saves to database using Prisma.
 * 
 * @param req - NextRequest object containing the comment data in the request body
 * @param req.body - JSON object containing comment creation data
 * @param req.body.content - The content of the comment (required, validated by createCommentSchema)
 * @param req.body.authorId - The ID of the user creating the comment (required, must be valid UUID)
 * @param req.body.postId - The ID of the post where the comment will be created (required)
 * @param req.body.parentCommentId - The ID of the parent comment for replies (optional)
 * 
 * @example
 * ```typescript
 * // Create a top-level comment
 * const response = await fetch('/api/comments/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     content: 'This is a great post!',
 *     authorId: '123e4567-e89b-12d3-a456-426614174000',
 *     postId: 'post123'
 *   })
 * });
 * 
 * // Create a reply to another comment
 * const response = await fetch('/api/comments/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     content: 'I agree with your point!',
 *     authorId: '123e4567-e89b-12d3-a456-426614174000',
 *     postId: 'post123',
 *     parentCommentId: 'comment456'
 *   })
 * });
 * ```
 * 
 * @returns Promise<NextResponse> - JSON response with the created comment data
 * 
 * @response
 * ```json
 * {
 *   "comment": {
 *     "id": "comment789",
 *     "content": "This is a great post!",
 *     "authorId": "123e4567-e89b-12d3-a456-426614174000",
 *     "postId": "post123",
 *     "parentCommentId": null,
 *     "createdAt": "2024-01-01T10:00:00.000Z",
 *     "updatedAt": "2024-01-01T10:00:00.000Z"
 *   }
 * }
 * ```
 * 
 * @throws {ZodError} - If validation fails (400 Bad Request)
 * @throws {Error} - If there's a database error or other internal error (500 Internal Server Error)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate input
    const validated = createCommentSchema.extend({ authorId: z.string().uuid() }).parse(body);
    // Save to DB
    const comment = await prisma.comment.create({
      data: {
        content: validated.content,
        authorId: validated.authorId,
        postId: validated.postId,
        parentCommentId: validated.parentCommentId || null,
      },
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
} 