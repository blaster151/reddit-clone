import { PostCard } from '@/components/post-card';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search-bar';
import { PostFeed } from '@/components/post-feed';
import { Plus } from 'lucide-react';

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-orange-500">reddit</h1>
              <SearchBar 
                placeholder="Search Reddit"
                className="w-80"
                onResultSelect={handleSearchResult}
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            <PostFeed />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* About Community */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About Community</h2>
              <p className="text-gray-600 text-sm mb-4">
                A place for developers to share knowledge, ask questions, and discuss all things programming.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Members</span>
                  <span className="font-medium">1.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Online</span>
                  <span className="font-medium">2.3K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">Jan 1, 2010</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                Join Community
              </Button>
            </div>

            {/* Create Post */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Create a Post</h3>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>

            {/* Community Rules */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Rules</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>1. Be respectful and civil</li>
                <li>2. No spam or self-promotion</li>
                <li>3. Stay on topic</li>
                <li>4. Follow Reddit's content policy</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
