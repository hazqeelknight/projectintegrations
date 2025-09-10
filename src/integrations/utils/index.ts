// Integrations Module Utilities

/**
 * Get provider display name
 */
export const getProviderDisplayName = (provider: string): string => {
  const providerNames = {
    google: 'Google Calendar',
    outlook: 'Microsoft Outlook',
    apple: 'Apple Calendar',
    zoom: 'Zoom',
    google_meet: 'Google Meet',
    microsoft_teams: 'Microsoft Teams',
    webex: 'Cisco Webex',
  };
  
  return providerNames[provider as keyof typeof providerNames] || provider;
};

/**
 * Get provider icon/emoji
 */
export const getProviderIcon = (provider: string): string => {
  const providerIcons = {
    google: '🔵',
    outlook: '🔷',
    apple: '🍎',
    zoom: '🔵',
    google_meet: '🟢',
    microsoft_teams: '🟣',
    webex: '🔶',
  };
  
  return providerIcons[provider as keyof typeof providerIcons] || '🔗';
};

/**
 * Get integration health color
 */
export const getHealthColor = (health: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (health) {
    case 'healthy': return 'success';
    case 'degraded': return 'warning';
    case 'unhealthy': return 'error';
    default: return 'default';
  }
};

/**
 * Format API usage percentage
 */
export const formatApiUsage = (current: number, limit: number): {
  percentage: number;
  color: 'success' | 'warning' | 'error';
  label: string;
} => {
  const percentage = Math.min((current / limit) * 100, 100);
  
  let color: 'success' | 'warning' | 'error' = 'success';
  if (percentage > 80) color = 'error';
  else if (percentage > 60) color = 'warning';
  
  return {
    percentage,
    color,
    label: `${current} / ${limit}`,
  };
};

/**
 * Validate webhook URL
 */
export const validateWebhookUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: false, error: 'Webhook URL is required' };
  }
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Format webhook events for display
 */
export const formatWebhookEvents = (events: string[]): string => {
  if (events.length === 0) return 'No events selected';
  if (events.length === 1) return events[0].replace('_', ' ');
  if (events.length <= 3) return events.map(e => e.replace('_', ' ')).join(', ');
  return `${events.slice(0, 2).map(e => e.replace('_', ' ')).join(', ')} and ${events.length - 2} more`;
};

/**
 * Get integration status summary
 */
export const getIntegrationStatusSummary = (
  calendarIntegrations: any[],
  videoIntegrations: any[],
  webhookIntegrations: any[]
): {
  total: number;
  active: number;
  healthy: number;
  needsAttention: number;
} => {
  const allIntegrations = [
    ...calendarIntegrations,
    ...videoIntegrations,
    ...webhookIntegrations,
  ];
  
  const active = allIntegrations.filter(i => i.is_active).length;
  const healthy = allIntegrations.filter(i => 
    i.is_active && !i.is_token_expired && (i.sync_errors === undefined || i.sync_errors === 0)
  ).length;
  const needsAttention = allIntegrations.filter(i => 
    !i.is_active || i.is_token_expired || (i.sync_errors !== undefined && i.sync_errors > 0)
  ).length;
  
  return {
    total: allIntegrations.length,
    active,
    healthy,
    needsAttention,
  };
};

/**
 * Generate OAuth state parameter
 */
export const generateOAuthState = (provider: string, integrationType: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${provider}:${integrationType}:${timestamp}:${random}`;
};

/**
 * Parse OAuth state parameter
 */
export const parseOAuthState = (state: string): {
  provider: string;
  integrationType: string;
  timestamp: number;
  random: string;
} | null => {
  try {
    const [provider, integrationType, timestamp, random] = state.split(':');
    return {
      provider,
      integrationType,
      timestamp: parseInt(timestamp, 10),
      random,
    };
  } catch {
    return null;
  }
};

/**
 * Check if OAuth state is valid (not expired)
 */
export const isOAuthStateValid = (state: string, maxAgeMinutes = 10): boolean => {
  const parsed = parseOAuthState(state);
  if (!parsed) return false;
  
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000;
  
  return (now - parsed.timestamp) < maxAge;
};

/**
 * Format integration error for display
 */
export const formatIntegrationError = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message) return error.message;
  
  return 'An unexpected error occurred';
};

/**
 * Get recommended actions for integration issues
 */
export const getRecommendedActions = (integration: {
  is_active: boolean;
  is_token_expired?: boolean;
  sync_errors?: number;
}): string[] => {
  const actions: string[] = [];
  
  if (!integration.is_active) {
    actions.push('Enable the integration to start using it');
  }
  
  if (integration.is_token_expired) {
    actions.push('Reconnect the integration to refresh expired tokens');
  }
  
  if (integration.sync_errors && integration.sync_errors > 0) {
    actions.push('Check integration logs for sync error details');
    if (integration.sync_errors >= 3) {
      actions.push('Consider reconnecting the integration to resolve persistent errors');
    }
  }
  
  return actions;
};