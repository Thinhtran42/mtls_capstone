import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Box,
  Divider,
  Alert,
} from '@mui/material'
import VexFlowComponent from '../../vexflow/VexFlowComponent'
import * as mm from '@magenta/music/es6/core'

const AIExerciseModal = ({ open, onClose, exercise }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  if (!exercise) return null

  const handleOptionChange = (event) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestion]: event.target.value,
    })
  }

  const handleNext = () => {
    if (currentQuestion < exercise.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate score
      let correctCount = 0
      exercise.questions.forEach((question, index) => {
        if (selectedOptions[index] === question.correctAnswer) {
          correctCount++
        }
      })
      setScore(correctCount)
      setShowResults(true)
    }
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setSelectedOptions({})
    setShowResults(false)
    setScore(0)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const currentQ = exercise.questions[currentQuestion]

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>{exercise.title}</DialogTitle>
      <Divider />
      <DialogContent>
        {!showResults ? (
          <Box>
            <Typography
              variant='h6'
              gutterBottom
            >
              Câu hỏi {currentQuestion + 1} / {exercise.questions.length}
            </Typography>
            <Typography
              variant='body1'
              gutterBottom
            >
              {currentQ.question}
            </Typography>

            {currentQ.notation && (
              <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <VexFlowComponent
                  notes={currentQ.notation}
                  width={500}
                />
              </Box>
            )}

            <FormControl
              component='fieldset'
              sx={{ width: '100%' }}
            >
              <RadioGroup
                value={selectedOptions[currentQuestion] || ''}
                onChange={handleOptionChange}
              >
                {currentQ.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant='h5'
              gutterBottom
            >
              Kết quả
            </Typography>
            <Typography
              variant='h6'
              gutterBottom
            >
              Bạn đã trả lời đúng {score}/{exercise.questions.length} câu hỏi
            </Typography>

            <Box sx={{ mt: 3 }}>
              {exercise.questions.map((question, index) => (
                <Box
                  key={index}
                  sx={{ mb: 2, textAlign: 'left' }}
                >
                  <Typography variant='subtitle1'>
                    Câu {index + 1}: {question.question}
                  </Typography>
                  <Typography variant='body2'>
                    Đáp án của bạn: {selectedOptions[index] || 'Không trả lời'}
                  </Typography>
                  <Typography variant='body2'>
                    Đáp án đúng: {question.correctAnswer}
                  </Typography>
                  <Alert
                    severity={
                      selectedOptions[index] === question.correctAnswer
                        ? 'success'
                        : 'error'
                    }
                    sx={{ mt: 1 }}
                  >
                    {selectedOptions[index] === question.correctAnswer
                      ? 'Chính xác!'
                      : 'Chưa chính xác'}
                  </Alert>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!showResults ? (
          <>
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              onClick={handleNext}
              variant='contained'
              color='primary'
              disabled={selectedOptions[currentQuestion] === undefined}
            >
              {currentQuestion < exercise.questions.length - 1
                ? 'Tiếp theo'
                : 'Hoàn thành'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleReset}>Làm lại</Button>
            <Button
              onClick={handleClose}
              variant='contained'
              color='primary'
            >
              Đóng
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AIExerciseModal
