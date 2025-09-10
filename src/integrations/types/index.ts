// Integrations Module TypeScript Types

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'apple';
  provider_display: string;
  provider_email: string;
  calendar_id: string;
  last_sync_at: string | null;
  sync_errors: number;
  is_active: boolean;
  sync_enabled: boolean;
  is_token_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoConferenceIntegration {
  id: string;
  provider: 'zoom' | 'google_meet' | 'microsoft_teams' | 'webex';
  provider_display: string;
  provider_email: string;
  api_calls_today: number;
  is_active: boolean;
  auto_generate_links: boolean;
  is_token_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookIntegration {
  id: string;
  name: string;
  webhook_url: string;
  events: string[];
  is_active: boolean;
  retry_failed: boolean;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  log_type: 'calendar_sync' | 'video_link_created' | 'webhook_sent' | 'error';
  log_type_display: string;
  integration_type: string;
  booking_id: string | null;
  message: string;
  details: Record<string, any>;
  success: boolean;
  created_at: string;
}

export interface IntegrationHealth {
  organizer_email: string;
  timestamp: string;
  calendar_integrations: Array<{
    provider: string;
    is_active: boolean;
    sync_enabled: boolean;
    token_expired: boolean;
    last_sync: string | null;
    sync_errors: number;
    health: 'healthy' | 'unhealthy';
  }>;
  video_integrations: Array<{
    provider: string;
    is_active: boolean;
    auto_generate_links: boolean;
    token_expired: boolean;
    api_calls_today: number;
    health: 'healthy' | 'unhealthy';
  }>;
  overall_health: 'healthy' | 'degraded';
}

export interface CalendarConflicts {
  conflicts: Array<{
    external_event: {
      id: string;
      summary: string;
      start: string;
      end: string;
    };
    manual_block: {
      id: string;
      reason: string;
      start: string;
      end: string;
    };
    overlap_type: 'complete_overlap' | 'contained_overlap' | 'partial_overlap';
  }>;
  overlaps: Array<{
    external_event: any;
    manual_block: any;
    overlap_type: string;
  }>;
  manual_blocks_count: number;
  synced_blocks_count: number;
  total_external_events: number;
  total_manual_blocks: number;
}

export interface OAuthInitiateData {
  provider: 'google' | 'outlook' | 'zoom' | 'microsoft_teams';
  integration_type: 'calendar' | 'video';
  redirect_uri: string;
}

export interface OAuthInitiateResponse {
  authorization_url: string;
  provider: string;
  integration_type: string;
  state: string;
}

export interface OAuthCallbackData {
  provider: string;
  integration_type: string;
  code: string;
  state?: string;
}

export interface WebhookTestData {
  message: string;
}

// Form data types
export interface WebhookFormData {
  name: string;
  webhook_url: string;
  events: string[];
  secret_key?: string;
  headers?: Record<string, string>;
  is_active: boolean;
  retry_failed: boolean;
  max_retries: number;
}

export interface CalendarIntegrationSettings {
  is_active: boolean;
  sync_enabled: boolean;
}

export interface VideoIntegrationSettings {
  is_active: boolean;
  auto_generate_links: boolean;
}

// Constants
export const CALENDAR_PROVIDERS = [
  { value: 'google', label: 'Google Calendar', icon: 'google' },
  { value: 'outlook', label: 'Microsoft Outlook', icon: 'microsoft' },
  { value: 'apple', label: 'Apple Calendar', icon: 'apple' },
] as const;

export const VIDEO_PROVIDERS = [
  { value: 'zoom', label: 'Zoom', icon: 'zoom' },
  { value: 'google_meet', label: 'Google Meet', icon: 'google' },
  { value: 'microsoft_teams', label: 'Microsoft Teams', icon: 'microsoft' },
  { value: 'webex', label: 'Cisco Webex', icon: 'webex' },
] as const;

export const WEBHOOK_EVENTS = [
  { value: 'booking_created', label: 'Booking Created' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
  { value: 'booking_rescheduled', label: 'Booking Rescheduled' },
  { value: 'booking_completed', label: 'Booking Completed' },
] as const;

export const INTEGRATION_LOG_TYPES = [
  { value: 'calendar_sync', label: 'Calendar Sync' },
  { value: 'video_link_created', label: 'Video Link Created' },
  { value: 'webhook_sent', label: 'Webhook Sent' },
  { value: 'error', label: 'Error' },
] as const;