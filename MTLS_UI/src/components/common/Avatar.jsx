/* eslint-disable react/prop-types */
import { Avatar, Container, Box, Typography } from '@mui/material'
import { useState, useEffect } from 'react'

const CustomAvatar = ({ onClick }) => {
  const [userInfo, setUserInfo] = useState({
    fullname: '',
    avatar: '',
  })

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi component mount
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUserInfo({
          fullname: userData.fullname || 'Người dùng',
          avatar: userData.avatar || userData.photoURL || '',
        })
      } catch (error) {
        console.error('Lỗi khi parse thông tin user:', error)
      }
    }
  }, [])

  // Lấy chữ cái đầu từ tên người dùng nếu không có avatar
  const getInitials = () => {
    if (!userInfo.fullname) return '?'
    return userInfo.fullname.charAt(0).toUpperCase()
  }

  // Rút gọn tên nếu quá dài
  const getDisplayName = () => {
    if (!userInfo.fullname) return 'Người dùng';
    if (userInfo.fullname.length > 15) {
      return userInfo.fullname.substring(0, 15) + '...';
    }
    return userInfo.fullname;
  }

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 'fit-content',
          mx: 'auto',
          mt: '50px',
        }}
      >
        <Avatar
          src={userInfo.avatar}
          alt={userInfo.fullname}
          onClick={onClick}
          sx={{
            width: 100,
            height: 100,
            border: '4px solid white',
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            cursor: 'pointer',
            bgcolor: !userInfo.avatar ? 'primary.main' : undefined,
            fontSize: !userInfo.avatar ? '3rem' : undefined,
          }}
        >
          {!userInfo.avatar && getInitials()}
        </Avatar>
        <Box
          sx={{
            bgcolor: '#e3f2fd',
            borderRadius: '16px',
            p: 2,
            pt: 7,
            textAlign: 'center',
            width: '180px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant='body1'
            sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              fontSize: '1rem',
              lineHeight: 1.2,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {getDisplayName()}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default CustomAvatar
