import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Switch,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Send,
  CheckCircle,
  Error,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/utils/formatters';
import { WebhookIntegration, WEBHOOK_EVENTS } from '../types';
import {
  useUpdateWebhookIntegration,
  useDeleteWebhookIntegration,
  useTestWebhook,
} from '../hooks/useIntegrationsApi';

interface WebhookIntegrationCardProps {
  integration: WebhookIntegration;
  onEdit: (integration: WebhookIntegration) => void;
}

export const WebhookIntegrationCard: React.FC<WebhookIntegrationCardProps> = ({
  integration,
  onEdit,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const updateIntegration = useUpdateWebhookIntegration();
  const deleteIntegration = useDeleteWebhookIntegration();
  const testWebhook = useTestWebhook();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleActive = () => {
    updateIntegration.mutate({
      id: integration.id,
      data: { is_active: !integration.is_active },
    });
  };

  const handleEdit = () => {
    onEdit(integration);
    handleMenuClose();
  };

  const handleTest = () => {
    testWebhook.mutate(integration.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this webhook integration?')) {
      deleteIntegration.mutate(integration.id);
    }
    handleMenuClose();
  };

  const getEventLabels = (events: string[]) => {
    return events.map(event => {
      const eventConfig = WEBHOOK_EVENTS.find(e => e.value === event);
      return eventConfig?.label || event;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {integration.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LinkIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  {integration.webhook_url}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={integration.is_active ? <CheckCircle /> : <Error />}
                label={integration.is_active ? 'Active' : 'Inactive'}
                color={integration.is_active ? 'success' : 'default'}
                size="small"
              />
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Triggered Events:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {getEventLabels(integration.events).map((event, index) => (
                <Chip
                  key={index}
                  label={event}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

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
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<Send />}
              onClick={handleTest}
              disabled={testWebhook.isPending || !integration.is_active}
            >
              Test
            </Button>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="caption" color="text.secondary">
              Max retries: {integration.max_retries}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Created {formatRelativeTime(integration.created_at)}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleTest} disabled={testWebhook.isPending || !integration.is_active}>
              <ListItemIcon>
                <Send fontSize="small" />
              </ListItemIcon>
              <ListItemText>Test Webhook</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleDelete} disabled={deleteIntegration.isPending}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
    </motion.div>
  );
};