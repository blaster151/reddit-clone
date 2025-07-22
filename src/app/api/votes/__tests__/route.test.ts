import { POST } from '../route';

describe('POST /api/votes', () => {
  it('creates a vote for a post with valid input', async () => {
    const req = {
      json: async () => ({
        userId: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
        targetId: 'post-12345678-1234-1234-1234-123456789012',
        targetType: 'post',
        voteType: 'upvote',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.vote).toBeDefined();
    expect(data.vote.userId).toBe('b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3');
    expect(data.vote.targetType).toBe('post');
    expect(data.vote.voteType).toBe('upvote');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({
        userId: '',
        targetId: '',
        targetType: '',
        voteType: '',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid UUIDs', async () => {
    const req = {
      json: async () => ({
        userId: 'not-a-uuid',
        targetId: 'not-a-uuid',
        targetType: 'post',
        voteType: 'upvote',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid enums', async () => {
    const req = {
      json: async () => ({
        userId: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
        targetId: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
        targetType: 'invalid',
        voteType: 'invalid',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });
}); 