import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Debounce helper
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Actions that should trigger localStorage save
const PERSIST_ACTIONS = [
  'lists/reorderListsOptimistic',
  'cards/moveCardOptimistic',
  'lists/reorder/fulfilled',
  'cards/reorderCards/fulfilled',
];

// Actions that indicate save failure (for error handling)
const SAVE_ERROR_ACTIONS = [
  'lists/reorder/rejected',
  'cards/reorderCards/rejected',
];

// Create debounced save function
const debouncedSave = debounce((state: RootState, boardId: string) => {
  try {
    const persistData = {
      lists: state.lists.lists,
      cards: {
        cards: state.cards.cards,
        cardsByList: state.cards.cardsByList,
      },
      timestamp: Date.now(),
    };

    localStorage.setItem(`board_${boardId}`, JSON.stringify(persistData));

    // Dispatch custom event for save indicator
    window.dispatchEvent(new CustomEvent('board-saved', { detail: { boardId } }));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}, 500); // 500ms debounce

export const persistenceMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);

  // Extract boardId from current route
  const currentPath = window.location.pathname;
  const boardIdMatch = currentPath.match(/\/board\/([^/]+)/);
  const boardId = boardIdMatch?.[1];

  // Check if this action should trigger persistence
  if (PERSIST_ACTIONS.some(type => action.type.includes(type))) {
    if (boardId) {
      const state = store.getState();

      // Dispatch saving event
      window.dispatchEvent(new CustomEvent('board-saving', { detail: { boardId } }));

      // Debounced save to localStorage
      debouncedSave(state, boardId);
    }
  }

  // Handle save errors
  if (SAVE_ERROR_ACTIONS.some(type => action.type.includes(type))) {
    if (boardId) {
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('board-save-error', {
        detail: {
          boardId,
          error: action.payload || 'Save failed'
        }
      }));
    }
  }

  return result;
};

// Helper to load persisted data
export function loadPersistedBoardData(boardId: string) {
  try {
    const data = localStorage.getItem(`board_${boardId}`);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Check if data is not too old (e.g., 24 hours)
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > MAX_AGE) {
      localStorage.removeItem(`board_${boardId}`);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

// Helper to clear persisted data
export function clearPersistedBoardData(boardId: string) {
  try {
    localStorage.removeItem(`board_${boardId}`);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
