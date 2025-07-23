import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      data-testid="skeleton"
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div data-testid="post-card-skeleton" className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center mr-2">
          <Skeleton className="w-6 h-6 mb-1" />
          <Skeleton className="w-8 h-6 mb-1" />
          <Skeleton className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-2 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
          <Skeleton className="w-3/4 h-6 mb-1" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div data-testid="comment-skeleton" className="flex space-x-2">
      <div className="flex flex-col items-center space-y-1">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-8 h-4" />
        <Skeleton className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-2 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-3" />
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-8 h-6" />
        </div>
      </div>
    </div>
  );
} 