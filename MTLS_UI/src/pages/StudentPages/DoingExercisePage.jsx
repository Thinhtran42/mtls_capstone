import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { ArrowBack, Check } from '@mui/icons-material';
import ExerciseContent from '../../components/content/ExerciseContent';
import { baseApi } from '../../api/generated/baseApi';
import { exerciseService } from '../../api/services/exercise.service';

const DoingExercisePage = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a retry from state
  const stateData = location.state || {};
  const isRetryFromState = stateData.isRetry || false;
  const isViewSubmission = stateData.isViewSubmission || false;
  const doExerciseIdFromState = stateData.doExerciseId || null;
  const previousScore = stateData.previousScore || 0;

  // States
  const [exercise, setExercise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(isViewSubmission); // Hiển thị kết quả ngay nếu đang xem bài làm
  const [score, setScore] = useState(previousScore);
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentDoExerciseId, setCurrentDoExerciseId] = useState(doExerciseIdFromState);
  const [isRetry, setIsRetry] = useState(isRetryFromState);
  const [loadingPreviousAnswers, setLoadingPreviousAnswers] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // Fetch quiz data on component mount
  useEffect(() => {
    const fetchExerciseData = async () => {
      setLoading(true);
      try {
        const exerciseResponse = await exerciseService.getExerciseById(exerciseId);
        const exerciseData = exerciseResponse.data;
        setExerciseTitle(exerciseData.title);

        // Get shuffled questions and options for the exercise
        const shuffledQuestionsResponse = await exerciseService.getShuffledQuestionsForExercise(
          exerciseData._id,
          true,
          true
        );
        
        let questions = [];
        if (shuffledQuestionsResponse?.questions && Array.isArray(shuffledQuestionsResponse.questions)) {
          questions = shuffledQuestionsResponse.questions;
        } else {
          throw new Error("Shuffled questions data structure is not in the correct format");
        }

        if (questions.length === 0) {
          throw new Error("Exercise has no questions");
        }

        setExercise(questions);
        setError(null);
        setIsInitialDataLoaded(true);

        // Kiểm tra lịch sử làm bài
        const studentId = localStorage.getItem('userId');
        if (studentId && exerciseData._id) {
          try {
            const doExerciseResponse = await exerciseService.getDoExerciseByStudentAndExerciseId(studentId, exerciseData._id);
            if (doExerciseResponse && doExerciseResponse.data) {
              console.log("Latest exercise attempt found:", doExerciseResponse.data);
            }
          } catch (historyError) {
            console.error("Error fetching exercise history:", historyError);
          }
        }
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        setError(error.message || 'Could not load exercise data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseData();
  }, [exerciseId]); // Chỉ phụ thuộc vào exerciseId

  // useEffect mới để xử lý submission details
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!isInitialDataLoaded || !isViewSubmission || !currentDoExerciseId || exercise.length === 0) {
        return;
      }

      try {
        setLoadingPreviousAnswers(true);
        setError(null);

        const submissionDetailsResponse = await exerciseService.getExerciseSubmissionDetails(currentDoExerciseId);
        const answersResponse = submissionDetailsResponse?.answers?.data;

        if (!answersResponse || !Array.isArray(answersResponse)) {
          throw new Error("Không tìm thấy thông tin bài làm hoặc dữ liệu không hợp lệ");
        }

        const answersMap = {};
        answersResponse.forEach(answer => {
          const questionIndex = exercise.findIndex(q => q._id === answer.question);
          if (questionIndex !== -1) {
            const questionOption = exercise[questionIndex].options.find(opt => opt._id === answer.option);
            if (questionOption) {
              answersMap[questionIndex] = questionOption.content;
            }
          }
        });

        if (Object.keys(answersMap).length === 0) {
          throw new Error("Không tìm thấy câu trả lời nào trong bài làm");
        }

        // Cập nhật state
        setSelectedAnswers(answersMap);
        setShowResults(true);

        // Cập nhật điểm số nếu có
        if (submissionDetailsResponse?.submission?.score != null) {
          setScore(submissionDetailsResponse.submission.score);
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
        setError(error.message || "Không thể tải câu trả lời đã chọn");
      } finally {
        setLoadingPreviousAnswers(false);
      }
    };

    fetchSubmissionDetails();
  }, [isInitialDataLoaded, isViewSubmission, currentDoExerciseId, exercise]);

  // Handle selecting an answer
  const handleAnswerSelect = (questionIndex, selectedOption) => {
    // Disable selection if in view submission mode
    if (isViewSubmission) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  // Handle submitting the quiz
  const handleSubmitExercise = async () => {
    console.log("Submitting exercise with answers:", selectedAnswers);
    setIsSubmitting(true);
    setSubmitError(null);

    let correctCount = 0;
    let totalQuestions = exercise.length;

    // Calculate correct answers and score
    exercise.forEach((exercise, index) => {
      const selectedOption = selectedAnswers[index];
      console.log(`Question ${index + 1}:`, exercise.questionText);
      console.log(`- Selected option:`, selectedOption);

      // Find correct option in the options array
      const correctOption = exercise.options.find(opt => opt.isCorrect);
      console.log(`- Correct option:`, correctOption?.content);

      if (selectedOption === correctOption?.content) {
        console.log(`- Result: Correct`);
        correctCount++;
      } else {
        console.log(`- Result: Incorrect`);
      }
    });

    const finalScore = (correctCount / totalQuestions) * 10;
    console.log(`Score: ${finalScore.toFixed(1)}/10`);

    // Update state with results
    setScore(finalScore);
    setShowResults(true);

    try {
      // Get current user ID (assuming from localStorage or context)
      const studentId = localStorage.getItem('userId');

      if (!studentId) {
        console.error("Student ID not found for saving results");
        setSubmitError("Student information not found. Please login again.");
        setIsSubmitting(false);
        return;
      }

      let doExerciseId;

      // If this is a retry, use the existing doExerciseId
      if (isRetry && currentDoExerciseId) {
        console.log("This is a retry. Using existing doExercise ID:", currentDoExerciseId);
        doExerciseId = currentDoExerciseId;

        // Update score for existing doQuiz
        try {
          const updateScoreData = {
            score: Math.round(finalScore)
          };

          console.log("Updating doExercise score:", updateScoreData);
          await baseApi.doExercises.doExerciseControllerUpdate(currentDoExerciseId, updateScoreData);
          console.log("Updated score for existing doExercise");
        } catch (error) {
          console.error("Error updating doExercise score:", error);
          setSubmitError("Error updating exercise score. Results may not be saved correctly.");
        }
      } else {
        // This is a new attempt, create a new doExercise record
        const doExerciseData = {
          exercise: exercise[0]?.exercise || '', // Exercise ID
          score: Math.round(finalScore), // Rounded score
          student: studentId, // Student ID
          status: finalScore >= 5 // Sử dụng boolean thay vì string
        };

        console.log("Sending doExercise data:", doExerciseData);

        // Call API to create doExercise record
        const doExerciseResponse = await baseApi.doExercises.doExerciseControllerCreate(doExerciseData);
        console.log("doExercise creation result:", doExerciseResponse);

        if (!doExerciseResponse?.data?.data?._id) {
          console.error("Did not receive doExercise ID");
          setSubmitError("Error saving results. Please try again later.");
          setIsSubmitting(false);
          return;
        }

        doExerciseId = doExerciseResponse.data.data._id;
        setCurrentDoExerciseId(doExerciseId);
      }

      // Create answers data - common format for both creation and update
      const answersArray = exercise.map((question, index) => {
        // Find selected option (object)
        const selectedOptionObj = question.options.find(opt => opt.content === selectedAnswers[index]);

        return {
          question: question._id,
          option: selectedOptionObj?._id || '',
          doExercise: doExerciseId,
          submitType: "exercise"
        };
      });

      console.log("Answers array:", answersArray);

      // Call API to save answers - either create new or update existing
      let submitAnswersResponse;

      if (isRetry) {
        // Update existing answers using PUT with the required format
        const updateData = {
          doExercise: doExerciseId,  // Add doExercise at the top level for PUT request
          submitAnswers: answersArray
        };

        console.log("Sending update answer data:", updateData);
        submitAnswersResponse = await baseApi.submitAnswers.submitAnswerControllerUpdateMultiple(updateData);
        console.log("Updated answer results:", submitAnswersResponse);
      } else {
        // Create new answers using POST
        const createData = {
          submitAnswers: answersArray
        };

        console.log("Sending new answer data:", createData);
        submitAnswersResponse = await baseApi.submitAnswers.submitAnswerControllerCreateMultiple(createData);
        console.log("New answer results:", submitAnswersResponse);
      }

      console.log("Successfully saved exercise results!");
      setSubmitSuccess(true);
      setIsRetry(true); // Set retry flag for next attempt

      // Mark as completed if minimum score is achieved
      if (finalScore >= 5) {
        console.log("Passed requirements, marking as completed");
        await markExerciseAsCompleted(exercise[0]?._id);
      } else {
        console.log("Did not meet requirements, needs retry");
      }

      // Do not redirect immediately to let user see results
      // User will use "Complete" or "Retry" buttons to continue

    } catch (error) {
      console.error("Error saving exercise results:", error);
      setSubmitError("An error occurred while saving results. You can still see your results but scores may not be saved.");

      // Show results even with errors so user doesn't lose data
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm hàm để đánh dấu bài tập đã hoàn thành
  const markExerciseAsCompleted = async (exerciseId) => {
    if (!exerciseId) return;

    try {
      const studentId = localStorage.getItem('userId');
      if (!studentId) return;

      // Kiểm tra xem đã có bản ghi tiến độ chưa
      const existingProgress = await baseApi.doExercises.doExerciseControllerFindAll({
        student: studentId,
        exercise: exerciseId
      });

      // Xử lý dữ liệu phản hồi một cách an toàn
      console.log('Existing progress data:', existingProgress);
      const progressData = existingProgress?.data?.data ||
                         existingProgress?.data ||
                         [];

      if (Array.isArray(progressData) && progressData.length > 0) {
        // Nếu đã có bản ghi, cập nhật trạng thái
        const progressId = progressData[0]._id;
        await baseApi.doExercises.doExerciseControllerUpdate(progressId, {
          status: true // Đánh dấu là đã hoàn thành
        });
        console.log("Updated existing exercise progress");
      } else {
        // Nếu chưa có, tạo mới
        const createResult = await baseApi.doExercises.doExerciseControllerCreate({
          exercise: exerciseId,
          student: studentId,
          score: score,
          status: true // Giữ nguyên vì đã đúng là boolean
        });
        console.log("Created new exercise progress:", createResult);
      }

      console.log("Exercise marked as completed");
    } catch (error) {
      console.error("Error marking exercise as completed:", error);
    }
  };

  // Handle going back to overview
  const handleGoBack = () => {
    // Lấy các thông số từ URL hiện tại
    const url = window.location.pathname;
    const parts = url.split('/');

    // Tìm courseId và moduleId từ URL hiện tại (đây là index, không phải ID thực sự)
    const courseIndex = parts.findIndex(part => part === 'course');
    const moduleIndex = parts.findIndex(part => part === 'module');

    if (courseIndex >= 0 && moduleIndex >= 0 && parts.length > courseIndex + 1 && parts.length > moduleIndex + 1) {
      const courseNumber = parts[courseIndex + 1];
      const moduleNumber = parts[moduleIndex + 1];

      // Điều hướng theo đúng format
      navigate(`/student/course/${courseNumber}/module/${moduleNumber}`);
    } else {
      // Nếu không tìm thấy thông tin, quay lại trang trước
      navigate(-1);
    }
  };

  // Handle going to next section or complete quiz
  const handleNext = () => {
    // Lấy các thông số từ URL hiện tại
    const url = window.location.pathname;
    const parts = url.split('/');

    // Tìm courseId và moduleId từ URL hiện tại (đây là index, không phải ID thực sự)
    const courseIndex = parts.findIndex(part => part === 'course');
    const moduleIndex = parts.findIndex(part => part === 'module');

    if (courseIndex >= 0 && moduleIndex >= 0 && parts.length > courseIndex + 1 && parts.length > moduleIndex + 1) {
      const courseNumber = parts[courseIndex + 1];
      const moduleNumber = parts[moduleIndex + 1];

      // Điều hướng theo đúng format
      navigate(`/student/course/${courseNumber}/module/${moduleNumber}`);
    } else {
      // Nếu không tìm thấy thông tin, quay lại trang trước
      navigate(-1);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      justifyContent: 'center' // Căn giữa nội dung
    }}>
      <Box sx={{
        flexGrow: 1,
        p: { xs: 1, sm: 2, md: 3 }, // Padding responsive
        paddingTop: { xs: 1, sm: 2, md: 3 },
        overflow: 'auto',
        width: '100%',
        maxWidth: '150vh', // Giới hạn độ rộng tối đa
        boxSizing: 'border-box'
      }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              variant="outlined"
            >
              Back
            </Button>

            <Typography variant="h5" fontWeight="bold" textAlign="center">
              {isViewSubmission ? `${exerciseTitle} - Submission` : exerciseTitle}
            </Typography>

            <Box sx={{ width: 100 }}></Box> {/* Spacer for alignment */}
        </Box>

          {isViewSubmission}

          <ExerciseContent
            exerciseData={exercise}
            exerciseLoading={loading || loadingPreviousAnswers}
            exerciseError={error}
            showResults={showResults}
            selectedAnswers={selectedAnswers}
            score={score}
            handleAnswerSelect={handleAnswerSelect}
            handleSubmitExercise={handleSubmitExercise}
            isSubmitting={isSubmitting}
            isViewMode={isViewSubmission}
          />

          {submitError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {showResults && !isViewSubmission}

          {isViewSubmission}
        </Paper>
      </Box>
    </Box>
  );
};

export default DoingExercisePage;