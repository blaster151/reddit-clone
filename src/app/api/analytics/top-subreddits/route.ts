import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // In a real app, calculate top subreddits from DB
  const topSubreddits = [
    { id: 'sub-1', name: 'programming', subscriberCount: 10000 },
    { id: 'sub-2', name: 'javascript', subscriberCount: 8000 },
  ];
  return NextResponse.json({ topSubreddits }, { status: 200 });
} 