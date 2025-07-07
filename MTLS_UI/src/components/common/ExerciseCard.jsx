/* eslint-disable react/prop-types */
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material'
import { Clock, Users, BookOpen, CheckCircle } from 'lucide-react'

const ExerciseCard = ({
  title,
  duration,
  students,
  lessons,
  progress,
  status,
  items,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: '1000px',
        height: '300px',
        m: 2,
        p: 0,
        display: 'flex',
        overflow: 'hidden',
        borderRadius: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <Box
        sx={{
          width: '350px',
          height: '300px',
          backgroundImage: `url(https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box sx={{ flex: 1, p: 3 }}>
        <Typography
          variant='h5'
          gutterBottom
          fontWeight='bold'
        >
          {title}
        </Typography>

        <Stack
          direction='row'
          spacing={3}
          sx={{ mb: 2 }}
        >
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
          >
            <Clock size={20} />
            <Typography variant='body2'>{duration}</Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
          >
            <Users size={20} />
            <Typography variant='body2'>{students}</Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
          >
            <BookOpen size={20} />
            <Typography variant='body2'>{lessons} bài</Typography>
          </Stack>
        </Stack>

        <List>
          {items.map((item, index) => (
            <ListItem
              key={index}
              sx={{ px: 0 }}
            >
              <ListItemText
                primary={
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                  >
                    <Typography
                      variant='body1'
                      color={item.completed ? 'primary' : 'text.secondary'}
                    >
                      {index + 1}. {item.text}
                    </Typography>
                    {item.completed && (
                      <CheckCircle
                        size={16}
                        color='#1976d2'
                      />
                    )}
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, mb: 1 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='body2'>{progress}/5</Typography>
            <Chip
              label={status}
              size='small'
              sx={{
                bgcolor: status === 'Đang Làm' ? '#e3f2fd' : '#f5f5f5',
                color: status === 'Đang Làm' ? '#1976d2' : '#757575',
              }}
            />
          </Stack>
          <LinearProgress
            variant='determinate'
            value={(progress / 5) * 100}
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>
    </Card>
  )
}

export default ExerciseCard
