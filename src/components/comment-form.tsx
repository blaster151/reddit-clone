'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentSchema, type CreateCommentInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onSubmit?: (data: CreateCommentInput) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ 
  postId, 
  parentCommentId, 
  onSubmit, 
  onCancel, 
  placeholder = "What are your thoughts?" 
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      postId,
      parentCommentId,
    },
  });

  const handleFormSubmit = async (data: CreateCommentInput) => {
    setIsSubmitting(true);
    try {
      const commentData = {
        ...data,
        postId,
        parentCommentId: parentCommentId || undefined,
      };

      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const result = await response.json();
      showSuccess('Comment posted successfully!');
      onSubmit?.(data);
      reset();
    } catch (error) {
      console.error('Error creating comment:', error);
      showError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        <div>
          <Textarea
            {...register('content')}
            placeholder={placeholder}
            rows={3}
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
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