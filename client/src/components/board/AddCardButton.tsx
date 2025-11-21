import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { createCard } from '../../store/cardsSlice';
import { motion } from 'framer-motion';

interface AddCardButtonProps {
  listId: string;
}

const AddCardButton: React.FC<AddCardButtonProps> = ({ listId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;

    setIsLoading(true);
    try {
      await dispatch(createCard({ listId, data: { title: cardTitle.trim() } })).unwrap();
      setCardTitle('');
      // Keep the form open for adding more cards
    } catch (error) {
      console.error('Failed to create card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCardTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add a card
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
      <form onSubmit={handleSubmit}>
        <textarea
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this card..."
          className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!cardTitle.trim() || isLoading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add card'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="p-1.5 hover:bg-gray-200 rounded"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddCardButton;
