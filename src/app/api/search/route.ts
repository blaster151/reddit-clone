import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['post', 'comment']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = searchSchema.parse(body);
    // In a real app, perform full-text search in DB
    if (validated.type === 'post') {
      return NextResponse.json({
        results: [
          { id: 'post-1', title: 'First Post', content: 'Hello world', score: 0.95 },
        ],
      });
    } else {
      return NextResponse.json({
        results: [
          { id: 'comment-1', content: 'Nice post!', postId: 'post-1', score: 0.88 },
        ],
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 