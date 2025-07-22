import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // In a real app, calculate user engagement from DB
  const engagement = [
    { userId: 'user-1', posts: 10, comments: 25, votes: 50 },
    { userId: 'user-2', posts: 5, comments: 15, votes: 20 },
  ];
  return NextResponse.json({ engagement }, { status: 200 });
} 