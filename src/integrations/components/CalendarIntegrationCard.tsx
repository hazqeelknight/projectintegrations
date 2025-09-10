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
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  Sync,
  Delete,
  Warning,
  CheckCircle,
  Error,
  Schedule,
  CalendarToday,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/utils/formatters';
import { CalendarIntegration } from '../types';
import {
  useUpdateCalendarIntegration,
  useDeleteCalendarIntegration,
  useRefreshCalendarSync,
  useForceCalendarSync,
} from '../hooks/useIntegrationsApi';

interface CalendarIntegrationCardProps {
  integration: CalendarIntegration;
}

export const CalendarIntegrationCard: React.FC<CalendarIntegrationCardProps> = ({
  integration,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const updateIntegration = useUpdateCalendarIntegration();
  const deleteIntegration = useDeleteCalendarIntegration();
  const refreshSync = useRefreshCalendarSync();
  const forceSync = useForceCalendarSync();

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
        sync_enabled: integration.sync_enabled,
      },
    });
  };

  const handleToggleSync = () => {
    updateIntegration.mutate({
      id: integration.id,
      data: { 
        is_active: integration.is_active,
        sync_enabled: !integration.sync_enabled,
      },
    });
  };

  const handleRefresh = () => {
    refreshSync.mutate(integration.id);
    handleMenuClose();
  };

  const handleForceSync = () => {
    forceSync.mutate(integration.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to disconnect this calendar integration?')) {
      deleteIntegration.mutate(integration.id);
    }
    handleMenuClose();
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      google: '🔵',
      outlook: '🔷',
      apple: '🍎',
    };
    return icons[provider as keyof typeof icons] || '📅';
  };

  const getHealthStatus = () => {
    if (!integration.is_active) return { color: 'default', label: 'Inactive', icon: <Error /> };
    if (integration.is_token_expired) return { color: 'error', label: 'Token Expired', icon: <Warning /> };
    if (integration.sync_errors > 0) return { color: 'warning', label: 'Sync Issues', icon: <Warning /> };
    return { color: 'success', label: 'Healthy', icon: <CheckCircle /> };
  };

  const healthStatus = getHealthStatus();

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
              <Avatar sx={{ bgcolor: 'primary.main' }}>
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

          {integration.sync_errors > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {integration.sync_errors} consecutive sync errors detected.
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
                Sync Enabled
              </Typography>
              <Switch
                checked={integration.sync_enabled}
                onChange={handleToggleSync}
                disabled={updateIntegration.isPending || !integration.is_active}
                size="small"
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Last sync: {integration.last_sync_at ? formatRelativeTime(integration.last_sync_at) : 'Never'}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday fontSize="small" color="action" />
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
            <MenuItem onClick={handleRefresh} disabled={refreshSync.isPending}>
              <ListItemIcon>
                <Sync fontSize="small" />
              </ListItemIcon>
              <ListItemText>Refresh Token</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleForceSync} disabled={forceSync.isPending}>
              <ListItemIcon>
                <Sync fontSize="small" />
              </ListItemIcon>
              <ListItemText>Force Sync</ListItemText>
            </MenuItem>
            
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