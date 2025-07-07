import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Rating,
  TextField,
  Modal,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import { ratingService, courseService } from '../../api';

const RandomRatingModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [existingRating, setExistingRating] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Kiểm tra và lấy thông tin khóa học hiện tại
  useEffect(() => {
    const checkForPendingRatings = async () => {
      // Kiểm tra xem có hiển thị gần đây không
      const lastPrompt = localStorage.getItem('lastRatingPrompt');
      if (lastPrompt) {
        const lastPromptDate = new Date(lastPrompt);
        const now = new Date();
        const hoursSinceLastPrompt = (now - lastPromptDate) / (1000 * 60 * 60);

        // Nếu chưa đủ 24 giờ kể từ lần nhắc cuối cùng, không hiển thị
        if (hoursSinceLastPrompt < 24) {
          return;
        }
      }

      // Chỉ hiện modal với xác suất 20% mỗi khi component được mount
      const shouldShowModal = Math.random() < 0.2;

      if (!shouldShowModal) return;

      const studentId = localStorage.getItem('userId');
      // Lấy thông tin khóa học hiện tại từ localStorage (giả sử đã được lưu trước đó)
      const currentCourseId = localStorage.getItem('currentCourseId');

      if (!studentId || !currentCourseId) return;

      try {
        // Kiểm tra xem học viên đã đánh giá khóa học này chưa
        try {
          const ratingResponse = await ratingService.getRatingByStudentAndCourse(studentId, currentCourseId);
          if (ratingResponse.data) {
            // Nếu học viên đã đánh giá rồi, không hiển thị modal
            setExistingRating(ratingResponse.data);
            return;
          }
        } catch {
          // Nếu không tìm thấy đánh giá, có thể hiển thị modal
          console.log('Học viên chưa đánh giá khóa học này');
        }

        // Lấy thông tin khóa học
        const courseResponse = await courseService.getCourseById(currentCourseId);
        if (courseResponse.data) {
          setCurrentCourse(courseResponse.data);
          // Kiểm tra thêm điều kiện để hiển thị modal (ví dụ: học viên đã hoàn thành ít nhất 50% khóa học)
          const progressResponse = await courseService.getCourseWithProgress(currentCourseId, studentId);
          if (progressResponse?.data?.progress?.percentage >= 50) {
            setIsModalOpen(true);
          }
        }
      } catch (error) {
        console.error('Error checking rating information:', error);
      }
    };

    checkForPendingRatings();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRatingSubmit = async () => {
    if (ratingValue < 1) {
      setSnackbar({
        open: true,
        message: 'Please select a rating from 1 to 5 stars',
        severity: 'error'
      });
      return;
    }

    if (!currentCourse?._id) {
      setSnackbar({
        open: true,
        message: 'Cannot find course information',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const ratingData = {
        course: currentCourse._id,
        stars: ratingValue,
        comment: comment
      };

      // Tạo đánh giá mới
      await ratingService.createRating(ratingData);
      setSnackbar({
        open: true,
        message: 'Thank you for rating the course!',
        severity: 'success'
      });

      handleCloseModal();
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Cannot submit rating. Please try again later.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleLater = () => {
    // Lưu vào localStorage để tránh hiển thị lại quá sớm
    const now = new Date();
    localStorage.setItem('lastRatingPrompt', now.toISOString());
    handleCloseModal();
  };

  // Nếu không có khóa học hiện tại hoặc đã đánh giá rồi, không hiển thị gì cả
  if (!currentCourse || existingRating || !isModalOpen) {
    return null;
  }

  return (
    <>
      {/* Rating Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="rating-modal-title"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '70%', md: '50%' },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" id="rating-modal-title">
              Rate Course
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            {currentCourse?.title || 'Khóa học'}
          </Typography>

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Rating
            </Typography>
            <Rating
              name="course-rating"
              value={ratingValue}
              onChange={(event, newValue) => {
                setRatingValue(newValue);
              }}
              precision={1}
              size="large"
              sx={{ fontSize: '2rem' }}
            />
          </Box>

          <TextField
            fullWidth
            label="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 3 }}
            placeholder="Share your opinion about this course..."
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleLater}
              disabled={submitting}
            >
              Later
            </Button>
            <Button
              variant="contained"
              onClick={handleRatingSubmit}
              disabled={submitting || ratingValue < 1}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Rating'}
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RandomRatingModal;