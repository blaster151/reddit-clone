import { useState } from 'react';

interface Subreddit {
  id: string;
  name: string;
  description: string;
}

interface SubredditSidebarProps {
  subreddits: Subreddit[];
  onCreateSubreddit?: () => void;
}

export function SubredditSidebar({ subreddits, onCreateSubreddit }: SubredditSidebarProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Communities</h2>
      <ul className="space-y-2">
        {subreddits.length === 0 ? (
          <li className="text-gray-400">No subreddits yet.</li>
        ) : (
          subreddits.map((sub) => (
            <li
              key={sub.id}
              className={`cursor-pointer p-2 rounded ${selected === sub.id ? 'bg-orange-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelected(sub.id)}
            >
              <div className="font-semibold">r/{sub.name}</div>
              <div className="text-xs text-gray-500">{sub.description}</div>
            </li>
          ))
        )}
      </ul>
      <button
        className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
        onClick={onCreateSubreddit}
      >
        Create Community
      </button>
    </aside>
  );
} 