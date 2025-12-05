import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { labelService } from '../../services/labelService';
import type { Card as CardType } from '../../services/cardService';

interface LabelPickerProps {
  card: CardType;
  onUpdate: (updatedCard: CardType) => void;
  onClose?: () => void;
}

const LabelPicker: React.FC<LabelPickerProps> = ({ card, onUpdate, onClose }) => {
  const { labels } = useAppSelector((state) => state.labels);
  const [loading, setLoading] = useState<string | null>(null);

  const cardLabelIds = card.labels.map((cl) => cl.label.id);

  const handleToggleLabel = async (labelId: string) => {
    setLoading(labelId);
    try {
      const isSelected = cardLabelIds.includes(labelId);

      let updatedCard: CardType;
      if (isSelected) {
        updatedCard = await labelService.removeLabelFromCard(card.id, labelId);
      } else {
        updatedCard = await labelService.addLabelToCard(card.id, labelId);
      }

      onUpdate(updatedCard);
    } catch (error) {
      console.error('Failed to toggle label:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Labels</h3>
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

      {labels.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No labels available. Create labels in board settings.
        </p>
      ) : (
        <div className="space-y-2">
          {labels.map((label) => {
            const isSelected = cardLabelIds.includes(label.id);
            const isLoading = loading === label.id;

            return (
              <button
                key={label.id}
                onClick={() => handleToggleLabel(label.id)}
                disabled={isLoading}
                className={`w-full flex items-center justify-between px-3 py-2 rounded transition ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: label.color }}
              >
                <span className="text-white font-medium text-sm">{label.name}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-white"
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
    </div>
  );
};

export default LabelPicker;
