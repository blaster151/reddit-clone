import { GET } from '../route';

describe('GET /api/comments', () => {
  it('returns paginated comments (default page 1, pageSize 10)', async () => {
    const req = { url: 'http://localhost/api/comments' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(Array.isArray(data.comments)).toBe(true);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(10);
    expect(data.total).toBeGreaterThan(0);
  });

  it('returns paginated comments (page 1, pageSize 1)', async () => {
    const req = { url: 'http://localhost/api/comments?page=1&pageSize=1' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(data.comments.length).toBe(1);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(1);
    expect(data.totalPages).toBeGreaterThan(0);
  });

  it('returns filtered comments by postId', async () => {
    const req = { url: 'http://localhost/api/comments?postId=1' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(data.comments.every((c: any) => c.postId === '1')).toBe(true);
  });

  it('returns empty array for out-of-range page', async () => {
    const req = { url: 'http://localhost/api/comments?page=100&pageSize=10' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(data.comments.length).toBe(0);
  });
});

describe('GET /api/comments (hierarchical)', () => {
  it('returns top-level comments for a post', async () => {
    const req = { url: 'http://localhost/api/comments?postId=1' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(Array.isArray(data.comments)).toBe(true);
    expect(data.comments.every((c: any) => c.parentCommentId === null)).toBe(true);
  });

  it('returns direct replies for a comment', async () => {
    const req = { url: 'http://localhost/api/comments?postId=1&parentId=c1' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(data.comments.every((c: any) => c.parentCommentId === 'c1')).toBe(true);
  });

  it('includes replyCount and hasMoreReplies', async () => {
    const req = { url: 'http://localhost/api/comments?postId=1' };
    const response: any = await GET(req as any);
    const data = await response.json();
    expect(data.comments[0]).toHaveProperty('replyCount');
    expect(data.comments[0]).toHaveProperty('hasMoreReplies');
  });

  it('supports cursor-based pagination for replies', async () => {
    const req1 = { url: 'http://localhost/api/comments?postId=1&parentId=c1&limit=1' };
    const response1: any = await GET(req1 as any);
    const data1 = await response1.json();
    expect(data1.comments.length).toBe(1);
    expect(data1.nextCursor).toBeTruthy();
    const req2 = { url: `http://localhost/api/comments?postId=1&parentId=c1&limit=1&cursor=${data1.nextCursor}` };
    const response2: any = await GET(req2 as any);
    const data2 = await response2.json();
    expect(data2.comments.length).toBe(1);
  });
}); 