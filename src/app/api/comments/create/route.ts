import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // In a real app, validate and save to DB
  const comment = {
    id: Math.random().toString(36).slice(2),
    content: body.content,
    authorId: body.authorId,
    postId: body.postId,
    parentCommentId: body.parentCommentId || null,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json({ comment }, { status: 201 });
} 