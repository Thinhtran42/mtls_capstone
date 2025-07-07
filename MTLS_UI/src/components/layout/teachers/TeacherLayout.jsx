import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import TeacherNavbar from './TeacherNavbar';
import TeacherSidebar from './TeacherSidebar';

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isOverviewPage = location.pathname === '/teacher/overview';

  useEffect(() => {
    // Đảm bảo sidebar luôn mở khi chuyển trang
    if (!isOverviewPage) {
      setSidebarOpen(true);
    }
  }, [location.pathname, isOverviewPage]);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isOverviewPage) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <TeacherNavbar onMenuToggle={handleMenuToggle} />
        <Box component="main" sx={{ flexGrow: 1, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <TeacherSidebar open={sidebarOpen} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          minHeight: '100vh',
          marginLeft: sidebarOpen ? '240px' : '0',
          width: sidebarOpen ? 'calc(100% - 240px)' : '100%',
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherLayout; 