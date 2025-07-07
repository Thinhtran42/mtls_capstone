import { Box } from '@mui/material'

// eslint-disable-next-line react/prop-types
const Layout = ({ children }) => {
  return (
    <>
      <Box
        sx={{
          padding: '16px',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        {children}
      </Box>
    </>
  )
}

export default Layout
