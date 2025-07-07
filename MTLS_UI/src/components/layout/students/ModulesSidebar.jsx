import { Box } from '@mui/material'
import LearningModulesMenu from '../../common/LearningModulesMenu'
import { useLocation } from 'react-router-dom'
import { styled } from '@mui/system'

// Tạo một component với reset CSS
const SidebarContainer = styled(Box)(() => ({
  display: 'flex',
  height: '100vh',
  position: 'relative',
  left: 0,
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
}));

const ModulesSidebar = () => {
  const location = useLocation()
  
  // Kiểm tra xem có đang ở trang overview quiz, assignment, exercise không
  // Nếu đã ẩn sidebar chính, thì hiển thị ModulesSidebar đầy đủ
  // Nếu không, hiển thị ModulesSidebar với style khác
  const isQuizPage = location.pathname.includes('/quiz/')
  const isAssignmentPage = location.pathname.includes('/assignment/')
  const isExercisePage = location.pathname.includes('/exercise/')
  const shouldExpandFullWidth = isQuizPage || isAssignmentPage || isExercisePage
  
  return (
    <SidebarContainer
      sx={{
        position: shouldExpandFullWidth ? 'static' : 'fixed',
        top: shouldExpandFullWidth ? 0 : 56, // Nếu là trang full thì top = 0, nếu không thì top = 56 (height của header)
        zIndex: 900,
        width: 'auto',
        flexShrink: 0
      }}
    >
      <LearningModulesMenu fullWidth={shouldExpandFullWidth} />
    </SidebarContainer>
  )
}

export default ModulesSidebar 