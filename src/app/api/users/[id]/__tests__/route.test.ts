import { GET } from '../route';

describe('GET /api/users/[id]', () => {
  it('fetches a user profile with valid id', async () => {
    const req = {};
    const response: any = await GET(req as any, { params: { id: 'user-123' } });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.id).toBe('user-123');
  });

  it('returns 404 for invalid id', async () => {
    const req = {};
    const response: any = await GET(req as any, { params: { id: 'not-found' } });
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('User not found');
  });
}); 