import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { cardService } from '../services/cardService';
import type { Card, CreateCardData, UpdateCardData, MoveCardData, ReorderCardsData } from '../services/cardService';

interface CardsState {
  cards: Record<string, Card>; // Keyed by card ID for easy lookup
  cardsByList: Record<string, string[]>; // Map of listId to array of cardIds
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: CardsState = {
  cards: {},
  cardsByList: {},
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

// Async thunks
export const createCard = createAsyncThunk(
  'cards/create',
  async ({ listId, data }: { listId: string; data: CreateCardData }) => {
    const card = await cardService.createCard(listId, data);
    return { card, listId };
  }
);

export const updateCard = createAsyncThunk(
  'cards/update',
  async ({ cardId, data }: { cardId: string; data: UpdateCardData }) => {
    const card = await cardService.updateCard(cardId, data);
    return card;
  }
);

export const deleteCard = createAsyncThunk(
  'cards/delete',
  async (cardId: string) => {
    await cardService.deleteCard(cardId);
    return cardId;
  }
);

export const moveCard = createAsyncThunk(
  'cards/move',
  async ({ cardId, data }: { cardId: string; data: MoveCardData }) => {
    const card = await cardService.moveCard(cardId, data);
    return card;
  }
);

export const reorderCards = createAsyncThunk(
  'cards/reorder',
  async (data: ReorderCardsData) => {
    const cards = await cardService.reorderCards(data);
    return cards;
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Load cards from a board fetch
    setCardsFromBoard: (state, action: PayloadAction<{ listId: string; cards: Card[] }[]>) => {
      action.payload.forEach(({ listId, cards }) => {
        state.cardsByList[listId] = cards.map((card) => card.id);
        cards.forEach((card) => {
          state.cards[card.id] = card;
        });
      });
    },
    // Clear all cards (e.g., when leaving a board)
    clearCards: (state) => {
      state.cards = {};
      state.cardsByList = {};
    },
    // Optimistic update for moving cards
    moveCardOptimistic: (
      state,
      action: PayloadAction<{
        cardId: string;
        sourceListId: string;
        destListId: string;
        sourceIndex: number;
        destIndex: number;
      }>
    ) => {
      const { cardId, sourceListId, destListId, sourceIndex, destIndex } = action.payload;
      const card = state.cards[cardId];

      if (!card) return;

      // Same list
      if (sourceListId === destListId) {
        const listCards = state.cardsByList[sourceListId] || [];
        const newListCards = Array.from(listCards);
        newListCards.splice(sourceIndex, 1);
        newListCards.splice(destIndex, 0, cardId);
        state.cardsByList[sourceListId] = newListCards;

        // Update positions
        newListCards.forEach((id, index) => {
          if (state.cards[id]) {
            state.cards[id].position = index;
          }
        });
      } else {
        // Different lists
        const sourceListCards = state.cardsByList[sourceListId] || [];
        const destListCards = state.cardsByList[destListId] || [];

        const newSourceListCards = Array.from(sourceListCards);
        newSourceListCards.splice(sourceIndex, 1);
        state.cardsByList[sourceListId] = newSourceListCards;

        const newDestListCards = Array.from(destListCards);
        newDestListCards.splice(destIndex, 0, cardId);
        state.cardsByList[destListId] = newDestListCards;

        // Update card listId
        state.cards[cardId].listId = destListId;

        // Update positions in source list
        newSourceListCards.forEach((id, index) => {
          if (state.cards[id]) {
            state.cards[id].position = index;
          }
        });

        // Update positions in dest list
        newDestListCards.forEach((id, index) => {
          if (state.cards[id]) {
            state.cards[id].position = index;
          }
        });
      }
    },
  },
  extraReducers: (builder) => {
    // Create card
    builder
      .addCase(createCard.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.creating = false;
        const { card, listId } = action.payload;
        state.cards[card.id] = card;
        if (!state.cardsByList[listId]) {
          state.cardsByList[listId] = [];
        }
        state.cardsByList[listId].push(card.id);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || 'Failed to create card';
      });

    // Update card
    builder
      .addCase(updateCard.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updating = false;
        const card = action.payload;
        state.cards[card.id] = card;
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message || 'Failed to update card';
      });

    // Delete card
    builder
      .addCase(deleteCard.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.deleting = false;
        const cardId = action.payload;
        const card = state.cards[cardId];
        if (card) {
          // Remove from cardsByList
          const listCards = state.cardsByList[card.listId];
          if (listCards) {
            state.cardsByList[card.listId] = listCards.filter((id) => id !== cardId);
          }
          // Remove from cards
          delete state.cards[cardId];
        }
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || 'Failed to delete card';
      });

    // Move card
    builder
      .addCase(moveCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        state.loading = false;
        const card = action.payload;
        const oldCard = state.cards[card.id];

        if (oldCard && oldCard.listId !== card.listId) {
          // Remove from old list
          const oldListCards = state.cardsByList[oldCard.listId];
          if (oldListCards) {
            state.cardsByList[oldCard.listId] = oldListCards.filter((id) => id !== card.id);
          }
          // Add to new list
          if (!state.cardsByList[card.listId]) {
            state.cardsByList[card.listId] = [];
          }
          state.cardsByList[card.listId].push(card.id);
        }

        // Update card
        state.cards[card.id] = card;
      })
      .addCase(moveCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move card';
      });

    // Reorder cards
    builder
      .addCase(reorderCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderCards.fulfilled, (state, action) => {
        state.loading = false;
        const cards = action.payload;
        cards.forEach((card) => {
          state.cards[card.id] = card;
        });
      })
      .addCase(reorderCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reorder cards';
      });
  },
});

export const { clearError, setCardsFromBoard, clearCards, moveCardOptimistic } = cardsSlice.actions;
export default cardsSlice.reducer;
