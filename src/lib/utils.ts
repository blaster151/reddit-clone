import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * 
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * and conflict resolution of Tailwind CSS classes.
 * 
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * ```tsx
 * const className = cn(
 *   'bg-red-500',
 *   isActive && 'bg-blue-500',
 *   'text-white'
 * );
 * // Result: 'bg-blue-500 text-white' (if isActive is true)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * Removes potentially dangerous HTML tags, JavaScript protocols,
 * and event handlers from user input.
 * 
 * @param input - Raw user input string
 * @returns Sanitized string safe for display
 * 
 * @example
 * ```tsx
 * const safeInput = sanitizeInput('<script>alert("xss")</script>Hello');
 * // Result: 'Hello'
 * ```
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags and potentially dangerous content
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Formats a date into a readable string with date and time
 * 
 * Uses Intl.DateTimeFormat for locale-aware formatting.
 * 
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "Jan 15, 2024, 02:30 PM")
 * 
 * @example
 * ```tsx
 * const formatted = formatDate(new Date('2024-01-15T14:30:00'));
 * // Result: "Jan 15, 2024, 02:30 PM"
 * ```
 */
export function formatDate(date: Date): string {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats a date into a relative time string
 * 
 * Converts dates into human-readable relative time strings like
 * "2h ago", "3d ago", "1w ago", etc.
 * 
 * @param date - Date to format relative to current time
 * @returns Relative time string
 * 
 * @example
 * ```tsx
 * const relative = formatRelativeTime(new Date(Date.now() - 3600000));
 * // Result: "1h ago"
 * ```
 */
export function formatRelativeTime(date: Date): string {
  // Handle invalid dates, null, or undefined
  if (!date || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    const absDiffInSeconds = Math.abs(diffInSeconds);
    
    if (absDiffInSeconds < 60) {
      return 'just now';
    }

    const absDiffInMinutes = Math.floor(absDiffInSeconds / 60);
    if (absDiffInMinutes < 60) {
      return `in ${absDiffInMinutes}m`;
    }

    const absDiffInHours = Math.floor(absDiffInMinutes / 60);
    if (absDiffInHours < 24) {
      return `in ${absDiffInHours}h`;
    }

    const absDiffInDays = Math.floor(absDiffInHours / 24);
    if (absDiffInDays < 7) {
      return `in ${absDiffInDays}d`;
    }

    const absDiffInWeeks = Math.floor(absDiffInDays / 7);
    if (absDiffInWeeks < 4) {
      return `in ${absDiffInWeeks}w`;
    }

    const absDiffInMonths = Math.floor(absDiffInDays / 30);
    if (absDiffInMonths < 12) {
      return `in ${absDiffInMonths}mo`;
    }

    const absDiffInYears = Math.floor(absDiffInDays / 365);
    return `in ${absDiffInYears}y`;
  }

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

/**
 * Formats numbers into abbreviated form for display
 * 
 * Converts large numbers into K (thousands) and M (millions) format
 * for better readability in UI components.
 * 
 * @param num - Number to format
 * @returns Abbreviated number string
 * 
 * @example
 * ```tsx
 * formatNumber(1500);    // "1.5K"
 * formatNumber(2500000); // "2.5M"
 * formatNumber(500);     // "500"
 * ```
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
} 