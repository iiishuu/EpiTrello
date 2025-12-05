import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType } from '../../services/cardService';

interface CardProps {
  card: CardType;
  index: number;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, index, onClick }) => {
  const hasDueDate = card.dueDate !== null;
  const hasDescription = card.description !== null && card.description.trim() !== '';
  const hasLabels = card.labels && card.labels.length > 0;
  const hasMembers = card.members && card.members.length > 0;

  // Check if due date is approaching or overdue
  const getDueDateStatus = () => {
    if (!hasDueDate) return null;

    const dueDate = new Date(card.dueDate!);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'soon';
    return 'normal';
  };

  const dueDateStatus = getDueDateStatus();

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300 ${
            snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
          }`}
        >
          {/* Labels */}
          {hasLabels && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((cardLabel) => (
                <div
                  key={cardLabel.id}
                  className="h-2 w-10 rounded"
                  style={{ backgroundColor: cardLabel.label.color }}
                  title={cardLabel.label.name}
                />
              ))}
            </div>
          )}

          {/* Card title */}
          <h4 className="text-sm font-medium text-gray-900 mb-2">{card.title}</h4>

          {/* Card metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Description indicator */}
            {hasDescription && (
              <div className="flex items-center text-gray-500" title="This card has a description">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
            )}

            {/* Due date */}
            {hasDueDate && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                  dueDateStatus === 'overdue'
                    ? 'bg-red-100 text-red-700'
                    : dueDateStatus === 'urgent'
                    ? 'bg-orange-100 text-orange-700'
                    : dueDateStatus === 'soon'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDueDate(card.dueDate!)}</span>
              </div>
            )}

            {/* Members */}
            {hasMembers && (
              <div className="flex -space-x-2 ml-auto">
                {card.members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    title={member.user.name}
                  >
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      member.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {card.members.length > 3 && (
                  <div
                    className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium border-2 border-white"
                    title={`+${card.members.length - 3} more`}
                  >
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
