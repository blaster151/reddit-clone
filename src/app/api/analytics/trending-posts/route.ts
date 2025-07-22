import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // In a real app, calculate trending posts from DB
  const trendingPosts = [
    { id: 'post-1', title: 'Hot Post', upvotes: 100, comments: 50 },
    { id: 'post-2', title: 'Rising Post', upvotes: 80, comments: 30 },
  ];
  return NextResponse.json({ trendingPosts }, { status: 200 });
} 