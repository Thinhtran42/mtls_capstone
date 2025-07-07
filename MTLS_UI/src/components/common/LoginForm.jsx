// src/components/common/LoginForm.jsx
import { FormProvider, useForm } from 'react-hook-form'
import { Box, Button, Typography, CircularProgress, Snackbar, Alert } from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import InputField from './InputField'
import { useState, useEffect } from 'react'
import LoginViaSocial from './LoginViaSocial'
import { authService } from '../../api/services/auth.service'
import { settingsService } from '../../api/services/settings.service'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [securitySettings, setSecuritySettings] = useState({ passwordMinLength: 6 })
  const navigate = useNavigate()
  
  // Lấy cài đặt bảo mật khi component mount
  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const response = await settingsService.getSystemSettings();
        if (response.data && response.data.security) {
          setSecuritySettings(response.data.security);
        }
      } catch (error) {
        console.error('Không thể lấy cài đặt bảo mật:', error);
      }
    };
    
    fetchSecuritySettings();
  }, []);
  
  // Tạo schema động dựa trên cài đặt passwordMinLength
  const schema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
      .string()
      .min(securitySettings.passwordMinLength, `Password must be at least ${securitySettings.passwordMinLength} characters`)
      .required('Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    },
    // Cập nhật validation rules khi securitySettings thay đổi
    context: { securitySettings }
  });

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    console.log('Logging in with:', data);

    try {
      const response = await authService.login(data.email, data.password)
      console.log('Login successful:', response)

      // Kiểm tra nếu response chứa thông báo lỗi mặc dù không throw exception
      if (response.statusCode === 401 || response.error) {
        setError(response.message || 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
        // Đặt lỗi cho các trường đăng nhập
        methods.setError('email', { type: 'manual', message: ' ' });
        methods.setError('password', { type: 'manual', message: ' ' });
        setIsLoading(false)
        return
      }

      // Redirect based on role
      if (response.user && response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Kiểm tra nếu tài khoản bị khóa
      if (error.response && error.response.data && error.response.data.message.includes('tạm khóa')) {
        setError(error.response.data.message);
        navigate('/forget-password');
      } else {
        setError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
      }
      
      methods.setError('email', { type: 'manual', message: ' ' });
      methods.setError('password', { type: 'manual', message: ' ' });
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnackbarClose = () => {
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
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
        </Button>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ textAlign: 'left', mt: 1 }}
        >
          Are you a teacher or admin?{' '}
          <NavLink
            to='/admin/login'
            style={{
              textDecoration: 'none',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            Login here
          </NavLink>
        </Typography>
        {/* <Divider sx={{ my: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ px: 1 }}>
            OR
          </Typography>
        </Divider> */}
        <LoginViaSocial setError={setError} />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            Don&apos;t have an account yet?{' '}
            <NavLink
              to='/register'
              style={{ textDecoration: 'none', color: 'primary', fontWeight: 'bold' }}
            >
              Register now
            </NavLink>
          </Typography>
        </Box>
      </Box>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity='error'>
          {error}
        </Alert>
      </Snackbar>
    </FormProvider>
  )
}

export default LoginForm