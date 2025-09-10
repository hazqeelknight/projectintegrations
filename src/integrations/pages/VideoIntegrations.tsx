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
import { PageHeader } from '@/components/core';
import { VideoIntegrationCard } from '../components/VideoIntegrationCard';
import { ConnectIntegrationButton } from '../components/ConnectIntegrationButton';
import { useVideoIntegrations } from '../hooks/useIntegrationsApi';

const VideoIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { data: integrations = [], isLoading, error } = useVideoIntegrations();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const activeIntegrations = integrations.filter(i => i.is_active);
  const inactiveIntegrations = integrations.filter(i => !i.is_active);

  return (
    <>
      <PageHeader
        title="Video Integrations"
        subtitle="Set up video conferencing to automatically generate meeting links for your bookings"
        actions={
          <ConnectIntegrationButton type="video" />
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load video integrations. Please try again.
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Connected (${activeIntegrations.length})`} />
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
                No Video Integrations Connected
              </Typography>
              <Typography variant="body2" gutterBottom>
                Connect a video conferencing service to automatically generate meeting links for your bookings.
              </Typography>
              <Box mt={2}>
                <ConnectIntegrationButton type="video" variant="outlined" />
              </Box>
            </Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  How Video Integrations Work
                </Typography>
                <Typography variant="body2">
                  When enabled, NovaMeet will automatically generate video meeting links for new bookings. 
                  The meeting details will be included in confirmation emails and calendar events.
                </Typography>
              </Alert>
              
              <Grid container spacing={3}>
                {activeIntegrations.map((integration) => (
                  <Grid item xs={12} md={6} lg={4} key={integration.id}>
                    <VideoIntegrationCard integration={integration} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </motion.div>
      )}

      {/* Inactive Integrations Tab */}
      {activeTab === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {inactiveIntegrations.length === 0 ? (
            <Alert severity="info">
              No inactive video integrations.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {inactiveIntegrations.map((integration) => (
                <Grid item xs={12} md={6} lg={4} key={integration.id}>
                  <VideoIntegrationCard integration={integration} />
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      )}
    </>
  );
};

export default VideoIntegrations;