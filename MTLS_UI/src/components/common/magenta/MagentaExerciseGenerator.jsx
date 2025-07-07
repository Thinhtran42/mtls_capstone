// src/components/common/MagentaExerciseGenerator.jsx
import { useState, useEffect } from 'react'
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'
import * as mm from '@magenta/music'
import * as Tone from 'tone'
import VexFlowComponent from '../../vexflow/VexFlowComponent'

const MagentaExerciseGenerator = ({
  onExerciseGenerated,
  difficulty = 'medium',
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState(null)
  const [error, setError] = useState(null)
  const [generatedMelody, setGeneratedMelody] = useState(null)
  const [player, setPlayer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Khởi tạo model và player
  useEffect(() => {
    const initializeMagenta = async () => {
      try {
        // Khởi tạo model
        const musicVAE = new mm.MusicVAE(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2'
        )
        await musicVAE.initialize()
        setModel(musicVAE)

        // Khởi tạo player
        const newPlayer = new mm.Player()
        setPlayer(newPlayer)

        // Lắng nghe sự kiện kết thúc
        newPlayer.addListener('stop', () => {
          setIsPlaying(false)
        })
      } catch (err) {
        console.error('Error initializing Magenta:', err)
        setError('Không thể khởi tạo Magenta. Vui lòng thử lại sau.')
      }
    }

    initializeMagenta()

    // Cleanup khi component unmount
    return () => {
      if (player) {
        player.stop()
      }
    }
  }, [])

  // Hàm tạo bài tập mới
  const generateExercise = async () => {
    if (!model) return

    setIsLoading(true)
    setError(null)

    try {
      // Điều chỉnh temperature dựa trên độ khó
      let temperature = 0.8
      switch (difficulty) {
        case 'easy':
          temperature = 0.5
          break
        case 'medium':
          temperature = 0.8
          break
        case 'hard':
          temperature = 1.2
          break
        default:
          temperature = 0.8
      }

      // Tạo giai điệu
      const samples = await model.sample(1, temperature)
      const melody = samples[0]

      // Lưu giai điệu đã tạo
      setGeneratedMelody(melody)

      // Tạo câu hỏi từ giai điệu
      const exercise = createExerciseFromMelody(melody, difficulty)

      // Gửi bài tập về component cha
      if (onExerciseGenerated) {
        onExerciseGenerated(exercise)
      }
    } catch (err) {
      console.error('Error generating exercise:', err)
      setError('Có lỗi khi tạo bài tập. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm tạo bài tập từ giai điệu
  const createExerciseFromMelody = (melody, difficulty) => {
    // Trích xuất các nốt từ giai điệu
    const notes = melody.notes.map((note) => {
      return {
        pitch: mm.NoteSequence.pitchToName(note.pitch),
        startTime: note.startTime,
        endTime: note.endTime,
        duration: note.endTime - note.startTime,
      }
    })

    // Tạo câu hỏi dựa trên độ khó
    let questions = []

    if (difficulty === 'easy') {
      // Câu hỏi nhận diện nốt đơn giản
      questions = notes.slice(0, 3).map((note, index) => ({
        id: index + 1,
        question: `Nốt nhạc này là gì?`,
        notation: `${note.pitch}/w`,
        options: shuffleArray(['C', 'D', 'E', 'F', 'G', 'A', 'B']).slice(0, 4),
        correctAnswer: note.pitch.charAt(0),
      }))
    } else if (difficulty === 'medium') {
      // Câu hỏi về giai điệu
      const vexflowNotation = convertToVexFlowFormat(melody)
      questions = [
        {
          id: 1,
          question: 'Giai điệu này có bao nhiêu nốt?',
          notation: vexflowNotation,
          options: [
            String(notes.length - 2),
            String(notes.length),
            String(notes.length + 2),
            String(notes.length + 4),
          ],
          correctAnswer: String(notes.length),
        },
        {
          id: 2,
          question: 'Nốt cao nhất trong giai điệu này là gì?',
          notation: vexflowNotation,
          options: shuffleArray(['C', 'D', 'E', 'F', 'G', 'A', 'B']).slice(
            0,
            4
          ),
          correctAnswer: findHighestNote(notes).charAt(0),
        },
      ]
    } else {
      // Câu hỏi khó về cấu trúc giai điệu
      const vexflowNotation = convertToVexFlowFormat(melody)
      questions = [
        {
          id: 1,
          question: 'Giai điệu này có xu hướng gì?',
          notation: vexflowNotation,
          options: ['Đi lên', 'Đi xuống', 'Lên xuống đan xen', 'Giữ nguyên'],
          correctAnswer: determineMelodyDirection(notes),
        },
        {
          id: 2,
          question: 'Khoảng cách lớn nhất giữa hai nốt liên tiếp là bao nhiêu?',
          notation: vexflowNotation,
          options: ['Quãng 2', 'Quãng 3', 'Quãng 4', 'Quãng 5 hoặc lớn hơn'],
          correctAnswer: determineLargestInterval(notes),
        },
      ]
    }

    return {
      title: `Bài tập tự động tạo - ${new Date().toLocaleString()}`,
      type: 'exercise',
      content: 'Bài tập được tạo tự động bởi AI.',
      questions: questions,
    }
  }

  // Hàm phát giai điệu
  const playMelody = () => {
    if (!generatedMelody || !player) return

    if (isPlaying) {
      player.stop()
      setIsPlaying(false)
    } else {
      player.start(generatedMelody)
      setIsPlaying(true)
    }
  }

  // Hàm chuyển đổi từ NoteSequence sang định dạng VexFlow
  const convertToVexFlowFormat = (noteSequence) => {
    if (
      !noteSequence ||
      !noteSequence.notes ||
      noteSequence.notes.length === 0
    ) {
      return 'C4/q, D4/q, E4/q, F4/q'
    }

    let vexflowNotes = ''
    noteSequence.notes.forEach((note) => {
      const pitch = mm.NoteSequence.pitchToName(note.pitch)
      // Đơn giản hóa duration thành q (quarter note)
      vexflowNotes += `${pitch}/q, `
    })

    return vexflowNotes.slice(0, -2) // Loại bỏ dấu phẩy cuối cùng
  }

  // Các hàm tiện ích
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const findHighestNote = (notes) => {
    if (!notes || notes.length === 0) return 'C'

    let highestPitch = notes[0].pitch
    notes.forEach((note) => {
      if (getPitchValue(note.pitch) > getPitchValue(highestPitch)) {
        highestPitch = note.pitch
      }
    })

    return highestPitch
  }

  const getPitchValue = (pitchName) => {
    const note = pitchName.charAt(0)
    const octave = parseInt(pitchName.charAt(pitchName.length - 1))
    const noteValues = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    return octave * 12 + noteValues[note]
  }

  const determineMelodyDirection = (notes) => {
    if (notes.length < 2) return 'Giữ nguyên'

    let upCount = 0
    let downCount = 0

    for (let i = 1; i < notes.length; i++) {
      const currentPitch = getPitchValue(notes[i].pitch)
      const prevPitch = getPitchValue(notes[i - 1].pitch)

      if (currentPitch > prevPitch) upCount++
      else if (currentPitch < prevPitch) downCount++
    }

    if (upCount > downCount * 2) return 'Đi lên'
    if (downCount > upCount * 2) return 'Đi xuống'
    if (upCount === 0 && downCount === 0) return 'Giữ nguyên'
    return 'Lên xuống đan xen'
  }

  const determineLargestInterval = (notes) => {
    if (notes.length < 2) return 'Quãng 2'

    let largestInterval = 0

    for (let i = 1; i < notes.length; i++) {
      const currentPitch = getPitchValue(notes[i].pitch)
      const prevPitch = getPitchValue(notes[i - 1].pitch)
      const interval = Math.abs(currentPitch - prevPitch)

      if (interval > largestInterval) {
        largestInterval = interval
      }
    }

    if (largestInterval <= 2) return 'Quãng 2'
    if (largestInterval <= 4) return 'Quãng 3'
    if (largestInterval <= 5) return 'Quãng 4'
    return 'Quãng 5 hoặc lớn hơn'
  }

  return (
    <Box sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Typography
        variant='h6'
        gutterBottom
      >
        Tạo bài tập tự động với AI
      </Typography>

      {error && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={generateExercise}
          disabled={isLoading || !model}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Tạo bài tập mới'}
        </Button>

        {generatedMelody && (
          <Button
            variant='outlined'
            onClick={playMelody}
            disabled={!player}
          >
            {isPlaying ? 'Dừng phát' : 'Nghe giai điệu'}
          </Button>
        )}
      </Box>

      {generatedMelody && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='subtitle1'
            gutterBottom
          >
            Giai điệu đã tạo:
          </Typography>
          <VexFlowComponent
            notes={convertToVexFlowFormat(generatedMelody)}
            width={600}
            height={120}
          />
        </Box>
      )}

      {!model && !error && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography
            variant='body2'
            color='text.secondary'
          >
            Đang tải Magenta...
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default MagentaExerciseGenerator
