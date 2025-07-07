import { FormProvider, useForm } from 'react-hook-form'
import { Box, Button, Typography, CircularProgress, Snackbar, Alert } from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import InputField from '../common/InputField'
import { useState } from 'react'
import { authService } from '../../api/services/auth.service'

// Define validation schema with yup
const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    console.log('Admin logging in with:', data);

    try {
      // Sử dụng endpoint auth riêng cho admin
      const response = await authService.adminLogin(data.email, data.password)
      console.log('Admin login successful:', response)

      // Kiểm tra role - chỉ cho phép admin và teacher đăng nhập qua form này
      if (response.user && response.user.role === 'student') {
        // Hiển thị thông báo lỗi giống như khi sai email/mật khẩu
        setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
        
        // Đặt lỗi cho các trường đăng nhập
        methods.setError('email', { type: 'manual', message: '' });
        methods.setError('password', { type: 'manual', message: '' });
        
        // Xóa token và thông tin người dùng đã lưu
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userId')
        
        setIsLoading(false)
        return
      }

      // Check if token has been saved
      const savedToken = localStorage.getItem('token');
      console.log('Token saved in localStorage:', savedToken ? 'Yes' : 'No');
      console.log('User role:', response.user?.role);

      // Save user information if needed
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }

      // Call onLoginSuccess callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(response)
      } else {
        // Redirect after successful login
        if (response.user && response.user.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/teacher/overview')
        }
      }
    } catch (error) {
      console.error('Admin login error:', error)
      console.log('Error response:', error.response);
      
      // Tất cả các lỗi đều hiển thị thông báo giống nhau
      setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
      
      // Đặt lỗi cho các trường đăng nhập
      methods.setError('email', { type: 'manual', message: ' ' });
      methods.setError('password', { type: 'manual', message: ' ' });
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setError('')
  }
 
  return (
    <FormProvider {...methods}>
      <Box
        component='form'
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          margin: '0 auto',
          maxWidth: '800px',
          padding: '32px',
          boxShadow: '0 2px 4px rgba(109, 47, 47, 0.1)',
          borderRadius: '8px',
          backgroundColor: '#fff',
        }}
      >
        <Typography
          variant='h4'
          gutterBottom
          color='primary'
        >
          Teacher/Admin Login
        </Typography>

        <InputField
          name='email'
          label='Email'
          type='email'
          validation={{
            required: 'Email is required',
          }}
        />
        <InputField
          name='password'
          label='Password'
          type={showPassword ? 'text' : 'password'}
          validation={{
            required: 'Password is required',
          }}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <Typography
          variant='body2'
          color='text.secondary'
          component={NavLink}
          to='/forget-password'
          style={{ textDecoration: 'none', color: 'primary', fontWeight: 'bold' }}
        >
          Forgot your password?
        </Typography>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          disabled={isLoading}
          sx={{
            marginTop: '16px',
            borderRadius: '30px',
            position: 'relative'
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login as Teacher/Admin'}
        </Button>

        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ marginTop: '16px' }}
        >
          Are you a student?{' '}
          <NavLink
            to='/login'
            style={{
              textDecoration: 'none',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            Login here
          </NavLink>
        </Typography>

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
      </Box>
    </FormProvider>
  )
}

export default AdminLoginForm 