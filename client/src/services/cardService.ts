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

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: Label;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface CardMember {
  id: string;
  cardId: string;
  userId: string;
  user: User;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
  dueDate: string | null;
  labels: CardLabel[];
  members: CardMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardData {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  dueDate?: string | null;
}

export interface MoveCardData {
  listId: string;
  position: number;
}

export interface ReorderCardsData {
  cards: {
    id: string;
    position: number;
    listId?: string;
  }[];
}

export const cardService = {
  createCard: async (listId: string, data: CreateCardData): Promise<Card> => {
    const response = await api.post(`/lists/${listId}/cards`, data);
    return response.data.card;
  },

  updateCard: async (cardId: string, data: UpdateCardData): Promise<Card> => {
    const response = await api.put(`/cards/${cardId}`, data);
    return response.data.card;
  },

  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}`);
  },

  moveCard: async (cardId: string, data: MoveCardData): Promise<Card> => {
    const response = await api.patch(`/cards/${cardId}/move`, data);
    return response.data.card;
  },

  reorderCards: async (data: ReorderCardsData): Promise<Card[]> => {
    const response = await api.patch(`/cards/reorder`, data);
    return response.data.cards;
  },
};
