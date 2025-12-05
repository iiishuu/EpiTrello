import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { updateCard as updateCardInStore, deleteCard } from '../../store/cardsSlice';
import type { Card } from '../../services/cardService';
import { motion, AnimatePresence } from 'framer-motion';
import LabelPicker from './LabelPicker';
import MemberPicker from './MemberPicker';

interface CardDetailModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentCard, setCurrentCard] = useState<Card>(card);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  useEffect(() => {
    setCurrentCard(card);
    setTitle(card.title);
    setDescription(card.description || '');
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
  }, [card]);

  const handleCardUpdate = (updatedCard: Card) => {
    setCurrentCard(updatedCard);
    dispatch(updateCardInStore({ cardId: updatedCard.id, data: {} }));
  };

  const handleUpdateTitle = async () => {
    if (title.trim() && title !== card.title) {
      setIsSaving(true);
      try {
        await dispatch(updateCardInStore({ cardId: card.id, data: { title: title.trim() } })).unwrap();
      } catch (error) {
        console.error('Failed to update card title:', error);
        setTitle(card.title);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = async () => {
    if (description !== (card.description || '')) {
      setIsSaving(true);
      try {
        await dispatch(
          updateCardInStore({ cardId: card.id, data: { description: description.trim() || undefined } })
        ).unwrap();
      } catch (error) {
        console.error('Failed to update card description:', error);
        setDescription(card.description || '');
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditingDescription(false);
  };

  const handleUpdateDueDate = async (newDueDate: string) => {
    setDueDate(newDueDate);
    setIsSaving(true);
    try {
      await dispatch(
        updateCardInStore({
          cardId: card.id,
          data: { dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined },
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to update due date:', error);
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete card "${card.title}"?`)) {
      try {
        await dispatch(deleteCard(card.id)).unwrap();
        onClose();
      } catch (error) {
        console.error('Failed to delete card:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleUpdateTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateTitle();
                      if (e.key === 'Escape') {
                        setTitle(card.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xl font-semibold border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    disabled={isSaving}
                  />
                ) : (
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    className="flex-1 text-xl font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    {card.title}
                  </h2>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Due Date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleUpdateDueDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
              {dueDate && (
                <button
                  onClick={() => handleUpdateDueDate('')}
                  className="ml-2 text-sm text-red-600 hover:text-red-700"
                  disabled={isSaving}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                <h3 className="text-sm font-semibold text-gray-700">Description</h3>
              </div>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setDescription(card.description || '');
                        setIsEditingDescription(false);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    placeholder="Add a more detailed description..."
                    autoFocus
                    disabled={isSaving}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleUpdateDescription}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setDescription(card.description || '');
                        setIsEditingDescription(false);
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 min-h-[80px]"
                >
                  {card.description ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{card.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Add a more detailed description...</p>
                  )}
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Labels</h3>
                <button
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showLabelPicker ? 'Close' : 'Edit'}
                </button>
              </div>
              {currentCard.labels && currentCard.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentCard.labels.map((cardLabel) => (
                    <div
                      key={cardLabel.id}
                      className="px-3 py-1 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: cardLabel.label.color }}
                    >
                      {cardLabel.label.name}
                    </div>
                  ))}
                </div>
              )}
              {showLabelPicker && (
                <div className="mt-2 border border-gray-200 rounded-lg bg-white">
                  <LabelPicker
                    card={currentCard}
                    onUpdate={handleCardUpdate}
                    onClose={() => setShowLabelPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Members */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Members</h3>
                <button
                  onClick={() => setShowMemberPicker(!showMemberPicker)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showMemberPicker ? 'Close' : 'Edit'}
                </button>
              </div>
              {currentCard.members && currentCard.members.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentCard.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
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
                      <span className="text-sm text-gray-700">{member.user.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {showMemberPicker && (
                <div className="mt-2 border border-gray-200 rounded-lg bg-white">
                  <MemberPicker
                    card={currentCard}
                    onUpdate={handleCardUpdate}
                    onClose={() => setShowMemberPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete Card
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CardDetailModal;
