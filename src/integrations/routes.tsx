import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load all integration pages
const IntegrationsOverview = React.lazy(() => import('./pages/IntegrationsOverview'));
const CalendarIntegrations = React.lazy(() => import('./pages/CalendarIntegrations'));
const VideoIntegrations = React.lazy(() => import('./pages/VideoIntegrations'));
const WebhookIntegrations = React.lazy(() => import('./pages/WebhookIntegrations'));
const IntegrationLogs = React.lazy(() => import('./pages/IntegrationLogs'));
const IntegrationHealth = React.lazy(() => import('./pages/IntegrationHealth'));

const IntegrationsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<IntegrationsOverview />} />
      <Route path="calendar" element={<CalendarIntegrations />} />
      <Route path="video" element={<VideoIntegrations />} />
      <Route path="webhooks" element={<WebhookIntegrations />} />
      <Route path="logs" element={<IntegrationLogs />} />
      <Route path="health" element={<IntegrationHealth />} />
    </Routes>
  );
};

export default IntegrationsRoutes;