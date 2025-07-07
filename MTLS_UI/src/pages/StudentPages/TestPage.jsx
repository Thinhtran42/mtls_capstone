import { Box, Stack, Typography } from '@mui/material'
import ResultCard from '../../components/common/ResultCard'
import { useNavigate } from 'react-router-dom'

const results = [
  {
    date: { day: 22, month: 12 },
    title: 'QUÃNG',
    status: 'Đã hoàn thành',
    grade: 'A',
    completed: true,
  },
  {
    date: { day: 19, month: 12 },
    title: 'THANH ÂM & DẤU HOÁ',
    status: 'Chưa làm',
    completed: false,
  },
  {
    date: { day: 10, month: 12 },
    title: 'NHỊP ĐIỆU & NHỊP PHÁCH',
    status: 'Đã hoàn thành',
    grade: 'B',
    completed: true,
  },
]

const TestPage = () => {
  const navigate = useNavigate()
  const handleTestClick = (result) => {
    const urlFriendlyTitle = result.title.toLowerCase().replace(/\s+/g, '-')
    navigate(`/student/test/${urlFriendlyTitle}`)
  }
  return (
    <Box sx={{ margin: '50px 0 0 40px' }}>
      <Typography
        variant='h4'
        component='h4'
        color='#DE5E99'
        gutterBottom
        sx={{ mb: 4 }}
      >
        Kết quả
      </Typography>
      <Box sx={{ margin: '10px 0 0 0' }}>
        <Box
          sx={{
            p: 0,
            //maxWidth: 800,
            mx: 'auto',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <Stack spacing={3}>
            {results.map((result, index) => (
              <Box
                key={index}
                sx={{
                  opacity: result.completed ? 1 : 0.7,
                  backgroundColor: result.completed ? '#fff' : '#f5f5f5',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scale(1.01)',
                  },
                }}
              >
                <ResultCard
                  key={index}
                  result={result}
                  onClick={() => handleTestClick(result)}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default TestPage
