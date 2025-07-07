import GoogleIcon from '@mui/icons-material/Google'
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '../../api/services/auth.service'

const LoginViaSocial = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.loginWithGoogle();
      console.log('Google login successful:', response);
      navigate('/student/overview');
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Login failed. Please try again.');

      // Thêm xử lý cho trường hợp popup bị chặn
      if (error.message.includes('popup')) {
        setError('Please allow popup and try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ position: 'relative', my: 2 }}>
        <Divider>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', px: 1 }}
          >
            Or login with
          </Typography>
        </Divider>
      </Box>

      <Stack
        direction='row'
        spacing={2}
        justifyContent='center'
      >
        {/* <IconButton
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '50%',
            p: 1,
          }}
          disabled={true} // Tạm thời disable Facebook login
        >
          <FacebookIcon sx={{ color: '#1877F2', fontSize: 32 }} />
        </IconButton> */}
        <IconButton
          onClick={handleGoogleLogin}
          disabled={isLoading}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '50%',
            p: 1,
            '&:hover': {
              backgroundColor: 'rgba(219, 68, 55, 0.04)',
              borderColor: '#DB4437',
            },
          }}
        >
          <GoogleIcon sx={{ color: '#DB4437', fontSize: 32 }} />
        </IconButton>
      </Stack>

      {isLoading && (
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            mt: 1,
            color: 'text.secondary'
          }}
        >
          Logging in...
        </Typography>
      )}

      {error && (
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            mt: 1,
            color: 'error.main',
            fontSize: '0.875rem'
          }}
        >
          {error}
        </Typography>
      )}
    </>
  )
}

export default LoginViaSocial
