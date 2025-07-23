import { POST } from '../route';

const mockRequest = (body: any) => {
  return {
    json: async () => body,
  } as any;
};

describe('POST /api/posts Route Validation', () => {
  it('returns 400 for missing title', async () => {
    const request = mockRequest({
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
  });

  it('returns 400 for missing content', async () => {
    const request = mockRequest({
      title: 'Test Title',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('content');
  });

  it('returns 400 for missing authorId', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('authorId');
  });

  it('returns 400 for missing subredditId', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      authorId: 'user1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('subredditId');
  });

  it('returns 400 for empty title', async () => {
    const request = mockRequest({
      title: '',
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
  });

  it('returns 400 for title with only whitespace', async () => {
    const request = mockRequest({
      title: '   \n\t   ',
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
  });

  it('returns 400 for title exceeding length limit', async () => {
    const longTitle = 'A'.repeat(301); // Exceeds 300 character limit
    const request = mockRequest({
      title: longTitle,
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
  });

  it('returns 400 for empty content', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: '',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('content');
  });

  it('returns 400 for content with only whitespace', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: '   \n\t   ',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('content');
  });

  it('returns 400 for invalid authorId format', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      authorId: '', // Empty string
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('authorId');
  });

  it('returns 400 for invalid subredditId format', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      authorId: 'user1',
      subredditId: '', // Empty string
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('subredditId');
  });

  it('returns 400 for malformed JSON', async () => {
    const request = {
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid request body');
  });

  it('returns 400 for null body', async () => {
    const request = mockRequest(null);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Request body is required');
  });

  it('returns 400 for undefined body', async () => {
    const request = mockRequest(undefined);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Request body is required');
  });

  it('returns 400 for non-object body', async () => {
    const request = mockRequest('not an object');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Request body must be an object');
  });

  it('returns 400 for title with HTML tags', async () => {
    const request = mockRequest({
      title: '<script>alert("xss")</script>Test Title',
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
  });

  it('returns 400 for content with excessive length', async () => {
    const longContent = 'A'.repeat(10001); // Exceeds 10000 character limit
    const request = mockRequest({
      title: 'Test Title',
      content: longContent,
      authorId: 'user1',
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('content');
  });

  it('returns 400 for invalid authorId with special characters', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      authorId: 'user@#$%', // Invalid characters
      subredditId: 'sub1',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('authorId');
  });

  it('returns 400 for invalid subredditId with spaces', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub reddit', // Contains space
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('subredditId');
  });

  it('handles multiple validation errors', async () => {
    const request = mockRequest({
      title: '', // Empty title
      content: '', // Empty content
      authorId: '', // Empty authorId
      subredditId: '', // Empty subredditId
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
    expect(data.error).toContain('content');
    expect(data.error).toContain('authorId');
    expect(data.error).toContain('subredditId');
  });

  it('accepts valid data with special characters', async () => {
    const request = mockRequest({
      title: 'Title with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/"\'\\`~',
      content: 'Content with unicode: 🚀🌟🎉 and special chars: ñáéíóú',
      authorId: 'user_123',
      subredditId: 'subreddit_123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.post).toBeDefined();
    expect(data.post.title).toContain('!@#$%^&*()');
    expect(data.post.content).toContain('🚀🌟🎉');
  });

  it('handles request with extra fields gracefully', async () => {
    const request = mockRequest({
      title: 'Test Title',
      content: 'Test content',
      authorId: 'user1',
      subredditId: 'sub1',
      extraField: 'should be ignored',
      anotherField: 123,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.post).toBeDefined();
    expect(data.post.title).toBe('Test Title');
    expect(data.post.content).toBe('Test content');
  });
}); 