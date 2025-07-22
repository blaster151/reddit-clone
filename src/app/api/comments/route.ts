import { NextRequest, NextResponse } from 'next/server';

// Mock comment data for demonstration
const allComments = [
  { id: 'c1', content: 'Top-level 1', authorId: 'u1', postId: '1', parentCommentId: null, upvotes: 2, downvotes: 0, createdAt: '', updatedAt: '' },
  { id: 'c2', content: 'Reply to 1', authorId: 'u2', postId: '1', parentCommentId: 'c1', upvotes: 1, downvotes: 0, createdAt: '', updatedAt: '' },
  { id: 'c3', content: 'Reply to 1 (2)', authorId: 'u3', postId: '1', parentCommentId: 'c1', upvotes: 0, downvotes: 0, createdAt: '', updatedAt: '' },
  { id: 'c4', content: 'Reply to c2', authorId: 'u4', postId: '1', parentCommentId: 'c2', upvotes: 0, downvotes: 0, createdAt: '', updatedAt: '' },
  { id: 'c5', content: 'Top-level 2', authorId: 'u5', postId: '1', parentCommentId: null, upvotes: 0, downvotes: 0, createdAt: '', updatedAt: '' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');
  const parentId = searchParams.get('parentId');
  const limit = parseInt(searchParams.get('limit') || '2', 10);
  const cursor = searchParams.get('cursor');

  // Filter by postId and parentId
  let comments = allComments.filter(
    (c) => c.postId === postId && (parentId ? c.parentCommentId === parentId : c.parentCommentId === null)
  );

  // Cursor-based pagination (simple: use index of id)
  let start = 0;
  if (cursor) {
    const idx = comments.findIndex((c) => c.id === cursor);
    if (idx !== -1) start = idx + 1;
  }
  const paginated = comments.slice(start, start + limit);
  const nextCursor = paginated.length === limit ? paginated[paginated.length - 1].id : null;

  // For each comment, count direct replies
  const withMeta = paginated.map((c) => {
    const replyCount = allComments.filter((r) => r.parentCommentId === c.id).length;
    const hasMoreReplies = replyCount > 2; // For demo, assume limit=2
    return {
      ...c,
      replyCount,
      hasMoreReplies,
    };
  });

  return NextResponse.json({
    comments: withMeta,
    nextCursor,
    total: comments.length,
  });
} 