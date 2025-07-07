import { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card } from '@mui/material';
import { useNoteListening } from '../../../contexts/NoteListeningContext';
import PracticeEvaluation from '../../../components/common/PracticeEvaluation';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { styled } from '@mui/material/styles';

const AnswerCard = styled(Card)(({ iscorrect, isincorrect }) => ({
  padding: 2,
  minWidth: 100,
  cursor: 'pointer',
  textAlign: 'center',
  backgroundColor: iscorrect ? '#a5d6a7' : isincorrect ? '#ef9a9a' : 'white',
  color: '#000',
  '&:hover': {
    backgroundColor: iscorrect ? '#81c784' : isincorrect ? '#e57373' : '#e3f2fd',
  },
}));

const notes = [
  { id: 'C4', name: 'Đô', frequency: 261.63 },
  { id: 'D4', name: 'Rê', frequency: 293.66 },
  { id: 'E4', name: 'Mi', frequency: 329.63 },
  { id: 'F4', name: 'Fa', frequency: 349.23 },
  { id: 'G4', name: 'Sol', frequency: 392.00 },
  { id: 'A4', name: 'La', frequency: 440.00 },
  { id: 'B4', name: 'Si', frequency: 493.88 },
];

const NoteListeningIdentification = () => {
  const {
    currentNote,
    setCurrentNote,
    wrongAttempts,
    score,
    totalQuestions,
    setTotalQuestions,
    isCompleted,
    setIsCompleted,
    checkAnswer,
    reset,
    getEvaluation,
    getFinalEvaluation,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  } = useNoteListening();

  const [audioContext, setAudioContext] = useState(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set());
  const [correctAnswer, setCorrectAnswer] = useState(null);

  useEffect(() => {
    if (!currentNote && !isCompleted) {
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      setCurrentNote(randomNote.id);
      setCurrentQuestionIndex(0);
    }
  }, [currentNote, isCompleted, setCurrentNote, setTotalQuestions]);

  useEffect(() => {
    // Initialize AudioContext
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    return () => {
      if (context) {
        context.close();
      }
    };
  }, []);

  const playNote = (noteId) => {
    if (!audioContext) return;

    const noteToPlay = notes.find(note => note.id === noteId);
    if (!noteToPlay) return;

    // Create master gain node
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.7;

    // Harmonics ratios and gains for piano-like sound
    const harmonics = [
      { ratio: 1, gain: 0.7 },    // fundamental
      { ratio: 2, gain: 0.15 },   // octave
      { ratio: 3, gain: 0.1 },    // fifth
      { ratio: 4, gain: 0.08 },   // second octave
      { ratio: 5, gain: 0.05 },   // third + some cents
      { ratio: 6, gain: 0.03 }    // second fifth
    ];

    harmonics.forEach(({ ratio, gain }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect oscillator to its gain node, then to master gain
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      // Set frequency and type
      oscillator.frequency.setValueAtTime(noteToPlay.frequency * ratio, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set initial gain
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      // Attack
      gainNode.gain.linearRampToValueAtTime(
        gain,
        audioContext.currentTime + 0.02
      );
      
      // Decay and Sustain
      gainNode.gain.linearRampToValueAtTime(
        gain * 0.8,
        audioContext.currentTime + 0.1
      );
      
      // Release
      gainNode.gain.linearRampToValueAtTime(
        0,
        audioContext.currentTime + 1.5
      );
      
      // Start and stop
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    });
  };

  const handleNoteSelection = (selectedNoteId) => {
    if (correctAnswer) return; // Prevent selection if already correct

    const isCorrect = checkAnswer(selectedNoteId);
    
    if (isCorrect) {
      setCorrectAnswer(selectedNoteId);
      // Play the correct note when user selects correctly
      playNote(selectedNoteId);
      
      // Only move to next question after correct answer
      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex >= totalQuestions) {
          setIsCompleted(true);
        } else {
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          setCurrentNote(randomNote.id);
          setCorrectAnswer(null);
          setIncorrectAnswers(new Set());
          setCurrentQuestionIndex(nextQuestionIndex);
        }
      }, 1500); // Wait for the note to finish playing
    } else {
      // Just mark the answer as incorrect and let user try again
      setIncorrectAnswers(prev => new Set([...prev, selectedNoteId]));
    }
  };

  const handleReset = () => {
    reset();
    setIncorrectAnswers(new Set());
    setCorrectAnswer(null);
    setCurrentQuestionIndex(0);
  };

  const playCurrentNote = () => {
    if (currentNote) {
      playNote(currentNote);
    }
  };

  if (isCompleted) {
    return (
      <Box sx={{ p: 3, ml: 25 }}>
        <PracticeEvaluation
          wrongAttempts={wrongAttempts}
          totalQuestions={totalQuestions}
          score={score}
          getEvaluation={getEvaluation}
          getFinalEvaluation={getFinalEvaluation}
          onReset={handleReset}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 10 }}>
      <Typography variant="h4" gutterBottom align="center">
        Note Listening Identification
      </Typography>
      
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h6" gutterBottom>
          Question {currentQuestionIndex + 1}/{totalQuestions}
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlayCircleIcon />}
          onClick={playCurrentNote}
          sx={{ my: 2 }}
        >
          Play Sound
        </Button>
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {notes.map((note) => (
          <Grid item key={note.id}>
            <AnswerCard 
              onClick={() => handleNoteSelection(note.id)}
              iscorrect={note.id === correctAnswer}
              isincorrect={incorrectAnswers.has(note.id)}
              sx={{ p: 2 }}
            >
              <Typography variant="h6">
                {note.name}
              </Typography>
            </AnswerCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NoteListeningIdentification;
