import { api } from '@/lib/api';
import type {
  User,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from '@/types/auth';

export const authApi = {
  // Register a new user (sends OTP)
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Login existing user (sends OTP)
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Verify OTP and get tokens
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response = await api.post<ResendOtpResponse>('/auth/resend-otp', data);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
