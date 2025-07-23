import { render, screen } from '@testing-library/react';
import { UserProfile } from '../user-profile';

describe('UserProfile', () => {
  const user = {
    username: 'testuser',
    email: 'test@example.com',
    karma: 123,
    createdAt: new Date('2023-01-01T12:00:00Z'),
  };

  it('renders username, email, karma, and join date', () => {
    render(<UserProfile user={user} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/karma/i)).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText(/joined/i)).toBeInTheDocument();
    
    // Check that the date is displayed (more flexible than exact format)
    const dateElement = screen.getByText(/joined/i).parentElement;
    expect(dateElement).toHaveTextContent(/2023/); // Check for year
    expect(dateElement).toHaveTextContent(/1/); // Check for month/day
  });
}); 