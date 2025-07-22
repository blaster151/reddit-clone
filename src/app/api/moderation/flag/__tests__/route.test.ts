import { POST } from '../route';

describe('POST /api/moderation/flag', () => {
  it('flags a comment with valid input', async () => {
    const req = {
      json: async () => ({ targetId: 'comment-1', targetType: 'comment', userId: 'user-1', reason: 'Spam' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.targetType).toBe('comment');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ targetId: '', targetType: '', userId: '', reason: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid targetType', async () => {
    const req = {
      json: async () => ({ targetId: 'id', targetType: 'invalid', userId: 'user-1', reason: 'Spam' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });

  it('returns 400 for short reason', async () => {
    const req = {
      json: async () => ({ targetId: 'id', targetType: 'comment', userId: 'user-1', reason: 'a' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });
}); 