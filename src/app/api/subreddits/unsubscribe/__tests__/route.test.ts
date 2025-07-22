import { POST } from '../route';

describe('POST /api/subreddits/unsubscribe', () => {
  it('unsubscribes a user from a subreddit with valid input', async () => {
    const req = {
      json: async () => ({ subredditId: 'sub-123', userId: 'user-123' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.subredditId).toBe('sub-123');
    expect(data.userId).toBe('user-123');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ subredditId: '', userId: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });
}); 