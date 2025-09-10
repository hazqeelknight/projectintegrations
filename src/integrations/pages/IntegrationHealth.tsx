import React from 'react';
import { Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/core';
import { IntegrationHealthDashboard } from '../components/IntegrationHealthDashboard';
import { CalendarConflictsPanel } from '../components/CalendarConflictsPanel';
import { IntegrationLogsTable } from '../components/IntegrationLogsTable';

const IntegrationHealth: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Integration Health"
        subtitle="Monitor the health and performance of all your integrations"
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <IntegrationHealthDashboard />
        </Grid>
        
        <Grid item xs={12}>
          <CalendarConflictsPanel />
        </Grid>
        
        <Grid item xs={12}>
          <IntegrationLogsTable />
        </Grid>
      </Grid>
    </>
  );
};

export default IntegrationHealth;