import { api } from '@/api/client';
import type {
  CalendarIntegration,
  VideoConferenceIntegration,
  WebhookIntegration,
  IntegrationLog,
  IntegrationHealth,
  CalendarConflicts,
  OAuthInitiateData,
  OAuthInitiateResponse,
  OAuthCallbackData,
  WebhookFormData,
  CalendarIntegrationSettings,
  VideoIntegrationSettings,
  WebhookTestData,
} from '../types';

// Calendar Integrations API
export const calendarIntegrationsApi = {
  getAll: async (): Promise<CalendarIntegration[]> => {
    const response = await api.get('/integrations/calendar/');
    return response.data;
  },

  getById: async (id: string): Promise<CalendarIntegration> => {
    const response = await api.get(`/integrations/calendar/${id}/`);
    return response.data;
  },

  update: async (id: string, data: CalendarIntegrationSettings): Promise<CalendarIntegration> => {
    const response = await api.patch(`/integrations/calendar/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/integrations/calendar/${id}/`);
  },

  refresh: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/integrations/calendar/${id}/refresh/`);
    return response.data;
  },

  forceSync: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/integrations/calendar/${id}/force-sync/`);
    return response.data;
  },
};

// Video Conference Integrations API
export const videoIntegrationsApi = {
  getAll: async (): Promise<VideoConferenceIntegration[]> => {
    const response = await api.get('/integrations/video/');
    return response.data;
  },

  getById: async (id: string): Promise<VideoConferenceIntegration> => {
    const response = await api.get(`/integrations/video/${id}/`);
    return response.data;
  },

  update: async (id: string, data: VideoIntegrationSettings): Promise<VideoConferenceIntegration> => {
    const response = await api.patch(`/integrations/video/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/integrations/video/${id}/`);
  },
};

// Webhook Integrations API
export const webhookIntegrationsApi = {
  getAll: async (): Promise<WebhookIntegration[]> => {
    const response = await api.get('/integrations/webhooks/');
    return response.data;
  },

  getById: async (id: string): Promise<WebhookIntegration> => {
    const response = await api.get(`/integrations/webhooks/${id}/`);
    return response.data;
  },

  create: async (data: WebhookFormData): Promise<WebhookIntegration> => {
    const response = await api.post('/integrations/webhooks/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<WebhookFormData>): Promise<WebhookIntegration> => {
    const response = await api.patch(`/integrations/webhooks/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/integrations/webhooks/${id}/`);
  },

  test: async (id: string): Promise<WebhookTestData> => {
    const response = await api.post(`/integrations/webhooks/${id}/test/`);
    return response.data;
  },
};

// Integration Logs API
export const integrationLogsApi = {
  getAll: async (filters?: Record<string, any>): Promise<IntegrationLog[]> => {
    const response = await api.get('/integrations/logs/', { params: filters });
    return response.data;
  },
};

// OAuth API
export const oauthApi = {
  initiate: async (data: OAuthInitiateData): Promise<OAuthInitiateResponse> => {
    const response = await api.post('/integrations/oauth/initiate/', data);
    return response.data;
  },

  callback: async (data: OAuthCallbackData): Promise<{ message: string; provider: string; integration_type: string; provider_email: string; created: boolean }> => {
    const response = await api.post('/integrations/oauth/callback/', data);
    return response.data;
  },
};

// Health and Monitoring API
export const healthMonitoringApi = {
  getHealth: async (): Promise<IntegrationHealth> => {
    const response = await api.get('/integrations/health/');
    return response.data;
  },

  getCalendarConflicts: async (): Promise<CalendarConflicts> => {
    const response = await api.get('/integrations/calendar/conflicts/');
    return response.data;
  },
};