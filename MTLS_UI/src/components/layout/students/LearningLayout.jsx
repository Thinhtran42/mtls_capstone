import { Box } from '@mui/material'
import Header from './Header'
import LearningModulesMenu from '../../common/LearningModulesMenu'
import { Outlet } from 'react-router-dom'

const LearningLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          marginTop: '56px',
          position: 'relative',
          zIndex: 900,
        }}
      >
        <LearningModulesMenu />
        <Box
          sx={{
            padding: { xs: '16px', md: '24px' },
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default LearningLayout
