/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'
import { Link } from 'react-router-dom'

const ExerciseContent = ({
  title,
  selectedItem,
  selectedAnswers,
  onAnswerSelect,
}) => {
  const handleAnswerChange = (questionIndex, answerId) => {
    onAnswerSelect(questionIndex, answerId)
  }

  const isAnswerCorrect = (question, answerId) => {
    return answerId === question.correctAnswer
  }

  return (
    <Box sx={{ mr: '100px', ml: '50px', width: 800 }}>
      <Typography
        variant='subtitle1'
        color='text.secondary'
      >
        <Link
          to={'/student/exercise'}
          style={{
            textDecoration: 'none',
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Bài tập
        </Link>{' '}
        / {title}
      </Typography>

      {selectedItem?.content?.map((contentItem, index) => (
        <Box
          key={index}
          sx={{ mb: 4 }}
        >
          <img
            src={contentItem.image}
            alt={`Hình minh họa ${index + 1}`}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <Typography sx={{ mt: 2 }}>{contentItem.description}</Typography>
        </Box>
      ))}

      {selectedItem?.questions?.map((question, index) => (
        <Box
          key={index}
          sx={{ mb: 4 }}
        >
          <Typography
            variant='h6'
            sx={{ mt: 2, mb: 2 }}
          >
            Câu hỏi {index + 1}: {question.question}
          </Typography>

          {question.type === 'multiple-choice' && (
            <RadioGroup
              value={selectedAnswers[index] || ''}
              onChange={(e) =>
                handleAnswerChange(index, parseInt(e.target.value))
              }
            >
              {question.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={
                    <>
                      {option.image && (
                        <img
                          src={option.image}
                          alt={`Option ${option.id}`}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            marginRight: '10px',
                          }}
                        />
                      )}
                      {option.text}
                    </>
                  }
                  sx={{
                    color:
                      selectedAnswers[index] === option.id
                        ? isAnswerCorrect(question, option.id)
                          ? 'green'
                          : 'red'
                        : 'inherit',
                  }}
                />
              ))}
            </RadioGroup>
          )}

          {question.type === 'true-false' && (
            <RadioGroup
              value={selectedAnswers[index] || ''}
              onChange={(e) =>
                handleAnswerChange(index, parseInt(e.target.value))
              }
            >
              {question.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                  sx={{
                    color:
                      selectedAnswers[index] === option.id
                        ? isAnswerCorrect(question, option.id)
                          ? 'green'
                          : 'red'
                        : 'inherit',
                  }}
                />
              ))}
            </RadioGroup>
          )}

          {question.type === 'image-choice' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {question.options.map((option) => (
                <Button
                  key={option.id}
                  variant='outlined'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderColor:
                      selectedAnswers[index] === option.id
                        ? isAnswerCorrect(question, option.id)
                          ? 'green'
                          : 'red'
                        : 'inherit',
                  }}
                  onClick={() => handleAnswerChange(index, option.id)}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      alt={`Option ${option.id}`}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        marginBottom: '10px',
                      }}
                    />
                  )}
                  <Typography>{option.description}</Typography>
                </Button>
              ))}
            </Box>
          )}

          {question.type === 'matching' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {question.pairs.map((pair, pairIndex) => (
                <Box
                  key={pairIndex}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  {pair.term.image && (
                    <img
                      src={pair.term.image}
                      alt={`Term ${pairIndex}`}
                      style={{ maxWidth: '100px', height: 'auto' }}
                    />
                  )}
                  <Typography>{pair.term.text}</Typography>
                  <Typography sx={{ mx: 2 }}>→</Typography>
                  <Typography>{pair.match.text}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}

export default ExerciseContent
