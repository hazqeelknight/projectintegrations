import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Close, ExpandMore, Add, Delete } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/core';
import { WebhookIntegration, WebhookFormData, WEBHOOK_EVENTS } from '../types';
import {
  useCreateWebhookIntegration,
  useUpdateWebhookIntegration,
} from '../hooks/useIntegrationsApi';

interface WebhookFormProps {
  open: boolean;
  onClose: () => void;
  webhook?: WebhookIntegration;
}

export const WebhookForm: React.FC<WebhookFormProps> = ({
  open,
  onClose,
  webhook,
}) => {
  const isEditing = !!webhook;
  const createWebhook = useCreateWebhookIntegration();
  const updateWebhook = useUpdateWebhookIntegration();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WebhookFormData>({
    defaultValues: {
      name: webhook?.name || '',
      webhook_url: webhook?.webhook_url || '',
      events: webhook?.events || [],
      secret_key: '',
      headers: {},
      is_active: webhook?.is_active ?? true,
      retry_failed: webhook?.retry_failed ?? true,
      max_retries: webhook?.max_retries || 3,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'headers' as any,
  });

  React.useEffect(() => {
    if (webhook) {
      reset({
        name: webhook.name,
        webhook_url: webhook.webhook_url,
        events: webhook.events,
        secret_key: '',
        headers: {},
        is_active: webhook.is_active,
        retry_failed: webhook.retry_failed,
        max_retries: webhook.max_retries,
      });
    }
  }, [webhook, reset]);

  const handleFormSubmit = async (data: WebhookFormData) => {
    try {
      if (isEditing) {
        await updateWebhook.mutateAsync({ id: webhook.id, data });
      } else {
        await createWebhook.mutateAsync(data);
      }
      onClose();
      reset();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditing ? 'Edit Webhook Integration' : 'Create Webhook Integration'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>
              
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Webhook Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    margin="normal"
                  />
                )}
              />

              <Controller
                name="webhook_url"
                control={control}
                rules={{
                  required: 'Webhook URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Webhook URL"
                    placeholder="https://your-app.com/webhooks/novameet"
                    error={!!errors.webhook_url}
                    helperText={errors.webhook_url?.message}
                    margin="normal"
                  />
                )}
              />
            </Box>

            {/* Events Configuration */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Trigger Events
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select which events should trigger this webhook
              </Typography>
              
              <FormControl component="fieldset" margin="normal">
                <FormGroup>
                  {WEBHOOK_EVENTS.map((event) => (
                    <Controller
                      key={event.value}
                      name="events"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value.includes(event.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, event.value]);
                                } else {
                                  field.onChange(field.value.filter((v: string) => v !== event.value));
                                }
                              }}
                            />
                          }
                          label={event.label}
                        />
                      )}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Box>

            {/* Security Configuration */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Security & Advanced Settings
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Controller
                    name="secret_key"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Secret Key (Optional)"
                        placeholder="Used for webhook signature verification"
                        helperText="Leave empty to keep existing secret key"
                        margin="normal"
                      />
                    )}
                  />

                  <Controller
                    name="max_retries"
                    control={control}
                    rules={{
                      min: { value: 0, message: 'Must be 0 or greater' },
                      max: { value: 10, message: 'Must be 10 or less' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Max Retries"
                        error={!!errors.max_retries}
                        helperText={errors.max_retries?.message || 'Number of retry attempts for failed webhooks'}
                        margin="normal"
                        inputProps={{ min: 0, max: 10 }}
                      />
                    )}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Status Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Status Settings
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active"
                    />
                  )}
                />

                <Controller
                  name="retry_failed"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Retry Failed Webhooks"
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={createWebhook.isPending || updateWebhook.isPending}
            loadingText={isEditing ? 'Updating...' : 'Creating...'}
          >
            {isEditing ? 'Update Webhook' : 'Create Webhook'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};