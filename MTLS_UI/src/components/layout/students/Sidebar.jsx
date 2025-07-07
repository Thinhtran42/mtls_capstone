import {
  List,
  ListItem,
  ListItemText,
  Box,
  Paper,
  Collapse,
  Typography,
  CircularProgress,
  ListItemIcon,
  Alert
} from '@mui/material'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ExpandLess, ExpandMore, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import { courseService, moduleService } from '../../../api'

// Hàm kiểm tra xem một ID có phải là MongoDB ObjectID hợp lệ không
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

const Sidebar = () => {
  const location = useLocation()
  const { courseId } = useParams()
  const [activeItem, setActiveItem] = useState('Course Material')
  const [openCourse, setOpenCourse] = useState(true)
  const [courseName, setCourseName] = useState('')
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [courseProgress, setCourseProgress] = useState(null) // Thêm state để lưu tiến trình
  const [error, setError] = useState(null) // New error state
  const [currentItems, setCurrentItems] = useState({
    moduleId: null,
    lessonId: null,
    quizId: null,
    exerciseId: null,
    assignmentId: null
  })

  const menuItems = [
    {
      text: 'Grades',
      path: courseId ? `/student/course/${courseId}/grades` : '#',
    },
    {
      text: 'Notes',
      path: courseId ? `/student/course/${courseId}/notes` : '#',
    },
    {
      text: 'Discussion Forums',
      path: courseId ? `/student/course/${courseId}/discussion` : '#',
    },
    {
      text: 'Course Rating',
      path: courseId ? `/student/course/${courseId}/rating` : '#',
    }
  ]

  // Extract current module and item IDs from URL
  useEffect(() => {
    const pathSegments = location.pathname.split('/')
    
    // Extract moduleId
    const moduleIndex = pathSegments.indexOf('module')
    const moduleId = moduleIndex !== -1 && moduleIndex < pathSegments.length - 1 
      ? pathSegments[moduleIndex + 1] 
      : null
    
    // Extract various item IDs
    const lessonIndex = pathSegments.indexOf('lesson')
    const lessonId = lessonIndex !== -1 && lessonIndex < pathSegments.length - 1 
      ? pathSegments[lessonIndex + 1] 
      : null
    
    const quizIndex = pathSegments.indexOf('quiz')
    const quizId = quizIndex !== -1 && quizIndex < pathSegments.length - 1 
      ? pathSegments[quizIndex + 1] 
      : null
    
    const exerciseIndex = pathSegments.indexOf('exercise')
    const exerciseId = exerciseIndex !== -1 && exerciseIndex < pathSegments.length - 1 
      ? pathSegments[exerciseIndex + 1] 
      : null
    
    const assignmentIndex = pathSegments.indexOf('assignment')
    const assignmentId = assignmentIndex !== -1 && assignmentIndex < pathSegments.length - 1 
      ? pathSegments[assignmentIndex + 1] 
      : null
    
    setCurrentItems({
      moduleId,
      lessonId,
      quizId,
      exerciseId,
      assignmentId
    })
    
    console.log('Current navigation items:', { moduleId, lessonId, quizId, exerciseId, assignmentId })
  }, [location.pathname])

  useEffect(() => {
    const fetchData = async () => {
      // Reset states when fetching new data
      setLoading(true)
      setError(null)

      // Validate courseId before making API calls
      if (!courseId) {
        console.error('CourseId is undefined or invalid')
        setError('Course ID is missing or invalid')
        setLoading(false)
        return
      }

      try {
        // Lấy user ID từ localStorage
        const studentId = localStorage.getItem('userId');

        if (!studentId) {
          console.error('Student ID không tìm thấy');
          setError('Student ID not found')
          return;
        }

        let selectedCourse = null;

        // Sử dụng API mới để lấy khóa học kèm tiến trình
        try {
          const progressResponse = await courseService.getCourseWithProgress(courseId, studentId);
          console.log('Progress response:', progressResponse);

          // Lấy dữ liệu từ response, đảm bảo có được một đối tượng
          const progressData = progressResponse?.data || {};
          console.log('Progress data:', progressData);

          // Lưu dữ liệu vào state
          setCourseProgress(progressData);

          // Gán dữ liệu khóa học
          selectedCourse = progressData;

          // Kiểm tra xem dữ liệu có hợp lệ không
          if (!selectedCourse || typeof selectedCourse !== 'object') {
            console.error('Invalid course data format:', selectedCourse);
            throw new Error('Dữ liệu khóa học không hợp lệ');
          }

          // Log dữ liệu để debug
          console.log('Selected course data:', selectedCourse);
        } catch (progressError) {
          console.error('Error fetching course progress:', progressError);

          // Fallback to regular course fetch if progress API fails
          if (isValidObjectId(courseId)) {
            // Nếu là ObjectID, lấy khóa học trực tiếp bằng ID
            const courseResponse = await courseService.getCourseById(courseId);
            selectedCourse = courseResponse?.data;
            console.log('Fallback course data:', selectedCourse);
          } else {
            // Nếu không phải ObjectID (có thể là index), dùng cách cũ
            const coursesResponse = await courseService.getAllCourses()
            const courses = coursesResponse?.data || []
            selectedCourse = courses[parseInt(courseId) - 1]
            console.log('Fallback indexed course data:', selectedCourse);
          }
        }

        if (!selectedCourse) {
          console.error('Course not found');
          setError('Course not found')
          return;
        }

        // Set course name
        setCourseName(selectedCourse.title || 'Course')

        // Lấy ID thực của khóa học
        let actualCourseId = selectedCourse._id;

        // Nếu không có _id trong dữ liệu, sử dụng courseId từ params
        if (!actualCourseId) {
          console.warn('Course data is missing _id, using courseId from params:', courseId);

          // Kiểm tra xem courseId có phải là ObjectID hợp lệ không
          if (isValidObjectId(courseId)) {
            actualCourseId = courseId;
          } else {
            console.error('Cannot proceed: No valid course ID available');
            setError('Không thể tải dữ liệu khóa học - Thiếu định danh khóa học');
            return;
          }
        }

        console.log('Using actualCourseId:', actualCourseId);

        // Nếu đã có dữ liệu tiến trình, sử dụng modules từ đó
        if (courseProgress && courseProgress.modules) {
          console.log('Using modules from course progress:', courseProgress.modules);

          // Kiểm tra xem modules có phải là array không
          if (!Array.isArray(courseProgress.modules)) {
            console.error('Modules is not an array:', courseProgress.modules);
            setModules([]);
          } else {
            // Kiểm tra xem các module có _id không
            const validModules = courseProgress.modules.filter(mod => mod && mod._id);
            console.log('Valid modules with _id:', validModules);

            if (validModules.length < courseProgress.modules.length) {
              console.warn(`Filtered out ${courseProgress.modules.length - validModules.length} modules without _id`);
            }

            setModules(validModules);
          }
        } else {
          // Nếu không, lấy modules theo cách cũ
          console.log('Fetching modules by course ID:', actualCourseId);
          try {
            const modulesResponse = await moduleService.getModulesByCourse(actualCourseId);
            console.log('Modules response:', modulesResponse);

            const modulesData = modulesResponse?.data || [];
            console.log('Modules data:', modulesData);

            // Kiểm tra và lọc các module không có _id
            if (!Array.isArray(modulesData)) {
              console.error('Modules data is not an array:', modulesData);
              setModules([]);
            } else {
              const validModules = modulesData.filter(mod => mod && mod._id);
              console.log('Valid modules with _id:', validModules);

              if (validModules.length < modulesData.length) {
                console.warn(`Filtered out ${modulesData.length - validModules.length} modules without _id`);
              }

              setModules(validModules);
            }
          } catch (moduleError) {
            console.error('Error fetching modules:', moduleError);
            setModules([]);
            setError('Không thể tải module cho khóa học này');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load course data')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchData()
    } else {
      setLoading(false)
      setError('No course selected')
    }
  }, [courseId])

  // Helper to check if a single component is completed
  const isComponentCompleted = (component) => {
    if (!component) return false;
    
    // Check various completion indicators
    if (component.status === 'completed') return true;
    if (component.isCompleted === true) return true;
    
    // Type-specific checks
    if (component.type === 'assignment' && component.isSubmitted === true) return true;
    if (component.type === 'quiz' && component.isPassed === true) return true;
    
    // For lessons, check if viewed or completed
    if (component.type === 'lesson' && (component.isViewed === true || component.viewCount > 0)) return true;
    
    return false;
  };

  // Helper function để kiểm tra liệu module đã hoàn thành chưa
  const isModuleCompleted = (module) => {
    if (!module) {
      console.log('Module is null or undefined');
      return false;
    }
    
    console.log(`Checking completion for module: ${module.title || module._id}`);

    // Kiểm tra từ dữ liệu tiến trình
    if (courseProgress && courseProgress.modules) {
      // Check this specific module in the courseProgress data
      const progressModule = courseProgress.modules.find(m => m._id === module._id);
      
      if (progressModule) {
        console.log(`Found matching module in courseProgress for ${module.title || module._id}`);
        console.log('Module completion properties:', {
          moduleId: module._id,
          title: module.title,
          completed: progressModule.completed,
          isCompleted: progressModule.isCompleted,
          progress: progressModule.progress
        });
        
        // Kiểm tra các thuộc tính chỉ để DEBUG - sau đó bỏ qua và chỉ dựa vào việc kiểm tra components
        if (progressModule.completed === true) {
          console.log(`WARNING: Module ${module.title || module._id} has completed=true property but we're ignoring this flag`);
        }

        if (progressModule.progress === 100) {
          console.log(`WARNING: Module ${module.title || module._id} has 100% progress but we're ignoring this indicator`);
        }

        if (progressModule.isCompleted === true) {
          console.log(`WARNING: Module ${module.title || module._id} has isCompleted=true but we're ignoring this flag`);
        }

        // Nếu tất cả components trong tất cả sections đều 'completed'
        if (progressModule.sections && Array.isArray(progressModule.sections)) {
          console.log(`Module ${module.title || module._id} has ${progressModule.sections.length} sections to check`);
          let allComponentsCompleted = true;
          let hasComponents = false;
          let totalComponents = 0;
          let completedComponents = 0;

          for (const section of progressModule.sections) {
            if (section.components && Array.isArray(section.components) && section.components.length > 0) {
              hasComponents = true;
              totalComponents += section.components.length;
              
              for (const component of section.components) {
                if (isComponentCompleted(component)) {
                  completedComponents++;
                } else {
                  allComponentsCompleted = false;
                  console.log(`Found incomplete component in section ${section.title || section._id}: ${component.title || component._id} with status: ${component.status || 'undefined'}, type: ${component.type || 'unknown'}`);
                  console.log('Component details:', JSON.stringify(component, null, 2));
                }
              }
            }
          }

          console.log(`Module ${module.title || module._id}: ${completedComponents}/${totalComponents} components completed`);
          
          if (hasComponents && allComponentsCompleted && totalComponents > 0) {
            console.log(`All components in module ${module.title || module._id} are completed!`);
            return true;
          }
          
          // Module is not completed - requires 100% completion
          if (hasComponents && totalComponents > 0) {
            const completionPercentage = (completedComponents / totalComponents) * 100;
            console.log(`Module ${module.title || module._id} requires 100% completion but only has ${completionPercentage.toFixed(2)}%`);
          }
          
          return false;
        }
      } else {
        console.log(`No matching module found in courseProgress for ${module.title || module._id}`);
      }
    } else {
      console.log('No courseProgress data available or no modules in courseProgress');
    }

    // Kiểm tra trực tiếp các section/components trong module
    if (module.sections && Array.isArray(module.sections)) {
      console.log(`Checking sections directly in module ${module.title || module._id}: ${module.sections.length} sections`);
      let allComponentsCompleted = true;
      let hasComponents = false;
      let totalComponents = 0;
      let completedComponents = 0;

      for (const section of module.sections) {
        if (section.components && Array.isArray(section.components) && section.components.length > 0) {
          hasComponents = true;
          totalComponents += section.components.length;
          
          for (const component of section.components) {
            if (isComponentCompleted(component)) {
              completedComponents++;
            } else {
              allComponentsCompleted = false;
              console.log(`Found incomplete component in section ${section.title || section._id}: ${component.title || component._id} with status: ${component.status || 'undefined'}, type: ${component.type || 'unknown'}`);
              console.log('Component details:', JSON.stringify(component, null, 2));
            }
          }
        }
      }

      console.log(`Module ${module.title || module._id}: ${completedComponents}/${totalComponents} components completed`);
      
      if (hasComponents && allComponentsCompleted && totalComponents > 0) {
        console.log(`All components in module ${module.title || module._id} are completed!`);
        return true;
      }
      
      // Module is not completed - requires 100% completion
      if (hasComponents && totalComponents > 0) {
        const completionPercentage = (completedComponents / totalComponents) * 100;
        console.log(`Module ${module.title || module._id} requires 100% completion but only has ${completionPercentage.toFixed(2)}%`);
      }
    }
    
    console.log(`Module ${module.title || module._id} is NOT completed - using strict completion rules (100% required)`);
    return false;
  };

  useEffect(() => {
    const pathSegments = location.pathname.split('/')
    const currentPath = pathSegments[pathSegments.length - 1]

    if (currentPath === 'grades') setActiveItem('Grades')
    else if (currentPath === 'notes') setActiveItem('Notes')
    else if (currentPath === 'discussion') setActiveItem('Discussion Forums')
    else if (currentPath === 'messages') setActiveItem('Messages')
    else if (currentPath === 'info') setActiveItem('Course Info')
    else setActiveItem('Course Material')
  }, [location.pathname])

  const handleCourseClick = () => {
    setOpenCourse(!openCourse)
    setActiveItem('Course Material')
  }

  // Cập nhật regex để hỗ trợ cả ID số và ObjectID
  const isMainCoursePage = location.pathname.match(/^\/student\/course\/([^/]+)$/)

  // Thêm kiểm tra cho các trang quiz, assignment và exercise overview
  const isQuizPage = location.pathname.includes('/quiz/')
  const isAssignmentPage = location.pathname.includes('/assignment/')
  const isExercisePage = location.pathname.includes('/exercise/')

  // If on the main course page or quiz/assignment/exercise pages, don't render the sidebar
  if (isMainCoursePage || isQuizPage || isAssignmentPage || isExercisePage) {
    return null
  }

  // Render một module với sections và items của nó
  const renderModule = (module, index) => {
    // Kiểm tra xem module có _id hợp lệ không
    if (!module || !module._id) {
      console.error('Module is missing _id:', module);
      return null; // Skip rendering this module
    }

    const isActive = module._id === currentItems.moduleId;
    
    // Chuẩn bị render module ở mức cao
    return (
      <ListItem
        key={module._id}
        button
        component={Link}
        to={`/student/course/${courseId}/module/${module._id}`}
        sx={{
          py: 0.75,
          px: 2,
          backgroundColor: isActive ? '#e6f2ff' : 'transparent',
          '&:hover': { backgroundColor: '#e6f2ff' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {isModuleCompleted(module) ? (
            <CheckCircle sx={{ fontSize: 20, color: '#4caf50' }} />
          ) : (
            <RadioButtonUnchecked sx={{ fontSize: 20, color: '#6a6f73' }} />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography sx={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
              {module.title || `Module ${index + 1}`}
            </Typography>
          }
        />
      </ListItem>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        minHeight: 'calc(100vh - 56px)',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        position: 'fixed',
        top: 56,
        left: 0,
        overflowY: 'auto',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}  
    >
      {/* Course Name */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.2
          }}
        >
          {courseName}
        </Typography>
      </Box>

      {/* Course Material Section */}
      <Box sx={{ flex: 1 }}>
        <ListItem
          button
          onClick={handleCourseClick}
          sx={{
            py: 1,
            px: 2,
            backgroundColor: activeItem === 'Course Material' ? '#e6f2ff' : 'transparent',
            '&:hover': { backgroundColor: '#e6f2ff' },
          }}
        >
          <ListItemText
            primary={
              <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Course Material
              </Typography>
            }
          />
          {openCourse ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={openCourse} timeout="auto">
          <List component="div" disablePadding>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
                  {error}
                </Alert>
              </Box>
            ) : modules.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#6a6f73' }}>
                  No modules available
                </Typography>
              </Box>
            ) : (
              modules.map((module, index) => renderModule(module, index))
            )}
          </List>
        </Collapse>

        {/* Other Menu Items */}
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              component={Link}
              to={item.path}
              key={item.text}
              onClick={() => setActiveItem(item.text)}
              sx={{
                py: 1,
                px: 2,
                backgroundColor: activeItem === item.text ? '#e6f2ff' : 'transparent',
                '&:hover': { backgroundColor: '#e6f2ff' },
              }}
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    {item.text}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  )
}

export default Sidebar
