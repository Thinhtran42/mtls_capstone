/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
} from '@mui/material'
import { Link } from 'react-router-dom'
import MusicNotation from '../../vexflow/MusicNotation'

const TestContent = ({
  title,
  selectedItem,
  selectedAnswers,
  onAnswerSelect,
}) => {
  const handleAnswerChange = (questionIndex, answer) => {
    onAnswerSelect(questionIndex, answer)
  }

  const isAnswerCorrect = (question, answer) => {
    return answer === question.correctAnswer
  }

  const handleNoteClick = (note) => {
    alert(`Bạn đã nhấp vào nốt nhạc: ${note}`)
  }

  // Kiểm tra selectedItem và selectedItem.content
  if (!selectedItem || !selectedItem.content) {
    return (
      <Box sx={{ mr: '100px', ml: '50px', width: 800 }}>
        <Typography
          variant='h6'
          component='h1'
          sx={{ mt: 2, mb: 5 }}
        >
          Không có dữ liệu câu hỏi.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mr: '100px', ml: '50px', width: 800 }}>
      <Typography
        variant='subtitle1'
        color='text.secondary'
      >
        <Link
          to={'/student/test'}
          style={{
            textDecoration: 'none',
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Kiểm tra
        </Link>{' '}
        / {title}
      </Typography>
      <Typography
        variant='h6'
        component='h1'
        sx={{ mt: 2, mb: 5 }}
      >
        Câu {selectedItem?.id}: {selectedItem?.title}
      </Typography>

      {selectedItem?.content?.map((contentItem, index) => (
        <Box
          key={index}
          sx={{ mb: 4 }}
        >
          {contentItem.vexFlowNotes && (
            <MusicNotation
              notes={contentItem.vexFlowNotes}
              onNoteClick={handleNoteClick}
            />
          )}

          <Typography sx={{ mt: 2 }}>{contentItem.question}</Typography>

          <RadioGroup
            value={selectedAnswers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
          >
            {contentItem.options.map((option, optionIndex) => (
              <FormControlLabel
                key={optionIndex}
                value={option.split('. ')[0]}
                control={<Radio />}
                label={option}
                sx={{
                  color:
                    selectedAnswers[index] === option.split('. ')[0]
                      ? isAnswerCorrect(contentItem, option.split('. ')[0])
                        ? 'green'
                        : 'red'
                      : 'inherit',
                }}
              />
            ))}
          </RadioGroup>

          {selectedAnswers[index] && (
            <Typography
              sx={{
                mt: 2,
                color: isAnswerCorrect(contentItem, selectedAnswers[index])
                  ? 'green'
                  : 'red',
              }}
            >
              {isAnswerCorrect(contentItem, selectedAnswers[index])
                ? 'Chính xác!'
                : 'Sai rồi!'}{' '}
              {contentItem.explanation}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

export default TestContent
