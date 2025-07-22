import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Parse query params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const subredditId = searchParams.get('subredditId');

  // Static posts for demonstration
  let posts = [
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

  // Filtering
  if (subredditId) {
    posts = posts.filter((p) => p.subredditId === subredditId);
  }

  // Pagination
  const start = (page - 1) * pageSize;
  const paginated = posts.slice(start, start + pageSize);

  const response = NextResponse.json({
    posts: paginated,
    page,
    pageSize,
    total: posts.length,
    totalPages: Math.ceil(posts.length / pageSize),
  });
  response.headers.set('Cache-Control', 'public, max-age=60');
  return response;
} 