import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  Rating,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import {
  Star as StarIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { ratingService } from '../../api';

const CourseRatingButton = ({ courseId, courseName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if student has already rated this course
  useEffect(() => {
    const checkExistingRating = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // Get current student ID from localStorage
        const studentId = localStorage.getItem('userId');
        
        if (!studentId) {
          console.error('Student information not found');
          return;
        }
        
        // Check if student has already rated this course
        try {
          const ratingResponse = await ratingService.getRatingByStudentAndCourse(studentId, courseId);
          if (ratingResponse.data) {
            setExistingRating(ratingResponse.data);
            setRatingValue(ratingResponse.data.stars || 0);
            setComment(ratingResponse.data.comment || '');
          }
        } catch (error) {
          // No need to handle error, student might not have rated yet
          console.log('Student has not rated this course yet');
        }
      } catch (error) {
        console.error('Error checking existing rating:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkExistingRating();
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
        message: 'Please select a star rating from 1 to 5',
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
        // Update existing rating
        await ratingService.updateRating(existingRating._id, ratingData);
        setSnackbar({
          open: true,
          message: 'Your rating has been updated!',
          severity: 'success'
        });
      } else {
        // Create new rating
        await ratingService.createRating(ratingData);
        setSnackbar({
          open: true,
          message: 'Thank you for rating this course!',
          severity: 'success'
        });
      }
      
      handleCloseModal();
      
      // Mark as rated
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

  const handleEditRating = () => {
    handleOpenModal();
  };

  // Display existing rating instead of edit button
  if (existingRating && !loading) {
    return (
      <>
        <Card variant="outlined" sx={{ mb: 2, maxWidth: 'fit-content' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                Your Rating
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleEditRating}
                aria-label="Edit rating"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating
                value={existingRating.stars || 0}
                readOnly
                precision={0.5}
                size="medium"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {new Date(existingRating.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </Box>

            {existingRating.comment && (
              <Typography variant="body2" color="text.secondary">
                &ldquo;{existingRating.comment}&rdquo;
              </Typography>
            )}
          </CardContent>
        </Card>

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
                Edit Your Rating
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              {courseName || 'Course'}
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
              placeholder="Write your comments about this course..."
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
                {submitting ? <CircularProgress size={24} /> : 'Update'}
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
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<StarIcon />}
        onClick={handleOpenModal}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          'Rate Course'
        )}
      </Button>

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
            {courseName || 'Course'}
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
            placeholder="Write your comments about this course..."
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

CourseRatingButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseName: PropTypes.string
};

export default CourseRatingButton; 