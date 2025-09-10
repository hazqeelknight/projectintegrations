import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'react-toastify';
import { 
  SAMLConfiguration, 
  OIDCConfiguration, 
  SSOSession,
  SSOInitiateData,
  SSOInitiateResponse,
  SSODiscoveryResponse
} from '../types';

// SAML Configuration queries and mutations
export const useSAMLConfigurations = () => {
  return useQuery({
    queryKey: ['users', 'sso', 'saml'],
    queryFn: async (): Promise<SAMLConfiguration[]> => {
      const response = await api.get('/users/sso/saml/');
      return response.data;
    },
  });
};

export const useCreateSAMLConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<SAMLConfiguration>) => {
      const response = await api.post('/users/sso/saml/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'saml'] });
      toast.success('SAML configuration created successfully');
    },
  });
};

export const useUpdateSAMLConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SAMLConfiguration> }) => {
      const response = await api.patch(`/users/sso/saml/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'saml'] });
      toast.success('SAML configuration updated successfully');
    },
  });
};

export const useDeleteSAMLConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/sso/saml/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'saml'] });
      toast.success('SAML configuration deleted successfully');
    },
  });
};

// OIDC Configuration queries and mutations
export const useOIDCConfigurations = () => {
  return useQuery({
    queryKey: ['users', 'sso', 'oidc'],
    queryFn: async (): Promise<OIDCConfiguration[]> => {
      const response = await api.get('/users/sso/oidc/');
      return response.data;
    },
  });
};

export const useCreateOIDCConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<OIDCConfiguration>) => {
      const response = await api.post('/users/sso/oidc/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'oidc'] });
      toast.success('OIDC configuration created successfully');
    },
  });
};

export const useUpdateOIDCConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OIDCConfiguration> }) => {
      const response = await api.patch(`/users/sso/oidc/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'oidc'] });
      toast.success('OIDC configuration updated successfully');
    },
  });
};

export const useDeleteOIDCConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/sso/oidc/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'oidc'] });
      toast.success('OIDC configuration deleted successfully');
    },
  });
};

// SSO Discovery
export const useSSODiscovery = (domain: string) => {
  return useQuery({
    queryKey: ['users', 'sso', 'discovery', domain],
    queryFn: async (): Promise<SSODiscoveryResponse> => {
      const response = await api.get(`/users/sso/discovery/?domain=${domain}`);
      return response.data;
    },
    enabled: !!domain,
  });
};

// Initiate SSO mutation
export const useInitiateSSO = () => {
  return useMutation({
    mutationFn: async (data: SSOInitiateData): Promise<SSOInitiateResponse> => {
      const response = await api.post('/users/sso/initiate/', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to SSO provider
      window.location.href = data.auth_url;
    },
  });
};

// Get SSO sessions
export const useSSOSessions = () => {
  return useQuery({
    queryKey: ['users', 'sso', 'sessions'],
    queryFn: async (): Promise<{ sessions: SSOSession[] }> => {
      const response = await api.get('/users/sso/sessions/');
      return response.data;
    },
  });
};

// Revoke SSO session mutation
export const useRevokeSSOSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/users/sso/sessions/${sessionId}/revoke/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'sso', 'sessions'] });
      toast.success('SSO session revoked successfully');
    },
  });
};

// SSO logout mutation
export const useSSOLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/users/sso/logout/');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.logout_urls && data.logout_urls.length > 0) {
        toast.info('Logging out from SSO providers...');
        // Handle multiple logout URLs if needed
        data.logout_urls.forEach((logout: any) => {
          window.open(logout.url, '_blank');
        });
      }
    },
  });
};