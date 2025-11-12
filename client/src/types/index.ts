export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
