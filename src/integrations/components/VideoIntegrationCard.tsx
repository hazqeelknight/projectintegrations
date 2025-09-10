import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Switch,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  Delete,
  Warning,
  CheckCircle,
  Error,
  VideoCall,
  Api,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/utils/formatters';
import { VideoConferenceIntegration } from '../types';
import {
  useUpdateVideoIntegration,
  useDeleteVideoIntegration,
} from '../hooks/useIntegrationsApi';

interface VideoIntegrationCardProps {
  integration: VideoConferenceIntegration;
}

export const VideoIntegrationCard: React.FC<VideoIntegrationCardProps> = ({
  integration,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const updateIntegration = useUpdateVideoIntegration();
  const deleteIntegration = useDeleteVideoIntegration();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleActive = () => {
    updateIntegration.mutate({
      id: integration.id,
      data: { 
        is_active: !integration.is_active,
        auto_generate_links: integration.auto_generate_links,
      },
    });
  };

  const handleToggleAutoGenerate = () => {
    updateIntegration.mutate({
      id: integration.id,
      data: { 
        is_active: integration.is_active,
        auto_generate_links: !integration.auto_generate_links,
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to disconnect this video integration?')) {
      deleteIntegration.mutate(integration.id);
    }
    handleMenuClose();
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      zoom: '🔵',
      google_meet: '🟢',
      microsoft_teams: '🟣',
      webex: '🔶',
    };
    return icons[provider as keyof typeof icons] || '📹';
  };

  const getHealthStatus = () => {
    if (!integration.is_active) return { color: 'default', label: 'Inactive', icon: <Error /> };
    if (integration.is_token_expired) return { color: 'error', label: 'Token Expired', icon: <Warning /> };
    return { color: 'success', label: 'Healthy', icon: <CheckCircle /> };
  };

  const healthStatus = getHealthStatus();

  // Calculate API usage percentage (assuming 1000 daily limit)
  const apiUsagePercentage = Math.min((integration.api_calls_today / 1000) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {getProviderIcon(integration.provider)}
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {integration.provider_display}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {integration.provider_email}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={healthStatus.icon}
                label={healthStatus.label}
                color={healthStatus.color as any}
                size="small"
              />
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {integration.is_token_expired && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Authentication token has expired. Please reconnect this integration.
            </Alert>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
              <Switch
                checked={integration.is_active}
                onChange={handleToggleActive}
                disabled={updateIntegration.isPending}
                size="small"
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Auto-generate Links
              </Typography>
              <Switch
                checked={integration.auto_generate_links}
                onChange={handleToggleAutoGenerate}
                disabled={updateIntegration.isPending || !integration.is_active}
                size="small"
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                API Usage Today
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {integration.api_calls_today} / 1000
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={apiUsagePercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: apiUsagePercentage > 80 ? 'error.main' : 'primary.main',
                },
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <VideoCall fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Connected {formatRelativeTime(integration.created_at)}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleDelete} disabled={deleteIntegration.isPending}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Disconnect</ListItemText>
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
    </motion.div>
  );
};