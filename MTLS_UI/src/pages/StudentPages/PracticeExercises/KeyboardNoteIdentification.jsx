import { useState, useEffect } from 'react'
import { Box, Container, Typography, Paper, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useKeyboardNoteIdentification } from '../../../contexts/KeyboardNoteIdentificationContext'
import PracticeEvaluation from '../../../components/common/PracticeEvaluation'
import PropTypes from 'prop-types'

const StyledKey = styled(Box)(({ iswhite, ishighlighted }) => ({
  position: 'relative',
  display: 'inline-block',
  cursor: 'default',
  verticalAlign: 'top',
  userSelect: 'none',
  ...(iswhite
    ? {
        width: '40px',
        height: '160px',
        border: '1px solid #999',
        borderBottom: '4px solid #999',
        backgroundColor: ishighlighted ? '#e3f2fd' : '#fff',
        zIndex: 1,
      }
    : {
        width: '24px',
        height: '100px',
        backgroundColor: ishighlighted ? '#90caf9' : '#000',
        marginLeft: '-12px',
        marginRight: '-12px',
        zIndex: 2,
      }),
}))

const KeyLabel = styled(Typography)({
  position: 'absolute',
  bottom: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '12px',
  fontWeight: 'bold',
})

const AnswerButton = styled(Button)(({ iscorrect, isincorrect }) => ({
  minWidth: '80px',
  margin: '4px',
  backgroundColor: iscorrect ? '#a5d6a7' : isincorrect ? '#ef9a9a' : 'white',
  color: '#000',
  '&:hover': {
    backgroundColor: iscorrect
      ? '#81c784'
      : isincorrect
        ? '#e57373'
        : '#e3f2fd',
  },
}))

const Piano = ({ highlightedKey }) => {
  const keys = [
    { note: 'C', isWhite: true },
    { note: 'C#', isWhite: false },
    { note: 'D', isWhite: true },
    { note: 'D#', isWhite: false },
    { note: 'E', isWhite: true },
    { note: 'F', isWhite: true },
    { note: 'F#', isWhite: false },
    { note: 'G', isWhite: true },
    { note: 'G#', isWhite: false },
    { note: 'A', isWhite: true },
    { note: 'A#', isWhite: false },
    { note: 'B', isWhite: true },
  ]

  const octaves = [4, 5] // Showing two octaves

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        height: '170px',
        mt: 4,
      }}
    >
      {octaves.map((octave) =>
        keys.map(({ note, isWhite }) => {
          const fullNote = `${note}${octave}`
          return (
            <StyledKey
              key={fullNote}
              iswhite={isWhite}
              ishighlighted={highlightedKey === fullNote}
            >
              <KeyLabel
                sx={{
                  color: isWhite ? 'black' : 'white',
                  display: 'none',
                }}
              >
                {fullNote}
              </KeyLabel>
            </StyledKey>
          )
        })
      )}
    </Box>
  )
}

Piano.propTypes = {
  highlightedKey: PropTypes.string,
}

