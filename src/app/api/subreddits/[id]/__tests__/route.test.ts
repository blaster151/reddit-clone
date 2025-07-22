import { GET } from '../route';

describe('GET /api/subreddits/[id]', () => {
  it('fetches a subreddit with valid id', async () => {
    const req = {};
    const response: any = await GET(req as any, { params: { id: 'test-id' } });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.subreddit).toBeDefined();
    expect(data.subreddit.id).toBe('test-id');
  });

  it('returns 404 for invalid id', async () => {
    const req = {};
    const response: any = await GET(req as any, { params: { id: 'not-found' } });
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Subreddit not found');
  });
}); 