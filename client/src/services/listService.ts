import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error?.toLowerCase() || '';
      if (errorMessage.includes('invalid token') || errorMessage.includes('token expired') || errorMessage.includes('no token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  cards: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateListData {
  name: string;
}

export interface UpdateListData {
  name: string;
}

export interface ReorderListsData {
  lists: {
    id: string;
    position: number;
  }[];
}

export const listService = {
  createList: async (boardId: string, data: CreateListData): Promise<List> => {
    const response = await api.post(`/boards/${boardId}/lists`, data);
    return response.data.list;
  },

  updateList: async (listId: string, data: UpdateListData): Promise<List> => {
    const response = await api.put(`/lists/${listId}`, data);
    return response.data.list;
  },

  deleteList: async (listId: string): Promise<void> => {
    await api.delete(`/lists/${listId}`);
  },

  reorderLists: async (data: ReorderListsData): Promise<List[]> => {
    const response = await api.patch(`/lists/reorder`, data);
    return response.data.lists;
  },
};
