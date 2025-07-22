import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

// Mock comment data for demonstration
let comments = [
  { id: 'c1', content: 'Top-level 1', authorId: 'u1', postId: '1', parentCommentId: null, deleted: false },
  { id: 'c2', content: 'Reply to 1', authorId: 'u2', postId: '1', parentCommentId: 'c1', deleted: false },
];

const editSchema = z.object({ content: z.string().min(1) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = editSchema.parse(body);
    const userId = req.headers.get('x-user-id');
    // Find comment
    const idx = comments.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (comments[idx].authorId !== userId && userId !== 'mod') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    comments[idx].content = validated.content;
    return NextResponse.json({ comment: comments[idx] });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const userId = req.headers.get('x-user-id');
  const idx = comments.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (comments[idx].authorId !== userId && userId !== 'mod') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  comments[idx].deleted = true;
  return NextResponse.json({ success: true });
} 