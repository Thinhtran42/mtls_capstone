// src/pages/StudentPages/AIRhythmGeneratorPage.jsx
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

const AIRhythmGeneratorPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState(null)
  const [player, setPlayer] = useState(null)
  const [rhythm, setRhythm] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Các tùy chọn
  const [temperature, setTemperature] = useState(1.0)
  const [timeSignature, setTimeSignature] = useState('4/4')

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
        const drumsRNN = new window.mm.MusicRNN(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn'
        )
        await drumsRNN.initialize()
        setModel(drumsRNN)

        // Khởi tạo player
        const newPlayer = new window.mm.Player()
        setPlayer(newPlayer)

        // Lắng nghe sự kiện kết thúc
        newPlayer.addListener('stop', () => {
          setIsPlaying(false)
        })
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

  // Hàm tạo nhịp điệu
  const generateRhythm = async () => {
    if (!model) return

    setIsLoading(true)

    try {
      // Tạo sequence ban đầu
      const seed = createEmptyDrumSequence()

      // Tạo nhịp điệu
      const generatedRhythm = await model.continueSequence(
        seed,
        16,
        temperature
      )

      setRhythm(generatedRhythm)
    } catch (err) {
      console.error('Error generating rhythm:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm tạo sequence rỗng
  const createEmptyDrumSequence = () => {
    const sequence = {
      totalQuantizedSteps: 4,
      quantizationInfo: { stepsPerQuarter: 4 },
      notes: [],
    }

    // Thêm một nốt kick drum để khởi tạo
    sequence.notes.push({
      pitch: 36, // Kick drum
      quantizedStartStep: 0,
      quantizedEndStep: 1,
      isDrum: true,
    })

    return sequence
  }

  // Hàm phát/dừng nhịp điệu
  const togglePlayback = () => {
    if (!rhythm || !player) return

    if (isPlaying) {
      player.stop()
      setIsPlaying(false)
    } else {
      player.start(rhythm)
      setIsPlaying(true)
    }
  }

  // Hàm hiển thị nhịp điệu
  const renderRhythmVisualization = () => {
    if (!rhythm || !rhythm.notes) return null

    // Nhóm các nốt theo thời gian
    const timeSteps = {}
    rhythm.notes.forEach((note) => {
      const step = note.quantizedStartStep
      if (!timeSteps[step]) {
        timeSteps[step] = []
      }
      timeSteps[step].push(note.pitch)
    })

    // Tạo mảng các bước thời gian
    const steps = Array.from({ length: 16 }, (_, i) => i)

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {steps.map((step) => (
            <Typography
              key={step}
              variant='caption'
              sx={{ width: 20, textAlign: 'center' }}
            >
              {step + 1}
            </Typography>
          ))}
        </Box>

        {/* Kick drum (36) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant='caption'
            sx={{ width: 50 }}
          >
            Kick
          </Typography>
          {steps.map((step) => (
            <Box
              key={step}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor:
                  timeSteps[step] && timeSteps[step].includes(36)
                    ? '#f44336'
                    : '#e0e0e0',
              }}
            />
          ))}
        </Box>

        {/* Snare drum (38) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant='caption'
            sx={{ width: 50 }}
          >
            Snare
          </Typography>
          {steps.map((step) => (
            <Box
              key={step}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor:
                  timeSteps[step] && timeSteps[step].includes(38)
                    ? '#2196f3'
                    : '#e0e0e0',
              }}
            />
          ))}
        </Box>

        {/* Hi-hat (42) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant='caption'
            sx={{ width: 50 }}
          >
            Hi-hat
          </Typography>
          {steps.map((step) => (
            <Box
              key={step}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor:
                  timeSteps[step] && timeSteps[step].includes(42)
                    ? '#4caf50'
                    : '#e0e0e0',
              }}
            />
          ))}
        </Box>
      </Box>
    )
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
        AI Rhythm Pattern Generator
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
              <InputLabel>Time signature</InputLabel>
              <Select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
              >
                <MenuItem value='4/4'>4/4</MenuItem>
                <MenuItem value='3/4'>3/4</MenuItem>
                <MenuItem value='6/8'>6/8</MenuItem>
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
                onClick={generateRhythm}
                disabled={isLoading || !model}
                fullWidth
              >
                {isLoading ? <CircularProgress size={24} /> : 'Generate rhythm'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {rhythm && (
        <Paper
          elevation={3}
          sx={{ p: 3 }}
        >
          <Typography
            variant='h6'
            gutterBottom
          >
            Generated rhythm
          </Typography>

          <Box sx={{ my: 3 }}>{renderRhythmVisualization()}</Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant='contained'
              onClick={togglePlayback}
              disabled={!player}
            >
              {isPlaying ? 'Stop' : 'Play rhythm'}
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

export default AIRhythmGeneratorPage
