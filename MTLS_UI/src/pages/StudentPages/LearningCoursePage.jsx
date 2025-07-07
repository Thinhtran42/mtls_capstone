import { Box } from '@mui/material'
import LessonContent from '../../components/common/LessonContent'

const LearningCoursePage = () => {
  console.log('LearningCoursePage')
  return (
    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'row', gap: '2' }}>
      <LessonContent />
    </Box>
  )
}

export default LearningCoursePage
