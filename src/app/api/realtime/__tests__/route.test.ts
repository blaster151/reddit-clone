import { GET } from '../route';

describe('GET /api/realtime (SSE)', () => {
  it('streams comment and vote events in SSE format', async () => {
    const req = {};
    const response: any = await GET(req as any);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    // Simulate reading the stream
    const reader = response.body.getReader();
    let received = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      received += new TextDecoder().decode(value);
    }
    expect(received).toContain('event: comment');
    expect(received).toContain('event: vote');
    expect(received).toContain('data:');
    expect(received).toContain('New comment');
    expect(received).toContain('voteType');
  });
}); 