import axios from 'axios';

// Define types inline to avoid module resolution issues
interface Board {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  boardId: string;
  senderId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  board?: Board;
  sender?: User;
}

interface InviteResponse {
  message: string;
  invitation: Invitation;
}

interface InvitationDetailsResponse {
  invitation: Invitation;
}

interface AcceptInvitationResponse {
  message: string;
  board: Board;
}

interface BoardInvitationsResponse {
  invitations: Invitation[];
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

export const invitationService = {
  // Send invitation to a board
  inviteToBoard: async (boardId: string, email: string): Promise<InviteResponse> => {
    const response = await api.post<InviteResponse>(`/boards/${boardId}/invitations`, { email });
    return response.data;
  },

  // Get invitation details by token (public route)
  getInvitation: async (token: string): Promise<InvitationDetailsResponse> => {
    const response = await api.get<InvitationDetailsResponse>(`/invitations/${token}`);
    return response.data;
  },

  // Accept invitation
  acceptInvitation: async (token: string): Promise<AcceptInvitationResponse> => {
    const response = await api.post<AcceptInvitationResponse>(`/invitations/${token}/accept`);
    return response.data;
  },

  // Get all pending invitations for a board
  getBoardInvitations: async (boardId: string): Promise<BoardInvitationsResponse> => {
    const response = await api.get<BoardInvitationsResponse>(`/boards/${boardId}/invitations`);
    return response.data;
  },
};
