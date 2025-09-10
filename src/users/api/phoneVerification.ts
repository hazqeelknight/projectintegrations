import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'react-toastify';

export interface RequestPhoneVerificationData {
  phone_number: string;
}

export interface VerifyPhoneNumberData {
  phone_number: string;
  verification_code: string;
}

export interface PhoneVerificationResponse {
  message: string;
  phone_number?: string;
}

// Request phone verification mutation
export const useRequestPhoneVerification = () => {
  return useMutation({
    mutationFn: async (data: RequestPhoneVerificationData): Promise<PhoneVerificationResponse> => {
      const response = await api.post('/users/request-phone-verification/', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification code sent to your phone');
    },
  });
};

// Verify phone number mutation
export const useVerifyPhoneNumber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: VerifyPhoneNumberData): Promise<PhoneVerificationResponse> => {
      const response = await api.post('/users/verify-phone-number/', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate profile query to refresh phone verification status
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      toast.success('Phone number verified successfully');
    },
  });
};