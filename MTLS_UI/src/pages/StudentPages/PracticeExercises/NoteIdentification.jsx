import { useRef, useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import PracticeButton from '../../../components/common/PracticeButton';
import { Factory } from 'vexflow';
import { useNoteIdentification } from '../../../contexts/NoteIdentificationContext';

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
    maxHeight: '160px'
  }
});

const StatDisplay = styled(Typography)({
  position: 'absolute',
  top: 20,
  right: 20,
  fontSize: '1.2rem',
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  maxWidth: '90%',
  margin: '0 auto',
  padding: '20px 0',
  flexWrap: 'wrap'
});

const ButtonRow = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  width: '100%',
  marginBottom: '8px'
});

const ExerciseSelector = styled(FormControl)({
  margin: '20px auto',
  minWidth: 200,
  display: 'flex',
  justifyContent: 'center',
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
});

const ResponsiveButton = styled(PracticeButton)(({ theme, correct, incorrect }) => ({
  minWidth: '50px',
  margin: '4px',
  '@media (max-width: 768px)': {
    minWidth: '40px',
    fontSize: '0.9rem',
    padding: '6px'
  },
  ...(correct && {
    backgroundColor: '#4caf50 !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#45a049 !important',
    }
  }),
  ...(incorrect && {
    backgroundColor: '#ffcdd2 !important',
    color: '#c62828 !important',
    '&:hover': {
      backgroundColor: '#ffcdd2 !important',
    }
  })
}));

