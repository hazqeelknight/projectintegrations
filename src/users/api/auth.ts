import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { toast } from 'react-toastify';
import {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ForcedPasswordChangeData,
  PasswordResetRequestData,
  PasswordResetConfirmData,
  EmailVerificationData,
  ResendVerificationData,
  LoginResponse,
  RegisterResponse,
} from '../types';

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await api.post('/users/login/', credentials);
      return response.data;
    },
    onError: (error: any) => {
      if (error?.response?.data?.code === 'password_expired') {
        // Handle password expiry specifically
        toast.error('Your password has expired. Please check your email for reset instructions.');
      }
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterData): Promise<RegisterResponse> => {
      const response = await api.post('/users/register/', data);
      return response.data;
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await api.post('/users/logout/');
    },
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem('auth_token');
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Even if API fails, clear local state
      queryClient.clear();
      localStorage.removeItem('auth_token');
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await api.post('/users/change-password/', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast.success('Password changed successfully');
    },
  });
};

// Forced password change mutation
export const useForcedPasswordChange = () => {
  return useMutation({
    mutationFn: async (data: ForcedPasswordChangeData) => {
      const response = await api.post('/users/force-password-change/', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast.success('Password changed successfully. Your account is now active.');
    },
  });
};

// Request password reset mutation
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (data: PasswordResetRequestData) => {
      const response = await api.post('/users/request-password-reset/', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('If an account with that email exists, a password reset link has been sent.');
    },
  });
};

// Confirm password reset mutation
export const useConfirmPasswordReset = () => {
  return useMutation({
    mutationFn: async (data: PasswordResetConfirmData) => {
      const response = await api.post('/users/confirm-password-reset/', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully. You can now log in with your new password.');
    },
  });
};

// Email verification mutation
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (data: EmailVerificationData) => {
      const response = await api.post('/users/verify-email/', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
  });
};

// Resend verification mutation
export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (data: ResendVerificationData) => {
      const response = await api.post('/users/resend-verification/', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('If an unverified account with that email exists, a verification email has been sent.');
    },
  });
};