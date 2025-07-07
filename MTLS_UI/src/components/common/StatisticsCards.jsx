/* eslint-disable react/prop-types */
import { Box, Typography } from '@mui/material'

const StatisticsCards = ({ value, label, bgcolor, color, shadowColor }) => {
  return (
    <Box
      sx={{
        bgcolor: bgcolor,
        borderRadius: '16px',
        p: 2,
        width: '200px',
        textAlign: 'center',
        boxShadow: `4px 4px 10px ${shadowColor}`,
      }}
    >
      <Typography
        variant='h4'
        sx={{
          color: color,
          fontWeight: 'bold',
          mb: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant='body1'
        sx={{
          color: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default StatisticsCards
