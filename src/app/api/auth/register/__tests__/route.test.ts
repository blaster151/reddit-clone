import { POST } from '../route';

describe('POST /api/auth/register', () => {
  it('registers a user with valid input', async () => {
    const req = {
      json: async () => ({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe('testuser');
    expect(data.user.email).toBe('test@example.com');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ username: '', email: '', password: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const req = {
      json: async () => ({ username: 'testuser', email: 'not-an-email', password: 'password123' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });

  it('returns 400 for short password', async () => {
    const req = {
      json: async () => ({ username: 'testuser', email: 'test@example.com', password: 'short' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });
}); 