import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Label interfaces
export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: string;
}

export interface CreateLabelData {
  name: string;
  color: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
}

// Label service
export const labelService = {
  // Get all labels for a board
  getLabels: async (boardId: string): Promise<Label[]> => {
    const response = await api.get<{ labels: Label[] }>(`/boards/${boardId}/labels`);
    return response.data.labels;
  },

  // Create a new label for a board
  createLabel: async (boardId: string, data: CreateLabelData): Promise<Label> => {
    const response = await api.post<{ label: Label; message: string }>(
      `/boards/${boardId}/labels`,
      data
    );
    return response.data.label;
  },

  // Update a label
  updateLabel: async (
    boardId: string,
    labelId: string,
    data: UpdateLabelData
  ): Promise<Label> => {
    const response = await api.put<{ label: Label; message: string }>(
      `/boards/${boardId}/labels/${labelId}`,
      data
    );
    return response.data.label;
  },

  // Delete a label
  deleteLabel: async (boardId: string, labelId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/labels/${labelId}`);
  },

  // Add a label to a card
  addLabelToCard: async (cardId: string, labelId: string): Promise<any> => {
    const response = await api.post(`/cards/${cardId}/labels/${labelId}`);
    return response.data.card;
  },

  // Remove a label from a card
  removeLabelFromCard: async (cardId: string, labelId: string): Promise<any> => {
    const response = await api.delete(`/cards/${cardId}/labels/${labelId}`);
    return response.data.card;
  },

  // Add a member to a card
  addMemberToCard: async (cardId: string, userId: string): Promise<any> => {
    const response = await api.post(`/cards/${cardId}/members/${userId}`);
    return response.data.card;
  },

  // Remove a member from a card
  removeMemberFromCard: async (cardId: string, userId: string): Promise<any> => {
    const response = await api.delete(`/cards/${cardId}/members/${userId}`);
    return response.data.card;
  },
};
