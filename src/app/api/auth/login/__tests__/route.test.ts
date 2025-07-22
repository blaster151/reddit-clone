import { POST } from '../route';

describe('POST /api/auth/login', () => {
  it('logs in a user with valid input', async () => {
    const req = {
      json: async () => ({
        email: 'test@example.com',
        password: 'password123',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('test@example.com');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ email: '', password: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const req = {
      json: async () => ({ email: 'not-an-email', password: 'password123' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });

  it('returns 400 for short password', async () => {
    const req = {
      json: async () => ({ email: 'test@example.com', password: 'short' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });
}); 