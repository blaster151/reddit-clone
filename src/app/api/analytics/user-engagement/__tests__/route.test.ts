import { GET } from '../route';

describe('GET /api/analytics/user-engagement', () => {
  it('returns user engagement array', async () => {
    const req = {};
    const response: any = await GET(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.engagement)).toBe(true);
    expect(data.engagement[0]).toHaveProperty('userId');
    expect(data.engagement[0]).toHaveProperty('posts');
    expect(data.engagement[0]).toHaveProperty('comments');
    expect(data.engagement[0]).toHaveProperty('votes');
  });
}); 