import { render, screen, fireEvent } from '@testing-library/react';
import { SubredditSidebar } from '../subreddit-sidebar';

describe('SubredditSidebar', () => {
  const subreddits = [
    { id: '1', name: 'reactjs', description: 'React community' },
    { id: '2', name: 'webdev', description: 'Web development' },
  ];

  it('renders empty state', () => {
    render(<SubredditSidebar subreddits={[]} />);
    expect(screen.getByText(/no subreddits yet/i)).toBeInTheDocument();
  });

  it('renders a list of subreddits', () => {
    render(<SubredditSidebar subreddits={subreddits} />);
    expect(screen.getByText('r/reactjs')).toBeInTheDocument();
    expect(screen.getByText('r/webdev')).toBeInTheDocument();
    expect(screen.getByText('React community')).toBeInTheDocument();
    expect(screen.getByText('Web development')).toBeInTheDocument();
  });

  it('calls onCreateSubreddit when button is clicked', () => {
    const onCreate = jest.fn();
    render(<SubredditSidebar subreddits={subreddits} onCreateSubreddit={onCreate} />);
    const button = screen.getByRole('button', { name: /create community/i });
    fireEvent.click(button);
    expect(onCreate).toHaveBeenCalled();
  });

  it('highlights selected subreddit when clicked', () => {
    render(<SubredditSidebar subreddits={subreddits} />);
    const reactjs = screen.getByText('r/reactjs');
    fireEvent.click(reactjs);
    // Should have orange background (class check)
    expect(reactjs.parentElement).toHaveClass('bg-orange-100');
  });
}); 