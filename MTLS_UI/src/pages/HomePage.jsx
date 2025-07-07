import {
  Music,
  BookOpen,
  PenTool,
  Brain,
  Lightbulb,
  Headphones,
  FileAudio,
  ChevronRight,
} from 'lucide-react'
import {
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Box,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const LessonCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}))

const ExerciseCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}))

const ViewMoreButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

const Homepage = () => {
  return (
    <Box>
      {/* Hero Section - Unchanged */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'common.white',
          py: 12,
        }}
      >
        <Container>
          <Grid
            container
            spacing={6}
            alignItems='center'
          >
            <Grid
              item
              xs={12}
              md={7}
            >
              <Typography
                variant='h2'
                component='h1'
                fontWeight='bold'
                mb={3}
              >
                Học lý thuyết âm nhạc miễn phí
              </Typography>
              <Typography
                variant='h6'
                mb={4}
                sx={{ opacity: 0.9 }}
              >
                Khám phá thế giới âm nhạc qua các bài học tương tác và bài tập
                thực hành
              </Typography>
              <Button
                variant='contained'
                size='large'
                sx={{
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Bắt đầu học ngay
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              md={5}
            >
              <Box
                component='img'
                src='https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                alt='Music theory'
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 8,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Learning Sections */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant='h4'
          component='h2'
          fontWeight='bold'
          mb={4}
          textAlign='center'
        >
          Nội dung học tập
        </Typography>
        <Grid
          container
          spacing={4}
        >
          {[
            {
              title: 'Khái niệm cơ bản',
              description:
                'Tìm hiểu về nốt nhạc, khóa nhạc, và các ký hiệu âm nhạc cơ bản',
              icon: <Music size={32} />,
              image:
                'https://images.unsplash.com/photo-1514119412350-e174d90d280e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              exercises: [
                'Nhận diện nốt nhạc trên khuông',
                'Xác định độ dài nốt nhạc',
                'Đọc tên nốt nhạc',
              ],
            },
            {
              title: 'Nhịp và tiết tấu',
              description: 'Học về các loại nhịp, phách, và cách đọc tiết tấu',
              icon: <FileAudio size={32} />,
              image:
                'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              exercises: [
                'Đếm nhịp cơ bản',
                'Gõ theo tiết tấu',
                'Nhận diện loại nhịp',
              ],
            },
            {
              title: 'Quãng nhạc',
              description: 'Khám phá các loại quãng và ứng dụng trong âm nhạc',
              icon: <Music size={32} />,
              image:
                'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              exercises: [
                'Xác định độ rộng quãng',
                'Phân biệt quãng trưởng/thứ',
                'Tìm quãng đảo',
              ],
            },
            {
              title: 'Thang âm và điệu thức',
              description:
                'Tìm hiểu về các loại thang âm và điệu thức trong âm nhạc',
              icon: <Headphones size={32} />,
              image:
                'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              exercises: [
                'Xây dựng thang âm trưởng/thứ',
                'Nhận biết điệu thức',
                'Chuyển đổi giữa các điệu',
              ],
            },
          ].map((section, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
            >
              <LessonCard>
                <CardMedia
                  component='img'
                  height='160'
                  image={section.image}
                  alt={section.title}
                />
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>{section.icon}</Box>
                  <Typography
                    variant='h6'
                    fontWeight='bold'
                    gutterBottom
                  >
                    {section.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    mb={2}
                  >
                    {section.description}
                  </Typography>
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    gutterBottom
                  >
                    Bài tập thực hành:
                  </Typography>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    {section.exercises.map((exercise, i) => (
                      <li key={i}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          {exercise}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </LessonCard>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center' }}>
          <ViewMoreButton
            variant='outlined'
            color='primary'
            endIcon={<ChevronRight />}
          >
            Xem thêm bài học
          </ViewMoreButton>
        </Box>
      </Container>

      {/* Interactive Exercise Examples */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Typography
            variant='h4'
            component='h2'
            fontWeight='bold'
            mb={4}
            textAlign='center'
          >
            Các dạng bài tập tương tác
          </Typography>
          <Grid
            container
            spacing={4}
          >
            {[
              {
                title: 'Nhận diện nốt nhạc',
                description:
                  'Luyện tập đọc và nhận biết các nốt nhạc trên khuông nhạc',
                icon: <BookOpen size={24} />,
                image:
                  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                features: [
                  'Hiển thị khuông nhạc tương tác',
                  'Phản hồi ngay lập tức',
                  'Theo dõi tiến độ',
                ],
              },
              {
                title: 'Xác định quãng',
                description: 'Thực hành nhận biết và phân biệt các loại quãng',
                icon: <PenTool size={24} />,
                image:
                  'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                features: [
                  'Nghe và so sánh quãng',
                  'Bài tập đa dạng',
                  'Hướng dẫn chi tiết',
                ],
              },
              {
                title: 'Đọc tiết tấu',
                description: 'Luyện tập đọc và gõ các mẫu tiết tấu khác nhau',
                icon: <Brain size={24} />,
                image:
                  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                features: [
                  'Gõ theo nhịp',
                  'Kiểm tra độ chính xác',
                  'Tăng dần độ khó',
                ],
              },
              {
                title: 'Nhận biết hợp âm',
                description: 'Học cách nhận diện và phân biệt các loại hợp âm',
                icon: <Lightbulb size={24} />,
                image:
                  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                features: [
                  'Nghe và phân tích hợp âm',
                  'Xây dựng hợp âm',
                  'Thực hành với piano ảo',
                ],
              },
            ].map((exercise, index) => (
              <Grid
                item
                xs={12}
                md={6}
                key={index}
              >
                <ExerciseCard sx={{ display: 'flex', height: '100%' }}>
                  <CardMedia
                    component='img'
                    sx={{ width: 200 }}
                    image={exercise.image}
                    alt={exercise.title}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: 'primary.main', mr: 2 }}>
                        {exercise.icon}
                      </Box>
                      <Typography
                        variant='h6'
                        fontWeight='bold'
                      >
                        {exercise.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      mb={2}
                    >
                      {exercise.description}
                    </Typography>
                    <Typography
                      variant='subtitle2'
                      fontWeight='bold'
                      gutterBottom
                    >
                      Tính năng:
                    </Typography>
                    <ul style={{ paddingLeft: '20px', margin: '0' }}>
                      {exercise.features.map((feature, i) => (
                        <li key={i}>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            {feature}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </ExerciseCard>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center' }}>
            <ViewMoreButton
              variant='outlined'
              color='primary'
              endIcon={<ChevronRight />}
            >
              Xem thêm bài tập
            </ViewMoreButton>
          </Box>
        </Container>
      </Box>

      {/* Thống kê và thành tựu */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant='h4'
          component='h2'
          fontWeight='bold'
          mb={6}
          textAlign='center'
        >
          Thống kê và thành tựu
        </Typography>
        <Grid
          container
          spacing={4}
        >
          {[
            {
              number: '1000+',
              label: 'Học viên đã tham gia',
              icon: <Brain size={32} />,
            },
            {
              number: '50+',
              label: 'Bài học lý thuyết',
              icon: <BookOpen size={32} />,
            },
            {
              number: '200+',
              label: 'Bài tập thực hành',
              icon: <PenTool size={32} />,
            },
            {
              number: '95%',
              label: 'Học viên hài lòng',
              icon: <Lightbulb size={32} />,
            },
          ].map((stat, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
            >
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ color: 'primary.main' }}>{stat.icon}</Box>
                <Typography
                  variant='h3'
                  component='div'
                  fontWeight='bold'
                  color='primary'
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant='subtitle1'
                  color='text.secondary'
                >
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Typography
            variant='h4'
            component='h2'
            fontWeight='bold'
            mb={6}
            textAlign='center'
          >
            Đánh giá từ học viên
          </Typography>
          <Grid
            container
            spacing={4}
          >
            {[
              {
                name: 'Nguyễn Văn A',
                role: 'Học viên piano',
                content:
                  'Khóa học giúp tôi hiểu rõ hơn về lý thuyết âm nhạc. Các bài tập tương tác rất hữu ích.',
                image:
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Trần Thị B',
                role: 'Giáo viên âm nhạc',
                content:
                  'Tài liệu học tập được trình bày rất rõ ràng, dễ hiểu. Tôi thường giới thiệu cho học viên của mình.',
                image:
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Lê Văn C',
                role: 'Sinh viên nhạc viện',
                content:
                  'Website giúp tôi ôn tập kiến thức một cách hiệu quả. Các bài tập tương tác rất thú vị.',
                image:
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
              },
            ].map((testimonial, index) => (
              <Grid
                item
                xs={12}
                md={4}
                key={index}
              >
                <Card sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      component='img'
                      src={testimonial.image}
                      alt={testimonial.name}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        mr: 2,
                      }}
                    />
                    <Box>
                      <Typography
                        variant='h6'
                        fontWeight='bold'
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='body1'>{testimonial.content}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default Homepage
