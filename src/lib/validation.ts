import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  karma: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const subredditSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(21).regex(/^[a-zA-Z0-9_]+$/),
  description: z.string().max(500),
  creatorId: z.string().uuid(),
  subscriberCount: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(40000),
  authorId: z.string().uuid(),
  subredditId: z.string().uuid(),
  upvotes: z.number().int().min(0),
  downvotes: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const commentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(10000),
  authorId: z.string().uuid(),
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional(),
  upvotes: z.number().int().min(0),
  downvotes: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const voteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  targetId: z.string().uuid(),
  targetType: z.enum(['post', 'comment']),
  voteType: z.enum(['upvote', 'downvote']),
  createdAt: z.date(),
});

// Form schemas for user input
export const createUserSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export const createSubredditSchema = z.object({
  name: z.string().min(3).max(21).regex(/^[a-zA-Z0-9_]+$/),
  description: z.string().max(500),
});

export const createPostSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(40000),
  subredditId: z.string().uuid(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional(),
});

export const voteSchemaInput = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['post', 'comment']),
  voteType: z.enum(['upvote', 'downvote']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateSubredditInput = z.infer<typeof createSubredditSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type VoteInput = z.infer<typeof voteSchemaInput>; 