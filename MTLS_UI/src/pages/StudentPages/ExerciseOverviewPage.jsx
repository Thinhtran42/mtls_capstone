import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import ExerciseOverview from '../../components/student/ExerciseOverview';
import { exerciseService } from '../../api/services/exercise.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';
import ModulesSidebar from '../../components/layout/students/ModulesSidebar';

const ExerciseOverviewPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, exerciseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState({
    courseName: '',
    moduleName: ''
  });
  const [hasAttempted, setHasAttempted] = useState(false)
  const [latestAttempt, setLatestAttempt] = useState(null)

  useEffect(() => {
    // Fetch exercise data
    const fetchExerciseData = async () => {
      try {
        setLoading(true);

          // Get student ID from localStorage
          const studentId = localStorage.getItem('userId')
          if (!studentId) {
            console.warn('Student ID not found in localStorage')
          }

        // Lấy thông tin exercise từ API
        const exerciseResponse = await exerciseService.getExerciseById(exerciseId);
        const exerciseData = exerciseResponse.data

         // If student ID is available, get quiz history
         let exerciseHistoryData = null
         let latestAttemptData = null
         let hasAttemptedExercise = false

         if (studentId && exerciseData && exerciseData._id) {
          try {
            const doExerciseResponse =
              await exerciseService.getDoExerciseByStudentAndExerciseId(
                studentId,
                exerciseData._id
              )

              console.log('Do exercise response:', doExerciseResponse);

              if (doExerciseResponse && doExerciseResponse.data) {
                hasAttemptedExercise = true
                latestAttemptData = doExerciseResponse.data
                exerciseHistoryData = doExerciseResponse.allAttempts

                console.log('Latest exercise attempt found:', latestAttemptData)
                console.log('All exercise attempts:', exerciseHistoryData)
                console.log('🔍 EXERCISE HISTORY - Successfully retrieved history')
              } else {
                console.log('No exercise attempts found for this student')
                console.log('🔍 EXERCISE HISTORY - No history found')
              }
          } catch (historyError) {
            console.error('Error fetching exercise history:', historyError)
            console.log('🔍 EXERCISE HISTORY - Error:', historyError.message)
          }
         }

          // Format quiz data, use section information if no quiz information is available
        const formattedExercise = {
          id: exerciseData?._id || exerciseId,
          title: exerciseData?.title || 'Music Exercise',
          description: exerciseData?.description || 'Music knowledge assessment',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          attemptsLeft: latestAttemptData ? 2 : 3, // Assume 3 total attempts
          attemptsMax: 3,
          timePerAttempt: exerciseData?.duration || 30,
          grade: latestAttemptData ? latestAttemptData.score : null,
          submitted: hasAttemptedExercise,
        }

        setExercise(formattedExercise)
        setHasAttempted(hasAttemptedExercise)
        setLatestAttempt(latestAttemptData)

        // Lấy thông tin khóa học và module
        try {

          const courseResponse = await courseService.getCourseById(courseId);
          const courseDetail = courseResponse?.data;

            // Lấy thông tin module
            const moduleResponse = await moduleService.getModuleById(moduleId);
            const moduleDetail = moduleResponse?.data;

            setCourseData({
              courseName: courseDetail?.title || "Khóa học",
              moduleName: moduleDetail?.title || "Bài kiểm tra",
          });
        } catch (courseError) {
          console.error("Error fetching course/module data:", courseError);
          // Sử dụng dữ liệu mẫu nếu không thể lấy thông tin khóa học
          setCourseData({
            courseName: "Lý thuyết âm nhạc cơ bản",
            moduleName: "Bài kiểm tra",
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercise data:', error);
      }
    };

    fetchExerciseData();
  }, [exerciseId, moduleId, courseId]);

  const handleStartExercise = () => {
    // If this is a retry, pass the latest doQuizId as a state parameter
    if (hasAttempted && latestAttempt) {
      navigate(`/student/exercise/${exerciseId}`, {
        state: {
          isRetry: true,
          doExerciseId: latestAttempt._id,
          previousScore: latestAttempt.score,
        },
      })
    } else {
      // First attempt
      navigate(`/student/exercise/${exerciseId}`)
    }
  }

  const handleViewSubmission = () => {
    if (hasAttempted && latestAttempt) {
      navigate(`/student/exercise/${exerciseId}`, {
        state: {
          isViewSubmission: true,
          doExerciseId: latestAttempt._id,
          previousScore: latestAttempt.score,
        },
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        <ModulesSidebar />
        <Box sx={{
          flexGrow: 1,
          p: 3,
          paddingTop: 2,
          ml: 0,
          overflow: 'auto',
          width: 'calc(100% - 400px)',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        <ModulesSidebar />
        <Box sx={{
          flexGrow: 1,
          p: 3,
          paddingTop: 2,
          ml: 0,
          overflow: 'auto',
          width: 'calc(100% - 400px)',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  if (!exercise) {
    return (
      <Box sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        <ModulesSidebar />
        <Box sx={{
          flexGrow: 1,
          p: 3,
          paddingTop: 2,
          ml: 0,
          overflow: 'auto',
          width: 'calc(100% - 400px)',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Không tìm thấy bài tập</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  const renderCustomButtons = () => {
    if (!hasAttempted) {
      return null // Sử dụng nút mặc định
    }

     // Kiểm tra điểm số, nếu >= 5 thì hiển thị thông báo đã vượt qua
     if (latestAttempt && latestAttempt.score >= 5) {
      return (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography
            variant="subtitle1"
            color="success.main"
            sx={{ fontWeight: "bold", mr: 2 }}
          >
            Passed !
          </Typography>
          <Button
            variant="outlined"
            color="info"
            onClick={handleViewSubmission}
            size="large"
          >
            View Submission
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleStartExercise}
          size='large'
        >
          Retry Exercise
        </Button>
        <Button
          variant='outlined'
          color='info'
          onClick={handleViewSubmission}
          size='large'
        >
          View Submission
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <ModulesSidebar />
      <Box sx={{
        flexGrow: 1,
        p: 3,
        paddingTop: 2,
        ml: 0,
        overflow: 'auto',
        width: 'calc(100% - 400px)',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && exercise && (
          <ExerciseOverview
            title={exercise.title}
            description={exercise.description}
            dueDate={exercise.dueDate}
            attemptsLeft={exercise.attemptsLeft}
            attemptsMax={exercise.attemptsMax}
            timePerAttempt={exercise.timePerAttempt}
            grade={exercise.grade}
            submitted={exercise.submitted}
            isPractice={false}
            courseInfo={courseData}
            onStart={handleStartExercise}
            navigation={{
              course: `/student/course/${courseId}`,
              module: `/student/course/${courseId}/module/${moduleId}`
            }}
            customButtons={renderCustomButtons()}
          />
        )}
      </Box>
    </Box>
  );
};

export default ExerciseOverviewPage;