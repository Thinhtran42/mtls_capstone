import { Container, Paper, Stack, Typography } from '@mui/material'
import { Box } from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import AlbumIcon from '@mui/icons-material/Album'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'

const AboutPage = () => {
  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Typography
        variant='h4'
        component='h1'
        align='center'
        color='#DE5E99'
        padding='40px'
        gutterBottom
      >
        VỀ CHÚNG TÔI
      </Typography>

      <Stack spacing={4}>
        {/* First Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <MusicNoteIcon sx={{ fontSize: 100, color: 'primary.main' }} />
          </Box>
          <Paper
            elevation={3}
            sx={{
              flex: 2,
              p: 3,
              bgcolor: '#C8E0C3',
              borderRadius: 4,
            }}
          >
            <Typography>
              Chào mừng bạn đến với MTLS - hệ thống học lý thuyết âm nhạc tiên
              tiến, nơi giúp bạn khám phá và làm chủ âm nhạc một cách dễ dàng và
              thú vị hơn bao giờ hết!
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Tại MTLS, chúng tôi hiểu rằng lý thuyết âm nhạc có thể phức tạp và
              đôi khi khiến người học cảm thấy choáng ngợp. Vì vậy, chúng tôi đã
              phát triển một nền tảng tiện lợi và trực tiếp (AI) để hỗ trợ bạn
              từng bước trên hành trình học tập, hoàn toàn miễn phí.
            </Typography>
          </Paper>
        </Box>

        {/* Second Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Paper
            elevation={3}
            sx={{
              flex: 2,
              p: 3,
              bgcolor: '#C8E0C3',
              borderRadius: 4,
            }}
          >
            <Typography>
              MTLS là một hệ thống giáo dục trực tuyến được thiết kế dành cho
              mọi đối tượng - từ người mới bắt đầu muốn tìm quan với các khái
              niệm cơ bản, đến những nhạc sĩ chuyên nghiệp cần củng cố và mở
              rộng kiến thức lý thuyết của mình.
            </Typography>
          </Paper>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <AlbumIcon sx={{ fontSize: 100, color: 'primary.main' }} />
          </Box>
        </Box>

        {/* Third Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <LibraryMusicIcon sx={{ fontSize: 100, color: 'primary.main' }} />
          </Box>
          <Paper
            elevation={3}
            sx={{
              flex: 2,
              p: 3,
              bgcolor: '#C8E0C3',
              borderRadius: 4,
            }}
          >
            <Typography component='div'>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  Biên pháp tập thành đơn giản: Nhờ ứng dụng công nghệ AI, chúng
                  tôi phân tích các khái niệm phức tạp, biến chúng thành nội
                  dung trực quan, dễ hiểu.
                </li>
                <li>
                  Có nhiều bài tập trình học tập: MTLS hiểu bạn và đề xuất các
                  bài học phù hợp với mục tiêu và tốc độ học tập của bạn.
                </li>
                <li>
                  Tạo cảm hứng sáng tạo: Không chỉ là học lý thuyết, chúng tôi
                  mong đến các công cụ và bài tập thực hành giúp bạn áp dụng
                  kiến thức ngay lập tức để sáng tạo âm nhạc theo cách của riêng
                  mình.
                </li>
              </ul>
            </Typography>
          </Paper>
        </Box>

        <Typography
          variant='h6'
          align='center'
          color='#DE5E99'
          sx={{
            mt: 4,
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          Hãy để MTLS là người bạn đồng hành đáng tin cậy, giúp bạn chinh phục
          lý thuyết âm nhạc và tiến xa hơn trên con đường âm nhạc của mình!
        </Typography>

        <Typography
          align='center'
          color='primary.light'
          sx={{ fontStyle: 'italic' }}
        >
          ♪ MTLS - Học lý thuyết âm nhạc dễ dàng, miễn phí và tràn đầy cảm hứng!
          ♪
        </Typography>
      </Stack>
    </Container>
  )
}

export default AboutPage
