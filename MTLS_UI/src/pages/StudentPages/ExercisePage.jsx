/* eslint-disable no-unused-vars */
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Container,
  Grid,
} from '@mui/material'
import {
  MenuBook,
  CheckCircle,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { courses } from '../../data/dataLesson' // Sử dụng courses thay vì exercises và modules
import { GoalTracker } from '../../components/common/GoalTracker'
import { CourseTimeline } from '../../components/common/CourseTimeline'

// Hàm để lấy dữ liệu từ localStorage hoặc dữ liệu mặc định
const getStoredCourses = () => {
  const storedData = localStorage.getItem('courseData')
  return storedData ? JSON.parse(storedData) : courses
}

export function ExercisePage() {
  const navigate = useNavigate()
  const { courseId } = useParams() // Lấy courseId từ URL
  const [courseData, setCourseData] = useState(getStoredCourses)
  const [openSections, setOpenSections] = useState({}) // State để theo dõi trạng thái mở của từng module

  // Tìm course hiện tại dựa trên courseId
  const currentCourse = courseData.find((c) => c.id === Number(courseId))

  if (!currentCourse) {
    return (
      <Box p={4}>
        <Typography>Course not found</Typography>
      </Box>
    )
  }

  // Lọc các section có type là 'exercise' từ tất cả module trong course
  const exerciseSections = currentCourse.modules.flatMap((module) =>
    module.sections.filter((section) => section.type === 'exercise')
  )

  const getIcon = (type, status) => {
    if (status === 'complete') return <CheckCircle sx={{ color: '#4CAF50' }} />
    switch (type) {
      case 'exercise':
        return <MenuBook />
      default:
        return null
    }
  }

  const isExerciseAccessible = (moduleSections, currentIndex) => {
    const previousExercises = moduleSections
      .slice(0, currentIndex)
      .filter((s) => s.type === 'exercise')
    return previousExercises.every((section) => section.status === 'complete')
  }

  const handleSectionClick = (moduleId, sectionIndex) => {
    const module = currentCourse.modules.find((m) => m.id === Number(moduleId))
    const section = module.sections[sectionIndex]
    const isExercise = section.type === 'exercise'
    const isAccessible =
      !isExercise || isExerciseAccessible(module.sections, sectionIndex)

    if (isAccessible) {
      navigate(
        `/student/exercise/${courseId}/module/${moduleId}/section/${sectionIndex}`
      )
    }
  }

  const handleComplete = (moduleId, sectionIndex, isCompleted) => {
    setCourseData((prevCourses) => {
      const newCourses = [...prevCourses]
      const courseIndex = newCourses.findIndex((c) => c.id === Number(courseId))
      if (courseIndex !== -1) {
        const moduleIndex = newCourses[courseIndex].modules.findIndex(
          (m) => m.id === Number(moduleId)
        )
        if (moduleIndex !== -1) {
          newCourses[courseIndex].modules[moduleIndex] = {
            ...newCourses[courseIndex].modules[moduleIndex],
            sections: newCourses[courseIndex].modules[moduleIndex].sections.map(
              (section, idx) => {
                if (idx === sectionIndex) {
                  return {
                    ...section,
                    status: isCompleted ? 'complete' : undefined,
                  }
                }
                return section
              }
            ),
          }
        }
      }
      localStorage.setItem('courseData', JSON.stringify(newCourses))
      return newCourses
    })
  }

  const toggleSection = (moduleId) => {
    setOpenSections((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', width: '80vw' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: '1600px',
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{
            maxWidth: '1400px',
            margin: '0 auto',
            justifyContent: 'center',
          }}
        >
          <Grid
            item
            xs={12}
            md={8}
            lg={7}
            sx={{
              maxWidth: '800px',
            }}
          >
            <Box>
              <Typography
                variant='h5'
                gutterBottom
                fontWeight='bold'
                mb={3}
                sx={{ color: '#000' }}
              >
                Bài tập - {currentCourse.title}
              </Typography>

              <Typography
                variant='body1'
                color='text.secondary'
                mb={3}
              >
                {currentCourse.description}
              </Typography>

              {currentCourse.modules.map((module) => {
                const moduleExercises = module.sections.filter(
                  (section) => section.type === 'exercise'
                )
                if (moduleExercises.length === 0) return null // Bỏ qua module không có exercise
                const isOpen = openSections[module.id] || false

                return (
                  <Box
                    key={module.id}
                    mb={4}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <ListItem
                        button
                        onClick={() => toggleSection(module.id)}
                        sx={{
                          borderRadius: '8px 8px 0 0',
                          '&:hover': {
                            backgroundColor: '#D9EEFB',
                          },
                        }}
                      >
                        <ListItemText
                          primary={`Bài tập - ${module.title}`}
                          primaryTypographyProps={{
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            color: '#000',
                          }}
                        />
                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>
                      <Collapse
                        in={isOpen}
                        timeout='auto'
                        unmountOnExit
                      >
                        <List
                          component='div'
                          disablePadding
                          sx={{
                            backgroundColor: '#FAFAFA',
                            borderRadius: '0 0 8px 8px',
                          }}
                        >
                          {moduleExercises.map((section, index) => {
                            const sectionIndex =
                              module.sections.indexOf(section) // Lấy chỉ số thực trong sections
                            const isExercise = section.type === 'exercise'
                            const isAccessible =
                              !isExercise ||
                              isExerciseAccessible(
                                module.sections,
                                sectionIndex
                              )
                            const isCompleted = section.status === 'complete'

                            return (
                              <ListItem
                                key={index}
                                button
                                onClick={() =>
                                  handleSectionClick(module.id, sectionIndex)
                                }
                                sx={{
                                  pl: 4,
                                  '&:hover': {
                                    backgroundColor: isAccessible
                                      ? '#D9EEFB'
                                      : 'transparent',
                                  },
                                  borderBottom: '1px solid #eee',
                                  '&:last-child': {
                                    borderBottom: 'none',
                                  },
                                  opacity: isAccessible ? 1 : 0.5,
                                  cursor: isAccessible
                                    ? 'pointer'
                                    : 'not-allowed',
                                  backgroundColor: isCompleted
                                    ? '#E3F2FD'
                                    : 'transparent', // Nền xanh nhạt cho completed
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    marginRight: '0px',
                                    paddingRight: '0px',
                                    minWidth: '30px',
                                  }}
                                >
                                  {getIcon(section.type, section.status)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={section.title}
                                  primaryTypographyProps={{
                                    fontSize: '0.95rem',
                                    color: isAccessible
                                      ? '#000'
                                      : 'text.secondary',
                                  }}
                                />
                                <ListItemSecondaryAction>
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    {section.duration} min
                                  </Typography>
                                </ListItemSecondaryAction>
                              </ListItem>
                            )
                          })}
                        </List>
                      </Collapse>
                    </Paper>
                  </Box>
                )
              })}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            sx={{
              position: { md: 'sticky' },
              top: { md: 24 },
              height: { md: 'fit-content' },
              alignSelf: { md: 'flex-start' },
              marginLeft: '200px',
              marginRight: '0',
            }}
          >
            <GoalTracker />
            <CourseTimeline />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ExercisePage
