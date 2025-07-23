'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, flexibleCreatePostSchema, type CreatePostInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';

interface CreatePostFormProps {
  onSubmit?: (data: CreatePostInput) => void;
  onCancel?: () => void;
  subreddits?: Array<{ id: string; name: string }>;
}

export function CreatePostForm({ onSubmit, onCancel, subreddits = [] }: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(flexibleCreatePostSchema) as any,
    defaultValues: {
      title: '',
      content: '',
      subredditId: subreddits.length > 0 ? subreddits[0].id : '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: CreatePostInput) => {
    setIsSubmitting(true);
    try {
      // For now, use a mock authorId and subredditId
      const postData = {
        ...data,
        authorId: 'mock-user-id',
        subredditId: data.subredditId || subreddits[0]?.id || 'mock-subreddit-id',
      };

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const result = await response.json();
      showSuccess('Post created successfully!');
      onSubmit?.(data);
      reset();
    } catch (error) {
      console.error('Error creating post:', error);
      showError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle empty subreddits list
  if (subreddits.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a Post</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No subreddits available</p>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a Post</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter your post title..."
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <Textarea
            id="content"
            {...register('content')}
            placeholder="What's on your mind?"
            rows={6}
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        {subreddits.length > 0 && (
          <div>
            <label htmlFor="subredditId" className="block text-sm font-medium text-gray-700 mb-1">
              Subreddit
            </label>
            <select
              id="subredditId"
              {...register('subredditId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {subreddits.map((subreddit) => (
                <option key={subreddit.id} value={subreddit.id}>
                  r/{subreddit.name}
                </option>
              ))}
            </select>
            {errors.subredditId && (
              <p className="text-red-500 text-sm mt-1">{errors.subredditId.message}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
} 