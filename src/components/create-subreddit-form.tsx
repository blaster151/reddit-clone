'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { LoadingSpinner } from './ui/loading-spinner';

interface CreateSubredditFormProps {
  onClose?: () => void;
  isModal?: boolean;
}

interface FormData {
  name: string;
  description: string;
  type: 'public' | 'private' | 'restricted';
  category: string;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  category?: string;
  type?: string;
}

const COMMUNITY_TYPES = [
  { value: 'public', label: 'Public', description: 'Anyone can view, submit, and comment' },
  { value: 'private', label: 'Private', description: 'Only approved users can view and submit' },
  { value: 'restricted', label: 'Restricted', description: 'Anyone can view, but only approved users can submit' }
];

const CATEGORIES = [
  'Technology', 'Gaming', 'Sports', 'Entertainment', 'News', 'Science', 
  'Health', 'Education', 'Business', 'Politics', 'Art', 'Music', 
  'Food', 'Travel', 'Fashion', 'Fitness', 'Books', 'Movies', 
  'Television', 'Anime', 'Comics', 'Gaming', 'Programming', 'Other'
];

const RESERVED_WORDS = ['admin', 'mod', 'moderator', 'administrator', 'reddit', 'help', 'about', 'contact'];

export function CreateSubredditForm({ onClose, isModal = false }: CreateSubredditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'public',
    category: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Real-time name validation
  useEffect(() => {
    const validateName = async () => {
      if (formData.name.length < 3) {
        setNameAvailable(null);
        return;
      }

      // Check format
      const nameRegex = /^[a-zA-Z0-9_]+$/;
      if (!nameRegex.test(formData.name)) {
        setErrors(prev => ({ ...prev, name: 'Name can only contain letters, numbers, and underscores' }));
        setNameAvailable(false);
        return;
      }

      // Check reserved words
      if (RESERVED_WORDS.includes(formData.name.toLowerCase())) {
        setErrors(prev => ({ ...prev, name: 'This name is reserved and cannot be used' }));
        setNameAvailable(false);
        return;
      }

      // Check length
      if (formData.name.length > 21) {
        setErrors(prev => ({ ...prev, name: 'Name must be 21 characters or less' }));
        setNameAvailable(false);
        return;
      }

      // Clear format errors
      setErrors(prev => ({ ...prev, name: undefined }));

      // Check availability with API
      setIsCheckingName(true);
      try {
        const response = await fetch(`/api/subreddits/check-name?name=${encodeURIComponent(formData.name)}`);
        const data = await response.json();
        
        if (data.available) {
          setNameAvailable(true);
          setErrors(prev => ({ ...prev, name: undefined }));
        } else {
          setNameAvailable(false);
          setErrors(prev => ({ ...prev, name: data.error || 'This community name is already taken' }));
        }
      } catch (error) {
        console.error('Error checking name availability:', error);
        setNameAvailable(null);
      } finally {
        setIsCheckingName(false);
      }
    };

    const timeoutId = setTimeout(validateName, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.name]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && nameAvailable === true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subreddits/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          if (isModal && onClose) {
            onClose();
          }
          router.push(`/r/${data.name}`);
        }, 2000);
      } else {
        setErrors({ name: data.error || 'Failed to create community' });
      }
    } catch (error) {
      console.error('Error creating subreddit:', error);
      setErrors({ name: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name.length >= 3 && 
                     formData.name.length <= 21 && 
                     nameAvailable === true && 
                     formData.category && 
                     !isLoading &&
                     Object.keys(errors).length === 0;

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Created!</h2>
          <p className="text-gray-600 mb-4">
            Your community <strong>r/{formData.name}</strong> has been successfully created.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to your new community...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isModal ? 'max-w-md' : 'max-w-2xl'} mx-auto p-6 bg-white rounded-lg shadow-lg`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a Community</h2>
        <p className="text-gray-600">
          Build a community around a topic you're passionate about.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Community Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Community name *
          </label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter community name"
              className={`pr-10 ${errors.name ? 'border-red-500' : nameAvailable === true ? 'border-green-500' : ''}`}
              maxLength={21}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isCheckingName && <LoadingSpinner size="sm" />}
              {!isCheckingName && nameAvailable === true && (
                <span className="text-green-500 text-xl">✓</span>
              )}
              {!isCheckingName && nameAvailable === false && (
                <span className="text-red-500 text-xl">✗</span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {formData.name.length}/21 characters
            </span>
            {formData.name && (
              <span className="text-xs text-gray-500">
                URL: reddit.com/r/{formData.name}
              </span>
            )}
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Community names cannot be changed later. Use 3-21 characters, letters, numbers, and underscores only.
          </p>
        </div>

        {/* Community Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your community (optional)"
            rows={4}
            maxLength={500}
            className={errors.description ? 'border-red-500' : ''}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {formData.description.length}/500 characters
            </span>
          </div>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Community Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Community type
          </label>
          <div className="space-y-2">
            {COMMUNITY_TYPES.map((type) => (
              <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {isModal && onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Community'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 