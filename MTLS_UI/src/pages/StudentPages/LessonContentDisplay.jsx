import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { lessonService } from '../../api/services/lesson.service';
import { contentService } from '../../api/services/content.service';
import { lessonProgressService } from '../../api/services/lessonProgress.service';
import { sectionService } from '../../api/services/section.service';
import VideoContent from '../../components/content/VideoContent';

const LessonContentDisplay = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [contentData, setContentData] = useState([]);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [moduleSections, setModuleSections] = useState([]);
  const [loadingNext, setLoadingNext] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch module sections for navigation
  useEffect(() => {
    const fetchModuleSections = async () => {
      if (!moduleId) return;
      
      try {
        const sectionsResponse = await sectionService.getSectionsByModule(moduleId);
        if (sectionsResponse?.data && Array.isArray(sectionsResponse.data)) {
          console.log('Fetched module sections:', sectionsResponse.data);
          setModuleSections(sectionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching module sections:', error);
      }
    };

    fetchModuleSections();
  }, [moduleId]);

  // Fetch content data from API and check completion status
  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId) return;

      setLoading(true);
      try {
        console.log('Loading data for lesson ID (direct):', lessonId);

        // Get lesson information from API
        const lessonResponse = await lessonService.getLessonById(lessonId);
        console.log('Lesson data from API:', lessonResponse);
        console.log('Response structure:', {
          hasData: !!lessonResponse?.data,
          dataType: lessonResponse?.data ? typeof lessonResponse.data : 'undefined',
          isArray: lessonResponse?.data ? Array.isArray(lessonResponse.data) : false,
          responseKeys: lessonResponse ? Object.keys(lessonResponse) : [],
          dataKeys: lessonResponse?.data ? Object.keys(lessonResponse.data) : []
        });

        if (lessonResponse?.data) {
          let lesson = null;

          if (Array.isArray(lessonResponse.data)) {
            console.log('Response data is an array, using the first element');
            lesson = lessonResponse.data[0];
          } else if (lessonResponse.data.lesson) {
            console.log('Response data has lesson property');
            lesson = lessonResponse.data.lesson;
          } else {
            console.log('Response data is a single object');
            lesson = lessonResponse.data;
          }

          if (!lesson) {
            console.warn('Lesson data not found!');
            setError('Lesson information not found');
            setLoading(false);
            return;
          }

          console.log('Lesson information:', lesson);
          setLessonInfo(lesson);

          // Call API to get content by lesson ID
          const contentResponse = await contentService.getContentsByLesson(lessonId);
          console.log(`Content data for lesson ID ${lessonId}:`, contentResponse);

          if (contentResponse?.data) {
            // Get content data
            let contents = [];

            if (Array.isArray(contentResponse.data)) {
              contents = contentResponse.data;
            } else if (contentResponse.data.data && Array.isArray(contentResponse.data.data)) {
              contents = contentResponse.data.data;
            } else if (contentResponse.data.contents && Array.isArray(contentResponse.data.contents)) {
              contents = contentResponse.data.contents;
            } else if (typeof contentResponse.data === 'object') {
              contents = [contentResponse.data];
            }

            console.log(`Processed ${contents.length} contents for lesson`);

            // Add lesson title as header
            let allContents = [];
            if (contents.length > 0) {
              allContents.push({
                _id: `lesson-header-${lessonId}`,
                type: 'lesson-header',
                data: lesson.title || 'Untitled Lesson',
                lesson: lesson
              });

              // Add content
              allContents = [...allContents, ...contents];
            }

            console.log('Total loaded content:', allContents.length);
            console.log('Content data:', allContents);
            setContentData(allContents);
            setError(null);

            // Check if the lesson has been completed
            await checkLessonCompletionStatus(lessonId);
          } else {
            console.warn(`No content found for lesson ${lessonId}`);
            setContentData([]);
          }
        } else {
          console.error('No data in lesson response');
          setError('Lesson information not found');
        }
      } catch (error) {
        console.error('Error when fetching lesson data:', error);
        setError('Unable to load lesson content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  // Check completion status of the lesson directly using specific API
  const checkLessonCompletionStatus = async (lessonId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('User ID not found in localStorage');
        return;
      }

      // Get lesson completion status using direct API endpoint
      console.log(`Checking completion status for lesson ${lessonId} and student ${userId}`);
      const progressResponse = await lessonProgressService.getLessonProgressByStudentAndLesson(userId, lessonId);
      console.log('Lesson completion response:', progressResponse);

      // Check returned data and update completion status
      let isCompleted = false;

      if (progressResponse?.data) {
        // Handle different response structures
        if (Array.isArray(progressResponse.data) && progressResponse.data.length > 0) {
          // If response is an array, check the first item
          isCompleted = progressResponse.data[0]?.status === true;
        } else if (progressResponse.data.data && Array.isArray(progressResponse.data.data) && progressResponse.data.data.length > 0) {
          // If response has a data array property
          isCompleted = progressResponse.data.data[0]?.status === true;
        } else if (progressResponse.data.status === true) {
          // If response is a single object with status
          isCompleted = true;
        }
      }

      // Update completion status
      setCompleted(isCompleted);
      console.log('Lesson completion status updated:', isCompleted);
    } catch (error) {
      console.error('Error checking lesson completion status:', error);
      // If API fails, assume lesson is not completed
      setCompleted(false);
    }
  };

  // Close snackbar notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({...prev, open: false}));
  };

  // Handle marking lesson as completed
  const handleComplete = async () => {
    try {
      setSavingProgress(true);
      const userId = localStorage.getItem('userId');

      if (!userId) {
        setSnackbar({
          open: true,
          message: 'You need to log in to save learning progress',
          severity: 'error'
        });
        return;
      }

      if (!lessonId) {
        setSnackbar({
          open: true,
          message: 'Lesson ID not found',
          severity: 'error'
        });
        return;
      }

      // If already completed, do nothing or possibly undo completion
      if (completed) {
        setSnackbar({
          open: true,
          message: 'This lesson has already been marked as completed',
          severity: 'info'
        });
        return;
      }

      // Call API to save progress
      console.log('Saving progress for lesson:', lessonId, 'of student:', userId);
      const progressData = {
        lesson: lessonId,
        student: userId,
        status: true
      };

      const response = await lessonProgressService.createLessonProgress(progressData);
      console.log('Progress saving result:', response);

      // Update UI
      setCompleted(true);
    } catch (error) {
      console.error('Error saving learning progress:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while saving learning progress',
        severity: 'error'
      });
    } finally {
      setSavingProgress(false);
    }
  };

  // Find the next item to navigate to based on current lesson
  const findNextItem = async () => {
    try {
      setLoadingNext(true);
      if (!lessonInfo || !lessonInfo.section) {
        console.warn('Current lesson info not available for navigation');
        return null;
      }

      const currentSectionId = lessonInfo.section;
      console.log('Looking for next item. Current section ID:', currentSectionId);

      // Organize sections and items
      let allItems = [];
      
      // Flatten all sections and their items into a single array in order
      for (const section of moduleSections) {
        try {
          // Load items for this section based on section type
          let items = [];
          
          // Different section types need different API calls
          if (section.type && section.type.toUpperCase() === 'LESSON') {
            const itemsRes = await lessonService.getLessonsBySection(section._id);
            items = itemsRes?.data || [];
          } else if (section.type && section.type.toUpperCase() === 'QUIZ') {
            const quizService = (await import('../../api/services/quiz.service')).quizService;
            const itemsRes = await quizService.getQuizzesBySection(section._id);
            items = itemsRes?.data || [];
          } else if (section.type && section.type.toUpperCase() === 'EXERCISE') {
            const exerciseService = (await import('../../api/services/exercise.service')).exerciseService;
            const itemsRes = await exerciseService.getExercisesBySection(section._id);
            items = itemsRes?.data || [];
          } else if (section.type && section.type.toUpperCase() === 'ASSIGNMENT') {
            const assignmentService = (await import('../../api/services/assignment.service')).assignmentService;
            const itemsRes = await assignmentService.getAssignmentsBySection(section._id);
            items = itemsRes?.data || [];
          }
          
          // Process items and add to the list
          if (Array.isArray(items)) {
            items.forEach(item => {
              allItems.push({
                ...item,
                sectionId: section._id,
                sectionType: section.type
              });
            });
          }
        } catch (error) {
          console.error(`Error loading items for section ${section._id}:`, error);
        }
      }
      
      console.log('All items in module:', allItems);
      
      // Find the current item index
      const currentIndex = allItems.findIndex(item => item._id === lessonId);
      console.log('Current item index:', currentIndex);
      
      // Get the next item if it exists
      if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
        const nextItem = allItems[currentIndex + 1];
        console.log('Next item found:', nextItem);
        return nextItem;
      }
      
      console.log('No next item found');
      return null;
    } catch (error) {
      console.error('Error finding next item:', error);
      return null;
    } finally {
      setLoadingNext(false);
    }
  };
  
  // Handle navigation
  const handleNavigation = async (direction) => {
    if (direction === 'back') {
      // Check current path to decide where to go back
      const currentPath = window.location.pathname;
      if (currentPath.includes('/learning/')) {
        // If on learning route, go back to student course
        navigate(`/student/course/${courseId}/module/${moduleId}`);
      } else {
        // Regular route
        navigate(`/student/course/${courseId}/module/${moduleId}`);
      }
    } else if (direction === 'next') {
      try {
        setLoadingNext(true);
        // Find the next item to navigate to
        const nextItem = await findNextItem();
        
        if (nextItem) {
          // Determine route based on item type
          let route;
          const itemType = (nextItem.sectionType || '').toUpperCase();
          
          if (itemType === 'LESSON') {
            route = `/student/course/${courseId}/module/${moduleId}/lesson/${nextItem._id}`;
          } else if (itemType === 'QUIZ') {
            route = `/student/course/${courseId}/module/${moduleId}/quiz/${nextItem._id}`;
          } else if (itemType === 'EXERCISE') {
            route = `/student/course/${courseId}/module/${moduleId}/exercise/${nextItem._id}`;
          } else if (itemType === 'ASSIGNMENT') {
            route = `/student/course/${courseId}/module/${moduleId}/assignment/${nextItem._id}`;
          } else {
            // Default fallback if type is unknown
            route = `/student/course/${courseId}/module/${moduleId}`;
          }
          
          // Navigate to the next item
          console.log(`Navigating to next item: ${route}`);
          navigate(route);
          
          // Show success notification
          setSnackbar({
            open: true,
            message: 'Đã hoàn thành bài học này! Chuyển đến nội dung tiếp theo.',
            severity: 'success'
          });
        } else {
          // If no next item found, navigate back to module page
          console.log('No next item found, returning to module page');
          navigate(`/student/course/${courseId}/module/${moduleId}`);
          
          // Show completion notification
          setSnackbar({
            open: true,
            message: 'Đã hoàn thành tất cả nội dung trong module này!',
            severity: 'success'
          });
        }
      } catch (error) {
        console.error('Error during navigation:', error);
        // Fallback to module page on error
        navigate(`/student/course/${courseId}/module/${moduleId}`);
        
        setSnackbar({
          open: true,
          message: 'Đã xảy ra lỗi khi chuyển đến nội dung tiếp theo.',
          severity: 'error'
        });
      } finally {
        setLoadingNext(false);
      }
    }
  };

  // Display loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display error message
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => handleNavigation('back')}
          sx={{ mt: 2 }}
        >
          Back to Lessons
        </Button>
      </Container>
    );
  }

  // Check if no content data
  if (!contentData || contentData.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">No lesson content found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => handleNavigation('back')}
          sx={{ mt: 2 }}
        >
          Back to Lessons
        </Button>
      </Container>
    );
  }

  // Render content by type
  const renderContentItem = (item, index) => {
    const contentType = (item.type || '').toLowerCase();

    if (contentType === 'lesson-header') {
      return (
        <Box key={item._id || `lesson-header-${index}`} sx={{ mb: 3, mt: index > 0 ? 5 : 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" color="primary">
            {item.data}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
      );
    } else if (contentType === 'image') {
      return (
        <Card key={item._id || index} sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardMedia
            component="img"
            image={item.data}
            alt={item.caption || 'Lesson image'}
            sx={{
              maxHeight: '500px',
              objectFit: 'contain',
              backgroundColor: '#f5f5f5'
            }}
          />
          {item.caption && (
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {item.caption}
              </Typography>
            </CardContent>
          )}
        </Card>
      );
    } else if (contentType === 'video') {
      return (
        <Card key={item._id || index} sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Box sx={{ position: 'relative' }}>
            <VideoContent 
              videoUrl={item.data} 
              onComplete={handleComplete} 
              isCompleted={completed} 
            />
          </Box>
          {item.caption && (
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {item.caption}
              </Typography>
            </CardContent>
          )}
        </Card>
      );
    } else if (contentType === 'reading') {
      return (
        <Card key={item._id || index} sx={{ mb: 4, p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardContent>
            {item.caption && (
              <Typography variant="h6" gutterBottom>
                {item.caption}
              </Typography>
            )}
            <Box
              sx={{
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px'
                },
                '& p': {
                  lineHeight: 1.8,
                  mb: 2
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  mt: 4,
                  mb: 2,
                  fontWeight: 600
                }
              }}
              dangerouslySetInnerHTML={{ __html: item.data || 'No content' }}
            />
          </CardContent>
        </Card>
      );
    } else {
      // Fallback for unknown content types
      return (
        <Card key={item._id || index} sx={{ mb: 4, p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="body1">
              {item.data}
            </Typography>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => handleNavigation('back')}
        >
          Back to Module
        </Button>

      </Box>

      <Box sx={{ my: 4 }}>
        {contentData.map((item, index) => renderContentItem(item, index))}
      </Box>

      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
        {completed ? (
          // Khi đã hoàn thành, luôn hiển thị nút "Go to Next Item"
          <Button
            variant="contained"
            color="success"
            onClick={() => handleNavigation('next')}
            disabled={loadingNext}
          >
            {loadingNext ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Loading...
              </>
            ) : (
              "Go to Next Item"
            )}
          </Button>
        ) : (
          // Khi chưa hoàn thành, chỉ hiển thị "Mark as Completed" cho non-video lessons
          !contentData.some(item => (item.type || '').toLowerCase() === 'video') && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleComplete}
              disabled={savingProgress}
            >
              {savingProgress ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          )
        )}
      </Box>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LessonContentDisplay;