import { POST } from '../route';

describe('POST /api/comments/create', () => {
  it('creates a comment with valid input', async () => {
    const req = {
      json: async () => ({
        content: 'Integration test comment',
        authorId: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
        postId: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
        parentCommentId: null,
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.comment).toBeDefined();
    expect(data.comment.content).toBe('Integration test comment');
    expect(data.comment.authorId).toBe('b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3');
    expect(data.comment.postId).toBe('b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3');
    expect(data.comment.parentCommentId).toBeNull();
    expect(data.comment.upvotes).toBe(0);
    expect(data.comment.downvotes).toBe(0);
    expect(typeof data.comment.id).toBe('string');
    expect(typeof data.comment.createdAt).toBe('string');
    expect(typeof data.comment.updatedAt).toBe('string');
  });

  it('returns 400 for missing required fields', async () => {
    const req = {
      json: async () => ({
        content: '',
        authorId: '',
        postId: '',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 for invalid UUIDs', async () => {
    const req = {
      json: async () => ({
        content: 'Test',
        authorId: 'not-a-uuid',
        postId: 'not-a-uuid',
      }),
    };
    const response: any = await POST(req as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(Array.isArray(data.details)).toBe(true);
  });
}); 