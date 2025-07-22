import { GET } from '../route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ status: 200, json: async () => data })),
  },
}));

describe('GET /api/posts', () => {
  it('returns a JSON response with posts array', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.posts.length).toBeGreaterThan(0);
  });

  it('returns posts with required fields', async () => {
    const response = await GET();
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
    const response = await GET();
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
    const response = await GET();
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
  });
}); 