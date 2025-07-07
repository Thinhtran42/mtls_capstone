import { NavLink } from 'react-router-dom'
import { Typography } from '@mui/material'

// eslint-disable-next-line react/prop-types
const NavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        color: isActive ? '#1976d2' : '#000',
        fontWeight: 'bold',
      })}
    >
      <Typography variant='h6'>{label}</Typography>
    </NavLink>
  )
}

export default NavItem
