import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

const AuthResetPasswordRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy token từ URL hiện tại
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    // Chuyển hướng đến URL đúng
    navigate(`/reset-password?token=${token}`, { replace: true });
  }, [location.search, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Redirecting...
      </Typography>
    </Box>
  );
};

export default AuthResetPasswordRedirect; 