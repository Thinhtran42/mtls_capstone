import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const CourseLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box sx={{ flexGrow: 1, ml: '0px', p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default CourseLayout