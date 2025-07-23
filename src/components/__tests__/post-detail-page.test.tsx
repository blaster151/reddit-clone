import { render, screen } from '@testing-library/react';
import { PostDetailPage } from '../post-detail-page';

describe('PostDetailPage', () => {
  const post = {
    id: 'p1',
    title: 'Test Post',
    content: 'Full post content',
    authorId: 'user1',
    subredditId: 'sub1',
    upvotes: 10,
    downvotes: 2,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };
  const fetchComments = jest.fn().mockResolvedValue([]);

  it('renders loading state', () => {
    render(
      <PostDetailPage
        postId="p1"
        fetchPost={() => new Promise(() => {})}
        fetchComments={fetchComments}
      />
    );
    expect(screen.getByText(/loading post/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const fetchPost = jest.fn().mockRejectedValue(new Error('fail'));
    render(
      <PostDetailPage
        postId="p1"
        fetchPost={fetchPost}
        fetchComments={fetchComments}
      />
    );
    await screen.findByText(/failed to load post/i);
  });

  it('renders not found state', async () => {
    const fetchPost = jest.fn().mockResolvedValue(null);
    render(
      <PostDetailPage
        postId="p1"
        fetchPost={fetchPost}
        fetchComments={fetchComments}
      />
    );
    await screen.findByText(/post not found/i);
  });

  it('renders post and comment thread', async () => {
    const fetchPost = jest.fn().mockResolvedValue(post);
    render(
      <PostDetailPage
        postId="p1"
        fetchPost={fetchPost}
        fetchComments={fetchComments}
      />
    );
    
    await screen.findByText('Test Post');
    expect(screen.getByText('Full post content')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /comments/i })).toBeInTheDocument();
  });
}); 