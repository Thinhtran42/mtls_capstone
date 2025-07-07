import { TextField } from '@mui/material'
import { SearchIcon } from 'lucide-react'

const CustomSearch = () => {
  return (
    <TextField
      variant='outlined'
      placeholder='Tìm kiếm...'
      InputProps={{
        // Biểu tượng tìm kiếm
        startAdornment: <SearchIcon style={{ marginRight: '8px' }} />,
        sx: {
          borderRadius: '20px', // Bo góc tròn
          backgroundColor: '#fff', // Màu nền
          width: '500px',
          height: '40px',
          margin: '0 0 0 0',
          border: '1px solid #f5eeee',
        },
      }}
      margin='normal'
      fullWidth
    />
  )
}

export default CustomSearch
