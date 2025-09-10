import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { toast } from 'react-toastify';
import { Role, Permission, CreateRoleData, CreatePermissionData } from '../types';

// Get all permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: queryKeys.users.permissions(),
    queryFn: async (): Promise<Permission[]> => {
      const response = await api.get('/users/permissions/');
      return response.data;
    },
  });
};

// Get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.users.roles(),
    queryFn: async (): Promise<Role[]> => {
      const response = await api.get('/users/roles/');
      return response.data;
    },
  });
};

// Get single role
export const useRole = (roleId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.users.roles(), roleId],
    queryFn: async (): Promise<Role> => {
      const response = await api.get(`/users/roles/${roleId}/`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!roleId,
  });
};

// Get single permission
export const usePermission = (permissionId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.users.permissions(), permissionId],
    queryFn: async (): Promise<Permission> => {
      const response = await api.get(`/users/permissions/${permissionId}/`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!permissionId,
  });
};

// Create role mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateRoleData) => {
      const response = await api.post('/users/roles/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles() });
      toast.success('Role created successfully');
    },
  });
};

// Update role mutation
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateRoleData }) => {
      const response = await api.patch(`/users/roles/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles() });
      toast.success('Role updated successfully');
    },
  });
};