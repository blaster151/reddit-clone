import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

/**
 * Props for the Button component
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Size variant of the button */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Reusable Button component with multiple variants and sizes
 * 
 * This component provides a consistent button interface across the application
 * with support for different visual styles, sizes, and accessibility features.
 * 
 * @param props - Button props including variant, size, and standard button attributes
 * @param ref - Forwarded ref to the underlying button element
 * @returns JSX element representing a styled button
 * 
 * @example
 * ```tsx
 * // Default button
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * // Destructive button
 * <Button variant="destructive" onClick={handleDelete}>Delete</Button>
 * 
 * // Icon button
 * <Button size="icon" variant="ghost">
 *   <Icon />
 * </Button>
 * 
 * // Large outline button
 * <Button variant="outline" size="lg">Large Button</Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button }; 