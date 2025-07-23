import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the Skeleton component
 */
interface SkeletonProps {
  /** CSS class names to apply to the skeleton */
  className?: string;
  /** Whether to show the shimmer animation (default: true) */
  animate?: boolean;
  /** Width of the skeleton (can be CSS value like '100%', '200px', etc.) */
  width?: string | number;
  /** Height of the skeleton (can be CSS value like '100%', '20px', etc.) */
  height?: string | number;
  /** Border radius of the skeleton */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Skeleton loader component with shimmer effect
 * 
 * This component provides a loading placeholder with:
 * - Configurable dimensions and styling
 * - Smooth shimmer animation
 * - Different border radius options
 * - Accessible loading state
 * 
 * @param props - Component props for customization
 * @returns JSX element representing the skeleton loader
 * 
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="w-32 h-4" />
 * 
 * // Custom dimensions
 * <Skeleton width="200px" height="20px" rounded="md" />
 * 
 * // Without animation
 * <Skeleton className="w-full h-8" animate={false} />
 * ```
 */
export function Skeleton({ 
  className, 
  animate = true, 
  width, 
  height, 
  rounded = 'md' 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const animationClasses = animate 
    ? 'animate-pulse' 
    : '';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        roundedClasses[rounded],
        animationClasses,
        className
      )}
      style={style}
      role="status"
      aria-label="Loading"
      data-testid="skeleton"
    />
  );
}

/**
 * Props for the ShimmerSkeleton component
 */
interface ShimmerSkeletonProps extends SkeletonProps {
  /** Duration of the shimmer animation in milliseconds */
  duration?: number;
}

/**
 * Skeleton loader with shimmer effect
 * 
 * This component provides a more sophisticated loading placeholder with:
 * - Smooth shimmer animation that moves across the element
 * - Customizable animation duration
 * - All the features of the base Skeleton component
 * 
 * @param props - Component props for customization
 * @returns JSX element representing the shimmer skeleton
 * 
 * @example
 * ```tsx
 * // Basic shimmer skeleton
 * <ShimmerSkeleton className="w-32 h-4" />
 * 
 * // Custom duration
 * <ShimmerSkeleton className="w-full h-8" duration={2000} />
 * ```
 */
export function ShimmerSkeleton({ 
  className, 
  animate = true, 
  width, 
  height, 
  rounded = 'md',
  duration = 1500 
}: ShimmerSkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 relative overflow-hidden';
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const style: React.CSSProperties = {
    '--shimmer-duration': `${duration}ms`,
  } as React.CSSProperties;
  
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        roundedClasses[rounded],
        className
      )}
      style={style}
      role="status"
      aria-label="Loading"
      data-testid="shimmer-skeleton"
    >
      {animate && (
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Props for the PostCardSkeleton component
 */
interface PostCardSkeletonProps {
  /** Whether to show the shimmer animation */
  animate?: boolean;
  /** CSS class names to apply */
  className?: string;
}

/**
 * Skeleton loader specifically designed for post cards
 * 
 * This component provides a complete skeleton layout that matches
 * the structure of a PostCard component, including:
 * - Title skeleton
 * - Content skeleton with multiple lines
 * - Vote buttons skeleton
 * - Metadata skeleton (author, time, comments)
 * 
 * @param props - Component props for customization
 * @returns JSX element representing the post card skeleton
 * 
 * @example
 * ```tsx
 * // Basic post card skeleton
 * <PostCardSkeleton />
 * 
 * // Without animation
 * <PostCardSkeleton animate={false} />
 * ```
 */
export function PostCardSkeleton({ animate = true, className }: PostCardSkeletonProps) {
  const SkeletonComponent = animate ? ShimmerSkeleton : Skeleton;
  
  return (
    <div 
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 space-y-3',
        className
      )}
      data-testid="post-card-skeleton"
    >
      {/* Title */}
      <SkeletonComponent 
        className="w-3/4 h-5" 
        animate={animate}
      />
      
      {/* Content - multiple lines */}
      <div className="space-y-2">
        <SkeletonComponent 
          className="w-full h-4" 
          animate={animate}
        />
        <SkeletonComponent 
          className="w-5/6 h-4" 
          animate={animate}
        />
        <SkeletonComponent 
          className="w-4/6 h-4" 
          animate={animate}
        />
      </div>
      
      {/* Bottom row with votes and metadata */}
      <div className="flex items-center justify-between pt-2">
        {/* Vote buttons */}
        <div className="flex items-center space-x-2">
          <SkeletonComponent 
            className="w-8 h-8 rounded-full" 
            animate={animate}
          />
          <SkeletonComponent 
            className="w-12 h-4" 
            animate={animate}
          />
          <SkeletonComponent 
            className="w-8 h-8 rounded-full" 
            animate={animate}
          />
        </div>
        
        {/* Metadata */}
        <div className="flex items-center space-x-4">
          <SkeletonComponent 
            className="w-20 h-4" 
            animate={animate}
          />
          <SkeletonComponent 
            className="w-16 h-4" 
            animate={animate}
          />
          <SkeletonComponent 
            className="w-24 h-4" 
            animate={animate}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Props for the CommentSkeleton component
 */
interface CommentSkeletonProps {
  /** Whether to show the shimmer animation */
  animate?: boolean;
  /** Whether this is a nested comment (affects indentation) */
  nested?: boolean;
  /** CSS class names to apply */
  className?: string;
}

/**
 * Skeleton loader specifically designed for comments
 * 
 * This component provides a complete skeleton layout that matches
 * the structure of a Comment component, including:
 * - Author and timestamp skeleton
 * - Content skeleton
 * - Vote buttons skeleton
 * - Reply button skeleton
 * 
 * @param props - Component props for customization
 * @returns JSX element representing the comment skeleton
 * 
 * @example
 * ```tsx
 * // Basic comment skeleton
 * <CommentSkeleton />
 * 
 * // Nested comment skeleton
 * <CommentSkeleton nested={true} />
 * ```
 */
export function CommentSkeleton({ animate = true, nested = false, className }: CommentSkeletonProps) {
  const SkeletonComponent = animate ? ShimmerSkeleton : Skeleton;
  
  return (
    <div 
      className={cn(
        'space-y-2',
        nested && 'ml-6 border-l-2 border-gray-100 pl-4',
        className
      )}
      data-testid="comment-skeleton"
    >
      {/* Author and timestamp */}
      <div className="flex items-center space-x-2">
        <SkeletonComponent 
          className="w-20 h-4" 
          animate={animate}
        />
        <SkeletonComponent 
          className="w-16 h-3" 
          animate={animate}
        />
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <SkeletonComponent 
          className="w-full h-4" 
          animate={animate}
        />
        <SkeletonComponent 
          className="w-4/5 h-4" 
          animate={animate}
        />
      </div>
      
      {/* Vote buttons and reply */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <SkeletonComponent 
            className="w-6 h-6 rounded-full" 
            animate={animate}
          />
          <SkeletonComponent 
            className="w-8 h-4" 
            animate={animate}
          />
          <SkeletonComponent 
            className="w-6 h-6 rounded-full" 
            animate={animate}
          />
        </div>
        <SkeletonComponent 
          className="w-16 h-4" 
          animate={animate}
        />
      </div>
    </div>
  );
}

/**
 * Props for the FeedSkeleton component
 */
interface FeedSkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Whether to show the shimmer animation */
  animate?: boolean;
  /** Type of skeleton to render */
  type?: 'post' | 'comment';
  /** CSS class names to apply */
  className?: string;
}

/**
 * Skeleton loader for feeds with multiple items
 * 
 * This component renders multiple skeleton items to simulate
 * a loading feed, supporting both post and comment skeletons.
 * 
 * @param props - Component props for customization
 * @returns JSX element representing the feed skeleton
 * 
 * @example
 * ```tsx
 * // Post feed skeleton
 * <FeedSkeleton count={5} type="post" />
 * 
 * // Comment feed skeleton
 * <FeedSkeleton count={3} type="comment" animate={false} />
 * ```
 */
export function FeedSkeleton({ 
  count = 3, 
  animate = true, 
  type = 'post',
  className 
}: FeedSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);
  
  return (
    <div 
      className={cn('space-y-4', className)}
      data-testid="feed-skeleton"
    >
      {items.map((index) => (
        <div key={index}>
          {type === 'post' ? (
            <PostCardSkeleton animate={animate} />
          ) : (
            <CommentSkeleton animate={animate} />
          )}
        </div>
      ))}
    </div>
  );
} 