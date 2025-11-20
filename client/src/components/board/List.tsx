import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { updateList, deleteList } from '../../store/listsSlice';
import type { List as ListType } from '../../services/listService';
import { motion } from 'framer-motion';

interface ListProps {
  list: ListType;
}

const List: React.FC<ListProps> = ({ list }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleUpdateName = async () => {
    if (listName.trim() && listName !== list.name) {
      try {
        await dispatch(updateList({ listId: list.id, data: { name: listName.trim() } })).unwrap();
      } catch (error) {
        console.error('Failed to update list:', error);
        setListName(list.name);
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete list "${list.name}"? This will also delete all cards in this list.`)) {
      try {
        await dispatch(deleteList(list.id)).unwrap();
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
    }
    setShowMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateName();
    } else if (e.key === 'Escape') {
      setListName(list.name);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gray-100 rounded-lg p-3 w-72 flex-shrink-0 h-fit max-h-full flex flex-col"
    >
      {/* List header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onBlur={handleUpdateName}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm font-semibold bg-white border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className="flex-1 px-2 py-1 text-sm font-semibold cursor-pointer hover:bg-gray-200 rounded"
          >
            {list.title}
          </h3>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete list
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards will go here */}
      <div className="space-y-2 mb-2 min-h-[20px]">
        {list.cards.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No cards yet</p>
        )}
      </div>

      {/* Add card button placeholder */}
      <button className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded flex items-center gap-2">
        <svg
          className="w-4 h-4"
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
        Add a card
      </button>
    </motion.div>
  );
};

export default List;
