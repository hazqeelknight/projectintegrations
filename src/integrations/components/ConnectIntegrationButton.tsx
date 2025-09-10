import React from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { Add, CalendarToday, VideoCall } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CALENDAR_PROVIDERS, VIDEO_PROVIDERS } from '../types';
import { useInitiateOAuth } from '../hooks/useIntegrationsApi';

interface ConnectIntegrationButtonProps {
  type: 'calendar' | 'video';
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const ConnectIntegrationButton: React.FC<ConnectIntegrationButtonProps> = ({
  type,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const initiateOAuth = useInitiateOAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProviderSelect = (provider: string) => {
    initiateOAuth.mutate({
      provider: provider as any,
      integration_type: type,
      redirect_uri: `${window.location.origin}/integrations/${type}`,
    });
    handleClose();
  };

  const providers = type === 'calendar' ? CALENDAR_PROVIDERS : VIDEO_PROVIDERS;
  const icon = type === 'calendar' ? <CalendarToday /> : <VideoCall />;
  const label = type === 'calendar' ? 'Connect Calendar' : 'Connect Video';

  const getProviderIcon = (provider: string) => {
    const icons = {
      google: '🔵',
      outlook: '🔷',
      apple: '🍎',
      zoom: '🔵',
      google_meet: '🟢',
      microsoft_teams: '🟣',
      webex: '🔶',
    };
    return icons[provider as keyof typeof icons] || '📅';
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={icon}
        onClick={handleClick}
        disabled={initiateOAuth.isPending}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 200 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Choose Provider
          </Typography>
        </Box>
        {providers.map((provider) => (
          <MenuItem
            key={provider.value}
            onClick={() => handleProviderSelect(provider.value)}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                {getProviderIcon(provider.value)}
              </Avatar>
            </ListItemIcon>
            <ListItemText>{provider.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};