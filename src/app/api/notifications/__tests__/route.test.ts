import { GET } from '../route';
import { POST } from '../mark-read/route';

describe('GET /api/notifications', () => {
  it('returns notifications for valid user', async () => {
    const req = { headers: { get: (key: string) => (key === 'x-user-id' ? 'user-1' : undefined) } };
    const response: any = await GET(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.notifications)).toBe(true);
    expect(data.notifications.length).toBeGreaterThan(0);
  });

  it('returns empty notifications for unknown user', async () => {
    const req = { headers: { get: () => 'unknown' } };
    const response: any = await GET(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.notifications)).toBe(true);
    expect(data.notifications.length).toBe(0);
  });
});

describe('POST /api/notifications/mark-read', () => {
  it('marks a notification as read with valid input', async () => {
    const req = {
      json: async () => ({ notificationId: 'notif-1', userId: 'user-1' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.notificationId).toBe('notif-1');
    expect(data.userId).toBe('user-1');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({ notificationId: '', userId: '' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });
}); 