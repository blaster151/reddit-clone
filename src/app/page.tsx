import { PostCard } from '@/components/post-card';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search-bar';
import { PostFeed } from '@/components/post-feed';
import { Plus, Menu } from 'lucide-react';
import { SkipLink } from '@/components/ui/accessibility';
import { NotificationBell } from '@/components/notification-bell';
import { CreateCommunityButton } from '@/components/create-community-button';

// Sample data for demonstration
const samplePosts: Post[] = [
  {
    id: '1',
    title: 'What\'s your favorite programming language and why?',
    content: 'I\'ve been coding for a few years now and I\'m curious to hear what languages other developers prefer. Personally, I love TypeScript for its type safety and JavaScript ecosystem compatibility.',
    authorId: 'user1',
    subredditId: 'programming',
    upvotes: 42,
    downvotes: 3,
    isRemoved: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Just finished building my first full-stack app!',
    content: 'After months of learning, I finally completed my first full-stack application using Next.js, TypeScript, and Tailwind CSS. The feeling of accomplishment is incredible!',
    authorId: 'user2',
    subredditId: 'webdev',
    upvotes: 128,
    downvotes: 1,
    isRemoved: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Tips for staying productive while working from home',
    content: 'I\'ve been working remotely for over a year now and here are some strategies that have helped me stay focused and productive...',
    authorId: 'user3',
    subredditId: 'productivity',
    upvotes: 89,
    downvotes: 7,
    isRemoved: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(),
  },
];

export default function Home() {
  const handleSearchResult = (result: any) => {
    // Handle search result selection
    console.log('Selected search result:', result);
    // In a real app, this would navigate to the post or comment
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Links for Accessibility */}
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="navigation">Skip to navigation</SkipLink>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner" aria-label="Site header">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                aria-label="Open navigation menu"
                aria-expanded="false"
                aria-controls="mobile-menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
              <h1 className="text-xl font-bold text-orange-500">reddit</h1>
            </div>
            <div className="flex items-center gap-2">
              <CreateCommunityButton 
                variant="outline"
                size="sm"
                showText={false}
                className="px-3 py-1.5"
              />
              <Button 
                className="bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-sm"
                aria-label="Create new post"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-orange-500">reddit</h1>
              <SearchBar 
                placeholder="Search Reddit"
                className="w-80"
                onResultSelect={handleSearchResult}
              />
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell 
                showBadge={true}
                maxNotifications={10}
                enableRealtime={true}
                websocketUrl="ws://localhost:3001/notifications"
              />
              <CreateCommunityButton 
                variant="outline"
                size="sm"
                showText={false}
                className="mr-2"
              />
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                aria-label="Create new post"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3 lg:hidden">
            <SearchBar 
              placeholder="Search Reddit"
              className="w-full"
              onResultSelect={handleSearchResult}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-6" role="main" aria-label="Main content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4" role="feed" aria-label="Posts feed">
            <PostFeed />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4" role="complementary" aria-label="Community information">
            {/* About Community */}
            <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="about-community-heading">
              <h2 id="about-community-heading" className="text-lg font-semibold text-gray-900 mb-3">About Community</h2>
              <p className="text-gray-600 text-sm mb-4">
                A place for developers to share knowledge, ask questions, and discuss all things programming.
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Members</dt>
                  <dd className="font-medium">1.2M</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Online</dt>
                  <dd className="font-medium">2.3K</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium">Jan 1, 2010</dd>
                </div>
              </dl>
              <Button 
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
                aria-label="Join the community"
              >
                Join Community
              </Button>
            </section>

            {/* Create Post */}
            <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="create-post-heading">
              <h3 id="create-post-heading" className="text-lg font-semibold text-gray-900 mb-3">Create a Post</h3>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                aria-label="Create a new post"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Create Post
              </Button>
            </section>

            {/* Community Rules */}
            <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="community-rules-heading">
              <h3 id="community-rules-heading" className="text-lg font-semibold text-gray-900 mb-3">Community Rules</h3>
              <ol className="text-sm text-gray-600 space-y-2" role="list">
                <li>1. Be respectful and civil</li>
                <li>2. No spam or self-promotion</li>
                <li>3. Stay on topic</li>
                <li>4. Follow Reddit&apos;s content policy</li>
              </ol>
            </section>
          </aside>
        </div>
      </main>

      {/* Hidden navigation menu for mobile */}
      <nav id="mobile-menu" className="sr-only" aria-label="Mobile navigation menu">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/popular">Popular</a></li>
          <li><a href="/all">All</a></li>
        </ul>
      </nav>
    </div>
  );
}
