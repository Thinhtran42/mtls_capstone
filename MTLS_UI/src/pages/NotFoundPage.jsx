import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import notFoundImage from '../assets/NotFoundPage.jpg'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <img
        src={notFoundImage}
        alt='Not Found'
        style={{
          width: '100%',
          maxWidth: '400px',
          height: 'auto',
          marginBottom: '24px',
        }}
      />

      <Typography
        variant='h5'
        gutterBottom
      >
        Oops! Page Not Found
      </Typography>
      <Typography
        variant='body1'
        color='textSecondary'
        gutterBottom
      >
        Trang này hiện không tìm thấy, hoặc đã bị xóa, xin vui lòng trở về trang
        chủ
      </Typography>
      <Button
        variant='contained'
        color='primary'
        onClick={() => navigate('/')}
        sx={{ marginTop: '16px' }}
      >
        Đi tới Homepage
      </Button>
    </Box>
  )
}

export default NotFoundPage
