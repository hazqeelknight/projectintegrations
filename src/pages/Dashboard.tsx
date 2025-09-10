import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  CircularProgress,
  Divider,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event,
  Schedule,
  TrendingUp,
  People,
  CheckCircle,
  Warning,
  Error,
  CalendarToday,
  VideoCall,
  AccessTime,
  EventNote,
  PeopleAlt,
  Sync,
  Phone,
  Email,
  Business,
  Timeline,
  Analytics,
  Notifications,
  Speed,
  Security,
  CloudSync,
  ExpandMore,
  Refresh,
  Launch,
  Add,
  Settings,
  TrendingDown,
  Cancel,
  Done,
  PersonAdd,
  EventAvailable,
  Group,
  Today,
  DateRange,
  QueryStats,
  AutoGraph,
  BarChart,
  PieChart,
  ShowChart,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner, Button } from '@/components/core';
import { useUserAuth } from '@/users/hooks';
import { useBookingAnalytics, useBookings } from '@/events/hooks';
import { useContactStats } from '@/contacts/api';
import { useIntegrationHealth } from '@/integrations/hooks';
import { useAvailabilityStats } from '@/availability/hooks/useAvailabilityApi';
import { formatDateTime, formatRelativeTime, formatDuration } from '@/utils/formatters';
import { getBookingStatusColor } from '@/events/utils';

