import { useRef, useEffect, useState } from 'react'
import { Box, Container, Typography, Paper, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import PracticeButton from '../../../components/common/PracticeButton'
import PracticeEvaluation from '../../../components/common/PracticeEvaluation'
import { Factory } from 'vexflow'
import { useKeySignature } from '../../../contexts/KeySignatureContext'

// Custom styled components
const StaffContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  maxWidth: '800px',
  margin: '60px auto',
  display: 'flex',
  justifyContent: 'center',
  svg: {
    width: '100%',
    height: 'auto',
    maxHeight: '160px',
  },
})

const ScoreDisplay = styled(Typography)({
  position: 'absolute',
  top: 20,
  right: 20,
  fontSize: '1.2rem',
})

const ButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px 0',
  flexWrap: 'wrap',
})

const KeySignatureIdentification = () => {
  const {
    practiceSession,
    recordAttempt,
    nextQuestion,
    getEvaluation,
    getFinalEvaluation,
    resetSession,
  } = useKeySignature()

  const [currentKeySignature, setCurrentKeySignature] = useState(null)
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set())
  const [correctAnswer, setCorrectAnswer] = useState(null)
  const staffRef = useRef(null)

  const keySignatures = [
    { key: 'C', name: 'C ', accidentals: 0 },
    { key: 'G', name: 'G (1♯)', accidentals: 1 },
    { key: 'D', name: 'D (2♯)', accidentals: 2 },
    { key: 'A', name: 'A (3♯)', accidentals: 3 },
    { key: 'E', name: 'E (4♯)', accidentals: 4 },
    { key: 'F', name: 'F (1♭)', accidentals: -1 },
    { key: 'Bb', name: 'B♭ (2♭)', accidentals: -2 },
    { key: 'Eb', name: 'E♭ (3♭)', accidentals: -3 },
    { key: 'Ab', name: 'A♭ (4♭)', accidentals: -4 },
  ]

  useEffect(() => {
    // Generate random key signature when component mounts or when moving to next question
    const randomKeySignature =
      keySignatures[Math.floor(Math.random() * keySignatures.length)]
    setCurrentKeySignature(randomKeySignature)
  }, [practiceSession.currentQuestionIndex])

  const drawKeySignature = (key) => {
    if (!staffRef.current || !key) return

    staffRef.current.innerHTML = ''

    const vf = new Factory({
      renderer: {
        elementId: 'staff',
        width: 500,
        height: 120,
        type: 'svg',
      },
    })

    const score = vf.EasyScore()
    const system = vf.System({
      width: 400,
      spaceBetweenStaves: 10,
      x: 40,
      y: 20,
    })

    const stave = system
      .addStave({
        voices: [score.voice(score.notes('C4/w', { stem: 'up' }))],
      })
      .addClef('treble')
      .addKeySignature(key)

    stave.setContext(vf.context).format()

    vf.draw()

    const svg = staffRef.current.querySelector('svg')
    if (svg) {
      svg.style.transform = 'scale(1.1)'
      svg.style.transformOrigin = 'center center'
    }
  }

  useEffect(() => {
    if (currentKeySignature) {
      drawKeySignature(currentKeySignature.key)
    }
  }, [currentKeySignature])

  const handleAnswer = (answer) => {
    if (!currentKeySignature) return

    const isCorrect = answer === currentKeySignature.key
    recordAttempt(isCorrect)

    if (isCorrect) {
      setCorrectAnswer(answer)
      setTimeout(() => {
        setCorrectAnswer(null)
        setIncorrectAnswers(new Set())
        nextQuestion()
      }, 300)
    } else {
      setIncorrectAnswers((prev) => new Set([...prev, answer]))
    }
  }

  if (practiceSession.isComplete) {
    return (
      <Container
        maxWidth='lg'
        sx={{ py: 4, ml: 25 }}
      >
        <PracticeEvaluation
          wrongAttempts={practiceSession.wrongAttempts}
          totalQuestions={practiceSession.totalQuestions}
          score={practiceSession.score}
          getEvaluation={getEvaluation}
          getFinalEvaluation={getFinalEvaluation}
          onReset={resetSession}
        />
      </Container>
    )
  }

  if (!currentKeySignature) {
    return null // or loading indicator
  }

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4, ml: 30 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '16px',
          margin: '0 auto',
        }}
      >
        <Typography
          variant='h4'
          align='center'
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#1a1a1a',
          }}
        >
          Key Signature Identification
        </Typography>
        <Typography
          variant='h6'
          align='center'
          gutterBottom
        >
          Question {practiceSession.currentQuestionIndex + 1}/
          {practiceSession.totalQuestions}
        </Typography>

        <ScoreDisplay>Score: {practiceSession.score}</ScoreDisplay>

        <StaffContainer>
          <div
            id='staff'
            ref={staffRef}
          />
        </StaffContainer>

        <ButtonContainer>
          {keySignatures.map((keySignature) => (
            <PracticeButton
              key={keySignature.key}
              onClick={() => handleAnswer(keySignature.key)}
              correct={keySignature.key === correctAnswer}
              incorrect={incorrectAnswers.has(keySignature.key)}
              sx={{ minWidth: '120px' }}
            >
              {keySignature.name}
            </PracticeButton>
          ))}
        </ButtonContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant='outlined'
            onClick={() =>
              nextQuestion(
                Math.max(0, practiceSession.currentQuestionIndex - 1)
              )
            }
            disabled={practiceSession.currentQuestionIndex === 0}
          >
            Câu trước
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={nextQuestion}
            disabled={
              practiceSession.currentQuestionIndex ===
              practiceSession.totalQuestions - 1
            }
          >
            {practiceSession.currentQuestionIndex <
            practiceSession.totalQuestions - 1
              ? 'Câu tiếp theo'
              : 'Hoàn thành'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default KeySignatureIdentification
