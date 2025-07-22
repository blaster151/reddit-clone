import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  // In a real app, fetch from DB
  if (id === 'user-123') {
    const posts = [
      { id: 'post-1', title: 'First Post', content: 'Hello', createdAt: new Date().toISOString() },
    ];
    const comments = [
      { id: 'comment-1', content: 'Nice post!', postId: 'post-1', createdAt: new Date().toISOString() },
    ];
    const votes = [
      { id: 'vote-1', targetId: 'post-1', targetType: 'post', voteType: 'upvote', createdAt: new Date().toISOString() },
    ];
    return NextResponse.json({ posts, comments, votes }, { status: 200 });
  }
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
} 