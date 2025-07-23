import { useEffect, useState } from 'react';
import { PostCard } from './post-card';
import { ModeratorPanel } from './moderator-panel';
import { Button } from '@/components/ui/button';
import { Shield, Bell, BellOff } from 'lucide-react';

interface Subreddit {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  memberCount: number;
  onlineCount: number;
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

/**
 * SubredditPage component for displaying a specific subreddit with its posts
 * 
 * This component renders a complete subreddit page with:
 * - Subreddit header with name, description, and metadata
 * - Subscription/unsubscription functionality
 * - Moderator status and tools
 * - List of posts using PostCard components
 * - Loading, error, and empty states
 * - Mobile-responsive design with optimized layout
 * 
 * @param props - Component props including subreddit data and callbacks
 * @returns JSX element representing the subreddit page
 * 
 * @example
 * ```tsx
 * <SubredditPage 
 *   subredditId="programming"
 *   fetchSubreddit={fetchSubredditData}
 *   fetchPosts={fetchSubredditPosts}
 *   isModerator={true}
 *   onSubscribe={() => handleSubscribe()}
 * />
 * ```
 */
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
    const loadData = async () => {
      try {
        setLoading(true);
        const [subredditData, postsData] = await Promise.all([
          fetchSubreddit(subredditId),
          fetchPosts(subredditId)
        ]);
        setSubreddit(subredditData);
        setPosts(postsData);
      } catch (err) {
        setError('Failed to load subreddit');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
    <div className="max-w-6xl mx-auto mt-4 sm:mt-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            {/* Subreddit Header - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">r/{subreddit.name}</h1>
                <div className="text-gray-600 mb-2 text-sm sm:text-base">{subreddit.description}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
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
                    className="text-xs sm:text-sm"
                  >
                    {isSubscribed ? (
                      <>
                        <BellOff className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Unsubscribe</span>
                        <span className="sm:hidden">Unsub</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Subscribe</span>
                        <span className="sm:hidden">Sub</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No posts in this subreddit yet.</div>
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

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Moderator Panel - Mobile Responsive */}
          {isModerator && (
            <div className="mb-6">
              <ModeratorPanel
                moderators={[
                  { id: '1', username: 'mod1', email: 'mod1@example.com' },
                  { id: '2', username: 'mod2', email: 'mod2@example.com' }
                ]}
                bannedUsers={[
                  { id: '1', username: 'banned1', reason: 'Spam', isPermanent: true, createdAt: new Date() }
                ]}
                mutedUsers={[
                  { id: '1', username: 'muted1', reason: 'Harassment', isPermanent: false, createdAt: new Date() }
                ]}
                onAddModerator={(userId) => console.log('Add moderator:', userId)}
                onRemoveModerator={(userId) => console.log('Remove moderator:', userId)}
                onUnbanUser={(banId) => console.log('Unban user:', banId)}
                onUnmuteUser={(muteId) => console.log('Unmute user:', muteId)}
              />
            </div>
          )}

          {/* Subreddit Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About r/{subreddit.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{subreddit.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Members</span>
                <span className="font-medium">{subreddit.memberCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Online</span>
                <span className="font-medium">{subreddit.onlineCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">{subreddit.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 