import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Alert,
  Fab,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/core';
import { WebhookIntegrationCard } from '../components/WebhookIntegrationCard';
import { WebhookForm } from '../components/WebhookForm';
import { useWebhookIntegrations } from '../hooks/useIntegrationsApi';
import { WebhookIntegration } from '../types';

const WebhookIntegrations: React.FC = () => {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingWebhook, setEditingWebhook] = React.useState<WebhookIntegration | undefined>();
  
  const { data: integrations = [], isLoading, error } = useWebhookIntegrations();

  const handleCreateNew = () => {
    setEditingWebhook(undefined);
    setFormOpen(true);
  };

  const handleEdit = (webhook: WebhookIntegration) => {
    setEditingWebhook(webhook);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingWebhook(undefined);
  };

  return (
    <>
      <PageHeader
        title="Webhook Integrations"
        subtitle="Configure webhooks to send real-time notifications to external systems"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load webhook integrations. Please try again.
        </Alert>
      )}

      {integrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Webhook Integrations Configured
            </Typography>
            <Typography variant="body2" gutterBottom>
              Webhooks allow you to receive real-time notifications when booking events occur. 
              Connect your external systems to automate workflows and keep your data in sync.
            </Typography>
            <Box mt={2}>
              <Fab
                color="primary"
                aria-label="add webhook"
                onClick={handleCreateNew}
                sx={{ mt: 2 }}
              >
                <Add />
              </Fab>
            </Box>
          </Alert>
        </motion.div>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Webhook Security
            </Typography>
            <Typography variant="body2">
              All webhooks include a signature header for verification. Configure secret keys 
              to ensure webhook authenticity and prevent unauthorized access.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {integrations.map((integration) => (
              <Grid item xs={12} md={6} lg={4} key={integration.id}>
                <WebhookIntegrationCard
                  integration={integration}
                  onEdit={handleEdit}
                />
              </Grid>
            ))}
          </Grid>

          <Fab
            color="primary"
            aria-label="add webhook"
            onClick={handleCreateNew}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
            }}
          >
            <Add />
          </Fab>
        </>
      )}

      <WebhookForm
        open={formOpen}
        onClose={handleFormClose}
        webhook={editingWebhook}
      />
    </>
  );
};

export default WebhookIntegrations;