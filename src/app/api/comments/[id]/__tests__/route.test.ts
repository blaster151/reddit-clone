import { PATCH, DELETE } from '../route';

describe('PATCH /api/comments/[id]', () => {
  it('edits a comment as author', async () => {
    const req = {
      json: async () => ({ content: 'Edited content' }),
      headers: { get: () => 'u1' },
    };
    const response: any = await PATCH(req as any, { params: { id: 'c1' } });
    const data = await response.json();
    expect(data.comment.content).toBe('Edited content');
  });

  it('forbids editing by non-author/non-mod', async () => {
    const req = {
      json: async () => ({ content: 'Nope' }),
      headers: { get: () => 'not-author' },
    };
    const response: any = await PATCH(req as any, { params: { id: 'c1' } });
    expect(response.status).toBe(403);
  });

  it('allows editing by mod', async () => {
    const req = {
      json: async () => ({ content: 'Mod edit' }),
      headers: { get: () => 'mod' },
    };
    const response: any = await PATCH(req as any, { params: { id: 'c1' } });
    const data = await response.json();
    expect(data.comment.content).toBe('Mod edit');
  });

  it('returns 404 for not found', async () => {
    const req = {
      json: async () => ({ content: 'Nope' }),
      headers: { get: () => 'u1' },
    };
    const response: any = await PATCH(req as any, { params: { id: 'notfound' } });
    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/comments/[id]', () => {
  it('soft-deletes a comment as author', async () => {
    const req = { headers: { get: () => 'u1' } };
    const response: any = await DELETE(req as any, { params: { id: 'c1' } });
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('forbids deleting by non-author/non-mod', async () => {
    const req = { headers: { get: () => 'not-author' } };
    const response: any = await DELETE(req as any, { params: { id: 'c2' } });
    expect(response.status).toBe(403);
  });

  it('allows deleting by mod', async () => {
    const req = { headers: { get: () => 'mod' } };
    const response: any = await DELETE(req as any, { params: { id: 'c2' } });
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('returns 404 for not found', async () => {
    const req = { headers: { get: () => 'u1' } };
    const response: any = await DELETE(req as any, { params: { id: 'notfound' } });
    expect(response.status).toBe(404);
  });
}); 