const Dashboard: React.FC = () => {
  const { user } = useUserAuth();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Fetch all dashboard data
  const { data: bookingAnalytics, isLoading: isLoadingAnalytics } = useBookingAnalytics(30);
  const { data: recentBookings, isLoading: isLoadingRecentBookings } = useBookings({ 
    status: 'confirmed',
    limit: 10,
    ordering: '-created_at' 
  });
  const { data: contactStats, isLoading: isLoadingContactStats } = useContactStats();
  const { data: integrationHealth, isLoading: isLoadingHealth } = useIntegrationHealth();
  const { data: availabilityStats, isLoading: isLoadingAvailability } = useAvailabilityStats();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Calculate derived metrics
  const totalBookings = bookingAnalytics?.total_bookings || 0;
  const confirmedBookings = bookingAnalytics?.confirmed_bookings || 0;
  const cancelledBookings = bookingAnalytics?.cancelled_bookings || 0;
  const completedBookings = bookingAnalytics?.completed_bookings || 0;
  const noShowBookings = bookingAnalytics?.no_show_bookings || 0;
  
  const confirmationRate = totalBookings > 0 ? ((confirmedBookings + completedBookings) / totalBookings * 100) : 0;
  const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings * 100) : 0;
  const noShowRate = totalBookings > 0 ? (noShowBookings / totalBookings * 100) : 0;
  
  const calendarSyncTotal = (bookingAnalytics?.calendar_sync_success || 0) + (bookingAnalytics?.calendar_sync_failed || 0);
  const calendarSyncRate = calendarSyncTotal > 0 ? ((bookingAnalytics?.calendar_sync_success || 0) / calendarSyncTotal * 100) : 0;

  // Main KPI cards with detailed metrics
  const mainStats = [
    {
      title: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      change: totalBookings > 0 ? '+12%' : 'No data',
      icon: Event,
      color: 'primary.main',
      subtitle: 'Last 30 days',
      details: [
        { label: 'Confirmed', value: confirmedBookings, color: 'success.main' },
        { label: 'Completed', value: completedBookings, color: 'info.main' },
        { label: 'Cancelled', value: cancelledBookings, color: 'error.main' },
        { label: 'No Show', value: noShowBookings, color: 'warning.main' },
      ]
    },
    {
      title: 'Confirmation Rate',
      value: `${confirmationRate.toFixed(1)}%`,
      change: confirmationRate > 80 ? 'Excellent' : confirmationRate > 60 ? 'Good' : 'Needs attention',
      icon: CheckCircle,
      color: confirmationRate > 80 ? 'success.main' : confirmationRate > 60 ? 'warning.main' : 'error.main',
      subtitle: 'Booking success rate',
      details: [
        { label: 'Confirmed + Completed', value: confirmedBookings + completedBookings, color: 'success.main' },
        { label: 'Cancellation Rate', value: `${cancellationRate.toFixed(1)}%`, color: 'error.main' },
        { label: 'No-Show Rate', value: `${noShowRate.toFixed(1)}%`, color: 'warning.main' },
      ]
    },
    {
      title: 'Calendar Sync',
      value: `${calendarSyncRate.toFixed(1)}%`,
      change: calendarSyncRate > 95 ? 'Excellent' : calendarSyncRate > 85 ? 'Good' : 'Check integrations',
      icon: Sync,
      color: calendarSyncRate > 95 ? 'success.main' : calendarSyncRate > 85 ? 'warning.main' : 'error.main',
      subtitle: 'Integration health',
      details: [
        { label: 'Successful', value: bookingAnalytics?.calendar_sync_success || 0, color: 'success.main' },
        { label: 'Failed', value: bookingAnalytics?.calendar_sync_failed || 0, color: 'error.main' },
        { label: 'Pending', value: bookingAnalytics?.calendar_sync_pending || 0, color: 'warning.main' },
      ]
    },
    {
      title: 'Active Contacts',
      value: (contactStats?.active_contacts || 0).toLocaleString(),
      change: contactStats?.active_contacts ? '+8%' : 'No data',
      icon: People,
      color: 'secondary.main',
      subtitle: 'Engaged contacts',
      details: [
        { label: 'Total Contacts', value: contactStats?.total_contacts || 0, color: 'primary.main' },
        { label: 'Contact Groups', value: contactStats?.total_groups || 0, color: 'info.main' },
        { label: 'Recent Interactions', value: contactStats?.recent_interactions || 0, color: 'success.main' },
      ]
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    {
      label: 'Average Weekly Hours',
      value: availabilityStats?.average_weekly_hours || 0,
      format: (val: number) => `${val.toFixed(1)} hrs`,
      color: 'primary.main',
      icon: Schedule,
    },
    {
      label: 'Busiest Day',
      value: availabilityStats?.busiest_day || 'N/A',
      format: (val: string) => val,
      color: 'secondary.main',
      icon: Today,
    },
    {
      label: 'Cache Hit Rate',
      value: availabilityStats?.cache_hit_rate || 0,
      format: (val: number) => `${val.toFixed(1)}%`,
      color: val => val > 80 ? 'success.main' : val > 60 ? 'warning.main' : 'error.main',
      icon: Speed,
    },
    {
      label: 'Group Event Avg',
      value: bookingAnalytics?.group_event_stats?.average_attendees || 0,
      format: (val: number) => `${val.toFixed(1)} people`,
      color: 'info.main',
      icon: Group,
    },
  ];

  const isLoading = isLoadingAnalytics || isLoadingContactStats || isLoadingHealth || isLoadingAvailability;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ''}!`}
        subtitle="Here's a comprehensive overview of your scheduling platform performance"
        actions={
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh dashboard data">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => window.location.href = '/events/types/new'}
            >
              New Event Type
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Main KPI Cards with Detailed Breakdowns */}
        {mainStats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="overline">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                        {stat.change}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.subtitle}
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
                      <stat.icon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    {stat.details.map((detail, idx) => (
                      <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {detail.label}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600,
                            color: typeof detail.color === 'string' ? detail.color : 'text.primary'
                          }}
                        >
                          {typeof detail.value === 'string' ? detail.value : detail.value.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Performance Metrics Row */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Performance Metrics
                  </Typography>
                  <Chip 
                    icon={<Analytics />} 
                    label="Real-time" 
                    color="primary" 
                    variant="outlined" 
                    size="small" 
                  />
                </Box>
                
                <Grid container spacing={3}>
                  {performanceMetrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={metric.label}>
                      <Box textAlign="center">
                        <Box
                          sx={{
                            backgroundColor: typeof metric.color === 'function' 
                              ? metric.color(metric.value as number) 
                              : metric.color,
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <metric.icon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {metric.format(metric.value)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {metric.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Detailed Analytics Tabs */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab icon={<EventNote />} label="Recent Activity" />
                    <Tab icon={<BarChart />} label="Analytics Deep Dive" />
                    <Tab icon={<CloudSync />} label="System Health" />
                    <Tab icon={<PeopleAlt />} label="Contact Insights" />
                  </Tabs>
                </Box>

                {/* Recent Activity Tab */}
                {selectedTab === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Recent Bookings & Activity
                    </Typography>
                    
                    {isLoadingRecentBookings ? (
                      <LoadingSpinner message="Loading recent bookings..." />
                    ) : !recentBookings || recentBookings.length === 0 ? (
                      <Alert severity="info" icon={<EventNote />}>
                        <Typography variant="subtitle2" gutterBottom>
                          No Recent Bookings
                        </Typography>
                        <Typography variant="body2">
                          Your recent booking activity will appear here. Create your first event type to start accepting bookings.
                        </Typography>
                        <Box mt={2}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => window.location.href = '/events/types/new'}
                          >
                            Create Event Type
                          </Button>
                        </Box>
                      </Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Invitee</TableCell>
                              <TableCell>Event Type</TableCell>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Meeting</TableCell>
                              <TableCell>Sync Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentBookings.slice(0, 8).map((booking) => (
                              <TableRow key={booking.id} hover>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                      {booking.invitee_name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {booking.invitee_name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {booking.invitee_email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {booking.event_type.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDuration(booking.duration_minutes)}
                                      {booking.attendee_count > 1 && ` • ${booking.attendee_count} attendees`}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {formatDateTime(booking.start_time, 'MMM dd, yyyy')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDateTime(booking.start_time, 'h:mm a')} - {formatDateTime(booking.end_time, 'h:mm a')}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={booking.status_display}
                                    color={getBookingStatusColor(booking.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {booking.meeting_link && booking.meeting_link !== 'TBD' ? (
                                    <Tooltip title="Video meeting available">
                                      <VideoCall color="success" fontSize="small" />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="No video meeting">
                                      <VideoCall color="disabled" fontSize="small" />
                                    </Tooltip>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={booking.calendar_sync_status}
                                    color={
                                      booking.calendar_sync_status === 'succeeded' ? 'success' :
                                      booking.calendar_sync_status === 'failed' ? 'error' :
                                      booking.calendar_sync_status === 'pending' ? 'warning' : 'default'
                                    }
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => window.location.href = `/events/bookings/${booking.id}`}
                                  >
                                    <Launch fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Analytics Deep Dive Tab */}
                {selectedTab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Detailed Analytics & Insights
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Event Type Performance */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Event Type Performance
                          </Typography>
                          {bookingAnalytics?.bookings_by_event_type && bookingAnalytics.bookings_by_event_type.length > 0 ? (
                            <List dense>
                              {bookingAnalytics.bookings_by_event_type.slice(0, 5).map((eventType, index) => (
                                <ListItem key={index} divider>
                                  <ListItemIcon>
                                    <Box
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                        {index + 1}
                                      </Typography>
                                    </Box>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={eventType.event_type__name}
                                    secondary={`${eventType.count} bookings`}
                                  />
                                  <Box sx={{ minWidth: 60 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={(eventType.count / (bookingAnalytics.bookings_by_event_type[0]?.count || 1)) * 100}
                                      sx={{ mb: 1 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {((eventType.count / totalBookings) * 100).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Alert severity="info" icon={<EventNote />}>
                              No event type data available yet
                            </Alert>
                          )}
                        </Paper>
                      </Grid>

                      {/* Cancellation Analysis */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Cancellation Analysis
                          </Typography>
                          {bookingAnalytics?.cancellations_by_actor && bookingAnalytics.cancellations_by_actor.length > 0 ? (
                            <List dense>
                              {bookingAnalytics.cancellations_by_actor.map((cancellation, index) => (
                                <ListItem key={index} divider>
                                  <ListItemIcon>
                                    <Cancel 
                                      sx={{ 
                                        color: cancellation.cancelled_by === 'organizer' ? 'warning.main' : 'error.main' 
                                      }} 
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`${cancellation.cancelled_by === 'organizer' ? 'You' : 'Invitees'} cancelled`}
                                    secondary={`${cancellation.count} bookings`}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {((cancellation.count / cancelledBookings) * 100).toFixed(1)}%
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Alert severity="success" icon={<CheckCircle />}>
                              No cancellations in the selected period
                            </Alert>
                          )}
                        </Paper>
                      </Grid>

                      {/* Group Event Statistics */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Group Event Insights
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box textAlign="center">
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {bookingAnalytics?.group_event_stats?.total_group_bookings || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Group Bookings
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box textAlign="center">
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                  {(bookingAnalytics?.group_event_stats?.average_attendees || 0).toFixed(1)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Avg Attendees
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          <Box mt={2}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Group Event Utilization
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(((bookingAnalytics?.group_event_stats?.average_attendees || 0) / 10) * 100, 100)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Booking Trends */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Booking Trends
                          </Typography>
                          
                          <Box mb={3}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                Confirmation Rate
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {confirmationRate.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={confirmationRate}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: confirmationRate > 80 ? 'success.main' : 
                                                 confirmationRate > 60 ? 'warning.main' : 'error.main',
                                },
                              }}
                            />
                          </Box>

                          <Box mb={3}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                Calendar Sync Success
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {calendarSyncRate.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={calendarSyncRate}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: calendarSyncRate > 95 ? 'success.main' : 
                                                 calendarSyncRate > 85 ? 'warning.main' : 'error.main',
                                },
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Completion Rate
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={totalBookings > 0 ? (completedBookings / totalBookings * 100) : 0}
                                  size={60}
                                  thickness={6}
                                  sx={{ color: 'info.main' }}
                                />
                                <Box
                                  sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(0) : 0}%
                                  </Typography>
                                </Box>
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {completedBookings} completed
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  out of {totalBookings} total
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Analytics Deep Dive Tab */}
                {selectedTab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Advanced Analytics & Metrics
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Detailed Booking Breakdown */}
                      <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Comprehensive Booking Analysis
                          </Typography>
                          
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Booking Status Distribution
                                </Typography>
                                <Stack spacing={1}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                                      <Typography variant="body2">Confirmed</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {confirmedBookings} ({totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0}%)
                                    </Typography>
                                  </Box>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Done sx={{ color: 'info.main', fontSize: 16 }} />
                                      <Typography variant="body2">Completed</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {completedBookings} ({totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0}%)
                                    </Typography>
                                  </Box>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Cancel sx={{ color: 'error.main', fontSize: 16 }} />
                                      <Typography variant="body2">Cancelled</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {cancelledBookings} ({totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0}%)
                                    </Typography>
                                  </Box>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Warning sx={{ color: 'warning.main', fontSize: 16 }} />
                                      <Typography variant="body2">No Show</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {noShowBookings} ({totalBookings > 0 ? ((noShowBookings / totalBookings) * 100).toFixed(1) : 0}%)
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Calendar Integration Health
                                </Typography>
                                <Stack spacing={1}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                                      <Typography variant="body2">Sync Success</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {bookingAnalytics?.calendar_sync_success || 0}
                                    </Typography>
                                  </Box>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Error sx={{ color: 'error.main', fontSize: 16 }} />
                                      <Typography variant="body2">Sync Failed</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {bookingAnalytics?.calendar_sync_failed || 0}
                                    </Typography>
                                  </Box>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <AccessTime sx={{ color: 'warning.main', fontSize: 16 }} />
                                      <Typography variant="body2">Sync Pending</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {bookingAnalytics?.calendar_sync_pending || 0}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Availability Insights */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Availability Insights
                          </Typography>
                          
                          <Box mb={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Weekly Schedule Overview
                            </Typography>
                            <Box textAlign="center" mb={2}>
                              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {(availabilityStats?.average_weekly_hours || 0).toFixed(1)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                hours per week
                              </Typography>
                            </Box>
                            
                            {availabilityStats?.daily_hours && Object.keys(availabilityStats.daily_hours).length > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                  Daily Breakdown
                                </Typography>
                                {Object.entries(availabilityStats.daily_hours).map(([day, hours]) => (
                                  <Box key={day} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption">{day}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {(hours as number).toFixed(1)}h
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              System Performance
                            </Typography>
                            <Stack spacing={1}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption">Cache Hit Rate</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {(availabilityStats?.cache_hit_rate || 0).toFixed(1)}%
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption">Active Rules</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {availabilityStats?.active_rules || 0}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption">Date Overrides</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {availabilityStats?.total_overrides || 0}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* System Health Tab */}
                {selectedTab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      System Health & Integration Status
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Overall Health Status */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Overall System Health
                          </Typography>
                          
                          <Box mb={3}>
                            {integrationHealth?.overall_health === 'healthy' ? (
                              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                            ) : integrationHealth?.overall_health === 'degraded' ? (
                              <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                            ) : (
                              <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                            )}
                            
                            <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                              {integrationHealth?.overall_health || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last checked: {integrationHealth?.timestamp ? formatRelativeTime(integrationHealth.timestamp) : 'Never'}
                            </Typography>
                          </Box>

                          <Button
                            variant="outlined"
                            startIcon={<Settings />}
                            onClick={() => window.location.href = '/integrations/health'}
                            fullWidth
                          >
                            View Details
                          </Button>
                        </Paper>
                      </Grid>

                      {/* Calendar Integrations Health */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Calendar Integrations
                          </Typography>
                          
                          {!integrationHealth?.calendar_integrations || integrationHealth.calendar_integrations.length === 0 ? (
                            <Alert severity="info" icon={<CalendarToday />}>
                              <Typography variant="body2">
                                No calendar integrations configured
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => window.location.href = '/integrations/calendar'}
                                sx={{ mt: 1 }}
                              >
                                Connect Calendar
                              </Button>
                            </Alert>
                          ) : (
                            <List dense>
                              {integrationHealth.calendar_integrations.map((integration, index) => (
                                <ListItem key={index} divider>
                                  <ListItemIcon>
                                    {integration.health === 'healthy' ? (
                                      <CheckCircle sx={{ color: 'success.main' }} />
                                    ) : (
                                      <Warning sx={{ color: 'error.main' }} />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
                                    secondary={
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          {integration.is_active ? 'Active' : 'Inactive'} • 
                                          {integration.sync_enabled ? ' Sync On' : ' Sync Off'}
                                        </Typography>
                                        {integration.token_expired && (
                                          <Typography variant="caption" color="error.main">
                                            Token expired
                                          </Typography>
                                        )}
                                        {integration.sync_errors > 0 && (
                                          <Typography variant="caption" color="warning.main">
                                            {integration.sync_errors} sync errors
                                          </Typography>
                                        )}
                                        {integration.last_sync && (
                                          <Typography variant="caption" color="text.secondary">
                                            Last sync: {formatRelativeTime(integration.last_sync)}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Paper>
                      </Grid>

                      {/* Video Integrations Health */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <VideoCall sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Video Integrations
                          </Typography>
                          
                          {!integrationHealth?.video_integrations || integrationHealth.video_integrations.length === 0 ? (
                            <Alert severity="info" icon={<VideoCall />}>
                              <Typography variant="body2">
                                No video integrations configured
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => window.location.href = '/integrations/video'}
                                sx={{ mt: 1 }}
                              >
                                Connect Video
                              </Button>
                            </Alert>
                          ) : (
                            <List dense>
                              {integrationHealth.video_integrations.map((integration, index) => (
                                <ListItem key={index} divider>
                                  <ListItemIcon>
                                    {integration.health === 'healthy' ? (
                                      <CheckCircle sx={{ color: 'success.main' }} />
                                    ) : (
                                      <Warning sx={{ color: 'error.main' }} />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
                                    secondary={
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          {integration.is_active ? 'Active' : 'Inactive'} • 
                                          {integration.auto_generate_links ? ' Auto-gen On' : ' Auto-gen Off'}
                                        </Typography>
                                        {integration.token_expired && (
                                          <Typography variant="caption" color="error.main">
                                            Token expired
                                          </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          API calls today: {integration.api_calls_today}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Contact Insights Tab */}
                {selectedTab === 3 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Contact Management & Insights
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Contact Overview */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <PeopleAlt sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Contact Overview
                          </Typography>
                          
                          <Grid container spacing={2} mb={3}>
                            <Grid item xs={4}>
                              <Box textAlign="center">
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {contactStats?.total_contacts || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Total Contacts
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box textAlign="center">
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                  {contactStats?.active_contacts || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Active
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box textAlign="center">
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                                  {contactStats?.total_groups || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Groups
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Contact Engagement
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption">Active Rate</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {contactStats?.total_contacts ? 
                                  ((contactStats.active_contacts / contactStats.total_contacts) * 100).toFixed(1) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={contactStats?.total_contacts ? 
                                ((contactStats.active_contacts / contactStats.total_contacts) * 100) : 0}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Top Companies */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Top Companies
                          </Typography>
                          
                          {contactStats?.top_companies && contactStats.top_companies.length > 0 ? (
                            <List dense>
                              {contactStats.top_companies.slice(0, 5).map((company, index) => (
                                <ListItem key={index} divider>
                                  <ListItemIcon>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                                      <Business fontSize="small" />
                                    </Avatar>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={company.company || 'Unknown Company'}
                                    secondary={`${company.count} contacts`}
                                  />
                                  <Box sx={{ minWidth: 40 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      #{index + 1}
                                    </Typography>
                                  </Box>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Alert severity="info" icon={<Business />}>
                              <Typography variant="body2">
                                No company data available yet
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<PersonAdd />}
                                onClick={() => window.location.href = '/contacts/list'}
                                sx={{ mt: 1 }}
                              >
                                Add Contacts
                              </Button>
                            </Alert>
                          )}
                        </Paper>
                      </Grid>

                      {/* Booking Frequency Trends */}
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Booking Frequency Trends
                          </Typography>
                          
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                              <Box textAlign="center">
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {contactStats?.booking_frequency?.this_month || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  This Month
                                </Typography>
                                <Box mt={1}>
                                  <Chip
                                    icon={<TrendingUp />}
                                    label={
                                      contactStats?.booking_frequency?.this_month && contactStats?.booking_frequency?.last_month
                                        ? `${(((contactStats.booking_frequency.this_month - contactStats.booking_frequency.last_month) / contactStats.booking_frequency.last_month) * 100).toFixed(1)}% vs last month`
                                        : 'No comparison data'
                                    }
                                    color={
                                      contactStats?.booking_frequency?.this_month && contactStats?.booking_frequency?.last_month
                                        ? contactStats.booking_frequency.this_month > contactStats.booking_frequency.last_month ? 'success' : 'error'
                                        : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box textAlign="center">
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                  {contactStats?.booking_frequency?.last_month || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Last Month
                                </Typography>
                                <Box mt={1}>
                                  <Chip
                                    icon={<DateRange />}
                                    label="Previous period"
                                    variant="outlined"
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box textAlign="center">
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                                  {contactStats?.booking_frequency?.this_year || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  This Year
                                </Typography>
                                <Box mt={1}>
                                  <Chip
                                    icon={<QueryStats />}
                                    label="Annual total"
                                    color="info"
                                    variant="outlined"
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions Panel */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Common tasks and shortcuts to manage your scheduling platform
                </Typography>
                
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<EventAvailable />}
                      onClick={() => window.location.href = '/events/types/new'}
                      sx={{ py: 1.5 }}
                    >
                      Create Event Type
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<PersonAdd />}
                      onClick={() => window.location.href = '/contacts/list'}
                      sx={{ py: 1.5 }}
                    >
                      Add Contact
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Schedule />}
                      onClick={() => window.location.href = '/availability/rules'}
                      sx={{ py: 1.5 }}
                    >
                      Set Availability
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CloudSync />}
                      onClick={() => window.location.href = '/integrations'}
                      sx={{ py: 1.5 }}
                    >
                      Setup Integrations
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* System Insights Accordion */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AutoGraph />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Advanced System Insights
                  </Typography>
                  <Chip label="Detailed View" size="small" color="primary" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Availability System Details */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Availability System Status
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Total Availability Rules</Typography>
                        <Chip label={availabilityStats?.total_rules || 0} size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Active Rules</Typography>
                        <Chip 
                          label={availabilityStats?.active_rules || 0} 
                          size="small" 
                          color="success"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Date Overrides</Typography>
                        <Chip label={availabilityStats?.total_overrides || 0} size="small" color="info" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Blocked Time Slots</Typography>
                        <Chip label={availabilityStats?.total_blocks || 0} size="small" color="warning" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Recurring Blocks</Typography>
                        <Chip label={availabilityStats?.total_recurring_blocks || 0} size="small" color="secondary" />
                      </Box>
                    </Stack>
                  </Grid>

                  {/* User Account Details */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Account Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Account Status</Typography>
                        <Chip 
                          label={user?.account_status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                          size="small" 
                          color={user?.account_status === 'active' ? 'success' : 'warning'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Email Verified</Typography>
                        <Chip 
                          icon={user?.is_email_verified ? <CheckCircle /> : <Warning />}
                          label={user?.is_email_verified ? 'Verified' : 'Unverified'} 
                          size="small" 
                          color={user?.is_email_verified ? 'success' : 'error'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Phone Verified</Typography>
                        <Chip 
                          icon={user?.is_phone_verified ? <CheckCircle /> : <Warning />}
                          label={user?.is_phone_verified ? 'Verified' : 'Unverified'} 
                          size="small" 
                          color={user?.is_phone_verified ? 'success' : 'warning'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">MFA Enabled</Typography>
                        <Chip 
                          icon={user?.is_mfa_enabled ? <Security /> : <Warning />}
                          label={user?.is_mfa_enabled ? 'Enabled' : 'Disabled'} 
                          size="small" 
                          color={user?.is_mfa_enabled ? 'success' : 'warning'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Last Login</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.last_login ? formatRelativeTime(user.last_login) : 'Never'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Member Since</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.date_joined ? formatDateTime(user.date_joined, 'MMM yyyy') : 'Unknown'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;