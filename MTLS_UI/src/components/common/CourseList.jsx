/* eslint-disable react/prop-types */
import { Box } from '@mui/material'
import MyCourseCard from './MyCourseCard'
import { useNavigate } from 'react-router-dom'

const CourseList = ({ courses, level }) => {
  const navigate = useNavigate()

  const handleCourseClick = (course) => {
    if (course._id) {
      navigate(`/student/course/${course._id}`);
    } else {
      const urlFriendlyTitle = course.title?.toLowerCase().replace(/\s+/g, '-') || '';
      navigate(`/student/course/${level}/${urlFriendlyTitle}`);
    }
  }

  return (
    <Box sx={{ padding: '0 0 0 2px' }}>
      <Box sx={{ maxWidth: 800 }}>
        {courses.map((course, index) => (
          <MyCourseCard
            key={index}
            title={course.title}
            image={course.image}
            duration={course.duration}
            students={course.students}
            lessons={course.lessons?.length || 0}
            progress={`${course.lessons?.length || 0}/${course.lessons?.length || 0}`}
            grade={course.grade}
            onClick={() => handleCourseClick(course)}
          />
        ))}
      </Box>
    </Box>
  )
}

export default CourseList
