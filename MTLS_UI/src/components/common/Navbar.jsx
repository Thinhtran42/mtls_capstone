import { Box } from '@mui/material'
import NavItem from './NavItem'

const Navbar = () => {
  return (
    <Box
      component='nav'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        gap: '20rem',
      }}
    >
      <NavItem
        to='/'
        label='Trang chủ'
      />
      <NavItem
        to='/course'
        label='Bài học'
      />
      <NavItem
        to='/about'
        label='Về chúng tôi'
      />
    </Box>
  )
}

export default Navbar
