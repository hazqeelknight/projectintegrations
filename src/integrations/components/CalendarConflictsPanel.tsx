import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Warning,
  Info,
  ExpandMore,
  Event,
  Block,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/utils/formatters';
import { useCalendarConflicts } from '../hooks/useIntegrationsApi';
import { LoadingSpinner } from '@/components/core';

export const CalendarConflictsPanel: React.FC = () => {
  const { data: conflicts, isLoading, error } = useCalendarConflicts();

  if (isLoading) {
    return <LoadingSpinner message="Checking calendar conflicts..." />;
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load calendar conflicts data
      </Alert>
    );
  }

  if (!conflicts) {
    return null;
  }

  const hasConflicts = conflicts.conflicts.length > 0 || conflicts.overlaps.length > 0;

  const getOverlapTypeColor = (overlapType: string) => {
    switch (overlapType) {
      case 'complete_overlap': return 'error';
      case 'contained_overlap': return 'warning';
      case 'partial_overlap': return 'info';
      default: return 'default';
    }
  };

  const getOverlapTypeLabel = (overlapType: string) => {
    switch (overlapType) {
      case 'complete_overlap': return 'Complete Overlap';
      case 'contained_overlap': return 'Contained Overlap';
      case 'partial_overlap': return 'Partial Overlap';
      default: return overlapType;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Calendar Conflicts Analysis
          </Typography>

          {!hasConflicts ? (
            <Alert severity="success" icon={<Schedule />}>
              No calendar conflicts detected. Your manual blocks and synced calendar events are properly coordinated.
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 3 }}>
                {conflicts.conflicts.length + conflicts.overlaps.length} potential conflicts detected between your manual blocks and synced calendar events.
              </Alert>

              <Box display="flex" gap={2} mb={3}>
                <Chip
                  icon={<Block />}
                  label={`${conflicts.manual_blocks_count} Manual Blocks`}
                  variant="outlined"
                />
                <Chip
                  icon={<Event />}
                  label={`${conflicts.synced_blocks_count} Synced Events`}
                  variant="outlined"
                />
              </Box>

              {/* Complete Conflicts */}
              {conflicts.conflicts.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Warning color="error" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Complete Conflicts ({conflicts.conflicts.length})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      These are complete overlaps that may cause scheduling issues:
                    </Typography>
                    <List>
                      {conflicts.conflicts.map((conflict, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography variant="subtitle2">
                                  {conflict.external_event.summary}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  vs. {conflict.manual_block.reason}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  External: {formatDateTime(conflict.external_event.start)} - {formatDateTime(conflict.external_event.end)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Manual: {formatDateTime(conflict.manual_block.start)} - {formatDateTime(conflict.manual_block.end)}
                                </Typography>
                                <Chip
                                  label={getOverlapTypeLabel(conflict.overlap_type)}
                                  color={getOverlapTypeColor(conflict.overlap_type) as any}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Partial Overlaps */}
              {conflicts.overlaps.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Info color="info" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Partial Overlaps ({conflicts.overlaps.length})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      These are partial overlaps that may need attention:
                    </Typography>
                    <List>
                      {conflicts.overlaps.map((overlap, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            <Info color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography variant="subtitle2">
                                  {overlap.external_event.summary}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  vs. {overlap.manual_block.reason}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  External: {formatDateTime(overlap.external_event.start)} - {formatDateTime(overlap.external_event.end)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Manual: {formatDateTime(overlap.manual_block.start)} - {formatDateTime(overlap.manual_block.end)}
                                </Typography>
                                <Chip
                                  label={getOverlapTypeLabel(overlap.overlap_type)}
                                  color={getOverlapTypeColor(overlap.overlap_type) as any}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};