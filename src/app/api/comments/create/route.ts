import { NextRequest, NextResponse } from 'next/server';
import { createCommentSchema } from '@/lib/validation';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';

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