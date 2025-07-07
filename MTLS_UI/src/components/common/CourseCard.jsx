/* eslint-disable react/prop-types */
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material'

const CourseCard = (props) => {
  const { course, index } = props
  return (
    <Card
      key={index}
      sx={{
        display: 'flex',
        bgcolor: '#f5f5f5',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardMedia
        component='img'
        sx={{ width: 300 }}
        image={course.image}
        alt={course.title}
      />
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Typography
          variant='h5'
          component='h4'
          gutterBottom
          color='#000'
          fontWeight='bold'
        >
          {course.title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
          >
            Mục tiêu:
          </Typography>
          <Typography paragraph>{course.description.mucTieu}</Typography>

          <Typography
            variant='subtitle1'
            fontWeight='bold'
          >
            Nội dung:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {course.description.noiDung.map((item, i) => (
              <li key={i}>
                <Typography>{item}</Typography>
              </li>
            ))}
          </ul>

          {course.description.ketQua && (
            <>
              <Typography
                variant='subtitle1'
                fontWeight='bold'
              >
                Kết quả:
              </Typography>
              <Typography>{course.description.ketQua}</Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CourseCard
