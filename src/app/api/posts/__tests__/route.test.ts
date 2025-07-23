import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ status: 200, json: async () => data })),
  },
}));

describe('GET /api/posts', () => {
  const createMockRequest = (url: string): NextRequest => {
    return new NextRequest(url);
  };

  it('returns a JSON response with posts array', async () => {
    const req = createMockRequest('http://localhost/api/posts');
    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.posts.length).toBeGreaterThan(0);
  });

  it('returns posts with required fields', async () => {
    const req = createMockRequest('http://localhost/api/posts');
    const response = await GET(req);
    const { posts } = await response.json();
    for (const post of posts) {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('authorId');
      expect(post).toHaveProperty('subredditId');
      expect(post).toHaveProperty('upvotes');
      expect(post).toHaveProperty('downvotes');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('updatedAt');
    }
  });

  it('returns posts with correct types', async () => {
    const req = createMockRequest('http://localhost/api/posts');
    const response = await GET(req);
    const { posts } = await response.json();
    for (const post of posts) {
      expect(typeof post.id).toBe('string');
      expect(typeof post.title).toBe('string');
      expect(typeof post.content).toBe('string');
      expect(typeof post.authorId).toBe('string');
      expect(typeof post.subredditId).toBe('string');
      expect(typeof post.upvotes).toBe('number');
      expect(typeof post.downvotes).toBe('number');
      expect(typeof post.createdAt).toBe('string');
      expect(typeof post.updatedAt).toBe('string');
    }
  });

  it('sets Cache-Control header for caching', async () => {
    const req = createMockRequest('http://localhost/api/posts');
    const response = await GET(req);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
  });

  it('returns paginated posts (default page 1, pageSize 10)', async () => {
    const req = createMockRequest('http://localhost/api/posts');
    const response = await GET(req);
    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(10);
    expect(data.total).toBeGreaterThan(0);
  });

  it('returns paginated posts (page 1, pageSize 1)', async () => {
    const req = createMockRequest('http://localhost/api/posts?page=1&pageSize=1');
    const response = await GET(req);
    const data = await response.json();
    expect(data.posts.length).toBe(1);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(1);
    expect(data.totalPages).toBeGreaterThan(0);
  });

  it('returns filtered posts by subredditId', async () => {
    const req = createMockRequest('http://localhost/api/posts?subredditId=s1');
    const response = await GET(req);
    const data = await response.json();
    expect(data.posts.every((p: any) => p.subredditId === 's1')).toBe(true);
  });

  it('returns empty array for out-of-range page', async () => {
    const req = createMockRequest('http://localhost/api/posts?page=100&pageSize=10');
    const response = await GET(req);
    const data = await response.json();
    expect(data.posts.length).toBe(0);
  });
}); 