import { POST } from '../route';

describe('POST /api/subreddits/create', () => {
  it('creates a subreddit with valid input', async () => {
    const req = {
      json: async () => ({
        name: 'testsubreddit',
        description: 'A test subreddit',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.subreddit).toBeDefined();
    expect(data.subreddit.name).toBe('testsubreddit');
    expect(data.subreddit.description).toBe('A test subreddit');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ name: '', description: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid subreddit name', async () => {
    const req = {
      json: async () => ({ name: '!!invalid!!', description: 'desc' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });

  it('returns 400 for too long description', async () => {
    const req = {
      json: async () => ({ name: 'testsubreddit', description: 'a'.repeat(600) }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });
}); 