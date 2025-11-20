import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { createList } from '../../store/listsSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface AddListButtonProps {
  boardId: string;
}

const AddListButton: React.FC<AddListButtonProps> = ({ boardId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAdding, setIsAdding] = useState(false);
  const [listName, setListName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    setIsLoading(true);
    try {
      await dispatch(createList({ boardId, data: { name: listName.trim() } })).unwrap();
      setListName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setListName('');
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
        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg p-3 w-72 flex-shrink-0 flex items-center gap-2 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add a list
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-100 rounded-lg p-3 w-72 flex-shrink-0"
    >
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!listName.trim() || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add list'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddListButton;
