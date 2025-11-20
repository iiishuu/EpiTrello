import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { listService } from '../services/listService';
import type { List, CreateListData, UpdateListData, ReorderListsData } from '../services/listService';

interface ListsState {
  lists: List[];
  loading: boolean;
  error: string | null;
}

const initialState: ListsState = {
  lists: [],
  loading: false,
  error: null,
};

// Async thunks
export const createList = createAsyncThunk(
  'lists/create',
  async ({ boardId, data }: { boardId: string; data: CreateListData }, { rejectWithValue }) => {
    try {
      const list = await listService.createList(boardId, data);
      return list;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create list');
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/update',
  async ({ listId, data }: { listId: string; data: UpdateListData }, { rejectWithValue }) => {
    try {
      const list = await listService.updateList(listId, data);
      return list;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/delete',
  async (listId: string, { rejectWithValue }) => {
    try {
      await listService.deleteList(listId);
      return listId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete list');
    }
  }
);

export const reorderLists = createAsyncThunk(
  'lists/reorder',
  async (data: ReorderListsData, { rejectWithValue }) => {
    try {
      const lists = await listService.reorderLists(data);
      return lists;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reorder lists');
    }
  }
);

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setLists: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload;
    },
    clearLists: (state) => {
      state.lists = [];
      state.error = null;
    },
    // Optimistic updates for reordering
    optimisticReorder: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create list
    builder
      .addCase(createList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists.push(action.payload);
      })
      .addCase(createList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update list
    builder
      .addCase(updateList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lists.findIndex(list => list.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      .addCase(updateList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete list
    builder
      .addCase(deleteList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = state.lists.filter(list => list.id !== action.payload);
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reorder lists
    builder
      .addCase(reorderLists.pending, (state) => {
        state.error = null;
      })
      .addCase(reorderLists.fulfilled, (state, action) => {
        state.lists = action.payload;
      })
      .addCase(reorderLists.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setLists, clearLists, optimisticReorder } = listsSlice.actions;
export default listsSlice.reducer;
