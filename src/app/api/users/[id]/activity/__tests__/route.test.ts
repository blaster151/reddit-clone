import { GET } from '../route';

describe('GET /api/users/[id]/activity', () => {
  it('fetches user activity with valid id', async () => {
    const req = {};
    const response: any = await GET(req as any, { params: { id: 'user-123' } });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(Array.isArray(data.comments)).toBe(true);
    expect(Array.isArray(data.votes)).toBe(true);
  });

  it('returns 404 for invalid id', async () => {
    const req = {};
    const response: any = await GET(req as any, { params: { id: 'not-found' } });
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('User not found');
  });
}); 