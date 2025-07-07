import { Box, Button, Grid, Typography, Snackbar, Alert, CircularProgress } from '@mui/material'
import loginImage from '../assets/loginImage.svg'
import InputField from '../components/common/InputField'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormProvider, useForm } from 'react-hook-form'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from '../api/services/auth.service'

const schema = yup.object().shape({
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Confirm password is required'),
})

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const methods = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    // Lấy token từ URL query params
    const params = new URLSearchParams(location.search)
    const tokenParam = params.get('token')
    
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Token does not exist. Please request a new password.')
    }
  }, [location.search])

  const onSubmit = async (data) => {
    if (!token) {
      setError('Token does not exist. Please request a new password.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const response = await authService.resetPassword(token, data.newPassword)
      console.log('Reset password response:', response)
      setSuccess(true)
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password has been reset successfully. Please login with the new password.' } 
        })
      }, 3000)
      
    } catch (error) {
      console.error('Reset password error:', error)
      
      if (error.response?.status === 400 || error.response?.data?.message === 'Invalid or expired token') {
        setError('Token is invalid or expired. Please request a new password.')
      } else if (error.isConnectionError) {
        setError('Cannot connect to server. Please try again later.')
      } else {
        setError(error.response?.data?.message || 'An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setError('')
    setSuccess(false)
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

      {/* Phần form đổi mật khẩu bên phải */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
      >
        <FormProvider {...methods}>
          <Box
            sx={{ width: '100%', maxWidth: '600px', padding: '0' }}
            component='form'
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <Typography
              variant='h4'
              gutterBottom
              color='primary'
            >
              Reset Password
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your new password below.
            </Typography>
            
            <InputField
              name='newPassword'
              label='New Password'
              type='password'
              validation={{
                required: 'New password is required',
              }}
            />
            
            <InputField
              name='confirmPassword'
              label='Confirm Password'
              type='password'
              validation={{
                required: 'Confirm password is required',
              }}
            />
            
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isLoading || !token}
              sx={{
                marginTop: '16px',
                borderRadius: '30px',
                minWidth: '200px',
                position: 'relative'
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Reset Password'}
            </Button>

            {/* Back to Login link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                <NavLink to='/login' style={{ textDecoration: 'none', fontWeight: 'bold', color: '#000' }}>
                  Back to Login
                </NavLink>
              </Typography>
            </Box>
          </Box>
        </FormProvider>
        
        {/* Success Snackbar */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Password has been reset successfully. Please login with the new password.
          </Alert>
        </Snackbar>
        
        {/* Error Snackbar */}
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  )
}

export default ResetPasswordPage 