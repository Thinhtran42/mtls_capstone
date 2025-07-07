import { Container, Box, Typography, Stack } from '@mui/material'
import CourseCard from '../components/common/CourseCard'

const CoursePage = () => {
  const courses = [
    {
      title: 'CƠ BẢN',
      description: {
        mucTieu:
          'Làm quen với khuông nhạc, nốt nhạc, khóa nhạc và các ký hiệu cơ bản',
        noiDung: [
          '- Khuông nhạc, dòng kẻ và khe trống',
          '- Khóa Sol (Treble Clef) và khóa Fa (Bass Clef)',
          '- Ký hiệu nhạc và cách đọc chúng',
        ],
        ketQua:
          'Học viên có thể đọc hiểu chính xác, trực nốt nhạc cơ bản và nhận diện trên khuông nhạc.',
      },
      image:
        'https://images.unsplash.com/photo-1475275166152-f1e8005f9854?q=80&w=2672&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'NHỊP ĐIỆU & NHỊP PHÁCH',
      description: {
        mucTieu:
          'Hiểu về nhịp điệu, nhịp phách, và cách chúng được thể hiện trong âm nhạc',
        noiDung: [
          '- Nhịp (Meter) và nhịp phách (Beat)',
          '- Các loại nhịp: 2/4, 3/4, 4/4',
        ],
      },
      image:
        'https://images.unsplash.com/photo-1475275166152-f1e8005f9854?q=80&w=2672&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ]
  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Box sx={{ mt: 8 }}>
        <Typography
          variant='h3'
          component='h2'
          align='center'
          color='primary'
          gutterBottom
          sx={{ mb: 4 }}
        >
          HỌC LÝ THUYẾT ÂM NHẠC
          <Typography
            variant='h4'
            component='div'
            align='center'
            color='primary'
            gutterBottom
          >
            TỪ CƠ BẢN TỚI NÂNG CAO
          </Typography>
        </Typography>

        <Typography
          variant='body1'
          align='center'
          sx={{
            mb: 6,
            maxWidth: '800px',
            mx: 'auto',
            color: 'text.secondary',
          }}
        >
          Khám phá thế giới âm nhạc qua các khóa học lý thuyết được thiết kế hai
          bước từ cơ bản đến nâng cao. Dù bạn là người mới bắt đầu hay đã có
          kiến thức nền tảng, các khóa học này sẽ giúp bạn xây dựng kỹ năng và
          kiến thức lý thuyết âm nhạc vững chắc.
        </Typography>

        <Typography
          variant='h5'
          component='h3'
          sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}
        >
          {courses.length} Khóa Học
        </Typography>

        <Stack spacing={4}>
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              course={course}
              index={index}
            />
          ))}
        </Stack>
      </Box>
    </Container>
  )
}

export default CoursePage
