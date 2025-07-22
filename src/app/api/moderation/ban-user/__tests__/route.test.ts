import { POST } from '../route';

describe('POST /api/moderation/ban-user', () => {
  it('bans a user with valid input', async () => {
    const req = {
      json: async () => ({ userId: 'user-1', moderatorId: 'mod-1', reason: 'Abuse' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.userId).toBe('user-1');
    expect(data.moderatorId).toBe('mod-1');
    expect(data.reason).toBe('Abuse');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ userId: '', moderatorId: '', reason: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for short reason', async () => {
    const req = {
      json: async () => ({ userId: 'user-1', moderatorId: 'mod-1', reason: 'a' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });
}); 