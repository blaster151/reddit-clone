import { useEffect, useState } from 'react';
import { PostCard } from './post-card';

interface Subreddit {
  id: string;
  name: string;
  description: string;
}

interface Post {
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

interface SubredditPageProps {
  subredditId: string;
  fetchSubreddit: (id: string) => Promise<Subreddit>;
  fetchPosts: (subredditId: string) => Promise<Post[]>;
}

export function SubredditPage({ subredditId, fetchSubreddit, fetchPosts }: SubredditPageProps) {
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchSubreddit(subredditId), fetchPosts(subredditId)])
      .then(([sub, posts]) => {
        setSubreddit(sub);
        setPosts(posts);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load subreddit');
        setLoading(false);
      });
  }, [subredditId, fetchSubreddit, fetchPosts]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading subreddit...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!subreddit) {
    return <div className="p-8 text-center text-gray-400">Subreddit not found.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">r/{subreddit.name}</h1>
        <div className="text-gray-600 mb-2">{subreddit.description}</div>
      </div>
      <div>
        {posts.length === 0 ? (
          <div className="text-gray-400">No posts in this subreddit yet.</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 