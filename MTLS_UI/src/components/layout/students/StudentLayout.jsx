import { Box } from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import RandomRatingModal from '../../student/RandomRatingModal'

const StudentLayout = () => {
  const location = useLocation()
  const showSidebar = location.pathname.includes('/student/course/') &&
                     !location.pathname.includes('/student/course/')
  const isOverviewPage = location.pathname.includes('/student/overview')
  const isCourseDetailPage = location.pathname.includes('/student/course/')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        {showSidebar && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginLeft: showSidebar ? '240px' : 0,
            padding: '24px',
            width: '100%',
            marginTop: '56px', // Height of header
          }}
        >
          <Box sx={{
            maxWidth: isOverviewPage || isCourseDetailPage ? '1440px' : '960px',
            margin: '0 auto',
            width: '100%',
            padding: isOverviewPage || isCourseDetailPage ? '0 48px' : '0 24px'
          }}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      <RandomRatingModal />
    </Box>
  )
}

export default StudentLayout
