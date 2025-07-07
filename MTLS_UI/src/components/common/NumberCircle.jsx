/* eslint-disable react/prop-types */
import { Box } from '@mui/material'

const NumberCircle = ({ number, selected, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '2px solid',
        borderColor: selected ? '#1976d2' : '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? '#1976d2' : 'transparent',
        color: selected ? 'white' : '#757575',
        fontWeight: 'medium',
        fontSize: '16px',
        cursor: 'pointer',
        '&:hover': {
          borderColor: '#1976d2',
          backgroundColor: selected ? '#1976d2' : 'rgba(25, 118, 210, 0.04)',
        },
      }}
    >
      {number}
    </Box>
  )
}

export default NumberCircle
