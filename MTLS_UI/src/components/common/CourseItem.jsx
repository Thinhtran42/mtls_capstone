/* eslint-disable react/prop-types */
import { Box, Typography } from '@mui/material'

const Item = ({ number, text, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        mb: 3,
        gap: 2,
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: '2px solid #4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4CAF50',
          flexShrink: 0,
        }}
      >
        {number}
      </Box>
      <Typography
        color='text.secondary'
        sx={{ flex: 1 }}
      >
        {text}
      </Typography>
    </Box>
  )
}

const CourseItem = ({ title, items, onItemClick }) => {
  return (
    <Box
      sx={{
        width: 500,
        p: 3,
        borderLeft: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant='h6'
        sx={{ mb: 3 }}
      >
        {title}
      </Typography>
      {items.map((item) => (
        <Item
          key={item.id}
          number={item.id}
          text={item.title}
          onClick={() => onItemClick(item)}
        />
      ))}
    </Box>
  )
}

export default CourseItem
