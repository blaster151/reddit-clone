'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, Ban, MicOff, UserPlus, UserMinus } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Ban {
  id: string;
  userId: string;
  username: string;
  reason: string;
  isPermanent: boolean;
  createdAt: Date;
}

interface Mute {
  id: string;
  userId: string;
  username: string;
  reason: string;
  isPermanent: boolean;
  createdAt: Date;
}

interface ModeratorPanelProps {
  subredditId: string;
  moderators: User[];
  bannedUsers: Ban[];
  mutedUsers: Mute[];
  onAddModerator?: (userId: string) => void;
  onRemoveModerator?: (userId: string) => void;
  onUnbanUser?: (banId: string) => void;
  onUnmuteUser?: (muteId: string) => void;
}

export function ModeratorPanel({
  moderators,
  bannedUsers,
  mutedUsers,
  onAddModerator,
  onRemoveModerator,
  onUnbanUser,
  onUnmuteUser,
}: ModeratorPanelProps) {
  const [activeTab, setActiveTab] = useState<'moderators' | 'bans' | 'mutes'>('moderators');
  const [newModeratorUsername, setNewModeratorUsername] = useState('');

  const handleAddModerator = () => {
    if (newModeratorUsername.trim() && onAddModerator) {
      // In a real app, you'd look up the user ID by username
      onAddModerator(newModeratorUsername.trim());
      setNewModeratorUsername('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold">Moderator Tools</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('moderators')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'moderators'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Moderators ({moderators.length})
        </button>
        <button
          onClick={() => setActiveTab('bans')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bans'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Ban className="w-4 h-4 inline mr-2" />
          Banned Users ({bannedUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('mutes')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'mutes'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MicOff className="w-4 h-4 inline mr-2" />
          Muted Users ({mutedUsers.length})
        </button>
      </div>

      {/* Moderators Tab */}
      {activeTab === 'moderators' && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Add Moderator</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newModeratorUsername}
                onChange={(e) => setNewModeratorUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button onClick={handleAddModerator} disabled={!newModeratorUsername.trim()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Current Moderators</h3>
            {moderators.length === 0 ? (
              <p className="text-gray-500">No moderators found.</p>
            ) : (
              <div className="space-y-2">
                {moderators.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{mod.username}</div>
                      <div className="text-sm text-gray-500">{mod.email}</div>
                    </div>
                    {onRemoveModerator && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveModerator(mod.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bans Tab */}
      {activeTab === 'bans' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Banned Users</h3>
          {bannedUsers.length === 0 ? (
            <p className="text-gray-500">No banned users.</p>
          ) : (
            <div className="space-y-3">
              {bannedUsers.map((ban) => (
                <div key={ban.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                  <div>
                    <div className="font-medium text-red-800">{ban.username}</div>
                    <div className="text-sm text-red-600">Reason: {ban.reason}</div>
                    <div className="text-xs text-red-500">
                      {ban.isPermanent ? 'Permanent ban' : 'Temporary ban'} • {new Date(ban.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {onUnbanUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnbanUser(ban.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Unban
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mutes Tab */}
      {activeTab === 'mutes' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Muted Users</h3>
          {mutedUsers.length === 0 ? (
            <p className="text-gray-500">No muted users.</p>
          ) : (
            <div className="space-y-3">
              {mutedUsers.map((mute) => (
                <div key={mute.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
                  <div>
                    <div className="font-medium text-orange-800">{mute.username}</div>
                    <div className="text-sm text-orange-600">Reason: {mute.reason}</div>
                    <div className="text-xs text-orange-500">
                      {mute.isPermanent ? 'Permanent mute' : 'Temporary mute'} • {new Date(mute.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {onUnmuteUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnmuteUser(mute.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Unmute
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 