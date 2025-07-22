import { POST } from '../route';

describe('POST /api/moderation/remove-comment', () => {
  it('removes a comment with valid input', async () => {
    const req = {
      json: async () => ({ commentId: 'comment-1', moderatorId: 'mod-1' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.commentId).toBe('comment-1');
    expect(data.moderatorId).toBe('mod-1');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ commentId: '', moderatorId: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });
}); 