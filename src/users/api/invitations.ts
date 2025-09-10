import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { toast } from 'react-toastify';
import { Invitation, CreateInvitationData, InvitationResponseData } from '../types';

// Get user's sent invitations
export const useInvitations = () => {
  return useQuery({
    queryKey: ['users', 'invitations'],
    queryFn: async (): Promise<Invitation[]> => {
      const response = await api.get('/users/invitations/');
      return response.data;
    },
  });
};

// Create invitation mutation
export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateInvitationData) => {
      const response = await api.post('/users/invitations/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'invitations'] });
      toast.success('Invitation sent successfully');
    },
  });
};

// Respond to invitation mutation
export const useRespondToInvitation = () => {
  return useMutation({
    mutationFn: async (data: InvitationResponseData) => {
      const response = await api.post('/users/invitations/respond/', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (variables.action === 'accept') {
        toast.success('Invitation accepted successfully');
      } else {
        toast.success('Invitation declined');
      }
    },
  });
};