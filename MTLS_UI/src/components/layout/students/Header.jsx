import { Box, Button, Typography, Menu, MenuItem, Avatar } from '@mui/material'
import Logo from '../../../assets/Logo.svg'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../api/services/auth.service'
import { userService } from '../../../api'
import IconButton from '@mui/material/IconButton'

const Header = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [userAnchorEl, setUserAnchorEl] = useState(null)
  const [userInfo, setUserInfo] = useState({
    fullname: '',
    avatar: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        // Lấy userId từ localStorage
        const userId = localStorage.getItem('userId')

        if (!userId) {
          console.log('User ID not found in localStorage')
          return
        }

        // Lấy thông tin user từ API
        const userResponse = await userService.getUserById(userId)

        // Lưu thông tin user vào state
        if (userResponse && userResponse.data) {
          const userData = userResponse.data
          setUserInfo({
            fullname: userData.fullname || 'Người dùng',
            avatar: userData.avatar || userData.photoURL || '',
          })
        } else {
          // Fallback: Thử lấy từ localStorage
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
        }
      } catch (error) { 
        console.error('Error fetching user data:', error)

        // Fallback: Thử lấy từ localStorage
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
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Lấy chữ cái đầu từ tên người dùng nếu không có avatar
  const getInitials = () => {
    if (!userInfo.fullname) return '?'
    return userInfo.fullname.charAt(0).toUpperCase()
  }

  const handleUserClick = (event) => {
    setUserAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setUserAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()
    authService.logout()
    navigate('/login')
  }

  const handleProfile = () => {
    handleClose()
    navigate('/student/information')
  }

  const handlePractice = () => {
    navigate('/student/practice')
  }

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 24px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        height: '56px'
      }}
    >
      {/* Left section - Logo only */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          sx={{
            height: '32px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/student/overview')}
        />
      </Box>

      {/* Right section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Practice Button */}
        <Button
          variant="outlined"
          onClick={handlePractice}
          sx={{
            color: '#0056D2',
            borderColor: '#0056D2',
            '&:hover': {
              backgroundColor: 'rgba(0, 86, 210, 0.04)',
              borderColor: '#0056D2'
            },
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Practice
        </Button>

        {/* <IconButton
          size="small"
          sx={{
            color: '#1a1a1a',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <NotificationsIcon />
        </IconButton> */}

        <Button
          onClick={handleUserClick}
          sx={{
            color: '#1a1a1a',
            textTransform: 'none',
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
          endIcon={<KeyboardArrowDownIcon />}
        >
          {userInfo.avatar ? (
            <Avatar
              src={userInfo.avatar}
              alt={userInfo.fullname}
              sx={{
                width: 32,
                height: 32,
                mr: 0.5
              }}
            />
          ) : (
            loading ? (
              <AccountCircleIcon sx={{ mr: 0.5 }} />
            ) : (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mr: 0.5,
                  bgcolor: '#0056D2'
                }}
              >
                {getInitials()}
              </Avatar>
            )
          )}
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontSize: '0.875rem'
            }}
          >
            {userInfo.fullname || t('header.profile')}
          </Typography>
        </Button>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userAnchorEl}
        open={Boolean(userAnchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={handleProfile}>{t('header.personalInfo')}</MenuItem>
        <MenuItem onClick={handleLogout}>{t('header.logout')}</MenuItem>
      </Menu>
    </Box>
  )
}

export default Header