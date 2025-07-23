import { render, screen } from '@testing-library/react';
import { useState } from 'react';

describe('Jest config smoke test', () => {
  function DemoComponent() {
    const [count, setCount] = useState(0);
    return (
      <div>
        <span data-testid="count">{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>Inc</button>
      </div>
    );
  }

  it('renders and updates state', () => {
    render(<DemoComponent />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    screen.getByText('Inc').click();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
}); 