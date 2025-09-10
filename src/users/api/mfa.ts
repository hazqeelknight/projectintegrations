import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'react-toastify';
import { 
  MFADevice, 
  MFASetupData, 
  MFAVerificationData, 
  MFASetupResponse, 
  MFAVerificationResponse 
} from '../types';

// Get MFA devices
export const useMFADevices = () => {
  return useQuery({
    queryKey: ['users', 'mfa', 'devices'],
    queryFn: async (): Promise<MFADevice[]> => {
      const response = await api.get('/users/mfa/devices/');
      return response.data;
    },
  });
};

// Setup MFA mutation
export const useSetupMFA = () => {
  return useMutation({
    mutationFn: async (data: MFASetupData): Promise<MFASetupResponse> => {
      const response = await api.post('/users/mfa/setup/', data);
      return response.data;
    },
  });
};

// Verify MFA setup mutation
export const useVerifyMFASetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MFAVerificationData): Promise<MFAVerificationResponse> => {
      const response = await api.post('/users/mfa/verify/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'mfa', 'devices'] });
      toast.success('MFA enabled successfully');
    },
  });
};

// Disable MFA mutation
export const useDisableMFA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (password: string) => {
      const response = await api.post('/users/mfa/disable/', { password });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'mfa', 'devices'] });
      toast.success('MFA disabled successfully');
    },
  });
};

// Regenerate backup codes mutation
export const useRegenerateBackupCodes = () => {
  return useMutation({
    mutationFn: async (password: string) => {
      const response = await api.post('/users/mfa/backup-codes/regenerate/', { password });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Backup codes regenerated successfully');
    },
  });
};

// Resend SMS OTP mutation
export const useResendSMSOTP = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/users/mfa/resend-sms/');
      return response.data;
    },
    onSuccess: () => {
      toast.success('SMS verification code sent successfully');
    },
  });
};

// Send SMS MFA code mutation
export const useSendSMSMFACode = () => {
  return useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await api.post('/users/mfa/send-sms-code/', { device_id: deviceId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('SMS MFA code sent successfully');
    },
  });
};