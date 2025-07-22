import { setupServer } from 'msw/node';
import { rest, RestRequest, ResponseComposition, RestContext } from 'msw';

const server = setupServer(
  rest.get('/api/posts', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(
      ctx.status(200),
      ctx.json({
        posts: [
          { id: '1', title: 'Mocked Post', content: 'Mocked content', authorId: 'u1', subredditId: 's1', upvotes: 1, downvotes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/posts (MSW)', () => {
  it('returns mocked posts from MSW', async () => {
    const response = await fetch('/api/posts');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.posts[0].title).toBe('Mocked Post');
  });
}); 