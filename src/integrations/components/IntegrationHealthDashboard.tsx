import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  CalendarToday,
  VideoCall,
  Schedule,
  Api,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/utils/formatters';
import { useIntegrationHealth } from '../hooks/useIntegrationsApi';
import { LoadingSpinner } from '@/components/core';

export const IntegrationHealthDashboard: React.FC = () => {
  const { data: health, isLoading, error } = useIntegrationHealth();

  if (isLoading) {
    return <LoadingSpinner message="Loading integration health..." />;
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load integration health data
      </Alert>
    );
  }

  if (!health) {
    return null;
  }

  const getHealthColor = (healthStatus: string) => {
    switch (healthStatus) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      default: return 'error';
    }
  };

  const getHealthIcon = (healthStatus: string) => {
    switch (healthStatus) {
      case 'healthy': return <CheckCircle />;
      case 'degraded': return <Warning />;
      default: return <Error />;
    }
  };

  const totalIntegrations = health.calendar_integrations.length + health.video_integrations.length;
  const healthyIntegrations = [
    ...health.calendar_integrations.filter(i => i.health === 'healthy'),
    ...health.video_integrations.filter(i => i.health === 'healthy'),
  ].length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Integration Health</Typography>
            <Chip
              icon={getHealthIcon(health.overall_health)}
              label={health.overall_health.toUpperCase()}
              color={getHealthColor(health.overall_health) as any}
            />
          </Box>

          {health.overall_health !== 'healthy' && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Some integrations require attention. Check the details below.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Overall Stats */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Overall Status
                </Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Healthy Integrations
                    </Typography>
                    <Typography variant="body2">
                      {healthyIntegrations} / {totalIntegrations}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalIntegrations > 0 ? (healthyIntegrations / totalIntegrations) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: healthyIntegrations === totalIntegrations ? 'success.main' : 'warning.main',
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {formatRelativeTime(health.timestamp)}
                </Typography>
              </Box>
            </Grid>

            {/* Calendar Integrations */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Calendar Integrations
              </Typography>
              {health.calendar_integrations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No calendar integrations configured
                </Typography>
              ) : (
                <List dense>
                  {health.calendar_integrations.map((integration, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon>
                        <CalendarToday 
                          fontSize="small" 
                          color={integration.health === 'healthy' ? 'success' : 'error'} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={integration.provider}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Active: {integration.is_active ? 'Yes' : 'No'} | 
                              Sync: {integration.sync_enabled ? 'Enabled' : 'Disabled'}
                            </Typography>
                            {integration.token_expired && (
                              <Typography variant="caption" color="error">
                                Token expired
                              </Typography>
                            )}
                            {integration.sync_errors > 0 && (
                              <Typography variant="caption" color="warning.main">
                                {integration.sync_errors} sync errors
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            {/* Video Integrations */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Video Conference Integrations
              </Typography>
              {health.video_integrations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No video integrations configured
                </Typography>
              ) : (
                <List dense>
                  {health.video_integrations.map((integration, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon>
                        <VideoCall 
                          fontSize="small" 
                          color={integration.health === 'healthy' ? 'success' : 'error'} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={integration.provider}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Active: {integration.is_active ? 'Yes' : 'No'} | 
                              Auto-generate: {integration.auto_generate_links ? 'Yes' : 'No'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              API calls today: {integration.api_calls_today}
                            </Typography>
                            {integration.token_expired && (
                              <Typography variant="caption" color="error">
                                Token expired
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};