const KeyboardNoteIdentification = () => {
  const {
    practiceSession,
    recordAttempt,
    nextQuestion,
    getEvaluation,
    getFinalEvaluation,
    resetSession,
  } = useKeyboardNoteIdentification()

  const [currentKey, setCurrentKey] = useState(null)
  const [options, setOptions] = useState([])
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set())
  const [correctAnswer, setCorrectAnswer] = useState(null)
  const [audioContext, setAudioContext] = useState(null)

  // Frequency mapping for notes
  const noteFrequencies = {
    // First octave
    C4: 261.63,
    'C#4': 277.18,
    D4: 293.66,
    'D#4': 311.13,
    E4: 329.63,
    F4: 349.23,
    'F#4': 369.99,
    G4: 392.0,
    'G#4': 415.3,
    A4: 440.0,
    'A#4': 466.16,
    B4: 493.88,
    // Second octave
    C5: 523.25,
    'C#5': 554.37,
    D5: 587.33,
    'D#5': 622.25,
    E5: 659.26,
    F5: 698.46,
    'F#5': 739.99,
    G5: 783.99,
    'G#5': 830.61,
    A5: 880.0,
    'A#5': 932.33,
    B5: 987.77,
  }

  useEffect(() => {
    // Initialize AudioContext
    const context = new (window.AudioContext || window.webkitAudioContext)()
    setAudioContext(context)

    return () => {
      if (context) {
        context.close()
      }
    }
  }, [])

  const playNote = (notation) => {
    if (!audioContext) return

    // Create master gain node
    const masterGain = audioContext.createGain()
    masterGain.connect(audioContext.destination)
    masterGain.gain.value = 0.7

    // Harmonics ratios and gains for piano-like sound
    const harmonics = [
      { ratio: 1, gain: 0.7 }, // fundamental
      { ratio: 2, gain: 0.15 }, // octave
      { ratio: 3, gain: 0.1 }, // fifth
      { ratio: 4, gain: 0.08 }, // second octave
      { ratio: 5, gain: 0.05 }, // third + some cents
      { ratio: 6, gain: 0.03 }, // second fifth
    ]

    const fundamental = noteFrequencies[notation]

    harmonics.forEach(({ ratio, gain }) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Connect oscillator to its gain node, then to master gain
      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      // Set frequency and type
      oscillator.frequency.setValueAtTime(
        fundamental * ratio,
        audioContext.currentTime
      )
      oscillator.type = 'sine'

      // Set initial gain
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)

      // Attack
      gainNode.gain.linearRampToValueAtTime(
        gain,
        audioContext.currentTime + 0.02
      )

      // Decay and Sustain
      gainNode.gain.linearRampToValueAtTime(
        gain * 0.8,
        audioContext.currentTime + 0.1
      )

      // Release
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5)

      // Start and stop
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1.5)
    })
  }

  useEffect(() => {
    generateNewQuestion()
  }, [practiceSession.currentQuestionIndex])

  const generateNewQuestion = () => {
    const octaves = [4, 5]
    const notes = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ]
    const randomOctave = octaves[Math.floor(Math.random() * octaves.length)]
    const randomNote = notes[Math.floor(Math.random() * notes.length)]
    const correctAnswer = `${randomNote}${randomOctave}`
    setCurrentKey(correctAnswer)

    // Generate 4 unique options including the correct answer
    const allPossibleNotes = notes.flatMap((note) =>
      octaves.map((oct) => `${note}${oct}`)
    )
    const shuffled = allPossibleNotes
      .filter((note) => note !== correctAnswer)
      .sort(() => Math.random() - 0.5)

    const wrongOptions = shuffled.slice(0, 3)
    const allOptions = [...wrongOptions, correctAnswer].sort(
      () => Math.random() - 0.5
    )

    setOptions(allOptions)
    setIncorrectAnswers(new Set())
    setCorrectAnswer(null)
  }

  const handleAnswerClick = (answer) => {
    if (correctAnswer) return

    const isAnswerCorrect = answer === currentKey

    if (isAnswerCorrect) {
      setCorrectAnswer(answer)
      recordAttempt(true)
      // Play the note when correct
      playNote(answer)
      setTimeout(() => {
        nextQuestion()
      }, 1500) // Increased delay to allow the note to play
    } else {
      setIncorrectAnswers((prev) => new Set([...prev, answer]))
      recordAttempt(false)
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

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4, ml: 40 }}
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
          Keyboard Note Identification
        </Typography>

        <Typography
          variant='h6'
          align='center'
          gutterBottom
        >
          Question {practiceSession.currentQuestionIndex + 1}/
          {practiceSession.totalQuestions}
        </Typography>

        <Piano highlightedKey={currentKey} />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            mt: 4,
          }}
        >
          {options.map((option) => (
            <AnswerButton
              key={option}
              variant='contained'
              onClick={() => handleAnswerClick(option)}
              disabled={correctAnswer !== null}
              iscorrect={option === correctAnswer}
              isincorrect={incorrectAnswers.has(option)}
            >
              {option}
            </AnswerButton>
          ))}
        </Box>
      </Paper>
    </Container>
  )
}

export default KeyboardNoteIdentification
