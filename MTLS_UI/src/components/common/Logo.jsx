/* eslint-disable react/prop-types */
import { Box } from '@mui/material'
import logo from '../../assets/Logo.svg'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../api/services/user.service'

const Logo = ({ height, width }) => {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    const user = userService.getCurrentUser();
    console.log('Logo click - user role:', user?.role);
    
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/overview');
    } else {
      navigate('/student/overview');
    }
  }
  
  return (
    <Box
      sx={{
        height: height,
        width: width,
        cursor: 'pointer',
      }}
      onClick={handleLogoClick}
    >
      <img
        src={logo}
        alt='logo MTLS'
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  )
}

export default Logo
