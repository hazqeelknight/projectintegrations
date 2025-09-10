import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import {
  CalendarToday,
  VideoCall,
  Send,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/core';
import { ConnectIntegrationButton } from '../components/ConnectIntegrationButton';
import {
  useCalendarIntegrations,
  useVideoIntegrations,
  useWebhookIntegrations,
  useIntegrationHealth,
} from '../hooks/useIntegrationsApi';

const IntegrationsOverview: React.FC = () => {
  const { data: calendarIntegrations = [] } = useCalendarIntegrations();
  const { data: videoIntegrations = [] } = useVideoIntegrations();
  const { data: webhookIntegrations = [] } = useWebhookIntegrations();
  const { data: health } = useIntegrationHealth();

  const stats = [
    {
      title: 'Calendar Integrations',
      value: calendarIntegrations.length,
      active: calendarIntegrations.filter(i => i.is_active).length,
      icon: CalendarToday,
      color: 'primary.main',
      path: '/integrations/calendar',
    },
    {
      title: 'Video Integrations',
      value: videoIntegrations.length,
      active: videoIntegrations.filter(i => i.is_active).length,
      icon: VideoCall,
      color: 'secondary.main',
      path: '/integrations/video',
    },
    {
      title: 'Webhook Integrations',
      value: webhookIntegrations.length,
      active: webhookIntegrations.filter(i => i.is_active).length,
      icon: Send,
      color: 'info.main',
      path: '/integrations/webhooks',
    },
  ];

  const getHealthStatusChip = () => {
    if (!health) return null;
    
    const { overall_health } = health;
    const config = {
      healthy: { color: 'success', icon: <CheckCircle />, label: 'All Systems Healthy' },
      degraded: { color: 'warning', icon: <Warning />, label: 'Some Issues Detected' },
      unhealthy: { color: 'error', icon: <Error />, label: 'Critical Issues' },
    };
    
    const statusConfig = config[overall_health as keyof typeof config] || config.unhealthy;
    
    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color as any}
        sx={{ ml: 2 }}
      />
    );
  };

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Connect NovaMeet with your favorite tools and services"
        actions={getHealthStatusChip()}
      />

      {health?.overall_health === 'degraded' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some integrations require attention. Check the individual integration pages for details.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card sx={{ cursor: 'pointer' }} onClick={() => window.location.href = stat.path}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="overline">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.active} active
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: stat.color,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <stat.icon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Setup
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Connect your essential tools to get started
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                  <ConnectIntegrationButton type="calendar" variant="outlined" />
                  <ConnectIntegrationButton type="video" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Integration Benefits */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Integration Benefits
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <CalendarToday sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Calendar Sync
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically sync your existing calendar events to prevent double bookings
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <VideoCall sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Video Meetings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically generate video meeting links for your bookings
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Send sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Webhooks
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connect with external systems and automate your workflows
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default IntegrationsOverview;