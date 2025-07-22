import { NextRequest, NextResponse } from 'next/server';

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