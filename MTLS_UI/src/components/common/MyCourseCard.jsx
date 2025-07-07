/* eslint-disable react/prop-types */
import { Box, Card, Typography, Button } from '@mui/material'
import { Users } from 'lucide-react'

const MyCourseCard = ({
  title,
  image,
  duration,
  students,
  lessons,
  progress,
  grade,
  onClick,
}) => {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        gap: 2,
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      }}
      onClick={onClick}
    >
      <Box
        component='img'
        src={image}
        alt={title}
        sx={{
          width: 120,
          height: 80,
          objectFit: 'cover',
          borderRadius: 1,
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h6'>{title}</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: 'text.secondary',
          }}
        >
          <Typography variant='body2'>{duration}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Users size={16} />
            <Typography variant='body2'>{students}</Typography>
          </Box>
          <Typography variant='body2'>{lessons} bài học</Typography>
        </Box>
      </Box>

      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography
          variant='body2'
          color='text.secondary'
        >
          Hoàn thành
        </Typography>
        <Typography
          variant='h6'
          color='primary'
        >
          {progress}
        </Typography>
        {grade && (
          <Typography
            variant='h6'
            color='success.main'
          >
            {grade}
          </Typography>
        )}
      </Box>
    </Card>
  )
}

export default MyCourseCard
