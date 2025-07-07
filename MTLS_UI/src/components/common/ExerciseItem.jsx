/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import NumberCircle from './NumberCircle'

const ExerciseItem = ({ items, onItemSelect }) => {
  const [selectedNumber, setSelectedNumber] = useState(1) // Mặc định chọn item đầu tiên

  const handleNumberClick = (num) => {
    setSelectedNumber(num)
    onItemSelect(items[num - 1]) // Truyền item được chọn lên component cha
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 8,
        px: 3,
        ml: 20,
        borderLeft: '1px solid #ccc',
      }}
    >
      <Typography
        variant='h5'
        component='h1'
        align='center'
        sx={{
          fontWeight: 'bold',
          mb: 4,
          maxWidth: 500,
        }}
      >
        {items[selectedNumber - 1]?.title}
      </Typography>

      <Stack
        direction='row'
        spacing={4}
        sx={{
          mt: 2,
        }}
      >
        {items.map((_, index) => (
          <NumberCircle
            key={index + 1}
            number={index + 1}
            selected={index + 1 === selectedNumber}
            onClick={() => handleNumberClick(index + 1)}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default ExerciseItem
