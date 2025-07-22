import { render, screen } from '@testing-library/react';
import { CommentThread } from '../comment-thread';

describe('CommentThread', () => {
  const postId = 'post1';
  const baseComment = {
    id: 'c1',
    content: 'First comment',
    authorId: 'user1',
    postId,
    upvotes: 2,
    downvotes: 0,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };

  it('renders loading state', () => {
    render(
      <CommentThread
        postId={postId}
        fetchComments={() => new Promise(() => {})}
      />
    );
    expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const fetchComments = jest.fn().mockRejectedValue(new Error('fail'));
    render(<CommentThread postId={postId} fetchComments={fetchComments} />);
    // Wait for error to appear
    await screen.findByText(/failed to load comments/i);
  });

  it('renders empty state', async () => {
    const fetchComments = jest.fn().mockResolvedValue([]);
    render(<CommentThread postId={postId} fetchComments={fetchComments} />);
    await screen.findByText(/no comments yet/i);
  });

  it('renders a flat list of comments', async () => {
    const fetchComments = jest.fn().mockResolvedValue([
      { ...baseComment, id: 'c1', content: 'Comment 1' },
      { ...baseComment, id: 'c2', content: 'Comment 2' },
    ]);
    render(<CommentThread postId={postId} fetchComments={fetchComments} />);
    await screen.findByText('Comment 1');
    await screen.findByText('Comment 2');
  });

  it('renders nested comments', async () => {
    const comments = [
      { ...baseComment, id: 'c1', content: 'Parent', parentCommentId: undefined },
      { ...baseComment, id: 'c2', content: 'Child', parentCommentId: 'c1' },
      { ...baseComment, id: 'c3', content: 'Grandchild', parentCommentId: 'c2' },
    ];
    const fetchComments = jest.fn().mockResolvedValue(comments);
    render(<CommentThread postId={postId} fetchComments={fetchComments} />);
    await screen.findByText('Parent');
    await screen.findByText('Child');
    await screen.findByText('Grandchild');
  });
}); 