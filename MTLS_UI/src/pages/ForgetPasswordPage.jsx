import { Box, Button, Grid, Typography, Snackbar, Alert, CircularProgress } from '@mui/material'
import loginImage from '../assets/loginImage.svg'
import InputField from '../components/common/InputField'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormProvider, useForm } from 'react-hook-form'
import LoginViaSocial from '../components/common/LoginViaSocial'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '../api/services/auth.service'

const schema = yup.object().shape({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
})

const ForgetPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const methods = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const response = await authService.forgotPassword(data.email)
      console.log('Forgot password response:', response)
      setSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      
      if (error.response?.status === 404 || error.response?.data?.message === 'User not found') {
        setError('Email không tồn tại trong hệ thống')
      } else if (error.isConnectionError) {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
      } else {
        setError(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
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

      {/* Phần form đăng nhập bên phải */}
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
              Forgot Password
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email and we will send a link to reset your password.
            </Typography>
            
            <InputField
              name='email'
              label='Email'
              type='email'
              validation={{
                required: 'Email is required',
              }}
            />
            
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isLoading}
              sx={{
                marginTop: '16px',
                borderRadius: '30px',
                minWidth: '200px',
                position: 'relative'
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
            </Button>

            {/* Back to Login link placed below Continue button */}
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                <NavLink to='/login' style={{ textDecoration: 'none', fontWeight: 'bold', color: '#000' }}>
                  Back to Login
                </NavLink>
              </Typography>
            </Box>

            <LoginViaSocial />
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
            The password reset link has been sent to your email.
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

export default ForgetPassword

