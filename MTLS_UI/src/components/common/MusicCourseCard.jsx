/* eslint-disable react/prop-types */
import { Box, Typography, Card, CardMedia, LinearProgress } from '@mui/material'
import PropTypes from 'prop-types'

const MusicCourseCard = ({
  title,
  image,
  imageAlt,
  lessonProgress,
  totalLessons,
  recentGrade,
  progressValue,
  progressColor = '#2196f3',
  progressBgColor = '#bbdefb',
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '40px',
        width: 280, // Fixed width
        height: 340, // Fixed height
        overflow: 'hidden',
        bgcolor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #dcdcdc',
        flexShrink: 0,
      }}
    >
      <CardMedia
        component='img'
        height='180'
        image={image}
        alt={imageAlt}
        sx={{
          objectFit: 'cover',
        }}
      />

      <Box
        sx={{
          bgcolor: 'white',
          mt: -2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant='h6'
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              bgcolor: '#e3f2fd',
              borderRadius: '12px',
              p: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant='body1'>
                Lesson: {lessonProgress}/{totalLessons}
              </Typography>
              <Typography variant='body1'>Grade: {recentGrade}</Typography>
            </Box>

            <LinearProgress
              variant='determinate'
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: progressBgColor,
                '& .MuiLinearProgress-bar': {
                  bgcolor: progressColor,
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

MusicCourseCard.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  imageAlt: PropTypes.string,
  lessonProgress: PropTypes.number.isRequired,
  totalLessons: PropTypes.number.isRequired,
  recentGrade: PropTypes.string.isRequired,
  progressValue: PropTypes.number.isRequired,
  progressColor: PropTypes.string,
  progressBgColor: PropTypes.string,
}

export default MusicCourseCard
