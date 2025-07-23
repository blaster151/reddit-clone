export interface User {
  id: string;
  username: string;
  email: string;
  karma: number;
  subscribedSubreddits?: Subreddit[];
  moderatedSubreddits?: Subreddit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subreddit {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  subscribers?: User[];
  moderators?: User[];
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
  isRemoved: boolean;
  removedById?: string;
  removedAt?: Date;
  removalReason?: string;
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
  isRemoved: boolean;
  removedById?: string;
  removedAt?: Date;
  removalReason?: string;
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

export interface Ban {
  id: string;
  userId: string;
  subredditId: string;
  moderatorId: string;
  reason: string;
  expiresAt?: Date;
  isPermanent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mute {
  id: string;
  userId: string;
  subredditId: string;
  moderatorId: string;
  reason: string;
  expiresAt?: Date;
  isPermanent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type VoteType = 'upvote' | 'downvote';
export type VoteTarget = 'post' | 'comment'; 