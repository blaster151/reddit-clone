import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '../usePosts';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockPosts = [
  { id: '1', title: 'Test Post', content: 'Hello', authorId: 'u1', subredditId: 's1', upvotes: 1, downvotes: 0, isRemoved: false, createdAt: new Date(), updatedAt: new Date() },
];

const server = setupServer(
  http.get('/api/posts', () => {
    return HttpResponse.json({ posts: mockPosts });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usePosts', () => {
  it('fetches posts and updates state', async () => {
    const { result } = renderHook(() => usePosts());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts.length).toBe(1);
    expect(result.current.posts[0].title).toBe('Test Post');
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    server.use(
      http.get('/api/posts', () => {
        return HttpResponse.error();
      }),
    );
    const { result } = renderHook(() => usePosts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.posts.length).toBe(0);
  });
}); 