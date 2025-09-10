import React from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { useUIStore } from '@/store/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { sidebarCollapsed, sidebarOpen } = useUIStore();

  // Calculate margin based on sidebar state
  const getMainMargin = () => {
    if (isMobile) {
      return 0; // No margin on mobile since sidebar is overlay
    }
    return sidebarCollapsed ? '72px' : '280px';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      
     <Box
  component="main"
  className="main-content"
  sx={{
    flexGrow: 1,
    p: { xs: '20px 15px', sm: 3 }, // 15px side padding on mobile, 3*8px = 24px on bigger screens
    ml: { xs: 0, sm: '20px' },  // no margin on mobile, 20px on bigger screens
    width: { xs: '100%', sm: 'auto' }, // full width on mobile
    transition: (theme) =>
      theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
  }}
>
        <Toolbar /> {/* Spacer for fixed header */}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
};