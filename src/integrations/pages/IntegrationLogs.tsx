import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/core';
import { IntegrationLogsTable } from '../components/IntegrationLogsTable';

const IntegrationLogs: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Integration Logs"
        subtitle="Monitor integration activity, troubleshoot issues, and track performance"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <IntegrationLogsTable />
      </motion.div>
    </>
  );
};

export default IntegrationLogs;