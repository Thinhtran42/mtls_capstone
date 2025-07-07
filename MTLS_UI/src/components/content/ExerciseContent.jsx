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
  Button,
} from "@mui/material";
import {
  MusicNote,
  EmojiEvents,
  ErrorOutline,
  CheckCircle,
  LibraryMusic,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import VexFlowComponent from "../../vexflow/VexFlowComponent";

const ExerciseContent = ({
  exerciseData,
  exerciseLoading,
  exerciseError,
  selectedAnswers,
  score,
  handleAnswerSelect,
  handleSubmitExercise,
  showResults,
  isSubmitting = false,
  isViewMode = false,
}) => {
  const [processedExerciseData, setProcessedExerciseData] = useState([]);

  // Process quiz data from API to display in correct format
  useEffect(() => {
    console.log("ExerciseContent received data:", exerciseData);

    if (exerciseData) {
      // Check if exerciseData is an array
      if (Array.isArray(exerciseData)) {
        console.log(
          "exerciseData is an array with",
          exerciseData.length,
          "elements"
        );

        // Check each element in the array
        exerciseData.forEach((item, index) => {
          console.log(`Checking element ${index}:`, item);
          console.log(`- questionText:`, item.questionText);
          console.log(`- options:`, item.options);

          if (!item.options || !Array.isArray(item.options)) {
            console.warn(
              `Element ${index} has no options or options is not an array`
            );
          } else {
            console.log(`- Number of options:`, item.options.length);
          }
        });

        setProcessedExerciseData(exerciseData);
      }
      // Check if exerciseData is a quiz with questions
      else if (
        exerciseData.questions &&
        Array.isArray(exerciseData.questions)
      ) {
        console.log(
          "exerciseData has questions property which is an array with",
          exerciseData.questions.length,
          "elements"
        );
        setProcessedExerciseData(exerciseData.questions);
      }
      // Case where exerciseData is a single quiz object
      else {
        console.log("exerciseData is a single object, wrapping in array");
        setProcessedExerciseData([exerciseData]);
      }
    } else {
      console.warn("ExerciseContent did not receive data");
    }
  }, [exerciseData]);

  useEffect(() => {
    console.log("Processed data:", processedExerciseData);
  }, [processedExerciseData]);

  if (exerciseLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (exerciseError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {exerciseError}
      </Alert>
    );
  }

  if (!processedExerciseData || processedExerciseData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No exercise data found
      </Alert>
    );
  }

  // Check if each question has options
  const hasAllOptions = processedExerciseData.every(
    (exercise) =>
      exercise.options &&
      Array.isArray(exercise.options) &&
      exercise.options.length > 0
  );

  if (!hasAllOptions) {
    console.error(
      "Some questions have no options:",
      processedExerciseData.filter(
        (exercise) =>
          !exercise.options ||
          !Array.isArray(exercise.options) ||
          exercise.options.length === 0
      )
    );
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
              Result: {score.toFixed(1)}/10 points{" "}
              {score >= 5 ? "- Passed" : "- Not Passed"}
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

      {processedExerciseData.map((exercise, index) => {
        console.log(`Displaying question ${index}:`, exercise);
        console.log(`Question ${index} has options:`, exercise.options);
        console.log(`Question ${index} type:`, exercise.questionType);
        console.log(`Question ${index} notation:`, exercise.notation);

        // Check options before rendering
        if (
          !exercise.options ||
          !Array.isArray(exercise.options) ||
          exercise.options.length === 0
        ) {
          console.warn(`Question ${index} has no valid options`);
          return (
            <Paper
              key={exercise._id || index}
              elevation={3}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: "8px",
                border: "1px solid #ff9800",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip
                  icon={<MusicNote />}
                  label={`Question ${index + 1}`}
                  color="primary"
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {exercise.questionText || "No question content"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Alert severity="warning">
                No options found for this question
              </Alert>
            </Paper>
          );
        }

        // Find correct answer for this question
        const correctOption = exercise.options.find((opt) => opt.isCorrect);
        console.log(`Correct answer for question ${index}:`, correctOption);

        // Check if user answered correctly
        const userSelectedOption = selectedAnswers[index];
        const isAnswerCorrect =
          (showResults || isViewMode) &&
          userSelectedOption &&
          correctOption?.content === userSelectedOption;

        return (
          <Paper
            key={exercise._id || index}
            elevation={3}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: "8px",
              border:
                showResults || isViewMode
                  ? selectedAnswers[index] === correctOption?.content
                    ? "1px solid #4caf50"
                    : "1px solid #f44336"
                  : "1px solid transparent",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Chip
                icon={
                  exercise.questionType === "vexFlow" ? (
                    <LibraryMusic />
                  ) : (
                    <MusicNote />
                  )
                }
                label={`Question ${index + 1}`}
                color="primary"
                sx={{ mr: 2 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {exercise.questionText}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {exercise.questionType === "vexFlow" && exercise.notation && (
              <Box
                sx={{
                  my: 3,
                  borderRadius: 1,
                  p: 2,
                  bgcolor: "#f9f9f9",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  <LibraryMusic sx={{ mr: 1, verticalAlign: "middle" }} />
                  Khuông nhạc:
                </Typography>
                <VexFlowComponent
                  notes={exercise.notation}
                  width={500}
                  height={150}
                  editable={false}
                />
              </Box>
            )}

            <Box>
              <RadioGroup
                value={selectedAnswers[index] || ""}
                onChange={(e) => handleAnswerSelect(index, e.target.value)}
              >
                {exercise.options.map((option, optIndex) => {
                  const isSelected = selectedAnswers[index] === option.content;
                  const isCorrect = option.isCorrect;
                  const userSelectedThis =
                    (showResults || isViewMode) && isSelected;

                  // Trong chế độ xem, hiển thị đáp án đúng và đáp án người dùng chọn
                  const showCorrectAnswer = showResults || isViewMode;
                  const isCorrectOption = showCorrectAnswer && isCorrect;

                  // Style cho option label
                  let labelStyle = {
                    color: "text.primary",
                    fontWeight: "normal",
                  };

                  // Trong chế độ xem kết quả, style dành cho đáp án đúng và đáp án đã chọn
                  if (showCorrectAnswer) {
                    if (isSelected && !isCorrect) {
                      // Đáp án sai đã chọn: màu đỏ
                      labelStyle = {
                        color: "error.main",
                        fontWeight: "bold",
                      };
                    }
                  }

                  return (
                    <FormControlLabel
                      key={option._id || optIndex}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  bgcolor: "#E8F5E9",
                  borderRadius: 1,
                  border: "1px solid #C8E6C9",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircle sx={{ color: "#2E7D32", mr: 1 }} />
                  <Typography sx={{ color: "#2E7D32", fontWeight: "bold" }}>
                    Correct
                  </Typography>
                </Box>
                <Typography sx={{ color: "#2E7D32" }}>
                  You chose the correct answer.
                </Typography>
              </Box>
            )}

            {(showResults || isViewMode) &&
              selectedAnswers[index] !== undefined &&
              !isAnswerCorrect && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "#FFEBEE",
                    borderRadius: 1,
                    border: "1px solid #FFCDD2",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ErrorOutline sx={{ color: "#D32F2F", mr: 1 }} />
                    <Typography sx={{ color: "#D32F2F", fontWeight: "bold" }}>
                      Incorrect
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "#D32F2F" }}>
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
            onClick={handleSubmitExercise}
            disabled={
              Object.keys(selectedAnswers).length !==
                processedExerciseData.length || isSubmitting
            }
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      )}
    </>
  );
};

ExerciseContent.propTypes = {
  exerciseData: PropTypes.array,
  exerciseLoading: PropTypes.bool,
  exerciseError: PropTypes.string,
  selectedAnswers: PropTypes.object,
  score: PropTypes.number,
  handleAnswerSelect: PropTypes.func,
  handleSubmitExercise: PropTypes.func,
  showResults: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  isViewMode: PropTypes.bool,
};

export default ExerciseContent;
