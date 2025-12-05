import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { AppDispatch, RootState } from '../../store';
import { updateList, deleteList } from '../../store/listsSlice';
import type { List as ListType } from '../../services/listService';
import Card from './Card';
import CardDetailModal from './CardDetailModal';
import AddCardButton from './AddCardButton';
import type { Card as CardType } from '../../services/cardService';
import type { FilterState } from './FilterBar';

interface ListProps {
  list: ListType;
  index: number;
  filters?: FilterState;
}

const List: React.FC<ListProps> = ({ list, index, filters }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  // Get cards for this list from Redux store
  const cardIds = useSelector((state: RootState) => state.cards.cardsByList[list.id] || []);
  const cardsById = useSelector((state: RootState) => state.cards.cards);

  // Memoize cards to prevent unnecessary rerenders
  const cards = useMemo(() => {
    return cardIds
      .map((id) => cardsById[id])
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);
  }, [cardIds, cardsById]);

  const handleUpdateName = async () => {
    if (listName.trim() && listName !== list.title) {
      try {
        await dispatch(updateList({ listId: list.id, data: { name: listName.trim() } })).unwrap();
      } catch (error) {
        console.error('Failed to update list:', error);
        setListName(list.title);
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete list "${list.title}"? This will also delete all cards in this list.`)) {
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
      setListName(list.title);
      setIsEditing(false);
    }
  };

  // Apply filters to cards
  const filteredCards = cards.filter((card) => {
    if (!filters) return true;

    // Label filter
    if (filters.labelIds.length > 0) {
      const hasMatchingLabel = card.labels.some((cl) =>
        filters.labelIds.includes(cl.label.id)
      );
      if (!hasMatchingLabel) return false;
    }

    // Member filter
    if (filters.memberIds.length > 0) {
      const hasMatchingMember = card.members.some((cm) =>
        filters.memberIds.includes(cm.user.id)
      );
      if (!hasMatchingMember) return false;
    }

    // Due date filters
    if (filters.showOverdue || filters.showDueSoon || filters.showNoDueDate) {
      const now = new Date();
      const dueDate = card.dueDate ? new Date(card.dueDate) : null;

      if (filters.showNoDueDate && !dueDate) return true;
      if (!dueDate) return false;

      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      if (filters.showOverdue && dueDate < now) return true;
      if (filters.showDueSoon && dueDate >= now && dueDate <= threeDaysFromNow) return true;

      return false;
    }

    return true;
  });

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-100 rounded-xl p-4 w-80 flex-shrink-0 h-fit max-h-full flex flex-col transition-all shadow-sm ${
            snapshot.isDragging ? 'opacity-80 rotate-2 shadow-2xl scale-105' : 'shadow-md'
          }`}
        >
          {/* List header */}
          <div className="flex items-center justify-between mb-4">
            {isEditing ? (
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 text-base font-semibold bg-white border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h3
                {...provided.dragHandleProps}
                onClick={() => setIsEditing(true)}
                className="flex-1 px-3 py-2 text-base font-bold text-gray-900 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded-lg transition-colors"
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

          {/* Cards */}
          <Droppable droppableId={list.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 mb-2 min-h-[20px] overflow-y-auto flex-1 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded' : ''
                }`}
              >
                {filteredCards.length === 0 && cards.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No cards yet</p>
                )}
                {filteredCards.length === 0 && cards.length > 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No cards match filters
                  </p>
                )}
                {filteredCards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={index}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add card button */}
          <AddCardButton listId={list.id} />

          {/* Card detail modal */}
          {selectedCard && (
            <CardDetailModal
              card={selectedCard}
              isOpen={!!selectedCard}
              onClose={() => setSelectedCard(null)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};

export default List;
