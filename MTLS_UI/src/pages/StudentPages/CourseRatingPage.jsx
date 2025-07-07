/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
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
  Close as CloseIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { courseService, ratingService } from '../../api';

const CourseRatingPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [existingRating, setExistingRating] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0
  });

  // Lấy thông tin khóa học và đánh giá hiện tại của học viên (nếu có)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin khóa học
        const courseResponse = await courseService.getCourseById(courseId);
        setCourse(courseResponse.data);

        // Lấy thống kê rating của khóa học
        const ratingStatsResponse = await ratingService.getCourseRatingStats(courseId);
        if (ratingStatsResponse.data) {
          setRatingStats({
            averageRating: ratingStatsResponse.data.averageRating || 0,
            totalRatings: ratingStatsResponse.data.totalRatings || 0
          });
        }

        // Lấy thông tin học viên hiện tại từ localStorage
        const studentId = localStorage.getItem('userId');

        if (!studentId) {
          console.error('Không tìm thấy thông tin học viên');
          return;
        }

        // Kiểm tra xem học viên đã đánh giá khóa học này chưa
        try {
          const ratingResponse = await ratingService.getRatingByStudentAndCourse(studentId, courseId);
          if (ratingResponse.data) {
            setExistingRating(ratingResponse.data);
            setRatingValue(ratingResponse.data.stars || 0);
            setComment(ratingResponse.data.comment || '');
          }
        } catch (error) {
          console.log('Học viên chưa đánh giá khóa học này');
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRatingSubmit = async () => {
    if (ratingValue < 1) {
      setSnackbar({
        open: true,
        message: 'Please select a rating between 1 and 5 stars',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const ratingData = {
        course: courseId,
        stars: ratingValue,
        comment: comment
      };

      if (existingRating) {
        // Cập nhật đánh giá hiện có
        await ratingService.updateRating(existingRating._id, ratingData);
        setSnackbar({
          open: true,
          message: 'Your rating has been updated!',
          severity: 'success'
        });
      } else {
        // Tạo đánh giá mới
        await ratingService.createRating(ratingData);
        setSnackbar({
          open: true,
          message: 'Thank you for rating the course!',
          severity: 'success'
        });
      }

      handleCloseModal();

      // Đánh dấu là đã đánh giá
      setExistingRating({
        ...existingRating,
        stars: ratingValue,
        comment: comment
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Unable to submit rating. Please try again later.',
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {course?.title || 'Course'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {course?.description || 'Mô tả khóa học'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          {!existingRating && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<StarIcon />}
              onClick={handleOpenModal}
              sx={{ mr: 2 }}
            >
              Rate Course
            </Button>
          )}
        </Box>
      </Box>

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
            {course?.title || 'Course'}
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
            placeholder="Write your thoughts about this course..."
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
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

      {/* Existing Rating Display (if any) */}
      {existingRating && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Rating
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={existingRating.stars || 0}
              readOnly
              precision={0.5}
              size="medium"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {new Date(existingRating.createdAt || Date.now()).toLocaleDateString('en-US')}
            </Typography>
          </Box>

          {existingRating.comment && (
            <Typography variant="body1">
              {existingRating.comment}
            </Typography>
          )}
        </Paper>
      )}

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
    </Container>
  );
};

export default CourseRatingPage;