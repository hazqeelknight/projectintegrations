import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { AuditLog } from '../types';

// Get user audit logs
export const useAuditLogs = () => {
  return useQuery({
    queryKey: queryKeys.users.auditLogs(),
    queryFn: async (): Promise<AuditLog[]> => {
      const response = await api.get('/users/audit-logs/');
      return response.data;
    },
  });
};