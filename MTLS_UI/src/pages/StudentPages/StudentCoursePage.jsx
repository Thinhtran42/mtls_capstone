import { useNavigate, useParams, useLocation } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Container,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  AssignmentTurnedIn,
  MenuBook,
  CheckCircle,
  ExpandLess,
  ExpandMore,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import Sidebar from '../../components/layout/students/Sidebar'
import {
  courseService,
  sectionService,
  lessonService,
  quizService,
  assignmentService
} from '../../api'
import { exerciseService } from '../../api/services/exercise.service'
import { baseApi } from '../../api/generated/baseApi'
import { CourseTimeline } from '../../components/common/CourseTimeline'

const StudentCoursePage = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        <ModuleContent />
      </Box>
    </Box>
  )
}

export function ModuleContent() {
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [course, setCourse] = useState(null)
  const [module, setModule] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openMenus, setOpenMenus] = useState({
    lessonContent: true,
    quizzes: true,
    exercises: true,
    assignments: true,
  })
  const [durations, setDurations] = useState({
    lessonContent: 0,
    exercises: 0,
    quizzes: 0,
    assignments: 0
  })

  // Thêm state để lưu trữ các lessons cho mỗi section
  const [sectionLessons, setSectionLessons] = useState({});
  const [lessonsLoading, setLessonsLoading] = useState({});
  // Thêm state để lưu trữ các quizzes, exercises và assignments
  const [sectionItems, setSectionItems] = useState({});
  const [itemsLoading, setItemsLoading] = useState({});

  // Thêm state mới để lưu trạng thái hoàn thành của các item
  const [completedItems, setCompletedItems] = useState({
    lessons: {},
    quizzes: {},
    exercises: {},
    assignments: {}
  });

  // Thêm state để theo dõi khi nào component được mount
  const [mountCount, setMountCount] = useState(0)

  // Thêm state để lưu trữ dữ liệu khóa học với tiến trình
  const [courseWithProgress, setCourseWithProgress] = useState(null)

  // Tăng mountCount lên khi component mount để trigger fetch dữ liệu
  useEffect(() => {
    setMountCount(prevCount => prevCount + 1)
    return () => {
      // Reset state khi component unmount để đảm bảo fetch dữ liệu mới khi quay lại
      setCourse(null)
      setModule(null)
      setSections([])
    }
  }, [location.pathname])

  // Chỉnh sửa hàm isItemCompleted để sử dụng trạng thái từ API
  const isItemCompleted = (type, itemId) => {
    if (!itemId) return false;

    // Sử dụng dữ liệu từ API mới
    if (courseWithProgress) {
      // Tìm module trong dữ liệu tiến trình
      const currentModule = courseWithProgress.modules.find(
        mod => mod._id === moduleId
      );

      if (currentModule) {
        // Tìm section có type tương ứng
        const section = currentModule.sections.find(sec =>
          sec.type.toUpperCase() === type.toUpperCase()
        );

        if (section && section.components) {
          // Tìm component có _id tương ứng và kiểm tra status
          const component = section.components.find(comp => comp._id === itemId);
          if (component) {
            return component.status === 'completed';
          }
        }
      }
    }

    // Quay lại cách cũ nếu không tìm thấy trong dữ liệu mới
    switch(type.toUpperCase()) {
      case 'LESSON':
      case 'VIDEO':
        return completedItems.lessons[itemId] === true;
      case 'QUIZ':
        return completedItems.quizzes[itemId] === true;
      case 'EXERCISE':
        return completedItems.exercises[itemId] === true;
      case 'ASSIGNMENT':
        return completedItems.assignments[itemId] === true;
      default:
        return false;
    }
  };

  // Thêm hàm để lấy trạng thái hoàn thành từ API
  const fetchCompletionStatus = async (studentId) => {
    try {
      // Lấy trạng thái hoàn thành lesson
      const lessonProgressResponse = await baseApi.lessonProgress.lessonProgressControllerFindAll({
        student: studentId
      });

      // Xử lý dữ liệu lesson progress
      const lessonsStatus = {};
      // Kiểm tra cấu trúc dữ liệu trả về
      const progressData = lessonProgressResponse?.data?.data ||
                         lessonProgressResponse?.data ||
                         [];

      // Đảm bảo dữ liệu là mảng trước khi sử dụng forEach
      if (Array.isArray(progressData)) {
        progressData.forEach(progress => {
          if (progress.status === true) {
            lessonsStatus[progress.lesson] = true;
          }
        });
      } else {
        console.warn('Lesson progress data is not an array:', progressData);
      }

      // Lấy trạng thái hoàn thành quiz - CÁCH MỚI
      // Chỉ lấy trạng thái các quiz trong section hiện tại
      const quizzesStatus = {};

      // Tìm tất cả quiz section trong sections
      const quizSections = sections.filter(section =>
        section.type && section.type.toUpperCase() === 'QUIZ'
      );

      // Lấy toàn bộ quiz items
      const quizItems = {};
      for (const section of quizSections) {
        if (sectionItems[section._id] && Array.isArray(sectionItems[section._id])) {
          sectionItems[section._id].forEach(item => {
            if (item._id) {
              quizItems[item._id] = true;
            }
          });
        }
      }


      // Kiểm tra trạng thái từng quiz
      for (const quizId of Object.keys(quizItems)) {
        try {
          // Sử dụng quizService thay vì gọi API trực tiếp
          const quizStatus = await quizService.getQuizStatus(studentId, quizId);

          if (quizStatus.completed === true) {
            quizzesStatus[quizId] = true;
          }
        } catch (error) {
          console.error(`Error checking status for quiz ${quizId}:`, error);
        }
      }

      // Lấy trạng thái hoàn thành exercise - CÁCH MỚI TƯƠNG TỰ QUIZ
      const exercisesStatus = {};

      // Tìm tất cả exercise section trong sections
      const exerciseSections = sections.filter(section =>
        section.type && section.type.toUpperCase() === 'EXERCISE'
      );

      // Lấy toàn bộ exercise items
      const exerciseItems = {};
      for (const section of exerciseSections) {
        if (sectionItems[section._id] && Array.isArray(sectionItems[section._id])) {
          sectionItems[section._id].forEach(item => {
            if (item._id) {
              exerciseItems[item._id] = true;
            }
          });
        }
      }

      console.log('Exercise items to check status:', Object.keys(exerciseItems));

      // Kiểm tra trạng thái từng exercise
      for (const exerciseId of Object.keys(exerciseItems)) {
        try {
          // Sử dụng exerciseService thay vì gọi API trực tiếp
          const exerciseStatus = await exerciseService.getExerciseStatus(studentId, exerciseId);

          if (exerciseStatus.completed === true) {
            exercisesStatus[exerciseId] = true;
          }
        } catch (error) {
          console.error(`Error checking status for exercise ${exerciseId}:`, error);
        }
      }

      // Lấy trạng thái hoàn thành assignment - GIỮ NGUYÊN CÁCH CŨ
      const assignmentsStatus = {};
      try {
        const doAssignmentsResponse = await baseApi.doAssignments.doAssignmentControllerFindAll({
          student: studentId
        });

        // Kiểm tra cấu trúc dữ liệu trả về
        const assignmentsData = doAssignmentsResponse?.data?.data ||
                              doAssignmentsResponse?.data ||
                              [];

        // Đảm bảo dữ liệu là mảng trước khi sử dụng forEach
        if (Array.isArray(assignmentsData)) {
          assignmentsData.forEach(doAssignment => {
            // Đánh dấu hoàn thành nếu đã được chấm và điểm >= 8
            if (doAssignment.isGraded && doAssignment.score >= 8) {
              assignmentsStatus[doAssignment.assignment] = true;
            }
          });
        } else {
          console.warn('Assignment completion data is not an array:', assignmentsData);
        }
      } catch (error) {
        console.error('Error fetching assignment completion:', error);
      }

      // Cập nhật state
      setCompletedItems({
        lessons: lessonsStatus,
        quizzes: quizzesStatus,
        exercises: exercisesStatus,
        assignments: assignmentsStatus
      });

    } catch (error) {
      console.error('Error fetching completion status:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Lấy user ID từ localStorage
        const studentId = localStorage.getItem('userId');

        if (!studentId || !courseId) {
          throw new Error('Student ID hoặc Course ID không hợp lệ');
        }

        // Sử dụng API mới để lấy khóa học kèm tiến trình
        const response = await courseService.getCourseWithProgress(courseId, studentId);
        const courseData = response?.data;

        if (!courseData) {
          throw new Error('Không tìm thấy dữ liệu khóa học');
        }

        // Lưu dữ liệu khóa học kèm tiến trình
        setCourseWithProgress(courseData);

        // Lưu thông tin khóa học
        setCourse(courseData);

        // Lưu courseId vào localStorage để RandomRatingModal có thể sử dụng
        localStorage.setItem('currentCourseId', courseId);

        // Tìm module hiện tại trong danh sách modules
        const foundModule = courseData.modules.find(m => m._id === moduleId);

        if (!foundModule) {
          throw new Error('Không tìm thấy module');
        }

        // Lưu thông tin module
        setModule(foundModule);

        // Lưu danh sách sections của module
        setSections(foundModule.sections || []);

        // Vẫn tiếp tục lấy trạng thái hoàn thành (cho khả năng tương thích ngược)
        if (studentId) {
          await fetchCompletionStatus(studentId);
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, moduleId, mountCount, location.key])

  // Thêm hàm để cập nhật duration của section
  const updateSectionDuration = async (sectionId, newDuration) => {
    try {
      await sectionService.updateSection(sectionId, {
        duration: newDuration
      });
    } catch (error) {
      console.error('Error updating section duration:', error);
    }
  };

  // Sửa lại useEffect tính duration để tự động cập nhật duration của section
  useEffect(() => {
    const calculateDurations = () => {
      const newDurations = {
        lessonContent: 0,
        exercises: 0,
        quizzes: 0,
        assignments: 0
      };

      sections.forEach(section => {
        const sectionId = section._id;
        const sectionType = section.type.toUpperCase();
        let totalSectionDuration = 0;

        // Tính duration cho lessons
        if (sectionType === 'LESSON' || sectionType === 'VIDEO') {
          const lessons = sectionLessons[sectionId] || [];
          const lessonDuration = lessons.reduce((sum, lesson) => {
            return sum + (parseInt(lesson.duration) || 0);
          }, 0);
          newDurations.lessonContent += lessonDuration;
          totalSectionDuration = lessonDuration;
        }

        // Tính duration cho các items khác
        const items = sectionItems[sectionId] || [];
        const itemsDuration = items.reduce((sum, item) => {
          return sum + (parseInt(item.duration) || 0);
        }, 0);

        // Cộng duration vào loại tương ứng
        switch (sectionType) {
          case 'EXERCISE':
            newDurations.exercises += itemsDuration;
            totalSectionDuration = itemsDuration;
            break;
          case 'QUIZ':
            newDurations.quizzes += itemsDuration;
            totalSectionDuration = itemsDuration;
            break;
          case 'ASSIGNMENT':
            newDurations.assignments += itemsDuration;
            totalSectionDuration = itemsDuration;
            break;
        }

        // Cập nhật duration của section nếu khác với tổng thời gian hiện tại
        if (totalSectionDuration !== section.duration) {
          updateSectionDuration(sectionId, totalSectionDuration);
        }
      });

      setDurations(newDurations);
    };

    calculateDurations();
  }, [sections, sectionItems, sectionLessons]);

  // Format duration to display hours and minutes if duration >= 60
  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h ${remainingMinutes}m`
  }

  // Fetch lessons, quizzes, exercises và assignments cho mỗi section
  useEffect(() => {
    const fetchItemsForSections = async () => {
      if (!Array.isArray(sections) || sections.length === 0) return;

      // Tạo các trạng thái loading ban đầu
      const loadingLessonsState = {};
      const loadingItemsState = {};

      // Xử lý tất cả các loại section
      for (const section of sections) {
        const sectionId = section._id;
        const sectionType = (section.type || '').toUpperCase();

        if (sectionType === 'LESSON') {
          // Xử lý LESSON sections như trước đây
          loadingLessonsState[sectionId] = true;

          try {
            const response = await lessonService.getLessonsBySection(sectionId);

            // Kiểm tra cấu trúc response và xử lý tương ứng
            let lessons = [];
            if (response?.data) {
              if (Array.isArray(response.data)) {
                lessons = response.data;
              } else if (response.data.data && Array.isArray(response.data.data)) {
                lessons = response.data.data;
              } else if (response.data.lessons && Array.isArray(response.data.lessons)) {
                lessons = response.data.lessons;
              } else if (typeof response.data === 'object') {
                // Nếu là một object đơn lẻ, đặt vào mảng
                lessons = [response.data];
              }
            }

            setSectionLessons(prev => ({
              ...prev,
              [sectionId]: lessons
            }));
          } catch (error) {
            console.error(`Lỗi khi lấy lessons cho section ${sectionId}:`, error);
          } finally {
            loadingLessonsState[sectionId] = false;
          }
        } else if (['QUIZ', 'EXERCISE', 'ASSIGNMENT'].includes(sectionType)) {
          // Xử lý các section khác
          loadingItemsState[sectionId] = true;

          try {
            let items = [];
            let response = null;

            // Gọi API tương ứng với loại section
            if (sectionType === 'QUIZ') {
              response = await quizService.getQuizBySectionId(sectionId);
            } else if (sectionType === 'EXERCISE') {
              response = await exerciseService.getExerciseBySectionId(sectionId);
            } else if (sectionType === 'ASSIGNMENT') {
              response = await assignmentService.getAssignmentsBySection(sectionId);
            }

            // Xử lý response một cách linh hoạt
            if (response) {
              if (response.data) {
                if (Array.isArray(response.data)) {
                  items = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                  items = response.data.data;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                  items = response.data.items;
                } else if (response.data.assignments && Array.isArray(response.data.assignments)) {
                  items = response.data.assignments;
                } else if (response.data.exercises && Array.isArray(response.data.exercises)) {
                  items = response.data.exercises;
                } else if (response.data.quizzes && Array.isArray(response.data.quizzes)) {
                  items = response.data.quizzes;
                } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                  // Nếu là object đơn lẻ
                  items = [response.data];
                }
              } else if (Array.isArray(response)) {
                // Trong trường hợp API trả về mảng trực tiếp
                items = response;
              }
            }

            console.log(`Processed ${sectionType} data:`, items);

            // Nếu response rỗng và đây là ASSIGNMENT, sử dụng mock data cho Final Exam
            // Chỉ để demo, trong production nên bỏ phần này
            if (items.length === 0 && sectionType === 'ASSIGNMENT') {
              items = [
                {
                  _id: `demo-assignment-${sectionId}`,
                  title: 'creative chords for r&b music',
                  duration: 60,
                  description: 'Assignment for practice'
                }
              ];
            }

            setSectionItems(prev => ({
              ...prev,
              [sectionId]: items
            }));
          } catch (error) {
            console.error(`Lỗi khi lấy items cho section ${sectionId}:`, error);

            // Trong trường hợp lỗi cho ASSIGNMENT, sử dụng mock data cho Final Exam
            // Chỉ để demo, trong production nên bỏ phần này
            if (sectionType === 'ASSIGNMENT') {
              const items = [
                {
                  _id: `demo-assignment-${sectionId}`,
                  title: 'creative chords for r&b music',
                  duration: 60,
                  description: 'Assignment for practice'
                }
              ];
              setSectionItems(prev => ({
                ...prev,
                [sectionId]: items
              }));
            }
          } finally {
            loadingItemsState[sectionId] = false;
          }
        }
      }

      // Cập nhật trạng thái loading
      setLessonsLoading(loadingLessonsState);
      setItemsLoading(loadingItemsState);
    };

    // Chỉ fetch khi có sections
    if (sections.length > 0) {
      fetchItemsForSections();
    }
  }, [sections]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  // Tạo hàm mới để nhóm các section theo loại
  const groupSectionsByType = () => {
    if (!Array.isArray(sections) || sections.length === 0) return [];

    // Phân tích tất cả section để tạo mapping dựa trên loại và tên đặc biệt
    const titleMapping = {};

    // Map các loại section tới tên hiển thị từ dữ liệu section
    sections.forEach(section => {
      if (!section || typeof section !== 'object') return;

      const sectionType = (section.type || '').toUpperCase();

      // Nếu chưa có mapping cho loại này, lưu lại tên hiển thị dựa trên title
      if (!titleMapping[sectionType]) {
        // Kiểm tra các tên đặc biệt
        if (sectionType === 'QUIZ' && section.title && section.title.includes('Basic')) {
          titleMapping[sectionType] = 'Quiz Basic';
        }
        else if (sectionType === 'ASSIGNMENT' && section.title && section.title.includes('Final')) {
          titleMapping[sectionType] = 'Final Exam';
        }
        else {
          titleMapping[sectionType] = section.title || getDefaultSectionTitle(sectionType);
        }
      }
    });

    // Nhóm các section theo type
    const groupedSections = {};

    sections.forEach(section => {
      if (!section || typeof section !== 'object') return;

      // Lấy loại section
      const sectionType = (section.type || '').toUpperCase();

      // Tạo key cho nhóm dựa trên type
      if (!groupedSections[sectionType]) {
        groupedSections[sectionType] = {
          type: sectionType,
          // Sử dụng mapping đã tạo, nếu không có thì dùng tên mặc định
          title: titleMapping[sectionType] || getDefaultSectionTitle(sectionType),
          sections: []
        };
      }

      // Thêm section vào nhóm
      groupedSections[sectionType].sections.push(section);
    });

    // Sửa đổi title của các nhóm đặc biệt dựa trên thứ tự xuất hiện (giống teacher)
    // Mục đích là đảm bảo hiển thị "Quiz Basic" thay vì "Quiz" và "Final Exam" thay vì "Assignment"
    // nếu section có title tương ứng
    if (groupedSections['QUIZ']) {
      const quizzes = groupedSections['QUIZ'].sections;
      // Tìm section có title chứa "Basic"
      const basicQuiz = quizzes.find(q => q.title && q.title.includes('Basic'));
      if (basicQuiz) {
        groupedSections['QUIZ'].title = 'Quiz Basic';
      }
    }

    if (groupedSections['ASSIGNMENT']) {
      const assignments = groupedSections['ASSIGNMENT'].sections;
      // Tìm section có title chứa "Final"
      const finalExam = assignments.find(a => a.title && a.title.includes('Final'));
      if (finalExam) {
        groupedSections['ASSIGNMENT'].title = 'Final Exam';
      }
    }

    // Chuyển đổi object thành mảng và sắp xếp theo thứ tự ưu tiên
    return Object.values(groupedSections).sort((a, b) => {
      // Thứ tự ưu tiên: Lesson/Video > Quiz > Exercise > Assignment > others
      const typeOrder = {
        'LESSON': 1,
        'VIDEO': 1,
        'QUIZ': 2,
        'EXERCISE': 3,
        'ASSIGNMENT': 4
      };

      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    });
  };

  // Hàm lấy tiêu đề mặc định nếu không có tiêu đề từ API
  const getDefaultSectionTitle = (type) => {
    switch (type) {
      case 'LESSON':
      case 'VIDEO':
        return 'Lesson Content';
      case 'QUIZ':
        return 'Quiz';
      case 'EXERCISE':
        return 'Exercise';
      case 'ASSIGNMENT':
        return 'Assignment';
      default:
        return 'Learning Materials';
    }
  };

  // Render một nhóm section
  const renderSectionGroup = (group) => {
    if (!group || !Array.isArray(group.sections) || group.sections.length === 0) {
      return null;
    }

    return (
      <Paper
        key={group.type}
        elevation={1}
        sx={{
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          mb: 3,
        }}
      >
        <ListItem
          button
          onClick={() =>
            setOpenMenus((prev) => ({ ...prev, [group.type]: !prev[group.type] }))
          }
          sx={{
            borderRadius: '8px 8px 0 0',
            '&:hover': {
              backgroundColor: '#D9EEFB',
            },
          }}
        >
          <ListItemText
            primary={group.title}
            primaryTypographyProps={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          />
          {openMenus[group.type] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openMenus[group.type] ?? true} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            sx={{
              backgroundColor: '#FAFAFA',
              borderRadius: '0 0 8px 8px',
            }}
          >
            {group.sections.map((section) => {
              const sectionType = (section.type || '').toUpperCase();
              const sectionId = section._id || `section-${Math.random()}`;

              // Nội dung items dựa vào loại section
              const renderItems = () => {
                // Kiểm tra nếu có components từ API mới
                if (section.components && Array.isArray(section.components) && section.components.length > 0) {
                  return section.components.map((component) => (
                    <ListItem
                      key={component._id || `component-${Math.random()}`}
                      button
                      onClick={() => {
                        if (sectionType === 'LESSON' || sectionType === 'VIDEO') {
                          handleLessonClick(component._id);
                        } else if (sectionType === 'QUIZ') {
                          handleQuizClick(component._id);
                        } else if (sectionType === 'EXERCISE') {
                          handleExerciseClick(component._id);
                        } else if (sectionType === 'ASSIGNMENT') {
                          handleAssignmentClick(component._id);
                        }
                      }}
                      sx={{
                        pl: 8,
                        backgroundColor: '#F5F5F5',
                        '&:hover': {
                          backgroundColor: '#EEF6FC',
                        },
                        borderBottom: '1px solid #eee',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        {component.status === 'completed' ? (
                          <CheckCircle sx={{ fontSize: '0.9rem', color: '#4caf50' }} />
                        ) : sectionType === 'QUIZ' ? (
                          <QuizIcon sx={{ fontSize: '0.9rem', color: '#9c27b0' }} />
                        ) : sectionType === 'LESSON' || sectionType === 'VIDEO' ? (
                          <MenuBook sx={{ fontSize: '0.9rem', color: '#1976d2' }} />
                        ) : sectionType === 'EXERCISE' ? (
                          <AssignmentIcon sx={{ fontSize: '0.9rem', color: '#ff9800' }} />
                        ) : (
                          <AssignmentIcon sx={{ fontSize: '0.9rem', color: '#2196f3' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={component.title}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                        }}
                        secondary={
                          component.description ? component.description.substring(0, 50) : null
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(parseInt(component.duration) || 0)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ));
                }

                // Fallback to the existing implementation if no components found
                if (sectionType === 'LESSON') {
                  // Xử lý lessons
                  if (lessonsLoading[sectionId]) {
                    return (
                      <ListItem key={`loading-${sectionId}`} sx={{ pl: 8 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          Đang tải bài học...
                        </Typography>
                      </ListItem>
                    );
                  }

                  if (sectionLessons[sectionId]?.length > 0) {
                    return sectionLessons[sectionId].map((lesson) => (
                      <ListItem
                        key={lesson._id || `lesson-${Math.random()}`}
                        button
                        onClick={() => handleLessonClick(lesson._id)}
                        sx={{
                          pl: 8,
                          backgroundColor: '#F5F5F5',
                          '&:hover': {
                            backgroundColor: '#EEF6FC',
                          },
                          borderBottom: '1px solid #eee',
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          {isItemCompleted('LESSON', lesson._id) ? (
                            <CheckCircle sx={{ fontSize: '0.9rem', color: '#4caf50' }} />
                          ) : (
                            <MenuBook sx={{ fontSize: '0.9rem', color: '#1976d2' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.title}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                          }}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(parseInt(lesson.duration) || 0)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ));
                  }

                } else {
                  // Xử lý các loại item khác (quizzes, exercises, assignments)
                  if (itemsLoading[sectionId]) {
                    return (
                      <ListItem key={`loading-items-${sectionId}`} sx={{ pl: 8 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          Đang tải nội dung...
                        </Typography>
                      </ListItem>
                    );
                  }

                  if (sectionItems[sectionId]?.length > 0) {
                    return sectionItems[sectionId].map((item) => (
                      <ListItem
                        key={item._id || `item-${sectionType}-${Math.random()}`}
                        button
                        onClick={() => {
                          if (sectionType === 'QUIZ') {
                            handleQuizClick(item._id);
                          } else if (sectionType === 'EXERCISE') {
                            handleExerciseClick(item._id);
                          } else if (sectionType === 'ASSIGNMENT') {
                            handleAssignmentClick(item._id);
                          }
                        }}
                        sx={{
                          pl: 8,
                          backgroundColor: '#F5F5F5',
                          '&:hover': {
                            backgroundColor: '#EEF6FC',
                          },
                          borderBottom: '1px solid #eee',
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          {isItemCompleted(sectionType, item._id) ? (
                            <CheckCircle sx={{ fontSize: '0.9rem', color: '#4caf50' }} />
                          ) : sectionType === 'QUIZ' ? (
                            <QuizIcon sx={{ fontSize: '0.9rem', color: '#9c27b0' }} />
                          ) : sectionType === 'EXERCISE' ? (
                            <AssignmentIcon sx={{ fontSize: '0.9rem', color: '#ff9800' }} />
                          ) : (
                            <AssignmentIcon sx={{ fontSize: '0.9rem', color: '#2196f3' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                          }}
                          secondary={
                            sectionType === 'QUIZ' && item.questionCount !== undefined ?
                              `${item.questionCount} câu hỏi` : null
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(parseInt(item.duration) || 0)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ));
                  }
                }
              };

              return (
                <React.Fragment key={sectionId}>
                  {renderItems()}
                </React.Fragment>
              );
            })}
          </List>
        </Collapse>
      </Paper>
    );
  };

  // Render các section khi không có dữ liệu
  const renderNoDataSection = () => {
    return (
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          mb: 3,
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary" mb={2}>
          Chưa có nội dung học tập
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Các bài học đang được chuẩn bị. Vui lòng quay lại sau.
        </Typography>
      </Paper>
    );
  };

  // Thêm hàm xử lý khi click vào lesson bên trong section
  const handleLessonClick = (lessonId) => {
    // Navigate đến trang lesson với đường dẫn mới
    navigate(`/learning/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);
  };

  const handleQuizClick = (quizId) => {
    // Navigate đến trang lesson với lessonId
    navigate(`/student/course/${courseId}/module/${moduleId}/quiz/${quizId}`);
  };

  const handleExerciseClick = (exerciseId) => {
    // Navigate đến trang lesson với lessonId
    navigate(`/student/course/${courseId}/module/${moduleId}/exercise/${exerciseId}`);
  };
  const handleAssignmentClick = (assignmentId) => {
    // Navigate đến trang lesson với lessonId
    navigate(`/student/course/${courseId}/module/${moduleId}/assignment/${assignmentId}`);
  };

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', width: '80vw' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: '1600px',
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{
            maxWidth: '1400px',
            margin: '0 auto',
            justifyContent: 'center',
          }}
        >
          <Grid
            item
            xs={12}
            md={8}
            lg={7}
            sx={{
              maxWidth: '800px',
            }}
          >
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                fontWeight="bold"
                sx={{ color: '#1976d2', mb: 2 }}
              >
                {course?.title || 'Khóa học'}
              </Typography>

              <Typography
                variant="h5"
                gutterBottom
                fontWeight="bold"
                mb={3}
              >
                {module?.title || 'Module'}
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={4}
                mb={3}
                sx={{ justifyContent: 'center' }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <AssignmentTurnedIn sx={{ color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    {formatDuration(durations.exercises)} of exercise
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <MenuBook sx={{ color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    {formatDuration(durations.lessonContent)} of lesson content
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <QuizIcon sx={{ color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    {formatDuration(durations.quizzes)} of quizzes
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body1" color="text.secondary" mb={3}>
                {module?.description || 'There is no description for this module.'}
              </Typography>

              {sections && sections.length > 0 ? (
                <>
                  {groupSectionsByType().map(group => (
                    <React.Fragment key={group.type}>
                      {renderSectionGroup(group)}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                renderNoDataSection()
              )}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            sx={{
              position: { md: 'sticky' },
              top: { md: 24 },
              height: { md: 'fit-content' },
              alignSelf: { md: 'flex-start' },
              marginLeft: '200px',
              marginRight: '0',
            }}
          >
            <CourseTimeline />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default StudentCoursePage
