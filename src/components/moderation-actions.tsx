'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Shield, Ban, MicOff, Trash2 } from 'lucide-react';

interface ModerationActionsProps {
  targetId: string;
  targetType: 'post' | 'comment';
  authorId: string;
  subredditId?: string;
  isModerator: boolean;
  onRemove?: (targetId: string, reason: string) => void;
  onBanUser?: (userId: string, reason: string, isPermanent: boolean) => void;
  onMuteUser?: (userId: string, reason: string, isPermanent: boolean) => void;
}

export function ModerationActions({
  targetId,
  targetType,
  authorId,
  subredditId,
  isModerator,
  onRemove,
  onBanUser,
  onMuteUser,
}: ModerationActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [reason, setReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);

  if (!isModerator) return null;

  const handleRemove = () => {
    if (onRemove && reason.trim()) {
      onRemove(targetId, reason.trim());
      setShowRemoveModal(false);
      setReason('');
    }
  };

  const handleBanUser = () => {
    if (onBanUser && reason.trim()) {
      onBanUser(authorId, reason.trim(), isPermanent);
      setShowBanModal(false);
      setReason('');
      setIsPermanent(false);
    }
  };

  const handleMuteUser = () => {
    if (onMuteUser && reason.trim()) {
      onMuteUser(authorId, reason.trim(), isPermanent);
      setShowMuteModal(false);
      setReason('');
      setIsPermanent(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700"
        aria-label="Moderation actions"
      >
        <Shield className="w-4 h-4" />
        <MoreHorizontal className="w-4 h-4 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
          <div className="p-2">
            <button
              onClick={() => setShowRemoveModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
              Remove {targetType}
            </button>
            <button
              onClick={() => setShowBanModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <Ban className="w-4 h-4" />
              Ban User
            </button>
            <button
              onClick={() => setShowMuteModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded"
            >
              <MicOff className="w-4 h-4" />
              Mute User
            </button>
          </div>
        </div>
      )}

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Remove {targetType}</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for removal..."
              className="w-full p-2 border border-gray-300 rounded mb-4 h-24 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ban User</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for ban..."
              className="w-full p-2 border border-gray-300 rounded mb-4 h-24 resize-none"
            />
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
              />
              <span className="text-sm">Permanent ban</span>
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBanModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBanUser}>
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mute Modal */}
      {showMuteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Mute User</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for mute..."
              className="w-full p-2 border border-gray-300 rounded mb-4 h-24 resize-none"
            />
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
              />
              <span className="text-sm">Permanent mute</span>
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMuteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleMuteUser}>
                Mute User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 