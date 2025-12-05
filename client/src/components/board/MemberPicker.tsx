import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { labelService } from '../../services/labelService';
import type { Card as CardType } from '../../services/cardService';

interface MemberPickerProps {
  card: CardType;
  onUpdate: (updatedCard: CardType) => void;
  onClose?: () => void;
}

const MemberPicker: React.FC<MemberPickerProps> = ({ card, onUpdate, onClose }) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState<string | null>(null);

  // For now, only the current user can be added as a member
  // In a real app, you'd fetch board members from the backend
  const availableMembers = currentUser ? [currentUser] : [];
  const cardMemberIds = card.members.map((cm) => cm.user.id);

  const handleToggleMember = async (userId: string) => {
    setLoading(userId);
    try {
      const isSelected = cardMemberIds.includes(userId);

      let updatedCard: CardType;
      if (isSelected) {
        updatedCard = await labelService.removeMemberFromCard(card.id, userId);
      } else {
        updatedCard = await labelService.addMemberToCard(card.id, userId);
      }

      onUpdate(updatedCard);
    } catch (error) {
      console.error('Failed to toggle member:', error);
    } finally {
      setLoading(null);
    }
  };

  const renderAvatar = (user: typeof currentUser) => {
    if (!user) return null;

    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
        {user.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Members</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {availableMembers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No members available.</p>
      ) : (
        <div className="space-y-2">
          {availableMembers.map((member) => {
            const isSelected = cardMemberIds.includes(member.id);
            const isLoading = loading === member.id;

            return (
              <button
                key={member.id}
                onClick={() => handleToggleMember(member.id)}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100'
                } ${isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-gray-200'}`}
              >
                {renderAvatar(member)}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Assign members to this card
      </p>
    </div>
  );
};

export default MemberPicker;
