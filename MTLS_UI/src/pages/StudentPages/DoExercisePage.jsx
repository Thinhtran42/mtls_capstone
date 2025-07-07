import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Button, 
  Paper, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Divider, 
  CircularProgress,
  Alert,
  Chip,
  Container,
  Card,
  CardContent,
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  ArrowBack, 
  CheckCircle, 
  NavigateNext, 
  Timer, 
  QuestionAnswer 
} from '@mui/icons-material';
import { exerciseService } from '../../api/services/exercise.service';
import { questionService } from '../../api/services/question.service';
import { optionService } from '../../api/services/option.service';

const DoExercisePage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, exerciseId } = useParams();
  
  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch exercise and questions
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setLoading(true);
        
        // Fetch exercise details
        const exerciseResponse = await exerciseService.getExerciseById(exerciseId);
        if (!exerciseResponse?.data) {
          console.warn('Không thể tải thông tin bài tập, sử dụng dữ liệu mẫu');
          // Tạo dữ liệu bài tập mẫu
          const mockExerciseData = {
            _id: exerciseId,
            title: "Bài tập nhận diện nốt nhạc",
            description: "Bài tập thực hành về nhận diện nốt nhạc và hợp âm",
            duration: 30,
            maxAttempts: 3
          };
          setExercise(mockExerciseData);
        } else {
          const exerciseData = exerciseResponse.data;
          setExercise(exerciseData);
        }
        
        // Set timer
        setTimeLeft((exerciseResponse?.data?.duration || 30) * 60); // Convert to seconds
        
        // Fetch questions for this exercise
        const questionsResponse = await questionService.getQuestionsByExercise(exerciseId);
        if (!questionsResponse?.data || questionsResponse.data.length === 0) {
          console.warn('Không thể tải câu hỏi hoặc không có câu hỏi, sử dụng dữ liệu mẫu');
          // Tạo dữ liệu câu hỏi mẫu
          const mockQuestions = [
            {
              _id: "question1",
              text: "Trong khuông nhạc cơ bản, nốt nhạc trên dòng kẻ thứ ba là nốt nào?",
              type: "multiple-choice",
              options: [
                { _id: "option1", text: "Nốt Đô (C)", isCorrect: false },
                { _id: "option2", text: "Nốt Rê (D)", isCorrect: false },
                { _id: "option3", text: "Nốt Mi (E)", isCorrect: false },
                { _id: "option4", text: "Nốt Si (B)", isCorrect: true }
              ]
            },
            {
              _id: "question2",
              text: "Hợp âm trưởng C cơ bản (C Major triad) bao gồm những nốt nào?",
              type: "multiple-choice",
              options: [
                { _id: "option1", text: "C - E - G", isCorrect: true },
                { _id: "option2", text: "C - Eb - G", isCorrect: false },
                { _id: "option3", text: "C - D - E", isCorrect: false },
                { _id: "option4", text: "C - F - G", isCorrect: false }
              ]
            },
            {
              _id: "question3",
              text: "Dấu thăng (#) trong âm nhạc có tác dụng gì?",
              type: "multiple-choice",
              options: [
                { _id: "option1", text: "Hạ cao độ nửa cung", isCorrect: false },
                { _id: "option2", text: "Tăng cao độ nửa cung", isCorrect: true },
                { _id: "option3", text: "Tăng trường độ nốt nhạc", isCorrect: false },
                { _id: "option4", text: "Giảm trường độ nốt nhạc", isCorrect: false }
              ]
            }
          ];
          setQuestions(mockQuestions);
        } else {
          const questionsList = questionsResponse.data;
          
          // Initialize options for each question
          const questionsWithOptions = await Promise.all(
            questionsList.map(async (question) => {
              try {
                const optionsResponse = await optionService.getOptionsByQuestion(question._id);
                if (!optionsResponse?.data || optionsResponse.data.length === 0) {
                  // Tạo options mẫu nếu không có
                  return {
                    ...question,
                    options: [
                      { _id: "option1", text: "Đáp án A", isCorrect: true },
                      { _id: "option2", text: "Đáp án B", isCorrect: false },
                      { _id: "option3", text: "Đáp án C", isCorrect: false },
                      { _id: "option4", text: "Đáp án D", isCorrect: false }
                    ]
                  };
                }
                return {
                  ...question,
                  options: optionsResponse.data || []
                };
              } catch (error) {
                console.error(`Error fetching options for question ${question._id}:`, error);
                // Trả về options mẫu nếu không lấy được
                return {
                  ...question,
                  options: [
                    { _id: "option1", text: "Đáp án A", isCorrect: true },
                    { _id: "option2", text: "Đáp án B", isCorrect: false },
                    { _id: "option3", text: "Đáp án C", isCorrect: false },
                    { _id: "option4", text: "Đáp án D", isCorrect: false }
                  ]
                };
              }
            })
          );
          
          setQuestions(questionsWithOptions);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading exercise:', error);
        
        // Tạo dữ liệu mẫu khi có lỗi
        try {
          console.log('Sử dụng dữ liệu mẫu cho bài tập và câu hỏi');
          
          // Tạo dữ liệu bài tập mẫu
          const mockExercise = {
            _id: exerciseId,
            title: "Bài tập nhận diện nốt nhạc và hợp âm",
            description: "Bài tập thực hành về nhận diện nốt nhạc, đọc khuông nhạc và xác định hợp âm cơ bản",
            duration: 30
          };
          
          // Tạo dữ liệu câu hỏi mẫu
          const mockQuestions = [
            {
              _id: "question1",
              text: "Trong khuông nhạc cơ bản, nốt nhạc trên dòng kẻ thứ ba là nốt nào?",
              type: "multiple-choice",
              options: [
                { _id: "option1", text: "Nốt Đô (C)", isCorrect: false },
                { _id: "option2", text: "Nốt Rê (D)", isCorrect: false },
                { _id: "option3", text: "Nốt Mi (E)", isCorrect: false },
                { _id: "option4", text: "Nốt Si (B)", isCorrect: true }
              ]
            },
            {
              _id: "question2",
              text: "Hợp âm trưởng C cơ bản (C Major triad) bao gồm những nốt nào?",
              type: "multiple-choice",
              options: [
                { _id: "option1", text: "C - E - G", isCorrect: true },
                { _id: "option2", text: "C - Eb - G", isCorrect: false },
                { _id: "option3", text: "C - D - E", isCorrect: false },
                { _id: "option4", text: "C - F - G", isCorrect: false }
              ]
            }
          ];
          
          setExercise(mockExercise);
          setQuestions(mockQuestions);
          setTimeLeft(30 * 60); // Set timer to 30 minutes
          setLoading(false);
        } catch {
          setError('Đã xảy ra lỗi khi tải bài tập');
          setLoading(false);
        }
      }
    };
    
    fetchExerciseData();
  }, [exerciseId]);

  // Timer countdown
  useEffect(() => {
    if (!loading && timeLeft > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, timeLeft, isComplete]);

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Navigate to next/previous question
  const handleNavigateQuestion = (direction) => {
    if (direction === 'next' && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Go to specific question
  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
  };

  // Calculate score and submit answers
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Calculate score
      let correctAnswers = 0;
      
      questions.forEach((question) => {
        const selectedOption = selectedAnswers[question._id];
        if (selectedOption) {
          const correctOption = question.options.find(option => option.isCorrect);
          if (correctOption && selectedOption === correctOption._id) {
            correctAnswers++;
          }
        }
      });
      
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);
      
      // TODO: Submit answers to backend
      // const submitResponse = await exerciseService.submitExercise({
      //   exerciseId,
      //   answers: selectedAnswers,
      //   score: finalScore,
      //   timeSpent: exercise.duration * 60 - timeLeft
      // });
      
      setIsComplete(true);
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting exercise:', error);
      setError('Đã xảy ra lỗi khi nộp bài');
      setSubmitting(false);
    }
  };

  // Return to exercise overview
  const handleReturnToOverview = () => {
    navigate(`/student/course/${courseId}/module/${moduleId}/exercise/${exerciseId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          onClick={handleReturnToOverview}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Quay lại tổng quan
        </Button>
      </Box>
    );
  }

  if (isComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>Kết quả bài tập</Typography>
            <Typography variant="h2" color={score >= 70 ? 'success.main' : score >= 50 ? 'warning.main' : 'error.main'}>
              {score}%
            </Typography>
            
            <Chip 
              icon={score >= 70 ? <CheckCircle /> : null}
              label={score >= 70 ? "Hoàn thành tốt" : score >= 50 ? "Cần cải thiện" : "Chưa đạt"}
              color={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error'}
              sx={{ mt: 2 }}
            />
          </Box>
          
          <Divider sx={{ mb: 4 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>Chi tiết câu trả lời</Typography>
            
            {questions.map((question, index) => {
              const selectedOption = selectedAnswers[question._id];
              const correctOption = question.options.find(option => option.isCorrect);
              const isCorrect = selectedOption === correctOption?._id;
              
              return (
                <Card key={question._id} sx={{ mb: 2, border: isCorrect ? '1px solid #4caf50' : '1px solid #f44336' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Câu hỏi {index + 1}: {question.text}
                    </Typography>
                    
                    <Box sx={{ ml: 2 }}>
                      {question.options.map(option => (
                        <Typography 
                          key={option._id} 
                          variant="body2" 
                          sx={{ 
                            color: option._id === correctOption?._id 
                              ? 'success.main' 
                              : (option._id === selectedOption && !isCorrect) 
                                ? 'error.main' 
                                : 'text.primary',
                            fontWeight: option._id === correctOption?._id || option._id === selectedOption ? 'bold' : 'normal'
                          }}
                        >
                          {option._id === selectedOption ? '✓ ' : ''}{option.text}
                          {option._id === correctOption?._id ? ' (Đáp án đúng)' : ''}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleReturnToOverview}
              startIcon={<ArrowBack />}
            >
              Quay lại tổng quan
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Render the exercise interface
  const currentQuestionData = questions[currentQuestion];
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleReturnToOverview}
        >
          Quay lại
        </Button>
        
        <Typography variant="h5">
          {exercise?.title || 'Bài tập'}
        </Typography>
        
        <Chip 
          icon={<Timer />} 
          label={formatTime(timeLeft)}
          color={timeLeft < 60 ? 'error' : timeLeft < 300 ? 'warning' : 'default'}
        />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            {currentQuestionData ? (
              <>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={`Câu hỏi ${currentQuestion + 1}/${questions.length}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6">{currentQuestionData.text}</Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ ml: 2 }}>
                  <RadioGroup
                    value={selectedAnswers[currentQuestionData._id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestionData._id, e.target.value)}
                  >
                    {currentQuestionData.options.map((option) => (
                      <FormControlLabel
                        key={option._id}
                        value={option._id}
                        control={<Radio />}
                        label={option.text}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </RadioGroup>
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNavigateQuestion('prev')}
                    disabled={currentQuestion === 0}
                    startIcon={<ArrowBack />}
                  >
                    Câu trước
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handleNavigateQuestion('next')}
                    disabled={currentQuestion === questions.length - 1}
                    endIcon={<NavigateNext />}
                  >
                    Câu tiếp theo
                  </Button>
                </Box>
              </>
            ) : (
              <Typography>Không có câu hỏi nào được tìm thấy.</Typography>
            )}
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(selectedAnswers).length === 0}
              startIcon={<CheckCircle />}
            >
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              <QuestionAnswer sx={{ mr: 1, verticalAlign: 'middle' }} />
              Danh sách câu hỏi
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {questions.map((q, index) => (
                <Chip
                  key={q._id}
                  label={index + 1}
                  onClick={() => handleQuestionClick(index)}
                  color={selectedAnswers[q._id] ? 'primary' : 'default'}
                  variant={currentQuestion === index ? 'filled' : 'outlined'}
                  sx={{ width: 40, height: 40, borderRadius: '50%' }}
                />
              ))}
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Tiến độ: {Object.keys(selectedAnswers).length}/{questions.length} câu
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(Object.keys(selectedAnswers).length / questions.length) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoExercisePage; 