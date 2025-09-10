import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { toast } from 'react-toastify';
import { Profile, ProfileImageUploadData } from '../types';

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async (): Promise<Profile> => {
      const response = await api.get('/users/profile/');
      return response.data;
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const response = await api.patch('/users/profile/', updates);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.profile(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      toast.success('Profile updated successfully');
    },
  });
};

// Upload profile picture mutation
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileImageUploadData) => {
      const formData = new FormData();
      formData.append('profile_picture', data.file);
      
      const response = await api.patch('/users/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.profile(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      toast.success('Profile picture updated successfully');
    },
  });
};

// Upload brand logo mutation
export const useUploadBrandLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileImageUploadData) => {
      const formData = new FormData();
      formData.append('brand_logo', data.file);
      
      const response = await api.patch('/users/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.profile(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      toast.success('Brand logo updated successfully');
    },
  });
};

// Remove profile picture mutation
export const useRemoveProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch('/users/profile/', { profile_picture: null });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.profile(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      toast.success('Profile picture removed successfully');
    },
  });
};

// Remove brand logo mutation
export const useRemoveBrandLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch('/users/profile/', { brand_logo: null });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.profile(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      toast.success('Brand logo removed successfully');
    },
  });
};

// Get public profile by organizer slug
export const usePublicProfile = (organizerSlug: string) => {
  return useQuery({
    queryKey: ['users', 'public-profile', organizerSlug],
    queryFn: async (): Promise<Profile> => {
      const response = await api.get(`/users/public/${organizerSlug}/`);
      return response.data;
    },
    enabled: !!organizerSlug,
  });
};