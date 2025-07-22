import { GET } from '../route';

describe('GET /api/analytics/trending-posts', () => {
  it('returns trending posts array', async () => {
    const req = {};
    const response: any = await GET(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.trendingPosts)).toBe(true);
    expect(data.trendingPosts[0]).toHaveProperty('id');
    expect(data.trendingPosts[0]).toHaveProperty('title');
    expect(data.trendingPosts[0]).toHaveProperty('upvotes');
    expect(data.trendingPosts[0]).toHaveProperty('comments');
  });
}); 