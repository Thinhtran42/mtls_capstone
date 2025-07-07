// src/pages/StudentPages/AIQuizGeneratorPage.jsx
import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material'
import VexFlowComponent from '../../vexflow/VexFlowComponent'

const AIQuizGeneratorPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState(null)
  const [player, setPlayer] = useState(null)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [quizType, setQuizType] = useState('note-identification')
  const [difficulty, setDifficulty] = useState(1)
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Khởi tạo model và player
  useEffect(() => {
    const initializeMagenta = async () => {
      try {
        // Kiểm tra xem window.mm đã tồn tại chưa
        if (!window.mm) {
          console.error(
            'Magenta.js not loaded. Please check your script tag in index.html'
          )
          return
        }

        // Khởi tạo model
        const musicVAE = new window.mm.MusicVAE(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2'
        )
        await musicVAE.initialize()
        setModel(musicVAE)

        // Khởi tạo player với callbacks
        const newPlayer = new window.mm.Player(false, {
          run: () => {
            // Xử lý khi phát nốt
          },
          stop: () => {
            // Xử lý khi dừng phát
            console.log('Playback stopped')
          },
        })
        setPlayer(newPlayer)

        // Không cần dùng addListener nữa vì đã truyền callback vào constructor
      } catch (err) {
        console.error('Error initializing Magenta:', err)
      }
    }

    // Đợi một chút để đảm bảo script đã được tải
    const timer = setTimeout(() => {
      initializeMagenta()
    }, 1000)

    // Cleanup khi component unmount
    return () => {
      clearTimeout(timer)
      if (player) {
        player.stop()
      }
    }
  }, [])

  // Hàm tạo quiz
  const generateQuiz = async () => {
    if (!model) return

    setIsLoading(true)
    setUserAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)

    try {
      // Tạo các câu hỏi dựa trên loại quiz
      let questions = []

      switch (quizType) {
        case 'note-identification':
          questions = await generateNoteIdentificationQuestions()
          break
        case 'chord-identification':
          questions = await generateChordIdentificationQuestions()
          break
        case 'interval-identification':
          questions = await generateIntervalIdentificationQuestions()
          break
        default:
          questions = await generateNoteIdentificationQuestions()
      }

      // Giới hạn số lượng câu hỏi
      questions = questions.slice(0, numberOfQuestions)

      setGeneratedQuiz({
        title: `AI Generated ${formatQuizType(quizType)} Quiz`,
        questions: questions,
      })
    } catch (err) {
      console.error('Error generating quiz:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm tạo câu hỏi nhận diện nốt nhạc
  const generateNoteIdentificationQuestions = async () => {
    // Tạo giai điệu
    const samples = await model.sample(1, difficulty * 0.5)
    const melody = samples[0]

    // Tạo câu hỏi từ các nốt trong giai điệu
    const questions = []
    const usedNotes = new Set()

    console.log("Melody notes:", melody.notes);

    // Định nghĩa các nốt nhạc với vị trí khác nhau trên khuông nhạc
    const noteDefinitions = [
      { name: 'C', pitch: 60, notation: 'c/4/w' },  // C4
      { name: 'D', pitch: 62, notation: 'd/4/w' },  // D4
      { name: 'E', pitch: 64, notation: 'e/4/w' },  // E4
      { name: 'F', pitch: 65, notation: 'f/4/w' },  // F4
      { name: 'G', pitch: 67, notation: 'g/4/w' },  // G4
      { name: 'A', pitch: 69, notation: 'a/4/w' },  // A4
      { name: 'B', pitch: 71, notation: 'b/4/w' },  // B4
    ];

    // Sử dụng các nốt từ giai điệu
    melody.notes.forEach((note) => {
      const noteName = pitchToName(note.pitch)
      // Lấy chữ cái đầu tiên và chuyển thành chữ hoa
      const noteNameSimple = noteName.charAt(0).toUpperCase()

      // Tránh trùng lặp nốt
      if (!usedNotes.has(noteNameSimple)) {
        usedNotes.add(noteNameSimple)

        // Tìm định nghĩa nốt tương ứng
        const noteDefinition = noteDefinitions.find(n => n.name === noteNameSimple);
        const notation = noteDefinition ? noteDefinition.notation : `${noteName}/w`;
        
        console.log(`Adding note question: ${noteNameSimple}, notation: ${notation}`);

        questions.push({
          type: 'note-identification',
          question: 'What note is this?',
          notation: notation,
          options: shuffleArray(['C', 'D', 'E', 'F', 'G', 'A', 'B']),
          correctAnswer: noteNameSimple,
        })
      }
    })

    // Nếu không đủ câu hỏi, tạo thêm từ các nốt định nghĩa sẵn
    while (questions.length < numberOfQuestions) {
      // Chọn ngẫu nhiên một nốt từ các nốt định nghĩa
      const availableNotes = noteDefinitions.filter(n => !usedNotes.has(n.name));
      
      if (availableNotes.length === 0) break; // Nếu đã dùng hết các nốt
      
      const randomIndex = Math.floor(Math.random() * availableNotes.length);
      const selectedNote = availableNotes[randomIndex];
      
      usedNotes.add(selectedNote.name);
      
      console.log(`Adding predefined note question: ${selectedNote.name}, notation: ${selectedNote.notation}`);

      questions.push({
        type: 'note-identification',
        question: 'What note is this?',
        notation: selectedNote.notation,
        options: shuffleArray(['C', 'D', 'E', 'F', 'G', 'A', 'B']),
        correctAnswer: selectedNote.name,
      })
    }

    // Nếu vẫn chưa đủ, tạo thêm nốt ngẫu nhiên
    while (questions.length < numberOfQuestions) {
      // Tạo ngẫu nhiên các nốt từ C4 đến B4
      const randomPitch = Math.floor(Math.random() * 12) + 60 // C4 to B4
      const noteName = pitchToName(randomPitch)
      // Lấy chữ cái đầu tiên và chuyển thành chữ hoa
      const noteNameSimple = noteName.charAt(0).toUpperCase()

      if (!usedNotes.has(noteNameSimple)) {
        usedNotes.add(noteNameSimple)

        const notation = `${noteName}/w`;
        console.log(`Adding random note question: ${noteNameSimple}, notation: ${notation}`);

        questions.push({
          type: 'note-identification',
          question: 'What note is this?',
          notation: notation,
          options: shuffleArray(['C', 'D', 'E', 'F', 'G', 'A', 'B']),
          correctAnswer: noteNameSimple,
        })
      }
    }

    console.log("Generated note questions:", questions);
    return questions
  }

  // Hàm tạo câu hỏi nhận diện hợp âm
  const generateChordIdentificationQuestions = async () => {
    // Định nghĩa các hợp âm
    const chords = [
      { name: 'C Major', notation: '(c/4,e/4,g/4)/w', type: 'Major' },
      { name: 'D Minor', notation: '(d/4,f/4,a/4)/w', type: 'Minor' },
      { name: 'E Minor', notation: '(e/4,g/4,b/4)/w', type: 'Minor' },
      { name: 'F Major', notation: '(f/4,a/4,c/5)/w', type: 'Major' },
      { name: 'G Major', notation: '(g/4,b/4,d/5)/w', type: 'Major' },
      { name: 'A Minor', notation: '(a/4,c/5,e/5)/w', type: 'Minor' },
      { name: 'B Diminished', notation: '(b/4,d/5,f/5)/w', type: 'Diminished' },
    ]

    // Tạo câu hỏi từ các hợp âm
    const questions = []
    const usedChords = new Set()

    console.log("Generating chord questions");

    // Chọn ngẫu nhiên các hợp âm
    while (
      questions.length < numberOfQuestions &&
      questions.length < chords.length
    ) {
      const randomIndex = Math.floor(Math.random() * chords.length)
      const chord = chords[randomIndex]

      if (!usedChords.has(chord.name)) {
        usedChords.add(chord.name)

        console.log(`Adding chord question: ${chord.name}, notation: ${chord.notation}`);

        // Tạo câu hỏi dựa vào độ khó
        if (difficulty === 1) {
          // Dễ: Hỏi loại hợp âm (Major/Minor)
          questions.push({
            type: 'chord-identification',
            question: 'What is this chord?',
            notation: chord.notation,
            options: ['Major', 'Minor', 'Diminished', 'Augmented'],
            correctAnswer: chord.type,
          })
        } else {
          // Khó: Hỏi tên hợp âm cụ thể
          questions.push({
            type: 'chord-identification',
            question: 'What is this chord?',
            notation: chord.notation,
            options: shuffleArray([
              'C Major',
              'D Minor',
              'E Minor',
              'F Major',
              'G Major',
              'A Minor',
              'B Diminished',
            ]),
            correctAnswer: chord.name,
          })
        }
      }
    }

    console.log("Generated chord questions:", questions);
    return questions
  }

  // Hàm tạo câu hỏi nhận diện quãng
  const generateIntervalIdentificationQuestions = async () => {
    // Định nghĩa các quãng
    const intervals = [
      { name: 'Unison', semitones: 0, notation: '(c/4,c/4)/w' },
      { name: 'Minor 2nd', semitones: 1, notation: '(c/4,c#/4)/w' },
      { name: 'Major 2nd', semitones: 2, notation: '(c/4,d/4)/w' },
      { name: 'Minor 3rd', semitones: 3, notation: '(c/4,d#/4)/w' },
      { name: 'Major 3rd', semitones: 4, notation: '(c/4,e/4)/w' },
      { name: 'Perfect 4th', semitones: 5, notation: '(c/4,f/4)/w' },
      { name: 'Tritone', semitones: 6, notation: '(c/4,f#/4)/w' },
      { name: 'Perfect 5th', semitones: 7, notation: '(c/4,g/4)/w' },
      { name: 'Minor 6th', semitones: 8, notation: '(c/4,g#/4)/w' },
      { name: 'Major 6th', semitones: 9, notation: '(c/4,a/4)/w' },
      { name: 'Minor 7th', semitones: 10, notation: '(c/4,a#/4)/w' },
      { name: 'Major 7th', semitones: 11, notation: '(c/4,b/4)/w' },
      { name: 'Octave', semitones: 12, notation: '(c/4,c/5)/w' },
    ]

    // Tạo câu hỏi từ các quãng
    const questions = []
    const usedIntervals = new Set()

    console.log("Generating interval questions");

    // Chọn ngẫu nhiên các quãng
    while (
      questions.length < numberOfQuestions &&
      questions.length < intervals.length
    ) {
      const randomIndex = Math.floor(Math.random() * intervals.length)
      const interval = intervals[randomIndex]

      if (!usedIntervals.has(interval.name)) {
        usedIntervals.add(interval.name)

        console.log(`Adding interval question: ${interval.name}, notation: ${interval.notation}`);

        questions.push({
          type: 'interval-identification',
          question: 'What interval is this?',
          notation: interval.notation,
          options: shuffleArray([
            'Unison',
            'Minor 2nd',
            'Major 2nd',
            'Minor 3rd',
            'Major 3rd',
            'Perfect 4th',
            'Tritone',
            'Perfect 5th',
            'Minor 6th',
            'Major 6th',
            'Minor 7th',
            'Major 7th',
            'Octave',
          ]),
          correctAnswer: interval.name,
        })
      }
    }

    console.log("Generated interval questions:", questions);
    return questions
  }

  // Hàm xử lý khi chọn đáp án
  const handleAnswerSelect = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer,
    })
  }

  // Hàm xử lý khi chuyển câu hỏi
  const handleNextQuestion = () => {
    if (currentQuestion < generatedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Tính điểm
      let correctCount = 0
      generatedQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
          correctCount++
        }
      })

      setScore(correctCount)
      setShowResults(true)
    }
  }

  // Hàm xử lý khi làm lại quiz
  const handleRetakeQuiz = () => {
    setUserAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
  }

  // Hàm lưu quiz
  const handleSaveQuiz = () => {
    if (!generatedQuiz) return

    // Lấy danh sách quiz đã lưu từ localStorage
    const savedQuizzes = JSON.parse(
      localStorage.getItem('savedQuizzes') || '[]'
    )

    // Thêm quiz mới
    savedQuizzes.push({
      id: Date.now(),
      title: generatedQuiz.title,
      questions: generatedQuiz.questions,
      date: new Date().toISOString(),
    })

    // Lưu lại vào localStorage
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes))

    alert('Quiz saved!')
  }

  // Hàm phát âm thanh của nốt/hợp âm
  const playNotation = (notation) => {
    if (!player || !window.mm) return

    // Tạo sequence từ notation
    const sequence = {
      notes: [],
      totalQuantizedSteps: 4,
      quantizationInfo: { stepsPerQuarter: 1 },
    }

    console.log("Playing notation:", notation);

    // Phân tích notation
    try {
      if (notation.includes('(')) {
        // Hợp âm - định dạng (c/4,e/4,g/4)/w
        const chordMatch = notation.match(/\((.*?)\)\/(\w+)/)
        if (chordMatch) {
          const notes = chordMatch[1].split(',')
          notes.forEach((note) => {
            // Chuyển đổi từ định dạng c/4 sang c4 để dùng với nameToMidi
            const formattedNote = note.trim().replace('/', '');
            const pitch = nameToMidi(formattedNote)

            sequence.notes.push({
              pitch: pitch,
              quantizedStartStep: 0,
              quantizedEndStep: 4,
              program: 0,
            })
          })
        }
      } else {
        // Nốt đơn - định dạng c/4/w
        const parts = notation.split('/');
        if (parts.length >= 2) {
          // Chuyển đổi từ định dạng c/4 sang c4 để dùng với nameToMidi
          const formattedNote = parts[0] + parts[1]; // c4
          const pitch = nameToMidi(formattedNote)

          sequence.notes.push({
            pitch: pitch,
            quantizedStartStep: 0,
            quantizedEndStep: 4,
            program: 0,
          })
        }
      }

      // Phát sequence
      if (sequence.notes.length > 0) {
        player.start(sequence)
      } else {
        console.warn("No notes to play for notation:", notation);
      }
    } catch (error) {
      console.error("Error playing notation:", error, notation);
    }
  }

  // Các hàm tiện ích
  const formatQuizType = (type) => {
    switch (type) {
      case 'note-identification':
        return 'Note Identification'
      case 'chord-identification':
        return 'Chord Identification'
      case 'interval-identification':
        return 'Interval Identification'
      default:
        return type
    }
  }

  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Thêm hàm chuyển đổi từ MIDI pitch sang tên nốt nhạc
  const pitchToName = (pitch) => {
    const noteNames = [
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
    const octave = Math.floor(pitch / 12) - 1
    const noteIndex = pitch % 12
    // Trả về định dạng phù hợp cho VexFlow (chữ thường/số)
    return noteNames[noteIndex].toLowerCase() + '/' + octave
  }

  // Thêm hàm chuyển đổi từ tên nốt nhạc sang MIDI pitch
  const nameToMidi = (name) => {
    const noteNames = {
      c: 0,
      'c#': 1,
      d: 2,
      'd#': 3,
      e: 4,
      f: 5,
      'f#': 6,
      g: 7,
      'g#': 8,
      a: 9,
      'a#': 10,
      b: 11,
    }
    
    // Chuyển đổi tên nốt thành chữ thường để khớp với noteNames
    const match = name.toLowerCase().match(/([a-g]#?)(\d+)/)
    if (!match) {
      console.warn("Invalid note name:", name);
      return 60 // Mặc định là C4
    }

    const noteName = match[1]
    const octave = parseInt(match[2])
    
    if (!(noteName in noteNames)) {
      console.warn("Unknown note name:", noteName);
      return 60 // Mặc định là C4
    }
    
    return noteNames[noteName] + (octave + 1) * 12
  }

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
      >
        AI Music Quiz Generator
      </Typography>

      <Paper
        elevation={3}
        sx={{ p: 3, mb: 4 }}
      >
        <Typography
          variant='h6'
          gutterBottom
        >
          Customize
        </Typography>

        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            md={4}
          >
            <FormControl fullWidth>
              <InputLabel>Quiz type</InputLabel>
              <Select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value)}
              >
                <MenuItem value='note-identification'>
                  Note Identification
                </MenuItem>
                <MenuItem value='chord-identification'>
                  Chord Identification
                </MenuItem>
                <MenuItem value='interval-identification'>
                  Interval Identification
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography gutterBottom>Difficulty: {difficulty}</Typography>
            <Slider
              value={difficulty}
              onChange={(e, newValue) => setDifficulty(newValue)}
              min={1}
              max={3}
              step={1}
              marks
              valueLabelDisplay='auto'
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography gutterBottom>
              Number of questions: {numberOfQuestions}
            </Typography>
            <Slider
              value={numberOfQuestions}
              onChange={(e, newValue) => setNumberOfQuestions(newValue)}
              min={3}
              max={10}
              step={1}
              marks
              valueLabelDisplay='auto'
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            <Button
              variant='contained'
              color='primary'
              onClick={generateQuiz}
              disabled={isLoading || !model}
              fullWidth
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generate quiz'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {generatedQuiz && !showResults && (
        <Paper
          elevation={3}
          sx={{ p: 3 }}
        >
          <Typography
            variant='h6'
            gutterBottom
          >
            {generatedQuiz.title} - Question {currentQuestion + 1}/{generatedQuiz.questions.length}
          </Typography>

          <Box sx={{ my: 3 }}>
            <Typography
              variant='body1'
              gutterBottom
            >
              {generatedQuiz.questions[currentQuestion].question}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                my: 3,
              }}
            >
              <VexFlowComponent
                notes={generatedQuiz.questions[currentQuestion].notation}
                width={500}
                height={250}
              />

              <Button
                variant='outlined'
                onClick={() =>
                  playNotation(
                    generatedQuiz.questions[currentQuestion].notation
                  )
                }
                sx={{ ml: 2 }}
              >
                Listen
              </Button>
            </Box>

            <FormControl
              component='fieldset'
              sx={{ width: '100%' }}
            >
              <RadioGroup
                value={userAnswers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
              >
                {generatedQuiz.questions[currentQuestion].options.map(
                  (option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  )
                )}
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant='outlined'
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
            >
              Previous question
            </Button>

            <Button
              variant='contained'
              color='primary'
              onClick={handleNextQuestion}
              disabled={userAnswers[currentQuestion] === undefined}
            >
              {currentQuestion < generatedQuiz.questions.length - 1
                ? 'Next question'
                : 'Finish'}
            </Button>
          </Box>
        </Paper>
      )}

      {generatedQuiz && showResults && (
        <Paper
          elevation={3}
          sx={{ p: 3 }}
        >
          <Typography
            variant='h6'
            gutterBottom
          >
            Results
          </Typography>

          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant='h4'>
              {score}/{generatedQuiz.questions.length}
            </Typography>
            <Typography variant='body1'>
              ({Math.round((score / generatedQuiz.questions.length) * 100)}%)
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant='subtitle1'
            gutterBottom
          >
            Details:
          </Typography>

          {generatedQuiz.questions.map((question, index) => (
            <Box
              key={index}
              sx={{ mb: 2 }}
            >
              <Typography variant='body1'>
                Question {index + 1}: {question.question}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <VexFlowComponent
                  notes={question.notation}
                  width={400}
                  height={200}
                />

                <Box sx={{ ml: 2 }}>
                  <Typography variant='body2'>
                    Your answer: {userAnswers[index] || 'No answer'}
                  </Typography>
                  <Typography variant='body2'>
                    Correct answer: {question.correctAnswer}
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity={
                  userAnswers[index] === question.correctAnswer
                    ? 'success'
                    : 'error'
                }
                sx={{ mt: 1 }}
              >
                {userAnswers[index] === question.correctAnswer
                  ? 'Correct!'
                  : 'Incorrect'}
              </Alert>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant='outlined'
              onClick={handleRetakeQuiz}
            >
              Retake quiz
            </Button>

            <Button
              variant='contained'
              color='primary'
              onClick={handleSaveQuiz}
            >
              Save quiz
            </Button>
          </Box>
        </Paper>
      )}

      {!model && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading Magenta...</Typography>
        </Box>
      )}
    </Container>
  )
}

export default AIQuizGeneratorPage
