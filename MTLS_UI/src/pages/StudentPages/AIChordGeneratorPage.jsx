/* eslint-disable no-unused-vars */
// src/pages/StudentPages/AIChordGeneratorPage.jsx
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
  Chip,
  Card,
  CardContent,
  Divider,
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

// Hàm chuyển đổi từ MIDI pitch sang tên nốt VexFlow
const pitchToVexFlowName = (pitch) => {
  const noteNames = [
    'c',
    'c#',
    'd',
    'd#',
    'e',
    'f',
    'f#',
    'g',
    'g#',
    'a',
    'a#',
    'b',
  ]
  const octave = Math.floor(pitch / 12) - 1
  const noteIndex = pitch % 12
  return `${noteNames[noteIndex]}/${octave}`
}

const AIChordGeneratorPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [player, setPlayer] = useState(null)
  const [chordProgression, setChordProgression] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [synth, setSynth] = useState(null)

  // Các tùy chọn
  const [temperature, setTemperature] = useState(1.0)
  const [key, setKey] = useState('C')
  const [progressionLength, setProgressionLength] = useState(4)
  const [progressionType, setProgressionType] = useState('pop')

  // Khởi tạo player
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

        // Khởi tạo player
        const newPlayer = new window.mm.Player(false, {
          run: (note) => {
            // Xử lý khi phát nốt
          },
          stop: () => {
            // Xử lý khi dừng phát
            setIsPlaying(false)
          },
        })
        setPlayer(newPlayer)

        // Khởi tạo Tone.js synth cho trường hợp player không hoạt động
        const polySynth = new Tone.PolySynth(Tone.Synth).toDestination()
        setSynth(polySynth)
      } catch (err) {
        console.error('Error initializing Magenta:', err)

        // Khởi tạo Tone.js synth nếu Magenta không hoạt động
        const polySynth = new Tone.PolySynth(Tone.Synth).toDestination()
        setSynth(polySynth)
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
      if (synth) {
        synth.dispose()
      }
    }
  }, [])

  // Hàm tạo tiến trình hợp âm
  const generateChordProgression = async () => {
    setIsLoading(true)

    // Tạo tiến trình hợp âm đơn giản
    const simpleProgression = createSimpleChordProgression(
      key,
      progressionType,
      progressionLength
    )
    setChordProgression(simpleProgression)

    setIsLoading(false)
  }

  // Hàm tạo tiến trình hợp âm đơn giản
  const createSimpleChordProgression = (rootKey, type, length) => {
    // Định nghĩa các mẫu tiến trình hợp âm phổ biến theo thể loại
    const progressionsByType = {
      pop: [
        // I-IV-V-I
        [0, 5, 7, 0],
        // I-V-vi-IV
        [0, 7, 9, 5],
        // vi-IV-I-V
        [9, 5, 0, 7],
        // I-vi-IV-V
        [0, 9, 5, 7],
      ],
      jazz: [
        // ii-V-I
        [2, 7, 0],
        // I-vi-ii-V
        [0, 9, 2, 7],
        // iii-VI-ii-V
        [4, 9, 2, 7],
        // I-VI-ii-V
        [0, 8, 2, 7],
      ],
      classical: [
        // I-IV-V-I
        [0, 5, 7, 0],
        // I-IV-I-V
        [0, 5, 0, 7],
        // I-V-IV-I
        [0, 7, 5, 0],
        // I-vi-IV-V
        [0, 9, 5, 7],
      ],
      blues: [
        // I-I-I-I-IV-IV-I-I-V-IV-I-V
        [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7],
        // I-IV-I-V-IV-I
        [0, 5, 0, 7, 5, 0],
      ],
    }

    // Chọn mẫu tiến trình hợp âm dựa trên thể loại
    const progressions = progressionsByType[type] || progressionsByType.pop

    // Chọn một mẫu ngẫu nhiên
    let progression =
      progressions[Math.floor(Math.random() * progressions.length)]

    // Điều chỉnh độ dài nếu cần
    if (length && length !== progression.length) {
      // Nếu cần ngắn hơn, cắt bớt
      if (length < progression.length) {
        progression = progression.slice(0, length)
      }
      // Nếu cần dài hơn, lặp lại
      else {
        while (progression.length < length) {
          progression.push(
            progression[progression.length % (progression.length / 2)]
          )
        }
      }
    }

    // Định nghĩa các nốt trong các hợp âm major
    const majorChord = [0, 4, 7] // Root, Major 3rd, Perfect 5th
    const minorChord = [0, 3, 7] // Root, Minor 3rd, Perfect 5th
    const diminishedChord = [0, 3, 6] // Root, Minor 3rd, Diminished 5th
    const dominantSeventhChord = [0, 4, 7, 10] // Root, Major 3rd, Perfect 5th, Minor 7th
    const majorSeventhChord = [0, 4, 7, 11] // Root, Major 3rd, Perfect 5th, Major 7th
    const minorSeventhChord = [0, 3, 7, 10] // Root, Minor 3rd, Perfect 5th, Minor 7th

    // Định nghĩa các nốt trong key
    const keyOffsets = {
      C: 60, // C4
      'C#': 61,
      D: 62,
      'D#': 63,
      E: 64,
      F: 65,
      'F#': 66,
      G: 67,
      'G#': 68,
      A: 69,
      'A#': 70,
      B: 71,
    }

    const rootOffset = keyOffsets[rootKey]

    // Tạo sequence
    const sequence = {
      notes: [],
      totalQuantizedSteps: progression.length * 4,
      quantizationInfo: { stepsPerQuarter: 1 },
    }

    // Thêm các hợp âm vào sequence
    progression.forEach((chordRoot, index) => {
      // Xác định loại hợp âm
      let chordTemplate = majorChord

      // Thêm biến thể hợp âm dựa trên thể loại
      if (type === 'jazz') {
        // ii, iii, vi là minor7
        if ([1, 2, 5].includes(chordRoot % 12)) {
          chordTemplate = minorSeventhChord
        }
        // I, IV là major7
        else if ([0, 5].includes(chordRoot % 12)) {
          chordTemplate = majorSeventhChord
        }
        // V, VII là dominant7
        else {
          chordTemplate = dominantSeventhChord
        }
      } else {
        // ii, iii, vi là minor
        if ([1, 2, 5].includes(chordRoot % 12)) {
          chordTemplate = minorChord
        }
        // vii là diminished
        else if (chordRoot % 12 === 11) {
          chordTemplate = diminishedChord
        }
        // V có thể là dominant 7th với xác suất 50%
        else if (chordRoot % 12 === 7 && Math.random() > 0.5) {
          chordTemplate = dominantSeventhChord
        }
      }

      // Thêm các nốt của hợp âm
      chordTemplate.forEach((noteOffset) => {
        sequence.notes.push({
          pitch: rootOffset + chordRoot + noteOffset,
          quantizedStartStep: index * 4,
          quantizedEndStep: (index + 1) * 4,
          program: 0,
        })
      })
    })

    return sequence
  }

  // Hàm phát/dừng tiến trình hợp âm
  const togglePlayback = () => {
    if (!chordProgression) return

    if (isPlaying) {
      if (player) {
        player.stop()
      }
      if (synth) {
        Tone.Transport.stop()
        Tone.Transport.cancel()
      }
      setIsPlaying(false)
    } else {
      if (player) {
        try {
          player.start(chordProgression)
          setIsPlaying(true)
          return
        } catch (err) {
          console.error('Error playing with Magenta player:', err)
          // Fallback to Tone.js
        }
      }

      // Sử dụng Tone.js nếu player Magenta không hoạt động
      if (synth) {
        playWithTone()
      }
    }
  }

  // Phát âm thanh với Tone.js
  const playWithTone = () => {
    if (!chordProgression || !synth) return

    // Dừng và xóa các event cũ
    Tone.Transport.stop()
    Tone.Transport.cancel()

    // Nhóm các nốt theo thời gian để tạo hợp âm
    const chords = {}
    chordProgression.notes.forEach((note) => {
      const startTime = note.quantizedStartStep
      if (!chords[startTime]) {
        chords[startTime] = []
      }
      chords[startTime].push(note.pitch)
    })

    // Tạo sequence Tone.js
    const chordTimes = Object.keys(chords).sort((a, b) => Number(a) - Number(b))

    // Tạo các event cho Tone.js
    chordTimes.forEach((time, index) => {
      const pitches = chords[time]
      const noteNames = pitches.map((pitch) =>
        Tone.Frequency(pitch, 'midi').toNote()
      )

      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(noteNames, '2n', time)
      }, index + 's')
    })

    // Dừng sau khi phát hết
    Tone.Transport.schedule(() => {
      setIsPlaying(false)
      Tone.Transport.stop()
    }, chordTimes.length + 's')

    // Bắt đầu phát
    Tone.Transport.start()
    setIsPlaying(true)
  }

  // Hàm phân tích hợp âm
  const analyzeChords = (noteSequence) => {
    if (
      !noteSequence ||
      !noteSequence.notes ||
      noteSequence.notes.length === 0
    ) {
      return []
    }

    // Nhóm các nốt theo thời gian để tạo hợp âm
    const chords = {}
    noteSequence.notes.forEach((note) => {
      const startTime = note.quantizedStartStep
      if (!chords[startTime]) {
        chords[startTime] = []
      }
      chords[startTime].push(note)
    })

    // Phân tích từng hợp âm
    const chordNames = []
    Object.keys(chords)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((time) => {
        const chord = chords[time]
        const pitches = chord.map((note) => note.pitch % 12)
        const uniquePitches = [...new Set(pitches)].sort((a, b) => a - b)

        // Phân tích hợp âm dựa trên các nốt
        const chordName = identifyChord(uniquePitches, chord[0].pitch)
        chordNames.push(chordName)
      })

    return chordNames
  }

  // Hàm nhận diện hợp âm
  const identifyChord = (pitches, rootPitch) => {
    // Định nghĩa các mẫu hợp âm
    const chordPatterns = {
      '0,4,7': 'major',
      '0,3,7': 'minor',
      '0,3,6': 'diminished',
      '0,4,8': 'augmented',
      '0,4,7,10': '7',
      '0,3,7,10': 'm7',
      '0,4,7,11': 'maj7',
      '0,3,7,11': 'm(maj7)',
      '0,3,6,10': 'm7b5',
      '0,4,7,9': '6',
      '0,3,7,9': 'm6',
      '0,2,7': 'sus2',
      '0,5,7': 'sus4',
    }

    // Chuẩn hóa pitches để bắt đầu từ 0
    const normalizedPitches = pitches.map((p) => (p - pitches[0] + 12) % 12)
    normalizedPitches.sort((a, b) => a - b)

    // Chuyển đổi sang string để so sánh
    const pitchString = normalizedPitches.join(',')

    // Xác định root note
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
    const rootNote = noteNames[rootPitch % 12]

    // Xác định loại hợp âm
    const chordType = chordPatterns[pitchString] || ''

    // Kết hợp root note và loại hợp âm
    return rootNote + (chordType === 'major' ? '' : chordType)
  }

  // Hàm tạo màu cho hợp âm
  const getChordColor = (chordName) => {
    // Màu cho các loại hợp âm khác nhau
    if (chordName.includes('maj7')) return '#4caf50' // Xanh lá
    if (chordName.includes('m7')) return '#ff9800' // Cam
    if (chordName.includes('7')) return '#f44336' // Đỏ
    if (chordName.includes('m')) return '#9c27b0' // Tím
    if (chordName.includes('dim')) return '#795548' // Nâu
    if (chordName.includes('aug')) return '#ff5722' // Cam đỏ
    if (chordName.includes('sus')) return '#607d8b' // Xanh xám
    return '#2196f3' // Xanh dương cho major
  }

  // Hàm chuyển đổi từ NoteSequence sang định dạng VexFlow
  const convertToVexFlowFormat = (noteSequence) => {
    if (
      !noteSequence ||
      !noteSequence.notes ||
      noteSequence.notes.length === 0
    ) {
      return 'c/4/q, e/4/q, g/4/q'
    }

    // Nhóm các nốt theo thời gian để tạo hợp âm
    const chords = {}
    noteSequence.notes.forEach((note) => {
      const startTime = note.quantizedStartStep
      if (!chords[startTime]) {
        chords[startTime] = []
      }
      chords[startTime].push(note)
    })

    // Chuyển đổi sang định dạng VexFlow
    let vexflowNotes = ''
    Object.keys(chords)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((time) => {
        const chord = chords[time]
        if (chord.length === 1) {
          // Nốt đơn
          vexflowNotes += `${pitchToVexFlowName(chord[0].pitch)}/q, `
        } else {
          // Hợp âm
          const vexflowChord = chord
            .map((note) => pitchToVexFlowName(note.pitch))
            .join(',')
          vexflowNotes += `(${vexflowChord})/q, `
        }
      })

    return vexflowNotes.slice(0, -2) // Loại bỏ dấu phẩy cuối cùng
  }

  // Hàm tạo ký hiệu cho một hợp âm cụ thể
  const createSingleChordNotation = (noteSequence, chordIndex) => {
    if (
      !noteSequence ||
      !noteSequence.notes ||
      noteSequence.notes.length === 0
    ) {
      return 'c/4/w'
    }

    // Nhóm các nốt theo thời gian để tạo hợp âm
    const chords = {}
    noteSequence.notes.forEach((note) => {
      const startTime = note.quantizedStartStep
      if (!chords[startTime]) {
        chords[startTime] = []
      }
      chords[startTime].push(note)
    })

    // Lấy các thời điểm bắt đầu của các hợp âm
    const chordTimes = Object.keys(chords).sort((a, b) => Number(a) - Number(b))

    // Nếu chordIndex không hợp lệ, trả về chuỗi mặc định
    if (chordIndex < 0 || chordIndex >= chordTimes.length) {
      return 'c/4/w'
    }

    // Lấy hợp âm tại chordIndex
    const chord = chords[chordTimes[chordIndex]]

    // Chuyển đổi sang định dạng VexFlow
    if (chord.length === 1) {
      // Nốt đơn
      return `${pitchToVexFlowName(chord[0].pitch)}/w`
    } else {
      // Hợp âm - đảm bảo các nốt được sắp xếp từ thấp đến cao
      const sortedChord = [...chord].sort((a, b) => a.pitch - b.pitch)
      const vexflowChord = sortedChord
        .map((note) => pitchToVexFlowName(note.pitch))
        .join(',')
      return `(${vexflowChord})/w`
    }
  }

  // Hàm lấy URL hình ảnh hợp âm
  const getChordImageUrl = (chordName) => {
    // Bạn có thể sử dụng một API hoặc thư viện hình ảnh hợp âm
    // Ví dụ: return `https://example.com/chord-images/${encodeURIComponent(chordName)}.png`

    // Hoặc sử dụng một tập hợp hình ảnh cố định
    return '/images/chords/default-chord.png'
  }

  // Hàm lấy ngón tay cho hợp âm (ví dụ đơn giản)
  const getChordFingering = (chordName) => {
    const fingerings = {
      C: [0, 1, 0, 2, 3, -1], // -1 nghĩa là không bấm
      G: [3, 2, 0, 0, 0, 3],
      D: [-1, -1, 0, 2, 3, 2],
      A: [0, 0, 2, 2, 2, 0],
      E: [0, 2, 2, 1, 0, 0],
      F: [1, 3, 3, 2, 1, 1],
      Am: [0, 0, 2, 2, 1, 0],
      Em: [0, 2, 2, 0, 0, 0],
      Dm: [-1, -1, 0, 2, 3, 1],
    }

    // Trả về fingering cho hợp âm hoặc mặc định nếu không tìm thấy
    return fingerings[chordName] || [0, 0, 0, 0, 0, 0]
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
        AI Chord Progression Generator
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
            md={3}
          >
            <FormControl fullWidth>
              <InputLabel>Key</InputLabel>
              <Select
                value={key}
                onChange={(e) => setKey(e.target.value)}
              >
                {[
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
                ].map((k) => (
                  <MenuItem
                    key={k}
                    value={k}
                  >
                    {k}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={progressionType}
                onChange={(e) => setProgressionType(e.target.value)}
              >
                <MenuItem value='pop'>Pop</MenuItem>
                <MenuItem value='jazz'>Jazz</MenuItem>
                <MenuItem value='classical'>Classical</MenuItem>
                <MenuItem value='blues'>Blues</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <Typography gutterBottom>
              Number of chords: {progressionLength}
            </Typography>
            <Slider
              value={progressionLength}
              onChange={(e, newValue) => setProgressionLength(newValue)}
              min={3}
              max={8}
              step={1}
              marks
              valueLabelDisplay='auto'
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='contained'
                color='primary'
                onClick={generateChordProgression}
                disabled={isLoading}
                fullWidth
                sx={{ height: '100%' }}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Generate Chord Progression'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {chordProgression && (
        <Paper
          elevation={3}
          sx={{ p: 3 }}
        >
          <Typography
            variant='h6'
            gutterBottom
          >
            Chord Progression Generated
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Hiển thị tiến trình hợp âm */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='subtitle1'
              gutterBottom
              align='center'
            >
              Chord Progression: {analyzeChords(chordProgression).join(' → ')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
                my: 2,
              }}
            >
              {analyzeChords(chordProgression).map((chord, index) => (
                <Card
                  key={index}
                  elevation={3}
                  sx={{
                    width: 100,
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: getChordColor(chord),
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant='h5'
                      fontWeight='bold'
                      align='center'
                    >
                      {chord}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box
              sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}
            >
              <Button
                variant='contained'
                onClick={togglePlayback}
                size='large'
                startIcon={isPlaying ? <span>■</span> : <span>▶</span>}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Hiển thị khuông nhạc */}
          <Typography
            variant='h6'
            gutterBottom
            align='center'
          >
            Chord Representation
          </Typography>

          <Grid
            container
            spacing={3}
          >
            {analyzeChords(chordProgression).map((chord, index) => (
              <Grid
                item
                xs={12}
                md={6}
                lg={3}
                key={index}
              >
                <Paper
                  elevation={2}
                  sx={{ p: 2 }}
                >
                  <Typography
                    variant='subtitle2'
                    gutterBottom
                    align='center'
                  >
                    Chord {index + 1}: {chord}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <VexFlowComponent
                      width={250}
                      height={120}
                      notes={createSingleChordNotation(chordProgression, index)}
                      clef='treble'
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  )
}

export default AIChordGeneratorPage
