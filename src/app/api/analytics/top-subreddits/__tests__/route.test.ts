import { GET } from '../route';

describe('GET /api/analytics/top-subreddits', () => {
  it('returns top subreddits array', async () => {
    const req = {};
    const response: any = await GET(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.topSubreddits)).toBe(true);
    expect(data.topSubreddits[0]).toHaveProperty('id');
    expect(data.topSubreddits[0]).toHaveProperty('name');
    expect(data.topSubreddits[0]).toHaveProperty('subscriberCount');
  });
}); 