import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button
} from "@mui/material";
import { MusicNote, EmojiEvents, ErrorOutline, CheckCircle } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const QuizContent = ({
  quizData,
  quizLoading,
  quizError,
  selectedAnswers,
  score,
  handleAnswerSelect,
  handleSubmitQuiz,
  showResults,
  isSubmitting = false,
  isViewMode = false
}) => {
  const [processedQuizData, setProcessedQuizData] = useState([]);
  
  // Tạo câu hỏi khi data thay đổi - không xáo trộn
  useEffect(() => {
    console.log("QuizContent received data:", quizData);

    if (quizData) {
      let questions = [];
      
      // Check if quizData is an array
      if (Array.isArray(quizData)) {
        console.log("quizData is an array with", quizData.length, "elements");
        questions = quizData;
      }
      // Check if quizData is a quiz with questions
      else if (quizData.questions && Array.isArray(quizData.questions)) {
        console.log("quizData has questions property which is an array with", quizData.questions.length, "elements");
        questions = quizData.questions;
      }
      // Case where quizData is a single quiz object
      else {
        console.log("quizData is a single object, wrapping in array");
        questions = [quizData];
      }

      // Log details about each question
      questions.forEach((item, index) => {
        console.log(`Checking element ${index}:`, item);
        console.log(`- questionText:`, item.questionText);
        console.log(`- options:`, item.options);

        if (!item.options || !Array.isArray(item.options)) {
          console.warn(`Element ${index} has no options or options is not an array`);
        } else {
          console.log(`- Number of options:`, item.options.length);
        }
      });

      // Lưu lại data
      setProcessedQuizData(questions);
      
      console.log("Original order preserved");
    } else {
      console.warn("QuizContent did not receive data");
    }
  }, [quizData]);
  
  useEffect(() => {
    console.log("Processed data:", processedQuizData);
  }, [processedQuizData]);

  if (quizLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (quizError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {quizError}
      </Alert>
    );
  }

  if (!processedQuizData || processedQuizData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No quiz data found
      </Alert>
    );
  }

  // Check if each question has options
  const hasAllOptions = processedQuizData.every(
    (quiz) => quiz.options && Array.isArray(quiz.options) && quiz.options.length > 0
  );

  if (!hasAllOptions) {
    console.error("Some questions have no options:", processedQuizData.filter(
      (quiz) => !quiz.options || !Array.isArray(quiz.options) || quiz.options.length === 0
    ));
  }

  return (
    <>
      {(showResults || isViewMode) && (
        <Box sx={{ mb: 4 }}>
          <Alert
            severity={score >= 5 ? "success" : "warning"}
            icon={score >= 5 ? <EmojiEvents /> : undefined}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              Result: {score.toFixed(1)}/10 points {score >= 5 ? "- Passed" : "- Not Passed"}
            </Typography>
            <Typography>
              {score >= 5
                ? "Congratulations! You have completed this quiz."
                : "You need to score at least 5/10 points to complete this quiz."}
            </Typography>
          </Alert>
          <LinearProgress
            variant="determinate"
            value={score * 10}
            color={score >= 5 ? "success" : "warning"}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      )}
      
      {processedQuizData.map((quiz, displayIndex) => {
        console.log(`Displaying question ${displayIndex}:`, quiz);
        console.log(`Question options:`, quiz.options);

        // Check options before rendering
        if (!quiz.options || !Array.isArray(quiz.options) || quiz.options.length === 0) {
          console.warn(`Question has no valid options`);
          return (
            <Paper
              key={quiz._id || `question-${displayIndex}`}
              elevation={3}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: "8px",
                border: "1px solid #ff9800"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip
                  icon={<MusicNote />}
                  label={`Question ${displayIndex + 1}`}
                  color="primary"
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {quiz.questionText || "No question content"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Alert severity="warning">
                No options found for this question
              </Alert>
            </Paper>
          );
        }

        // Sử dụng options gốc
        const displayOptions = quiz.options;

        // Find correct answer for this question
        const correctOption = quiz.options.find(opt => opt.isCorrect === true);
        console.log(`Correct answer:`, correctOption);

        // Check if user answered correctly
        const userSelectedOption = selectedAnswers[displayIndex];
        const isAnswerCorrect = (showResults || isViewMode) &&
                               userSelectedOption &&
                               correctOption?.content === userSelectedOption;

        return (
          <Paper
            key={quiz._id || `question-${displayIndex}`}
            elevation={3}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: "8px",
              border: (showResults || isViewMode)
                ? selectedAnswers[displayIndex] === correctOption?.content
                  ? "1px solid #4caf50"
                  : "1px solid #f44336"
                : "1px solid transparent",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Chip
                icon={<MusicNote />}
                label={`Question ${displayIndex + 1}`}
                color="primary"
                sx={{ mr: 2 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {quiz.questionText}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box>
              <RadioGroup
                value={selectedAnswers[displayIndex] || ""}
                onChange={(e) => handleAnswerSelect(displayIndex, e.target.value)}
              >
                {displayOptions.map((option, optIndex) => {
                  const isSelected = selectedAnswers[displayIndex] === option.content;
                  const isCorrect = option.isCorrect;
                  const userSelectedThis = (showResults || isViewMode) && isSelected;

                  // Trong chế độ xem, hiển thị đáp án đúng và đáp án người dùng chọn
                  const showCorrectAnswer = (showResults || isViewMode);
                  const isCorrectOption = showCorrectAnswer && isCorrect;

                  // Style cho option label
                  let labelStyle = {
                    color: "text.primary",
                    fontWeight: "normal"
                  };

                  // Trong chế độ xem kết quả, style dành cho đáp án đúng và đáp án đã chọn
                  if (showCorrectAnswer) {
                    if (isSelected && !isCorrect) {
                      // Đáp án sai đã chọn: màu đỏ
                      labelStyle = {
                        color: "error.main",
                        fontWeight: "bold"
                      };
                    }
                  }

                  return (
                    <FormControlLabel
                      key={option._id || `option-${displayIndex}-${optIndex}`}
                      value={option.content}
                      control={
                        <Radio
                          disabled={showResults || isViewMode}
                          checked={isSelected}
                          color={
                            userSelectedThis && isCorrect
                              ? "success"
                              : userSelectedThis && !isCorrect
                              ? "error"
                              : isCorrectOption
                              ? "success"
                              : "primary"
                          }
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={labelStyle}>
                            {option.content}
                          </Typography>

                        </Box>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </Box>

            {/* Display message when user answers correctly */}
            {(showResults || isViewMode) && isAnswerCorrect && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: '#E8F5E9',
                  borderRadius: 1,
                  border: '1px solid #C8E6C9'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: '#2E7D32', mr: 1 }} />
                  <Typography sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                    Correct
                  </Typography>
                </Box>
                <Typography sx={{ color: '#2E7D32' }}>
                  You chose the correct answer.
                </Typography>
              </Box>
            )}

            {(showResults || isViewMode) &&
             selectedAnswers[displayIndex] !== undefined &&
             !isAnswerCorrect && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: '#FFEBEE',
                  borderRadius: 1,
                  border: '1px solid #FFCDD2'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ErrorOutline sx={{ color: '#D32F2F', mr: 1 }} />
                  <Typography sx={{ color: '#D32F2F', fontWeight: 'bold' }}>
                    Incorrect
                  </Typography>
                </Box>
                <Typography sx={{ color: '#D32F2F' }}>
                  You choose the incorrect answer.
                </Typography>
              </Box>
            )}
          </Paper>
        );
      })}

      {!showResults && !isViewMode && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== processedQuizData.length || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      )}
    </>
  );
};

// Thêm PropTypes cho component
QuizContent.propTypes = {
  quizData: PropTypes.array,
  quizLoading: PropTypes.bool,
  quizError: PropTypes.string,
  selectedAnswers: PropTypes.object,
  score: PropTypes.number,
  handleAnswerSelect: PropTypes.func,
  handleSubmitQuiz: PropTypes.func,
  showResults: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  isViewMode: PropTypes.bool
};

export default QuizContent;