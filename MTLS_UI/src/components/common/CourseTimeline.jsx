import { Box, Card, Paper, Typography } from '@mui/material'
import { useParams, useLocation } from 'react-router-dom'
import { Lock, MenuBook, PlayCircle, Assignment as AssignmentIcon, Quiz as QuizIcon } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { courseService } from '../../api'

export function CourseTimeline() {
  const { courseId, moduleId } = useParams()
  const location = useLocation()

  const [courseData, setCourseData] = useState(null)
  const [currentModule, setCurrentModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch course data with progress
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)

        // Get user ID from localStorage
        const studentId = localStorage.getItem('userId')

        if (!studentId || !courseId) {
          setError('Student ID or Course ID not found')
          return
        }

        // Call API to get course data with progress
        const response = await courseService.getCourseWithProgress(courseId, studentId)
        const data = response?.data

        if (!data) {
          setError('Course data not found')
          return
        }

        setCourseData(data)

        // Find the current module
        if (moduleId && data.modules) {
          const module = data.modules.find(m => m._id === moduleId)
          setCurrentModule(module || null)
        } else {
          setCurrentModule(null)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching course data:', err)
        setError('Unable to load course data')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, moduleId, location.key])

  // If loading or error, don't display anything
  if (loading || error || !courseData) return null

  // Calculate progress for the current module
  const calculateModuleProgress = () => {
    if (!currentModule) {
      // If no current module, use the course overall progress
      return courseData.progress || { percentage: 0, completed: 0, total: 1 }
    }

    let completed = 0
    let total = 0

    // Count components in all sections
    currentModule.sections.forEach(section => {
      if (section.components && Array.isArray(section.components)) {
        total += section.components.length

        // Count completed components
        section.components.forEach(component => {
          if (component.status === 'completed') {
            completed++
          }
        })
      }
    })

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { percentage, completed, total }
  }

  // Get upcoming lessons from the current module only
  const getUpcomingLessons = () => {
    const upcoming = []

    if (!currentModule) {
      // If no current module, return empty array
      return upcoming
    }

    // Loop through each section in the current module
    currentModule.sections.forEach(section => {
      // Loop through each component in section
      if (section.components && Array.isArray(section.components)) {
        section.components.forEach(component => {
          // Add to list if not completed
          if (component.status !== 'completed') {
            upcoming.push({
              title: component.title,
              type: section.type,
              duration: component.duration || 0,
              moduleTitle: currentModule.title
            })
          }
        })
      }
    })

    return upcoming
  }

  const moduleProgress = calculateModuleProgress()
  const upcomingLessons = getUpcomingLessons()

  // Get icon based on lesson type
  const getLessonIcon = (type) => {
    const upperType = (type || '').toUpperCase()

    switch (upperType) {
      case 'LESSON':
      case 'VIDEO':
        return <MenuBook fontSize='small' sx={{ color: '#1976d2' }} />
      case 'QUIZ':
        return <QuizIcon fontSize='small' sx={{ color: '#9c27b0' }} />
      case 'EXERCISE':
        return <PlayCircle fontSize='small' sx={{ color: '#ff9800' }} />
      case 'ASSIGNMENT':
        return <AssignmentIcon fontSize='small' sx={{ color: '#2196f3' }} />
      default:
        return <Lock fontSize='small' />
    }
  }

  // Get display name for lesson type
  const getLessonTypeName = (type) => {
    const upperType = (type || '').toUpperCase()

    switch (upperType) {
      case 'LESSON':
      case 'VIDEO':
        return 'Lesson'
      case 'QUIZ':
        return 'Quiz'
      case 'EXERCISE':
        return 'Exercise'
      case 'ASSIGNMENT':
        return 'Assignment'
      default:
        return 'Learning Content'
    }
  }

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Typography
        variant='h6'
        gutterBottom
        fontWeight='600'
      >
        {currentModule ? 'Module Progress' : 'Course Progress'}
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: '#FFF4E5',
          borderRadius: 2,
        }}
      >
        <Typography
          variant='subtitle1'
          fontWeight='600'
          color='error'
        >
          Progress: {moduleProgress.completed}/{moduleProgress.total} parts completed
        </Typography>
        <Typography
          color='text.secondary'
          sx={{ mb: 1 }}
        >
          {moduleProgress.percentage >= 100
            ? 'Congratulations! You have completed this module!'
            : 'Keep going! You are making great progress in this module!'}
        </Typography>
      </Paper>

      <Box
        sx={{ position: 'relative', pl: 3, borderLeft: '2px dashed #e0e0e0' }}
      >
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              position: 'absolute',
              left: -6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
            }}
          />
          <Typography
            variant='body2'
            color='text.secondary'
          >
            Current progress: {moduleProgress.percentage}%
          </Typography>
        </Box>

        {upcomingLessons.length > 0 && (
          <>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 2 }}
            >
              Remaining lessons in this module
            </Typography>

            {upcomingLessons.slice(0, 3).map((lesson, index) => (
              <Box
                key={index}
                sx={{ mb: 2 }}
              >
                <Typography variant='subtitle2'>{lesson.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getLessonIcon(lesson.type)}
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    {getLessonTypeName(lesson.type)} • {lesson.duration} min
                  </Typography>
                </Box>
              </Box>
            ))}
          </>
        )}

        <Box>
          <Box
            sx={{
              position: 'absolute',
              left: -6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
            }}
          />
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {currentModule ? 'Module completion goal' : 'Course completion goal'}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
