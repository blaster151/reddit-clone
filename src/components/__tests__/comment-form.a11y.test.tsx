import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CommentForm } from '../comment-form';

expect.extend(toHaveNoViolations);

describe('CommentForm accessibility', () => {
  it('has no accessibility violations (default)', async () => {
    const { container } = render(<CommentForm postId="post-1" onSubmit={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 