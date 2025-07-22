import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // In a real app, validate and save to DB
  const vote = {
    id: Math.random().toString(36).slice(2),
    userId: body.userId,
    targetId: body.targetId,
    targetType: body.targetType, // 'post' or 'comment'
    voteType: body.voteType,     // 'upvote' or 'downvote'
    createdAt: new Date().toISOString(),
  };
  return NextResponse.json({ vote }, { status: 201 });
} 