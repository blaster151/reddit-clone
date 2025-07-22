import { NextRequest, NextResponse } from 'next/server';
import { createCommentSchema } from '@/lib/validation';
import { z } from 'zod';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate input
    const validated = createCommentSchema.extend({ authorId: z.string().uuid() }).parse(body);
    // In a real app, validate and save to DB
    const comment = {
      id: Math.random().toString(36).slice(2),
      content: validated.content,
      authorId: validated.authorId,
      postId: validated.postId,
      parentCommentId: validated.parentCommentId || null,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
} 