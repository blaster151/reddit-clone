import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  // In a real app, fetch from DB
  if (id === 'test-id') {
    const subreddit = {
      id: 'test-id',
      name: 'testsubreddit',
      description: 'A test subreddit',
      creatorId: 'user-123',
      subscriberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const response = NextResponse.json({ subreddit }, { status: 200 });
    response.headers.set('Cache-Control', 'public, max-age=60');
    return response;
  }
  return NextResponse.json({ error: 'Subreddit not found' }, { status: 404 });
} 