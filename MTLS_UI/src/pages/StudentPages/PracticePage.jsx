import { Box, Container, Typography, Grid } from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import PianoIcon from '@mui/icons-material/Piano'
import HearingIcon from '@mui/icons-material/Hearing'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useNavigate } from 'react-router-dom'

const practiceCategories = [
  {
    title: 'Music Notation Identification',
    exercises: [
      {
        name: 'Music Note Identification',
        icon: <MusicNoteIcon />,
        path: '/student/practice/note-identification',
      },
      // {
      //   name: 'Key Signature Identification',
      //   icon: <MusicNoteIcon />,
      //   path: '/student/practice/key-signature-identification',
      // },
      // { name: "Nhận diện quãng", icon: <MusicNoteIcon /> },
      // { name: "Nhận diện điệu thức", icon: <MusicNoteIcon /> },
      // { name: "Nhận diện hợp âm", icon: <MusicNoteIcon /> },
    ],
  },
  // {
  //   title: 'Keyboard Identification',
  //   exercises: [
  //     {
  //       name: 'Keyboard Identification',
  //       icon: <PianoIcon />,
  //       path: '/student/practice/keyboard-identification',
  //     },
  //     {
  //       name: 'Keyboard Note Identification',
  //       icon: <PianoIcon />,
  //       path: '/student/practice/keyboard-note-identification',
  //     },
  //     { name: "Nhận diện quãng trên đàn", icon: <PianoIcon /> },
  //     { name: "Nhận diện điệu thức trên đàn", icon: <PianoIcon /> },
  //     { name: "Nhận diện hợp âm trên đàn", icon: <PianoIcon /> },
  //   ],
  // },
  // {
  //   title: "XÂY DỰNG KÝ HIỆU",
  //   exercises: [
  //     { name: "Xây dựng nốt nhạc", icon: <LibraryMusicIcon /> },
  //     { name: "Xây dựng hóa biểu", icon: <LibraryMusicIcon /> },
  //     { name: "Xây dựng quãng", icon: <LibraryMusicIcon /> },
  //     { name: "Xây dựng điệu thức", icon: <LibraryMusicIcon /> },
  //     { name: "Xây dựng hợp âm", icon: <LibraryMusicIcon /> },
  //   ]
  // },
  {
    title: 'Note Listening',
    exercises: [
      {
        name: 'Note Listening Identification',
        icon: <HearingIcon />,
        path: '/student/practice/note-listening-identification',
      },
      // { name: "Nghe và nhận diện quãng", icon: <HearingIcon /> },
      // { name: "Nghe và nhận diện điệu thức", icon: <HearingIcon /> },
      // { name: "Nghe và nhận diện hợp âm", icon: <HearingIcon /> },
    ],
  },
  {
    title: 'Pitch Identification',
    exercises: [
      {
        name: 'Pitch Identification',
        icon: <HearingIcon />,
        path: '/student/practice/pitch-identification',
      },
    ],
  },
  {
    title: 'AI-Generated Music Practice',
    exercises: [
      {
        name: 'Melody Generator',
        icon: <AutoFixHighIcon />,
        path: '/student/practice/ai-melody-generator',
      },
      {
        name: 'Chord Progression Generator',
        icon: <AutoFixHighIcon />,
        path: '/student/practice/ai-chord-generator',
      },
      {
        name: 'Rhythm Pattern Generator',
        icon: <AutoFixHighIcon />,
        path: '/student/practice/ai-rhythm-generator',
      },
      {
        name: 'Music Quiz Generator',
        icon: <AutoFixHighIcon />,
        path: '/student/practice/ai-quiz-generator',
      },
    ],
  },
]

const PracticePage = () => {
  const navigate = useNavigate()

  const handleExerciseClick = (exercisePath) => {
    navigate(exercisePath)
  }

  return (
    <Container
      maxWidth='lg'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        ml: 10,
        mt: 10,
      }}
    >
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
      >
        Practice
      </Typography>

      {practiceCategories.map((category, index) => (
        <Box
          key={index}
          sx={{ mb: 4 }}
        >
          <Typography
            variant='h6'
            sx={{
              mb: 2,
              borderBottom: '2px solid #1976d2',
              pb: 1,
              color: '#1976d2',
            }}
          >
            {category.title}
          </Typography>

          <Grid
            container
            spacing={2}
          >
            {category.exercises.map((exercise, idx) => (
              <Grid
                item
                key={idx}
              >
                <Box
                  onClick={() =>
                    exercise.path && handleExerciseClick(exercise.path)
                  }
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: exercise.path ? 'pointer' : 'default',
                    opacity: exercise.path ? 1 : 0.5,
                    minWidth: '250px',
                    whiteSpace: 'nowrap',
                    '&:hover': exercise.path
                      ? {
                          backgroundColor: '#f5f5f5',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out',
                        }
                      : {},
                  }}
                >
                  {exercise.icon}
                  <Typography>{exercise.name}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  )
}

export default PracticePage
