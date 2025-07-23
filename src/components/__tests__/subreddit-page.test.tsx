import { render, screen } from '@testing-library/react';
import { SubredditPage } from '../subreddit-page';

describe('SubredditPage', () => {
  const subreddit = {
    id: '1',
    name: 'reactjs',
    description: 'React community',
    memberCount: 1000,
    onlineCount: 50,
    createdAt: new Date('2020-01-01T00:00:00Z'),
  };
  const posts = [
    {
      id: 'p1',
      title: 'First Post',
      content: 'Hello world',
      authorId: 'user1',
      subredditId: '1',
      upvotes: 10,
      downvotes: 2,
      score: 8,
      isRemoved: false,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  it('renders loading state', () => {
    render(
      <SubredditPage
        subredditId="1"
        fetchSubreddit={() => new Promise(() => {})}
        fetchPosts={() => new Promise(() => {})}
      />
    );
    expect(screen.getByText(/loading subreddit/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const fetchSubreddit = jest.fn().mockRejectedValue(new Error('fail'));
    const fetchPosts = jest.fn().mockRejectedValue(new Error('fail'));
    render(
      <SubredditPage
        subredditId="1"
        fetchSubreddit={fetchSubreddit}
        fetchPosts={fetchPosts}
      />
    );
    await screen.findByText(/failed to load subreddit/i);
  });

  it('renders not found state', async () => {
    const fetchSubreddit = jest.fn().mockResolvedValue(null);
    const fetchPosts = jest.fn().mockResolvedValue([]);
    render(
      <SubredditPage
        subredditId="1"
        fetchSubreddit={fetchSubreddit}
        fetchPosts={fetchPosts}
      />
    );
    await screen.findByText(/subreddit not found/i);
  });

  it('renders empty state when no posts', async () => {
    const fetchSubreddit = jest.fn().mockResolvedValue(subreddit);
    const fetchPosts = jest.fn().mockResolvedValue([]);
    render(
      <SubredditPage
        subredditId="1"
        fetchSubreddit={fetchSubreddit}
        fetchPosts={fetchPosts}
      />
    );
    await screen.findByText('r/reactjs');
    expect(screen.getByText(/no posts in this subreddit yet/i)).toBeInTheDocument();
  });

  it('renders a list of posts', async () => {
    const fetchSubreddit = jest.fn().mockResolvedValue(subreddit);
    const fetchPosts = jest.fn().mockResolvedValue(posts);
    render(
      <SubredditPage
        subredditId="1"
        fetchSubreddit={fetchSubreddit}
        fetchPosts={fetchPosts}
      />
    );
    await screen.findByText('r/reactjs');
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
}); 