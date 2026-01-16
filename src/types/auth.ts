// User types
export type UserRole = 'User' | 'Admin';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  emailVerified: boolean;
  status: 'Active' | 'Suspended' | 'Deleted';
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

// Auth request/response types
export interface RegisterRequest {
  email: string;
  fullName?: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  userId: string;
  message: string;
}

export interface VerifyOtpRequest {
  userId: string;
  code: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ResendOtpRequest {
  userId: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pendingUserId: string | null;
  pendingEmail: string | null;
}
