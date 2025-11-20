import axios from 'axios';

// Board types
export interface Board {
  id: string;
  name: string;
  color: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lists: number;
  };
}

export interface BoardDetail extends Board {
  lists: List[];
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
  createdAt: string;
  updatedAt: string;
  labels: CardLabel[];
  members: CardMember[];
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: Label;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface CardMember {
  id: string;
  cardId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface CreateBoardData {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateBoardData {
  name?: string;
  color?: string;
  description?: string;
}

export interface BoardsResponse {
  boards: Board[];
}

export interface BoardResponse {
  board: BoardDetail;
}

export interface CreateBoardResponse {
  message: string;
  board: Board;
}

export interface UpdateBoardResponse {
  message: string;
  board: Board;
}

export interface DeleteBoardResponse {
  message: string;
}

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

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized error, clear the stored auth data
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error?.toLowerCase() || '';
      if (errorMessage.includes('invalid token') || errorMessage.includes('token expired') || errorMessage.includes('no token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const boardService = {
  // Get all boards for the authenticated user
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get<BoardsResponse>('/boards');
    return response.data.boards;
  },

  // Get a specific board by ID
  getBoard: async (id: string): Promise<BoardDetail> => {
    const response = await api.get<BoardResponse>(`/boards/${id}`);
    return response.data.board;
  },

  // Create a new board
  createBoard: async (data: CreateBoardData): Promise<Board> => {
    const response = await api.post<CreateBoardResponse>('/boards', data);
    return response.data.board;
  },

  // Update a board
  updateBoard: async (id: string, data: UpdateBoardData): Promise<Board> => {
    const response = await api.put<UpdateBoardResponse>(`/boards/${id}`, data);
    return response.data.board;
  },

  // Delete a board
  deleteBoard: async (id: string): Promise<void> => {
    await api.delete<DeleteBoardResponse>(`/boards/${id}`);
  },
};
