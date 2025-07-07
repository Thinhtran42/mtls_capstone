/* eslint-disable react/prop-types */
import { Box, Card, Typography, Button } from '@mui/material'

const ResultCard = ({ result, onClick }) => {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        gap: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: 2,
        width: '900px',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#e3f2fd',
          borderRadius: 2,
          p: 2,
          minWidth: 100,
          textAlign: 'center',
          border: '4px solid #0D6FB0',
        }}
      >
        <Typography
          variant='h4'
          component='div'
          sx={{ fontWeight: 'bold' }}
        >
          {result.date.day}
        </Typography>
        <Typography
          variant='subtitle1'
          component='div'
        >
          Tháng {result.date.month}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant='h6'
          component='div'
        >
          {result.title}
        </Typography>
        <Typography
          variant='body2'
          color='success.main'
        >
          {result.status}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant='h4'
          component='div'
          sx={{
            color: '#4caf50',
            fontWeight: 'bold',
          }}
        >
          {result.grade}
        </Typography>
        <Button
          variant='text'
          color='primary'
          onClick={onClick}
        >
          Xem chi tiết
        </Button>
      </Box>
    </Card>
  )
}

export default ResultCard
