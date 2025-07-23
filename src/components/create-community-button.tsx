'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { CreateSubredditForm } from './create-subreddit-form';

interface CreateCommunityButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function CreateCommunityButton({
  variant = 'default',
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}: CreateCommunityButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const buttonText = showText ? 'Create Community' : '';
  const buttonIcon = showIcon ? <Plus className="h-4 w-4" aria-hidden="true" /> : null;

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant={variant}
        size={size}
        className={`bg-orange-500 hover:bg-orange-600 ${className}`}
        aria-label="Create a new community"
      >
        {buttonIcon}
        {buttonText && <span className={showIcon ? 'ml-2' : ''}>{buttonText}</span>}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        showCloseButton={true}
      >
        <CreateSubredditForm 
          isModal={true} 
          onClose={handleCloseModal} 
        />
      </Modal>
    </>
  );
} 