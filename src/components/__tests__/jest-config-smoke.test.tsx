import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useState } from 'react';

function DemoComponent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>Inc</button>
    </div>
  );
}

describe('Jest config smoke test', () => {
  it('renders and updates state', () => {
    render(<DemoComponent />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    act(() => {
      screen.getByText('Inc').click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
}); 