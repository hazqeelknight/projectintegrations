import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { toast } from 'react-toastify';
import { UserSession } from '../types';

// Get user sessions
export const useUserSessions = () => {
  return useQuery({
    queryKey: queryKeys.users.sessions(),
    queryFn: async (): Promise<UserSession[]> => {
      const response = await api.get('/users/sessions/');
      return response.data;
    },
  });
};

// Revoke session mutation
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/users/sessions/${sessionId}/revoke/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      toast.success('Session revoked successfully');
    },
  });
};

// Revoke all sessions mutation
export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/users/sessions/revoke-all/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      toast.success('All other sessions revoked successfully');
    },
  });
};