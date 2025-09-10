import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/core';
import { CalendarIntegrationCard } from '../components/CalendarIntegrationCard';
import { ConnectIntegrationButton } from '../components/ConnectIntegrationButton';
import { CalendarConflictsPanel } from '../components/CalendarConflictsPanel';
import { useCalendarIntegrations, useOAuthCallback } from '../hooks/useIntegrationsApi';

const CalendarIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: integrations = [], isLoading, error } = useCalendarIntegrations();
  const oauthCallback = useOAuthCallback();

  // Handle OAuth callback
  React.useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // Parse state parameter to extract provider and integration type
      const stateParts = state.split(':');
      if (stateParts.length >= 3) {
        const [provider, integrationType] = stateParts;
        
        if (integrationType === 'calendar') {
          // Make authenticated API call to complete OAuth flow
          oauthCallback.mutate({
            provider,
            integration_type: integrationType,
            code,
            state,
          });
          
          // Clear URL parameters
          setSearchParams({});
        }
      }
    }
  }, [searchParams, setSearchParams, oauthCallback]);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const activeIntegrations = integrations.filter(i => i.is_active);
  const inactiveIntegrations = integrations.filter(i => !i.is_active);

  return (
    <>
      <PageHeader
        title="Calendar Integrations"
        subtitle="Connect your calendars to prevent double bookings and sync events automatically"
        actions={
          <ConnectIntegrationButton type="calendar" />
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load calendar integrations. Please try again.
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Connected (${activeIntegrations.length})`} />
          <Tab label="Conflicts Analysis" />
          <Tab label={`Inactive (${inactiveIntegrations.length})`} />
        </Tabs>
      </Box>

      {/* Connected Integrations Tab */}
      {activeTab === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeIntegrations.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No Calendar Integrations Connected
              </Typography>
              <Typography variant="body2" gutterBottom>
                Connect your calendar to automatically sync events and prevent double bookings.
              </Typography>
              <Box mt={2}>
                <ConnectIntegrationButton type="calendar" variant="outlined" />
              </Box>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {activeIntegrations.map((integration) => (
                <Grid item xs={12} md={6} lg={4} key={integration.id}>
                  <CalendarIntegrationCard integration={integration} />
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      )}

      {/* Conflicts Analysis Tab */}
      {activeTab === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CalendarConflictsPanel />
        </motion.div>
      )}

      {/* Inactive Integrations Tab */}
      {activeTab === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {inactiveIntegrations.length === 0 ? (
            <Alert severity="info">
              No inactive calendar integrations.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {inactiveIntegrations.map((integration) => (
                <Grid item xs={12} md={6} lg={4} key={integration.id}>
                  <CalendarIntegrationCard integration={integration} />
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      )}
    </>
  );
};

export default CalendarIntegrations;