const NoteIdentification = () => {
  // Get context values
  const {
    exercises,
    currentExercise,
    practiceStats,
    loading,
    error: contextError,
    loadExercise,
    recordAttempt,
    nextQuestion,
    resetStats
  } = useNoteIdentification();

  // State and refs
  const [currentNote, setCurrentNote] = useState(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set());
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const staffRef = useRef(null);

  // Initialize AudioContext
  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    return () => {
      if (context) {
        context.close();
      }
    };
  }, []);

  // Handle exercise change
  const handleExerciseChange = async (event) => {
    const exerciseId = parseInt(event.target.value);
    // Reset trạng thái các nút trả lời khi chuyển bài tập
    setIncorrectAnswers(new Set());
    setCorrectAnswer(null);
    await loadExercise(exerciseId);
  };

  // Reset trạng thái khi currentExercise thay đổi
  useEffect(() => {
    setIncorrectAnswers(new Set());
    setCorrectAnswer(null);
  }, [currentExercise?.id]);

  // Tạo nốt ngẫu nhiên mới
  const generateRandomNote = () => {
    if (currentExercise && currentExercise.notes && currentExercise.notes.length > 0) {
      const randomNote = currentExercise.notes[Math.floor(Math.random() * currentExercise.notes.length)];
      setCurrentNote(randomNote);
      // Reset trạng thái các nút trả lời khi chuyển câu hỏi
      setIncorrectAnswers(new Set());
      setCorrectAnswer(null);
    }
  };

  // Tạo nốt ngẫu nhiên khi component mount hoặc khi exercise thay đổi
  useEffect(() => {
    generateRandomNote();
  }, [currentExercise]);

  const playNote = (notation) => {
    if (!audioContext || !currentExercise) return;

    // Create master gain node
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.7;

    // Get frequency from the current note
    const noteObj = currentExercise.notes.find(n => n.notation === notation);
    const fundamental = noteObj ? noteObj.frequency : 440; // Default to A4 if not found

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
      oscillator.frequency.setValueAtTime(fundamental * ratio, audioContext.currentTime);
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

  const drawNote = (noteNotation, color = '#000000') => {
    if (!staffRef.current || !noteNotation || !currentExercise) return;

    staffRef.current.innerHTML = '';

    try {
      console.log("Drawing note:", noteNotation);
      
      // Khởi tạo VexFlow Factory
      const vf = new Factory({
        renderer: {
          elementId: 'staff',
          width: 500,
          height: 150,
          type: 'svg'
        }
      });

      // Tạo score
      const score = vf.EasyScore();

      // Xác định khóa nhạc dựa trên bài tập
      const clef = currentExercise.clef === 'bass' ? 'bass' : 'treble';
      
      // Đối với bài tập nâng cao, xác định khóa nhạc từ nốt
      const noteObj = currentExercise.notes.find(n => n.notation === noteNotation);
      const noteClef = noteObj && noteObj.clef ? noteObj.clef : clef;

      // Chuyển đổi notation sang định dạng VexFlow yêu cầu
      const note = noteNotation.charAt(0).toLowerCase();
      const octave = noteNotation.charAt(noteNotation.length - 1);
      const formattedNote = `${note}/${octave}`;
      
      console.log("Formatted note:", formattedNote);

      // Tạo stave với khóa nhạc phù hợp
      const stave = vf.Stave({ x: 40, y: 40, width: 400 })
        .addClef(noteClef)
        .setContext(vf.getContext());

      // Tạo nốt nhạc với định dạng đúng
      const staveNote = vf.StaveNote({
        clef: noteClef,
        keys: [formattedNote],
        duration: 'w'
      });

      // Đặt màu cho nốt nhạc nếu được chỉ định
      if (color !== '#000000') {
        staveNote.setStyle({ fillStyle: color, strokeStyle: color });
        
        // Đặt màu cho đầu nốt
        staveNote.setKeyStyle(0, { fillStyle: color, strokeStyle: color });
      }

      // Tạo voice và thêm nốt nhạc
      const voice = score.voice([staveNote]);

      // Vẽ stave và nốt nhạc
      vf.Formatter()
        .joinVoices([voice])
        .format([voice], 300);

      stave.draw();
      voice.draw(vf.getContext(), stave);

      // Điều chỉnh kích thước SVG
      const svg = staffRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = 'scale(1.1)';
        svg.style.transformOrigin = 'center center';
      }
    } catch (error) {
      console.error("Error drawing note:", error);
      console.log("Note notation:", noteNotation);
      console.log("Current exercise:", currentExercise);
      
      // Hiển thị thông báo lỗi trên UI
      if (staffRef.current) {
        staffRef.current.innerHTML = `
          <div style="text-align: center; color: red; padding: 20px;">
            <p>Error displaying music notation.</p>
            <p>Please try another exercise or refresh the page.</p>
          </div>
        `;
      }
    }
  };

  useEffect(() => {
    if (currentNote) {
      drawNote(currentNote.notation);
    }
  }, [currentNote, currentExercise]);

  const handleAnswer = (answer) => {
    if (!currentNote) return;
    
    const isCorrect = answer === currentNote.key;
    
    recordAttempt(isCorrect);
    
    if (isCorrect) {
      setCorrectAnswer(answer);
      
      // Đổi màu nốt nhạc thành màu xanh lá giống với màu nút khi đúng
      drawNote(currentNote.notation, '#4caf50');
      
      // Play the correct note
      playNote(currentNote.notation);
      
      setTimeout(() => {
        setCorrectAnswer(null);
        setIncorrectAnswers(new Set());
        nextQuestion();
        // Tạo câu hỏi mới
        generateRandomNote();
      }, 1500); // Tăng thời gian hiển thị để người dùng có thể nhìn thấy rõ hơn
    } else {
      setIncorrectAnswers(prev => new Set([...prev, answer]));
    }
  };

  // Thêm CSS transition cho phần tử SVG
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #staff svg .vf-notehead path,
      #staff svg .vf-stem path {
        transition: fill 0.3s ease, stroke 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle errors
  if (contextError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, ml: 13 }}>
        <Typography color="error" variant="h6">
          Error: {contextError}
        </Typography>
      </Container>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <LoadingContainer sx={{ ml: 13 }}>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  // Handle missing data
  if (!currentExercise || !currentNote) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  // Get available notes for the current exercise to display as answer options
  const availableNotes = currentExercise.notes.reduce((acc, note) => {
    // Only add unique keys
    if (!acc.some(n => n.key === note.key)) {
      acc.push({ key: note.key });
    }
    return acc;
  }, []);

  // Render the main component
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ml: 13,
        mt: 5,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '16px',
          mr: 20,
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: '#1a1a1a' 
          }}
        >
          Note Identification
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ExerciseSelector>
            <InputLabel id="exercise-select-label">Select Exercise</InputLabel>
            <Select
              labelId="exercise-select-label"
              id="exercise-select"
              value={currentExercise.id}
              label="Select Exercise"
              onChange={handleExerciseChange}
            >
              {exercises.map((exercise) => (
                <MenuItem key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </MenuItem>
              ))}
            </Select>
          </ExerciseSelector>
        </Box>
        
        <Typography 
          variant="body1" 
          align="center" 
          gutterBottom
          sx={{ 
            color: '#555',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}
        >
          Identify the note shown on the staff below
        </Typography>
        
        <StatDisplay>
          Correct: {practiceStats.correctAnswers} | Wrong: {practiceStats.wrongAnswers}
        </StatDisplay>

        <StaffContainer>
          <div id="staff" ref={staffRef} />
        </StaffContainer>

        {currentExercise && currentExercise.id === 4 ? (
          // Advanced Note Identification - hiển thị theo nhóm có tổ chức
          <ButtonContainer>
            {/* Nhóm 1: Các nốt bass clef (C3-A3) */}
            <ButtonRow>
              {availableNotes.filter(note => ['C3', 'D3', 'E3', 'F3', 'G3', 'A3'].includes(note.key)).map((note) => (
                <ResponsiveButton
                  key={note.key}
                  onClick={() => handleAnswer(note.key)}
                  correct={note.key === correctAnswer}
                  incorrect={incorrectAnswers.has(note.key)}
                >
                  {note.key}
                </ResponsiveButton>
              ))}
            </ButtonRow>
            
            {/* Nhóm 2: Các nốt chuyển tiếp (B3-C4) */}
            <ButtonRow>
              {availableNotes.filter(note => ['B3', 'C4'].includes(note.key)).map((note) => (
                <ResponsiveButton
                  key={note.key}
                  onClick={() => handleAnswer(note.key)}
                  correct={note.key === correctAnswer}
                  incorrect={incorrectAnswers.has(note.key)}
                >
                  {note.key}
                </ResponsiveButton>
              ))}
            </ButtonRow>
            
            {/* Nhóm 3: Các nốt treble clef (D4-B4) */}
            <ButtonRow>
              {availableNotes.filter(note => ['D4', 'E4', 'F4', 'G4', 'A4', 'B4'].includes(note.key)).map((note) => (
                <ResponsiveButton
                  key={note.key}
                  onClick={() => handleAnswer(note.key)}
                  correct={note.key === correctAnswer}
                  incorrect={incorrectAnswers.has(note.key)}
                >
                  {note.key}
                </ResponsiveButton>
              ))}
            </ButtonRow>
            
            {/* Nhóm 4: Nốt cao nhất (C5) */}
            <ButtonRow>
              {availableNotes.filter(note => ['C5'].includes(note.key)).map((note) => (
                <ResponsiveButton
                  key={note.key}
                  onClick={() => handleAnswer(note.key)}
                  correct={note.key === correctAnswer}
                  incorrect={incorrectAnswers.has(note.key)}
                >
                  {note.key}
                </ResponsiveButton>
              ))}
            </ButtonRow>
          </ButtonContainer>
        ) : (
          // Các bài tập khác - hiển thị 1 dòng với responsive
          <ButtonContainer>
            {availableNotes.map((note) => (
              <ResponsiveButton
                key={note.key}
                onClick={() => handleAnswer(note.key)}
                correct={note.key === correctAnswer}
                incorrect={incorrectAnswers.has(note.key)}
              >
                {note.key}
              </ResponsiveButton>
            ))}
          </ButtonContainer>
        )}
      </Paper>
    </Container>
  );
};

export default NoteIdentification; 