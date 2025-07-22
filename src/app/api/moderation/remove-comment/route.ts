import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

const removeCommentSchema = z.object({
  commentId: z.string().min(1),
  moderatorId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = removeCommentSchema.parse(body);
    // In a real app, remove comment from DB
    return NextResponse.json({ success: true, ...validated }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 