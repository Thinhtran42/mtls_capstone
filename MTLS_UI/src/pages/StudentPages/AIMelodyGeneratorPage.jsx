/* eslint-disable no-unused-vars */
// src/pages/StudentPages/AIMelodyGeneratorPage.jsx
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
} from '@mui/material'
import * as Tone from 'tone'
import VexFlowComponent from '../../vexflow/VexFlowComponent'

// Hàm chuyển đổi từ MIDI pitch sang tên nốt
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
  return noteNames[noteIndex] + octave
}

// Hàm chuyển đổi từ tên nốt sang MIDI pitch
const nameToMidi = (name) => {
  const noteNames = {
    C: 0,
    'C#': 1,
    D: 2,
    'D#': 3,
    E: 4,
    F: 5,
    'F#': 6,
    G: 7,
    'G#': 8,
    A: 9,
    'A#': 10,
    B: 11,
  }
  const match = name.match(/^([A-G][#]?)(\d+)$/)
  if (!match) return 60 // C4 mặc định

  const noteName = match[1]
  const octave = parseInt(match[2])
  return noteNames[noteName] + (octave + 1) * 12
}

const AIMelodyGeneratorPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState(null)
  const [player, setPlayer] = useState(null)
  const [melody, setMelody] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Các tùy chọn
  const [temperature, setTemperature] = useState(1.0)
  const [melodyLength, setMelodyLength] = useState(4)
  const [scale, setScale] = useState('major')

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

        // Khởi tạo model với đường dẫn chính xác
        const musicVAE = new window.mm.MusicVAE(
          // Sử dụng đường dẫn đầy đủ và chính xác đến checkpoint
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2'
        )

        console.log('Loading model...')
        await musicVAE.initialize()
        console.log('Model loaded successfully!')
        setModel(musicVAE)

        // Khởi tạo player với các tùy chọn đúng
        const newPlayer = new window.mm.Player(false, {
          run: (note) => {
            console.log('Playing note:', note)
          },
          stop: () => {
            console.log('Stopped playing')
            setIsPlaying(false)
          },
        })

        setPlayer(newPlayer)
      } catch (err) {
        console.error('Error initializing Magenta:', err)
      }
    }

    // Đợi lâu hơn để đảm bảo script đã được tải hoàn toàn
    const timer = setTimeout(() => {
      initializeMagenta()
    }, 2000)

    // Cleanup khi component unmount
    return () => {
      clearTimeout(timer)
      if (player) {
        player.stop()
      }
    }
  }, [])

  // Hàm tạo giai điệu
  const generateMelody = async () => {
    if (!model) {
      console.error('Model not loaded')
      return
    }

    setIsLoading(true)

    try {
      console.log('Generating melody with temperature:', temperature)

      // Sử dụng sample() thay vì continueSequence()
      const samples = await model.sample(1, temperature)
      console.log('Generated melody:', samples)

      if (!samples || samples.length === 0) {
        throw new Error('Cannot generate melody')
      }

      let generatedMelody = samples[0]

      // Áp dụng thang âm nếu cần
      if (scale !== 'chromatic') {
        generatedMelody = applyScale(generatedMelody, scale)
      }

      setMelody(generatedMelody)
    } catch (err) {
      console.error('Error generating melody:', err)
      alert('Cannot generate melody. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm áp dụng thang âm
  const applyScale = (noteSequence, scaleName) => {
    // Định nghĩa các thang âm
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 2, 4, 7, 9],
    }

    const selectedScale = scales[scaleName] || scales.major

    // Tạo bản sao của noteSequence
    const newSequence = window.mm.sequences.clone(noteSequence)

    // Áp dụng thang âm cho từng nốt
    newSequence.notes.forEach((note) => {
      // Tính toán vị trí trong thang âm
      const octave = Math.floor(note.pitch / 12)
      const pitchClass = note.pitch % 12

      // Tìm nốt gần nhất trong thang âm
      let closestScalePitch = selectedScale[0]
      let minDistance = 12

      for (const scalePitch of selectedScale) {
        const distance = Math.min(
          Math.abs(pitchClass - scalePitch),
          Math.abs(pitchClass - (scalePitch + 12))
        )

        if (distance < minDistance) {
          minDistance = distance
          closestScalePitch = scalePitch
        }
      }

      // Cập nhật pitch
      note.pitch = octave * 12 + closestScalePitch
    })

    return newSequence
  }

  // Hàm phát/dừng giai điệu
  const togglePlayback = () => {
    if (!melody || !player) return

    if (isPlaying) {
      player.stop()
      setIsPlaying(false)
    } else {
      player.start(melody)
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
      // Sử dụng hàm pitchToName tự định nghĩa thay vì window.mm.NoteSequence.pitchToName
      const pitch = pitchToName(note.pitch)
      // Đơn giản hóa duration thành q (quarter note)
      vexflowNotes += `${pitch}/q, `
    })

    return vexflowNotes.slice(0, -2) // Loại bỏ dấu phẩy cuối cùng
  }

  // Hàm lưu giai điệu
  const saveMelody = () => {
    if (!melody) return

    // Lấy danh sách giai điệu đã lưu từ localStorage
    const savedMelodies = JSON.parse(
      localStorage.getItem('savedMelodies') || '[]'
    )

    // Thêm giai điệu mới
    savedMelodies.push({
      id: Date.now(),
      melody: melody,
      date: new Date().toISOString(),
      name: `Melody ${savedMelodies.length + 1}`,
    })

    // Lưu lại vào localStorage
    localStorage.setItem('savedMelodies', JSON.stringify(savedMelodies))

    alert('Melody saved!')
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
        AI Melody Generator
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
            <Typography gutterBottom>
              Randomness: {temperature.toFixed(1)}
            </Typography>
            <Slider
              value={temperature}
              onChange={(e, newValue) => setTemperature(newValue)}
              min={0.1}
              max={2.0}
              step={0.1}
              valueLabelDisplay='auto'
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <FormControl fullWidth>
              <InputLabel>Scale</InputLabel>
              <Select
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                <MenuItem value='chromatic'>
                  Chromatic (No scale applied)
                </MenuItem>
                <MenuItem value='major'>Major (Major)</MenuItem>
                <MenuItem value='minor'>Minor (Minor)</MenuItem>
                <MenuItem value='pentatonic'>Pentatonic (Pentatonic)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='contained'
                color='primary'
                onClick={generateMelody}
                disabled={isLoading || !model}
                fullWidth
              >
                {isLoading ? <CircularProgress size={24} /> : 'Generate Melody'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {melody && (
        <Paper
          elevation={3}
          sx={{ p: 3 }}
        >
          <Typography
            variant='h6'
            gutterBottom
          >
            Generated Melody
          </Typography>

          <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
            <VexFlowComponent
              notes={convertToVexFlowFormat(melody)}
              width={600}
              height={150}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant='contained'
              onClick={togglePlayback}
              disabled={!player}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <Button
              variant='outlined'
              onClick={saveMelody}
              disabled={!melody}
            >
              Save Melody
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

export default AIMelodyGeneratorPage
