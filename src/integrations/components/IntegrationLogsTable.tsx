import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error,
  Info,
  CalendarToday,
  VideoCall,
  Send,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { useIntegrationLogs } from '../hooks/useIntegrationsApi';
import { LoadingSpinner } from '@/components/core';
import { IntegrationLog, INTEGRATION_LOG_TYPES } from '../types';

export const IntegrationLogsTable: React.FC = () => {
  const [filters, setFilters] = React.useState({
    log_type: '',
    integration_type: '',
    success: '',
  });
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const { data: logs, isLoading, error } = useIntegrationLogs(filters);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleRowExpansion = (logId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getLogTypeIcon = (logType: string) => {
    switch (logType) {
      case 'calendar_sync': return <CalendarToday fontSize="small" />;
      case 'video_link_created': return <VideoCall fontSize="small" />;
      case 'webhook_sent': return <Send fontSize="small" />;
      case 'error': return <Warning fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading integration logs..." />;
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load integration logs
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Integration Activity Logs
          </Typography>

          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Log Type</InputLabel>
              <Select
                value={filters.log_type}
                label="Log Type"
                onChange={(e) => handleFilterChange('log_type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {INTEGRATION_LOG_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                value={filters.integration_type}
                label="Provider"
                onChange={(e) => handleFilterChange('integration_type', e.target.value)}
              >
                <MenuItem value="">All Providers</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="outlook">Outlook</MenuItem>
                <MenuItem value="zoom">Zoom</MenuItem>
                <MenuItem value="microsoft_teams">Microsoft Teams</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.success}
                label="Status"
                onChange={(e) => handleFilterChange('success', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Success</MenuItem>
                <MenuItem value="false">Failed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {!logs || logs.length === 0 ? (
            <Alert severity="info">
              No integration logs found matching your filters.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getLogTypeIcon(log.log_type)}
                            <Typography variant="body2">
                              {log.log_type_display}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.integration_type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {log.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getSuccessIcon(log.success)}
                            <Typography variant="body2">
                              {log.success ? 'Success' : 'Failed'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeTime(log.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {Object.keys(log.details).length > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpansion(log.id)}
                            >
                              {expandedRows.has(log.id) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                      
                      {Object.keys(log.details).length > 0 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 0 }}>
                            <Collapse in={expandedRows.has(log.id)} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Details:
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    backgroundColor: 'grey.50',
                                    p: 2,
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    overflow: 'auto',
                                    maxHeight: 200,
                                  }}
                                >
                                  {JSON.stringify(log.details, null, 2)}
                                </Box>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};