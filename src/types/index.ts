export interface User {
  id: string;
  username: string;
  email: string;
  karma: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subreddit {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  subredditId: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
}

export type VoteType = 'upvote' | 'downvote';
export type VoteTarget = 'post' | 'comment'; 