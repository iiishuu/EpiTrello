import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { boardService } from '../services/boardService';
import type { Board, BoardDetail, CreateBoardData, UpdateBoardData } from '../services/boardService';

interface BoardsState {
  boards: Board[];
  currentBoard: BoardDetail | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

const initialState: BoardsState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

// Async thunks
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const boards = await boardService.getBoards();
      return boards;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || 'Failed to fetch boards');
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (id: string, { rejectWithValue }) => {
    try {
      const board = await boardService.getBoard(id);
      return board;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (data: CreateBoardData, { rejectWithValue }) => {
    try {
      const board = await boardService.createBoard(data);
      return board;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || 'Failed to create board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, data }: { id: string; data: UpdateBoardData }, { rejectWithValue }) => {
    try {
      const board = await boardService.updateBoard(id, data);
      return board;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (id: string, { rejectWithValue }) => {
    try {
      await boardService.deleteBoard(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || 'Failed to delete board');
    }
  }
);

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Boards
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false;
        state.boards = action.payload;
        state.error = null;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Board
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action: PayloadAction<BoardDetail>) => {
        state.loading = false;
        state.currentBoard = action.payload;
        state.error = null;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Board
    builder
      .addCase(createBoard.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.creating = false;
        state.boards.unshift(action.payload); // Add to beginning
        state.error = null;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Update Board
    builder
      .addCase(updateBoard.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.updating = false;
        // Update in boards list
        const index = state.boards.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        // Update current board if it's the same
        if (state.currentBoard && state.currentBoard.id === action.payload.id) {
          state.currentBoard = { ...state.currentBoard, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Delete Board
    builder
      .addCase(deleteBoard.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.boards = state.boards.filter(b => b.id !== action.payload);
        if (state.currentBoard && state.currentBoard.id === action.payload) {
          state.currentBoard = null;
        }
        state.error = null;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentBoard } = boardsSlice.actions;
export default boardsSlice.reducer;
