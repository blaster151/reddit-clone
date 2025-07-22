import { POST } from '../route';

const mockRequest = (body: any) => {
  return {
    json: async () => body,
  } as any;
};

describe('POST /api/posts/create', () => {
  it('creates a post and returns it', async () => {
    const req = mockRequest({
      title: 'Test Title',
      content: 'Test Content',
      authorId: 'user1',
      subredditId: 'sub1',
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.post.title).toBe('Test Title');
    expect(data.post.content).toBe('Test Content');
    expect(data.post.authorId).toBe('user1');
    expect(data.post.subredditId).toBe('sub1');
    expect(data.post.id).toBeDefined();
    expect(data.post.createdAt).toBeDefined();
    expect(data.post.updatedAt).toBeDefined();
    expect(data.post.upvotes).toBe(0);
    expect(data.post.downvotes).toBe(0);
  });
}); 