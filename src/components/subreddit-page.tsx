import { useEffect, useState } from 'react';
import { PostCard } from './post-card';
import { ModeratorPanel } from './moderator-panel';
import { Button } from '@/components/ui/button';
import { Shield, Users, Bell, BellOff } from 'lucide-react';

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
  isRemoved: boolean;
  removedById?: string;
  removedAt?: Date;
  removalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SubredditPageProps {
  subredditId: string;
  fetchSubreddit: (id: string) => Promise<Subreddit>;
  fetchPosts: (subredditId: string) => Promise<Post[]>;
  isModerator?: boolean;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  onUnsubscribe?: () => void;
  onRemovePost?: (postId: string, reason: string) => void;
  onBanUser?: (userId: string, reason: string, isPermanent: boolean) => void;
  onMuteUser?: (userId: string, reason: string, isPermanent: boolean) => void;
}

export function SubredditPage({ 
  subredditId, 
  fetchSubreddit, 
  fetchPosts, 
  isModerator = false,
  isSubscribed = false,
  onSubscribe,
  onUnsubscribe,
  onRemovePost,
  onBanUser,
  onMuteUser
}: SubredditPageProps) {
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
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">r/{subreddit.name}</h1>
                <div className="text-gray-600 mb-2">{subreddit.description}</div>
              </div>
              <div className="flex items-center gap-2">
                {isModerator && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Moderator</span>
                  </div>
                )}
                {onSubscribe && onUnsubscribe && (
                  <Button
                    onClick={isSubscribed ? onUnsubscribe : onSubscribe}
                    variant={isSubscribed ? "outline" : "default"}
                    size="sm"
                  >
                    {isSubscribed ? (
                      <>
                        <BellOff className="w-4 h-4 mr-2" />
                        Unsubscribe
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div>
            {posts.length === 0 ? (
              <div className="text-gray-400">No posts in this subreddit yet.</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    isModerator={isModerator}
                    onRemove={onRemovePost}
                    onBanUser={onBanUser}
                    onMuteUser={onMuteUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {isModerator && (
            <div className="mb-6">
              <ModeratorPanel
                subredditId={subredditId}
                moderators={[]} // TODO: Pass actual moderators
                bannedUsers={[]} // TODO: Pass actual banned users
                mutedUsers={[]} // TODO: Pass actual muted users
                onAddModerator={(userId) => console.log('Add moderator:', userId)}
                onRemoveModerator={(userId) => console.log('Remove moderator:', userId)}
                onUnbanUser={(banId) => console.log('Unban user:', banId)}
                onUnmuteUser={(muteId) => console.log('Unmute user:', muteId)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 