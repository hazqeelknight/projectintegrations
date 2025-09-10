import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryKeys } from '@/api/queryClient';
import {
  calendarIntegrationsApi,
  videoIntegrationsApi,
  webhookIntegrationsApi,
  integrationLogsApi,
  oauthApi,
  healthMonitoringApi,
} from '../api/integrationsApi';
import type {
  OAuthInitiateData,
  OAuthCallbackData,
  WebhookFormData,
  CalendarIntegrationSettings,
  VideoIntegrationSettings,
} from '../types';

// Calendar Integrations Hooks
export const useCalendarIntegrations = () => {
  return useQuery({
    queryKey: queryKeys.integrations.calendar(),
    queryFn: calendarIntegrationsApi.getAll,
  });
};

export const useCalendarIntegration = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.integrations.calendar(), id],
    queryFn: () => calendarIntegrationsApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateCalendarIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CalendarIntegrationSettings }) =>
      calendarIntegrationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.health() });
      toast.success('Calendar integration updated successfully');
    },
  });
};

export const useDeleteCalendarIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calendarIntegrationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.health() });
      toast.success('Calendar integration disconnected successfully');
    },
  });
};

export const useRefreshCalendarSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calendarIntegrationsApi.refresh(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.logs() });
      toast.success(data.message || 'Calendar sync refreshed successfully');
    },
  });
};

export const useForceCalendarSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calendarIntegrationsApi.forceSync(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.logs() });
      toast.success(data.message || 'Calendar sync initiated successfully');
    },
  });
};

// Video Conference Integrations Hooks
export const useVideoIntegrations = () => {
  return useQuery({
    queryKey: queryKeys.integrations.video(),
    queryFn: videoIntegrationsApi.getAll,
  });
};

export const useVideoIntegration = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.integrations.video(), id],
    queryFn: () => videoIntegrationsApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateVideoIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VideoIntegrationSettings }) =>
      videoIntegrationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.video() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.health() });
      toast.success('Video integration updated successfully');
    },
  });
};

export const useDeleteVideoIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => videoIntegrationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.video() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.health() });
      toast.success('Video integration disconnected successfully');
    },
  });
};

// Webhook Integrations Hooks
export const useWebhookIntegrations = () => {
  return useQuery({
    queryKey: queryKeys.integrations.webhooks(),
    queryFn: webhookIntegrationsApi.getAll,
  });
};

export const useWebhookIntegration = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.integrations.webhooks(), id],
    queryFn: () => webhookIntegrationsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateWebhookIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WebhookFormData) => webhookIntegrationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.webhooks() });
      toast.success('Webhook integration created successfully');
    },
  });
};

export const useUpdateWebhookIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebhookFormData> }) =>
      webhookIntegrationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.webhooks() });
      toast.success('Webhook integration updated successfully');
    },
  });
};

export const useDeleteWebhookIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhookIntegrationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.webhooks() });
      toast.success('Webhook integration deleted successfully');
    },
  });
};

export const useTestWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhookIntegrationsApi.test(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.logs() });
      toast.success('Test webhook sent successfully');
    },
  });
};

// Integration Logs Hooks
export const useIntegrationLogs = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.integrations.logs(),
    queryFn: () => integrationLogsApi.getAll(filters),
  });
};

// OAuth Hooks
export const useInitiateOAuth = () => {
  return useMutation({
    mutationFn: (data: OAuthInitiateData) => oauthApi.initiate(data),
    onSuccess: (data) => {
      // Redirect to OAuth provider
      window.location.href = data.authorization_url;
    },
  });
};

export const useOAuthCallback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OAuthCallbackData) => oauthApi.callback(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.video() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.health() });
      
      const action = data.created ? 'connected' : 'reconnected';
      toast.success(`${data.provider} ${data.integration_type} integration ${action} successfully`);
    },
  });
};

// Health and Monitoring Hooks
export const useIntegrationHealth = () => {
  return useQuery({
    queryKey: queryKeys.integrations.health(),
    queryFn: healthMonitoringApi.getHealth,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useCalendarConflicts = () => {
  return useQuery({
    queryKey: queryKeys.integrations.conflicts(),
    queryFn: healthMonitoringApi.getCalendarConflicts,
  });
};