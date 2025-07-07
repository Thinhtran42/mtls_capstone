/* eslint-disable react/prop-types */
import { Button } from '@mui/material'

const MarkCompletedButton = ({ onComplete, completed, onNavigateNext }) => {
  const handleClick = () => {
    if (completed && onNavigateNext) {
      onNavigateNext()
    } else if (onComplete) {
      onComplete(!completed)
    }
  }

  return (
    <Button
      variant='contained'
      onClick={handleClick}
      sx={{
        backgroundColor: completed ? '#4CAF50' : '#1976d2',
        '&:hover': {
          backgroundColor: completed ? '#45a049' : '#1565c0',
        },
        textTransform: 'none',
        padding: '8px 24px',
        borderRadius: '4px',
        fontWeight: 500,
      }}
    >
      {completed ? 'Đi tới bài kế tiếp' : 'đánh dấu là đã đọc'}
    </Button>
  )
}

export default MarkCompletedButton
