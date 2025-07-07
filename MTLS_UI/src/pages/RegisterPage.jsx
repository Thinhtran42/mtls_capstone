import { Box, Grid } from '@mui/material'
import registerImage from '../assets/registerImage.svg'
import RegisterForm from '../components/common/RegisterForm'

const RegisterPage = () => {
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
            src={registerImage}
            alt='Login'
            style={{ width: '100%', maxWidth: '500px', height: 'auto' }}
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
          <RegisterForm />
        </Box>
      </Grid>
    </Grid>
  )
}

export default RegisterPage
