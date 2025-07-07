import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <Box sx={{ 
      display: "flex",
      backgroundColor: "#f5f5f5",
      minHeight: "100vh"
    }}>
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: { xs: '16px', md: '24px' },
          minHeight: "100vh",
          display: "block",
          marginLeft: isExpanded ? '240px' : '65px',
          width: isExpanded ? 'calc(100% - 240px)' : 'calc(100% - 65px)',
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 