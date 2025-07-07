import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { ArrowBack, Check } from '@mui/icons-material';
import QuizContent from '../../components/content/QuizContent';
import { quizService } from '../../api/services/quiz.service';
import { baseApi } from '../../api/generated/baseApi';

const DoingQuizPageComponent = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a retry from state
  const stateData = location.state || {};
  const isRetryFromState = stateData.isRetry || false;
  const isViewSubmission = stateData.isViewSubmission || false;
  const doQuizIdFromState = stateData.doQuizId || null;
  const previousScore = stateData.previousScore || 0;

  // States
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [currentDoQuizId, setCurrentDoQuizId] = useState(doQuizIdFromState);
  const [isRetry, setIsRetry] = useState(isRetryFromState);
  const [loadingPreviousAnswers, setLoadingPreviousAnswers] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  useEffect(() => {
    // Log navigation state for debugging
    if (isRetryFromState) {
      console.log("This is a retry session with doQuizId:", doQuizIdFromState);
      console.log("Previous score:", previousScore);
    }

    if (isViewSubmission) {
      console.log("This is a view submission mode with doQuizId:", doQuizIdFromState);
      console.log("Previous score:", previousScore);
    }

    // Log previous answers when they change
    console.log("Stored previous answers:", selectedAnswers);

  }, [isRetryFromState, isViewSubmission, doQuizIdFromState, previousScore, selectedAnswers]);

  // Fetch quiz data on component mount
  useEffect(() => {
    const fetchQuizData = async () => {
      // Lấy quizId từ URL hoặc location state
      const quizId = location.state?.quizId || params?.quizId;
      
      if (!quizId) {
        setError("Không thể xác định ID của bài quiz");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Fetch quiz data
        const quizResponse = await quizService.getQuizById(quizId);
        let quizData = quizResponse?.data?.data || quizResponse?.data || quizResponse;
        
        if (!quizData || !quizData._id) {
          throw new Error("Dữ liệu bài quiz không hợp lệ");
        }
        
        setQuiz(quizData);
        setQuizTitle(quizData.title || 'Quiz');

        // Fetch questions
        let finalQuestions = [];
        try {
          const shuffledQuestionsResponse = await quizService.getShuffledQuestionsForQuiz(
            quizId,
            true,
            true
          );
          
          if (shuffledQuestionsResponse?.questions?.length > 0) {
            finalQuestions = shuffledQuestionsResponse.questions;
          } else {
            throw new Error("No questions returned");
          }
        } catch (shuffleError) {
          console.error("Error getting shuffled questions:", shuffleError);
          // Fallback to regular question fetching if needed
          // ... existing fallback code ...
        }

        setQuestions(finalQuestions);
        setIsInitialDataLoaded(true);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError(error.message || "Không thể tải bài quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [location.state?.quizId, params?.quizId]); // Update dependencies to include both possible sources of quizId

  // Add new useEffect for handling submission details
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!isInitialDataLoaded || !isViewSubmission || !currentDoQuizId || questions.length === 0) {
        return;
      }

      try {
        setLoadingPreviousAnswers(true);
        setError(null);
        
        const submissionDetails = await quizService.getQuizSubmissionDetails(currentDoQuizId);
        
        if (!submissionDetails?.answers) {
          throw new Error("Không tìm thấy thông tin bài làm");
        }

        const formattedAnswers = {};
        submissionDetails.answers.forEach(answer => {
          const question = questions.find(q => q._id === answer.question);
          if (question) {
            const questionIndex = questions.indexOf(question);
            const selectedOption = question.options.find(opt => opt._id === answer.option);
            if (selectedOption) {
              formattedAnswers[questionIndex] = selectedOption.content;
            }
          }
        });

        if (Object.keys(formattedAnswers).length === 0) {
          throw new Error("Không tìm thấy câu trả lời nào trong bài làm");
        }

        setSelectedAnswers(formattedAnswers);
        setShowResults(true);
        
        if (submissionDetails.submission?.score != null) {
          setScore(submissionDetails.submission.score);
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
        setError(error.message || "Không thể tải câu trả lời đã chọn");
      } finally {
        setLoadingPreviousAnswers(false);
      }
    };

    fetchSubmissionDetails();
  }, [isInitialDataLoaded, isViewSubmission, currentDoQuizId, questions]);

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
  const handleSubmitQuiz = async () => {
    if (!questions || questions.length === 0) {
      console.error("No questions data to submit");
      return;
    }

    console.log("Submitting quiz with answers:", selectedAnswers);
    setIsSubmitting(true);
    setSubmitError(null);

    let correctCount = 0;
    let totalQuestions = questions.length;
    let answeredQuestions = 0;

    // Calculate correct answers and score
    Object.keys(selectedAnswers).forEach((displayIndex) => {
      const index = parseInt(displayIndex, 10);
      if (isNaN(index) || index < 0 || index >= questions.length) return;
      
      const question = questions[index];
      const selectedOption = selectedAnswers[index];
      
      console.log(`Question ${index + 1}:`, question.questionText);
      console.log(`- Selected option:`, selectedOption);
      console.log(`- All options:`, question.options);
      // Log kiểu dữ liệu của isCorrect để phát hiện vấn đề
      question.options.forEach((opt, i) => {
        console.log(`  + Option ${i+1}: content="${opt.content}", isCorrect=${opt.isCorrect}, type=${typeof opt.isCorrect}`);
      });
      
      answeredQuestions++;

      // Find correct option in the options array
      const correctOption = question.options.find(opt => opt.isCorrect === true);
      console.log(`- Correct option:`, correctOption?.content);
      console.log(`- Selected vs Correct: "${selectedOption}" === "${correctOption?.content}" = ${selectedOption === correctOption?.content}`);

      // Kiểm tra đáp án đúng bằng cách so sánh nội dung
      if (selectedOption === correctOption?.content) {
        console.log(`- Result: Correct`);
        correctCount++;
      } else {
        console.log(`- Result: Incorrect`);
      }
    });

    // Calculate final score (out of 10 points)
    const finalScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
    console.log(`Score: ${finalScore.toFixed(1)}/10 (${correctCount}/${totalQuestions} correct)`);
    console.log(`Answered questions: ${answeredQuestions}/${totalQuestions}`);

    // Update state with results
    setScore(finalScore);
    setShowResults(true);

    try {
      // Get current user ID
      const studentId = localStorage.getItem('userId');
      
      if (!studentId) {
        console.error("Student ID not found for saving results");
        setSubmitError("Student information not found. Please login again.");
        setIsSubmitting(false);
        return;
      }

      let doQuizId;

      // If this is a retry, use the existing doQuizId
      if (isRetry && currentDoQuizId) {
        console.log("This is a retry. Using existing doQuiz ID:", currentDoQuizId);
        doQuizId = currentDoQuizId;

        // Update score for existing doQuiz
        try {
          const updateScoreData = {
            score: Math.round(finalScore),
            status: finalScore >= 5
          };

          console.log("Updating doQuiz score:", updateScoreData);
          await baseApi.doQuizzes.doQuizControllerUpdate(currentDoQuizId, updateScoreData);
          console.log("Updated score for existing doQuiz");
        } catch (error) {
          console.error("Error updating doQuiz score:", error);
          setSubmitError("Error updating quiz score. Results may not be saved correctly.");
        }
      } else {
        // This is a new attempt, create a new doQuiz record
        const doQuizData = {
          quiz: quiz._id || '', // Quiz ID là trường _id của quiz object
          score: Math.round(finalScore), // Rounded score
          student: studentId, // Student ID
          status: finalScore >= 5 // Sử dụng boolean thay vì string 'completed'/'failed'
        };

        console.log("Sending doQuiz data:", doQuizData);

        // Call API to create doQuiz record
        const doQuizResponse = await baseApi.doQuizzes.doQuizControllerCreate(doQuizData);
        console.log("doQuiz creation result:", doQuizResponse);

        if (!doQuizResponse?.data?.data?._id) {
          console.error("Did not receive doQuiz ID");
          setSubmitError("Error saving results. Please try again later.");
          setIsSubmitting(false);
          return;
        }

        doQuizId = doQuizResponse.data.data._id;
        setCurrentDoQuizId(doQuizId);
      }

      // Create answers data - common format for both creation and update
      const answersArray = [];
      
      // Lặp qua tất cả các câu hỏi và kiểm tra xem có câu trả lời hay không
      questions.forEach((question, index) => {
        const selectedOption = selectedAnswers[index];
        if (!selectedOption) return; // Bỏ qua câu hỏi không có câu trả lời
        
        // Find selected option (object)
        const selectedOptionObj = question.options.find(opt => opt.content === selectedOption);
        console.log(`Question ${index+1} - Finding option with content "${selectedOption}":`);
        console.log('- Selected option object:', selectedOptionObj);
        
        if (!selectedOptionObj) {
          console.warn(`Cannot find option object with content "${selectedOption}" for question ${index+1}`);
          return; // Bỏ qua nếu không tìm thấy option object
        }
        
        if (!selectedOptionObj._id) {
          console.warn(`Selected option doesn't have _id property:`, selectedOptionObj);
          return; // Bỏ qua nếu option không có _id
        }

        answersArray.push({
          question: question._id,
          option: selectedOptionObj._id,
          doQuiz: doQuizId,
          submitType: "quiz"
        });
      });

      console.log("Answers array:", answersArray);
      
      if (answersArray.length === 0) {
        console.warn("No valid answers to submit");
        setSubmitSuccess(true);
        setIsSubmitting(false);
        return;
      }

      // Call API to save answers - either create new or update existing
      let submitAnswersResponse;

      if (isRetry) {
        // Update existing answers using PUT with the required format
        const updateData = {
          doQuiz: doQuizId,  // Add doQuiz at the top level for PUT request
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

      console.log("Successfully saved quiz results!");
      setSubmitSuccess(true);
      setIsRetry(true); // Set retry flag for next attempt

      // Mark as completed if minimum score is achieved
      if (finalScore >= 5) {
        console.log("Passed requirements, marking as completed");
        // Cập nhật trạng thái hoàn thành
        try {
          await baseApi.doQuizzes.doQuizControllerUpdate(doQuizId, {
            status: true, // Sử dụng boolean thay vì string 'completed'
            completedAt: new Date().toISOString()
          });
          console.log("Updated quiz status to completed");
        } catch (error) {
          console.error("Error updating quiz completion status:", error);
        }
      } else {
        console.log("Did not meet requirements, needs retry");
        // Cập nhật trạng thái thất bại
        try {
          await baseApi.doQuizzes.doQuizControllerUpdate(doQuizId, {
            status: false // Sử dụng boolean thay vì string 'failed'
          });
          console.log("Updated quiz status to failed");
        } catch (error) {
          console.error("Error updating quiz failure status:", error);
        }
      }

      // Do not redirect immediately to let user see results
      // User will use "Complete" or "Retry" buttons to continue

    } catch (error) {
      console.error("Error saving quiz results:", error);
      setSubmitError("An error occurred while saving results. You can still see your results but scores may not be saved.");

      // Show results even with errors so user doesn't lose data
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
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
              {isViewSubmission ? `${quizTitle} - Submission` : quizTitle}
            </Typography>

            <Box sx={{ width: 100 }}></Box> {/* Spacer for alignment */}
          </Box>

          {isViewSubmission}

          <QuizContent
            quizData={questions}
            quizLoading={loading || loadingPreviousAnswers}
            quizError={error}
            showResults={showResults}
            selectedAnswers={selectedAnswers}
            score={score}
            handleAnswerSelect={handleAnswerSelect}
            handleSubmitQuiz={handleSubmitQuiz}
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

export default DoingQuizPageComponent;