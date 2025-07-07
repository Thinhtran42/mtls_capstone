import { Box, Grid, Alert } from '@mui/material'
import loginImage from '../assets/loginImage.svg'
import LoginForm from '../components/common/LoginForm'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { userService } from '../api/services/user.service'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [redirectMessage] = useState(location.state?.message || '')

  const handleLoginSuccess = () => {
    const user = userService.getCurrentUser();
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/teacher/overview', { replace: true });
    }
  }

  return (
    <Grid
      container
      sx={{ margin: '0 0' }}
    >
      {/* Phần hình ảnh bên trái */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Box sx={{ width: '800px', height: 'auto' }}>
          <img
            src={loginImage}
            alt='Login'
            style={{ width: '100%', maxWidth: '700px', height: 'auto' }}
          />
        </Box>
      </Grid>

      {/* Phần form đăng nhập bên phải */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box sx={{ width: '100%', maxWidth: '600px', padding: '0' }}>
          {redirectMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {redirectMessage}
            </Alert>
          )}
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </Box>
      </Grid>
    </Grid>
  )
}

export default LoginPage
