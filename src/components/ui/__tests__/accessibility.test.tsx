import { render, screen } from '@testing-library/react';
import { VisuallyHidden, LiveRegion, SkipLink, FocusTrap } from '../accessibility';
import { generateAccessibleLabel, generateDescribedBy, generateLabelledBy } from '../accessibility';

describe('Accessibility Components', () => {
  describe('VisuallyHidden', () => {
    it('renders content that is hidden visually but accessible to screen readers', () => {
      render(
        <button>
          <span>Submit</span>
          <VisuallyHidden>Submit the form data</VisuallyHidden>
        </button>
      );

      const hiddenContent = screen.getByText('Submit the form data');
      expect(hiddenContent).toBeInTheDocument();
      expect(hiddenContent).toHaveClass('sr-only');
    });

    it('applies custom className', () => {
      render(
        <VisuallyHidden className="custom-class">
          Hidden content
        </VisuallyHidden>
      );

      const element = screen.getByText('Hidden content');
      expect(element).toHaveClass('sr-only', 'custom-class');
    });

    it('has proper CSS styles for screen reader accessibility', () => {
      render(<VisuallyHidden>Test content</VisuallyHidden>);

      const element = screen.getByText('Test content');
      const styles = window.getComputedStyle(element);

      expect(styles.position).toBe('absolute');
      expect(styles.width).toBe('1px');
      expect(styles.height).toBe('1px');
      expect(styles.overflow).toBe('hidden');
    });
  });

  describe('LiveRegion', () => {
    it('renders with default politeness level', () => {
      render(<LiveRegion>Status update</LiveRegion>);

      const liveRegion = screen.getByText('Status update');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('renders with custom politeness level', () => {
      render(<LiveRegion politeness="assertive">Important update</LiveRegion>);

      const liveRegion = screen.getByText('Important update');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('applies custom className', () => {
      render(
        <LiveRegion className="custom-live-region">
          Update content
        </LiveRegion>
      );

      const element = screen.getByText('Update content');
      expect(element).toHaveClass('sr-only', 'custom-live-region');
    });

    it('has proper CSS styles for screen reader accessibility', () => {
      render(<LiveRegion>Test content</LiveRegion>);

      const element = screen.getByText('Test content');
      const styles = window.getComputedStyle(element);

      expect(styles.position).toBe('absolute');
      expect(styles.width).toBe('1px');
      expect(styles.height).toBe('1px');
      expect(styles.overflow).toBe('hidden');
    });
  });

  describe('SkipLink', () => {
    it('renders with correct href and text', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('applies custom className', () => {
      render(
        <SkipLink targetId="main-content" className="custom-skip-link">
          Skip to main content
        </SkipLink>
      );

      const element = screen.getByText('Skip to main content');
      expect(element).toHaveClass('custom-skip-link');
    });

    it('has proper focus styles', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('sr-only');
      expect(skipLink).toHaveClass('focus:not-sr-only');
      expect(skipLink).toHaveClass('focus:absolute');
      expect(skipLink).toHaveClass('focus:top-4');
      expect(skipLink).toHaveClass('focus:left-4');
      expect(skipLink).toHaveClass('focus:z-50');
      expect(skipLink).toHaveClass('focus:px-4');
      expect(skipLink).toHaveClass('focus:py-2');
      expect(skipLink).toHaveClass('focus:bg-orange-500');
      expect(skipLink).toHaveClass('focus:text-white');
      expect(skipLink).toHaveClass('focus:rounded');
      expect(skipLink).toHaveClass('focus:outline-none');
      expect(skipLink).toHaveClass('focus:ring-2');
      expect(skipLink).toHaveClass('focus:ring-orange-600');
    });
  });

  describe('FocusTrap', () => {
    it('renders children when active', () => {
      render(
        <FocusTrap active={true}>
          <button>First button</button>
          <button>Second button</button>
        </FocusTrap>
      );

      expect(screen.getByText('First button')).toBeInTheDocument();
      expect(screen.getByText('Second button')).toBeInTheDocument();
    });

    it('renders children when not active', () => {
      render(
        <FocusTrap active={false}>
          <button>Test button</button>
        </FocusTrap>
      );

      expect(screen.getByText('Test button')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <FocusTrap active={true} className="custom-focus-trap">
          <button>Test button</button>
        </FocusTrap>
      );

      const container = screen.getByText('Test button').parentElement;
      expect(container).toHaveClass('custom-focus-trap');
    });

    it('has a ref for focus management', () => {
      render(
        <FocusTrap active={true}>
          <button>Test button</button>
        </FocusTrap>
      );

      const container = screen.getByText('Test button').parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    describe('generateAccessibleLabel', () => {
      it('generates basic label without context', () => {
        const label = generateAccessibleLabel('upvote', 'post');
        expect(label).toBe('upvote post');
      });

      it('generates label with context', () => {
        const label = generateAccessibleLabel('upvote', 'post', 'by John Doe');
        expect(label).toBe('upvote post by John Doe');
      });

      it('handles empty context', () => {
        const label = generateAccessibleLabel('delete', 'comment', '');
        expect(label).toBe('delete comment');
      });
    });

    describe('generateDescribedBy', () => {
      it('generates correct describedby ID', () => {
        const describedBy = generateDescribedBy('post-123', 'error');
        expect(describedBy).toBe('post-123-error-description');
      });

      it('handles different base IDs and descriptions', () => {
        const describedBy = generateDescribedBy('comment-456', 'help');
        expect(describedBy).toBe('comment-456-help-description');
      });
    });

    describe('generateLabelledBy', () => {
      it('generates correct labelledby ID', () => {
        const labelledBy = generateLabelledBy('post-123', 'title');
        expect(labelledBy).toBe('post-123-title-label');
      });

      it('handles different base IDs and labels', () => {
        const labelledBy = generateLabelledBy('comment-456', 'author');
        expect(labelledBy).toBe('comment-456-author-label');
      });
    });
  });

  describe('Integration Tests', () => {
    it('works together in a complete accessibility setup', () => {
      render(
        <div>
          <SkipLink targetId="main-content">Skip to main content</SkipLink>
          <LiveRegion politeness="polite">Page loaded successfully</LiveRegion>
          <FocusTrap active={true}>
            <button aria-describedby={generateDescribedBy('btn-1', 'help')}>
              Submit
              <VisuallyHidden>Submit the form data</VisuallyHidden>
            </button>
          </FocusTrap>
        </div>
      );

      // Check that all components render correctly
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByText('Page loaded successfully')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Submit the form data')).toBeInTheDocument();

      // Check that the button has the correct describedby attribute
      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('aria-describedby', 'btn-1-help-description');
    });

    it('provides proper ARIA attributes for screen readers', () => {
      render(
        <div>
          <LiveRegion politeness="assertive">
            <span aria-label={generateAccessibleLabel('announce', 'status', 'to users')}>
              Important update
            </span>
          </LiveRegion>
        </div>
      );

      const liveRegion = screen.getByText('Important update').parentElement;
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

      const span = screen.getByText('Important update');
      expect(span).toHaveAttribute('aria-label', 'announce status to users');
    });
  });
}); 