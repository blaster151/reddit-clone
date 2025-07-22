import { POST } from '../route';

describe('POST /api/search', () => {
  it('returns post search results for valid query', async () => {
    const req = {
      json: async () => ({ query: 'First', type: 'post' }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBeUndefined(); // NextResponse.json returns undefined for status in this mock
    const data = await response.json();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results[0].title).toBe('First Post');
  });

  it('returns comment search results for valid query', async () => {
    const req = {
      json: async () => ({ query: 'Nice', type: 'comment' }),
    };
    const response: any = await POST(req as any);
    const data = await response.json();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results[0].content).toBe('Nice post!');
  });

  it('returns 400 for missing query', async () => {
    const req = {
      json: async () => ({ query: '', type: 'post' }),
    };
    const response: any = await POST(req as any);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });

  it('returns 400 for invalid type', async () => {
    const req = {
      json: async () => ({ query: 'test', type: 'invalid' }),
    };
    const response: any = await POST(req as any);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
  });
}); 