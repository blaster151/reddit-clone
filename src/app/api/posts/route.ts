import { NextResponse } from 'next/server';

export async function GET() {
  // Static posts for demonstration
  const posts = [
    {
      id: '1',
      title: 'Hello World',
      content: 'This is the first post!',
      authorId: 'u1',
      subredditId: 's1',
      upvotes: 10,
      downvotes: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Second Post',
      content: 'Another post for testing.',
      authorId: 'u2',
      subredditId: 's2',
      upvotes: 5,
      downvotes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  const response = NextResponse.json({ posts });
  response.headers.set('Cache-Control', 'public, max-age=60');
  return response;
} 