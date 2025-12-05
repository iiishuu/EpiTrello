import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  labelService,
  type Label,
  type CreateLabelData,
  type UpdateLabelData,
} from '../services/labelService';

interface LabelsState {
  labels: Label[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

const initialState: LabelsState = {
  labels: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

// Async thunks
export const fetchLabels = createAsyncThunk(
  'labels/fetchLabels',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const labels = await labelService.getLabels(boardId);
      return labels;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch labels');
    }
  }
);

export const createLabel = createAsyncThunk(
  'labels/createLabel',
  async (
    { boardId, data }: { boardId: string; data: CreateLabelData },
    { rejectWithValue }
  ) => {
    try {
      const label = await labelService.createLabel(boardId, data);
      return label;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create label');
    }
  }
);

export const updateLabel = createAsyncThunk(
  'labels/updateLabel',
  async (
    { boardId, labelId, data }: { boardId: string; labelId: string; data: UpdateLabelData },
    { rejectWithValue }
  ) => {
    try {
      const label = await labelService.updateLabel(boardId, labelId, data);
      return label;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update label');
    }
  }
);

export const deleteLabel = createAsyncThunk(
  'labels/deleteLabel',
  async ({ boardId, labelId }: { boardId: string; labelId: string }, { rejectWithValue }) => {
    try {
      await labelService.deleteLabel(boardId, labelId);
      return labelId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete label');
    }
  }
);

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    setLabels: (state, action: PayloadAction<Label[]>) => {
      state.labels = action.payload;
    },
    clearLabels: (state) => {
      state.labels = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch labels
    builder
      .addCase(fetchLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.labels = action.payload;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create label
    builder
      .addCase(createLabel.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.creating = false;
        state.labels.push(action.payload);
      })
      .addCase(createLabel.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Update label
    builder
      .addCase(updateLabel.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.labels.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.labels[index] = action.payload;
        }
      })
      .addCase(updateLabel.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Delete label
    builder
      .addCase(deleteLabel.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.deleting = false;
        state.labels = state.labels.filter((l) => l.id !== action.payload);
      })
      .addCase(deleteLabel.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLabels, clearLabels, clearError } = labelsSlice.actions;
export default labelsSlice.reducer;
