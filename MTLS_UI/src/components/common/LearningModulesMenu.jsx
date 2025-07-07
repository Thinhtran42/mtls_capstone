import { Box, IconButton, List, ListItem, Typography, CircularProgress, Button } from '@mui/material'
import { useState, useEffect } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
// Thay thế import dữ liệu tĩnh bằng các service
import { courseService } from '../../api/services/course.service'
import { moduleService } from '../../api/services/module.service'
import { sectionService } from '../../api/services/section.service'
import { lessonService } from '../../api/services/lesson.service'
import { quizService } from '../../api/services/quiz.service'
import { exerciseService } from '../../api/services/exercise.service'
import { assignmentService } from '../../api/services/assignment.service'
import {
  CheckCircle,
  Lock,
  Menu as MenuIcon,
  Book,
  OndemandVideo,
  Assignment,
  ExpandMore,
  ExpandLess,
  Quiz as QuizIcon,
} from '@mui/icons-material'
import { baseApi } from '../../api/generated/baseApi'

// Hàm sắp xếp sections theo thứ tự: Lesson/Reading, Quiz, Exercise, Assignment
const sortSectionsByType = (sections) => {
  // Định nghĩa thứ tự ưu tiên của các loại
  const typeOrder = {
    'LESSON': 1,
    'READINGS': 1,
    'READING': 1,
    'VIDEO': 1,
    'QUIZ': 2,
    'EXERCISE': 3,
    'ASSIGNMENT': 4
  };

  // Sắp xếp mảng sections dựa trên thứ tự ưu tiên
  return [...sections].sort((a, b) => {
    const typeA = (a.type || '').toUpperCase();
    const typeB = (b.type || '').toUpperCase();

    const orderA = typeOrder[typeA] || 999; // Các loại không xác định đặt ở cuối
    const orderB = typeOrder[typeB] || 999;

    return orderA - orderB;
  });
};

// Thêm hàm isValidObjectId nếu chưa có
const isValidObjectId = (id) => {
  return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

const LearningModulesMenu = (/*{ fullWidth = false }*/) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { courseId, moduleId, lessonId, quizId, exerciseId, assignmentId } = useParams()
  const [menuOpen, setMenuOpen] = useState(true)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentModule, setCurrentModule] = useState(null)
  const [sections, setSections] = useState([])
  const [expandedSections, setExpandedSections] = useState({})
  const [courseProgress, setCourseProgress] = useState(null)

  const isDoingQuizPage = location.pathname.includes('/doing-quiz');
  const isDoingExercisePage = location.pathname.includes('/doing-exercise');

  console.log('LearningModulesMenu rendered with:', { courseId, moduleId });

  // *** Define fetchSectionItems here as it's needed by fetchModuleData effect ***
  // Note: Defining functions inside the component like this can cause re-creation on each render.
  // Consider useCallback if performance becomes an issue.
  const fetchSectionItems = async (section) => {
    if (!section || !section._id) return [];
    const sectionId = section._id;
    console.log(`Fetching items for section: ${section.title} (${sectionId}) type: ${section.type}`);
    try {
      let items = [];
      switch(section.type.toUpperCase()) {
        case 'LESSON':
          const lessonsResponse = await lessonService.getLessonsBySection(sectionId);
          console.log(`API response for lessons in section ${sectionId}:`, lessonsResponse);

          // Kiểm tra và trích xuất dữ liệu từ các cấu trúc response khác nhau
          if (lessonsResponse) {
            let extractedLessons = [];

            // Kiểm tra cấu trúc data.lessons[array]
            if (lessonsResponse.data && lessonsResponse.data.lessons && Array.isArray(lessonsResponse.data.lessons)) {
              extractedLessons = lessonsResponse.data.lessons;
            }
            // Kiểm tra cấu trúc data[array]
            else if (lessonsResponse.data && Array.isArray(lessonsResponse.data)) {
              extractedLessons = lessonsResponse.data;
            }
            // Kiểm tra cấu trúc lessons[array]
            else if (lessonsResponse.lessons && Array.isArray(lessonsResponse.lessons)) {
              extractedLessons = lessonsResponse.lessons;
            }
            // Nếu là đối tượng đơn (không phải mảng)
            else if (lessonsResponse.data && !Array.isArray(lessonsResponse.data)) {
              extractedLessons = [lessonsResponse.data];
            }
            // Trường hợp response trực tiếp là lesson object
            else if (lessonsResponse._id) {
              extractedLessons = [lessonsResponse];
            }

            console.log(`Extracted ${extractedLessons.length} lessons:`, extractedLessons);
            items = extractedLessons;
          }
          break;

        case 'QUIZ':
          const quizzesResponse = await quizService.getQuizzesBySection(sectionId);
          console.log(`API response for quizzes in section ${sectionId}:`, quizzesResponse);

          // Kiểm tra và trích xuất dữ liệu từ các cấu trúc response khác nhau
          if (quizzesResponse) {
            let extractedQuizzes = [];

            // Kiểm tra cấu trúc data.quizzes[array]
            if (quizzesResponse.data && quizzesResponse.data.quizzes && Array.isArray(quizzesResponse.data.quizzes)) {
              extractedQuizzes = quizzesResponse.data.quizzes;
            }
            // Kiểm tra cấu trúc data[array]
            else if (quizzesResponse.data && Array.isArray(quizzesResponse.data)) {
              extractedQuizzes = quizzesResponse.data;
            }
            // Kiểm tra cấu trúc quizzes[array]
            else if (quizzesResponse.quizzes && Array.isArray(quizzesResponse.quizzes)) {
              extractedQuizzes = quizzesResponse.quizzes;
            }
            // Nếu là đối tượng đơn (không phải mảng)
            else if (quizzesResponse.data && !Array.isArray(quizzesResponse.data)) {
              extractedQuizzes = [quizzesResponse.data];
            }
            // Trường hợp response trực tiếp là quiz object
            else if (quizzesResponse._id) {
              extractedQuizzes = [quizzesResponse];
            }

            console.log(`Extracted ${extractedQuizzes.length} quizzes:`, extractedQuizzes);
            items = extractedQuizzes;
          }
          break;

        case 'EXERCISE':
          console.log(`Fetching exercises for section ${sectionId} using direct API call`);

          try {
            // Tạo một mảng để lưu tất cả các phương thức lấy dữ liệu exercise
            const fetchMethods = [
              // Phương thức 1: gọi trực tiếp API endpoint
              async () => {
                try {
                  console.log(`Method 1: Direct API call to /exercises/section/${sectionId}`);
                  const response = await baseApi.instance.get(`/exercises/section/${sectionId}`);
                  console.log('Direct API response:', response);
                  return response.data;
                } catch (e) {
                  console.log('Method 1 failed:', e);
                  return null;
                }
              },

              // Phương thức 2: sử dụng exerciseService.getExercisesBySection
              async () => {
                try {
                  console.log(`Method 2: Using exerciseService.getExercisesBySection`);
                  const response = await exerciseService.getExercisesBySection(sectionId);
                  console.log('getExercisesBySection response:', response);
                  return response;
                } catch (e) {
                  console.log('Method 2 failed:', e);
                  return null;
                }
              },

              // Phương thức 3: sử dụng exerciseService.getExerciseBySectionId
              async () => {
                try {
                  console.log(`Method 3: Using exerciseService.getExerciseBySectionId`);
                  const response = await exerciseService.getExerciseBySectionId(sectionId);
                  console.log('getExerciseBySectionId response:', response);
                  return response;
                } catch (e) {
                  console.log('Method 3 failed:', e);
                  return null;
                }
              },

              // Phương thức 4: gọi trực tiếp API endpoint với controller
              async () => {
                try {
                  console.log(`Method 4: Using baseApi.exercises.exerciseControllerFindBySectionId`);
                  // Đảm bảo sectionId là chuỗi
                  const id = typeof sectionId === 'object' ? sectionId._id : sectionId;
                  const response = await baseApi.exercises.exerciseControllerFindBySectionId(id);
                  console.log('exerciseControllerFindBySectionId response:', response);
                  return response.data;
                } catch (e) {
                  console.log('Method 4 failed:', e);
                  return null;
                }
              },

              // Phương thức 5: lấy tất cả exercises và lọc theo sectionId
              async () => {
                try {
                  console.log(`Method 5: Fetching all exercises and filtering by sectionId`);
                  const response = await baseApi.instance.get('/exercises');
                  console.log('All exercises response:', response);

                  if (response && response.data) {
                    const data = response.data.data || response.data;
                    const exercises = Array.isArray(data) ? data : [];

                    // Lọc các exercises theo sectionId
                    const filteredExercises = exercises.filter(ex =>
                      ex.section === sectionId ||
                      (ex.section && ex.section._id === sectionId)
                    );

                    console.log(`Found ${filteredExercises.length} exercises for section ${sectionId}:`, filteredExercises);
                    return filteredExercises;
                  }
                  return null;
                } catch (e) {
                  console.log('Method 5 failed:', e);
                  return null;
                }
              }
            ];

            // Thử lần lượt từng phương thức cho đến khi có kết quả
            let exercisesData = null;
            for (let i = 0; i < fetchMethods.length; i++) {
              console.log(`Trying fetch method ${i + 1}...`);
              exercisesData = await fetchMethods[i]();

              // Nếu có dữ liệu và không phải là mảng rỗng, dừng việc thử
              if (exercisesData &&
                  (!Array.isArray(exercisesData) || exercisesData.length > 0)) {
                console.log(`Method ${i + 1} succeeded!`);
                break;
              }
            }

            // Xử lý kết quả
            if (!exercisesData ||
                (Array.isArray(exercisesData) && exercisesData.length === 0)) {

              console.log(`No exercises found via API, creating placeholder`);
              // Tạo một exercise giả để hiển thị
              items = [{
                _id: `exercise-${sectionId}`,
                title: 'Exercise',
                description: 'Complete this exercise',
                type: 'EXERCISE',
                duration: 30,
                status: 'incomplete'
              }];
            } else {
              // Trích xuất dữ liệu từ response
              let extractedExercises = [];

              // Kiểm tra cấu trúc data.exercises[array]
              if (exercisesData.data && exercisesData.data.exercises && Array.isArray(exercisesData.data.exercises)) {
                extractedExercises = exercisesData.data.exercises;
              }
              // Kiểm tra cấu trúc data[array]
              else if (exercisesData.data && Array.isArray(exercisesData.data)) {
                extractedExercises = exercisesData.data;
              }
              // Kiểm tra cấu trúc exercises[array]
              else if (exercisesData.exercises && Array.isArray(exercisesData.exercises)) {
                extractedExercises = exercisesData.exercises;
              }
              // Nếu là đối tượng đơn (không phải mảng)
              else if (exercisesData.data && !Array.isArray(exercisesData.data)) {
                extractedExercises = [exercisesData.data];
              }
              // Trường hợp response trực tiếp là exercise object
              else if (exercisesData._id) {
                extractedExercises = [exercisesData];
              }
              // Trường hợp response là mảng
              else if (Array.isArray(exercisesData)) {
                extractedExercises = exercisesData;
              }

              // Đảm bảo mỗi exercise có type đúng và các trường cần thiết
              extractedExercises = extractedExercises.map(ex => ({
                ...ex,
                _id: ex._id || `exercise-${Math.random().toString(36).substr(2, 9)}`,
                title: ex.title || 'Exercise',
                description: ex.description || 'Complete this exercise',
                type: ex.type || 'EXERCISE',
                duration: ex.duration || 30,
                status: ex.status || 'incomplete'
              }));

              console.log(`Extracted ${extractedExercises.length} exercises:`, extractedExercises);

              // Nếu không có kết quả sau khi trích xuất, tạo một mục giả
              if (extractedExercises.length === 0) {
                items = [{
                  _id: `exercise-${sectionId}`,
                  title: 'Exercise',
                  description: 'Complete this exercise',
                  type: 'EXERCISE',
                  duration: 30,
                  status: 'incomplete'
                }];
              } else {
                items = extractedExercises;
              }
            }
          } catch (error) {
            console.error(`Error fetching exercises for section ${sectionId}:`, error);
            // Nếu có lỗi, tạo một mục giả
            items = [{
              _id: `exercise-${sectionId}`,
              title: 'Exercise',
              description: 'Complete this exercise',
              type: 'EXERCISE',
              duration: 30,
              status: 'incomplete'
            }];
          }

          break;

        case 'ASSIGNMENT':
          try { // Ensure specific try...catch for assignment fetching
            console.log(`Fetching assignments for section ${sectionId}`);
            // *** Ensure this calls the correct service method to get assignments by section ***
            const assignmentsResponse = await assignmentService.getAssignmentsBySection(sectionId);
            console.log(`RAW API response for assignments in section ${sectionId}:`, JSON.stringify(assignmentsResponse, null, 2));

            if (assignmentsResponse) {
              let extractedAssignments = [];
              // Try different potential response structures
              if (assignmentsResponse?.data?.data && Array.isArray(assignmentsResponse.data.data)) {
                  extractedAssignments = assignmentsResponse.data.data;
              } else if (assignmentsResponse?.data?.assignments && Array.isArray(assignmentsResponse.data.assignments)) {
                extractedAssignments = assignmentsResponse.data.assignments;
              } else if (assignmentsResponse?.data && Array.isArray(assignmentsResponse.data)) {
                extractedAssignments = assignmentsResponse.data;
              } else if (assignmentsResponse?.assignments && Array.isArray(assignmentsResponse.assignments)) {
                extractedAssignments = assignmentsResponse.assignments;
              } else if (assignmentsResponse?._id && typeof assignmentsResponse === 'object' && !Array.isArray(assignmentsResponse)) { // Handle single object response
                extractedAssignments = [assignmentsResponse];
              } else if (Array.isArray(assignmentsResponse)) { // Handle direct array response
                 extractedAssignments = assignmentsResponse;
              }

              console.log(`Extracted ${extractedAssignments.length} assignments:`, extractedAssignments);
              items = extractedAssignments;
            } else {
               console.log(`No response received from assignmentService for section ${sectionId}`);
               items = []; // Set empty if no response
            }
          } catch (assignmentError) {
             console.error(`Error explicitly fetching assignments for section ${sectionId}:`, assignmentError);
             items = []; // Set empty on error
          }
          break;

        default:
          // Nếu không xác định được loại, thử lấy lessons (mặc định)
          const defaultResponse = await lessonService.getLessonsBySection(sectionId);
          console.log(`API response for default items in section ${sectionId}:`, defaultResponse);

          // Kiểm tra và trích xuất dữ liệu từ các cấu trúc response khác nhau
          if (defaultResponse) {
            let extractedItems = [];

            // Kiểm tra cấu trúc data.items[array]
            if (defaultResponse.data && defaultResponse.data.items && Array.isArray(defaultResponse.data.items)) {
              extractedItems = defaultResponse.data.items;
            }
            // Kiểm tra cấu trúc data[array]
            else if (defaultResponse.data && Array.isArray(defaultResponse.data)) {
              extractedItems = defaultResponse.data;
            }
            // Kiểm tra các cấu trúc khác
            else if (defaultResponse.items && Array.isArray(defaultResponse.items)) {
              extractedItems = defaultResponse.items;
            }
            else if (defaultResponse.lessons && Array.isArray(defaultResponse.lessons)) {
              extractedItems = defaultResponse.lessons;
            }
            // Nếu là đối tượng đơn (không phải mảng)
            else if (defaultResponse.data && !Array.isArray(defaultResponse.data)) {
              extractedItems = [defaultResponse.data];
            }
            // Trường hợp response trực tiếp là item object
            else if (defaultResponse._id) {
              extractedItems = [defaultResponse];
            }

            console.log(`Extracted ${extractedItems.length} default items:`, extractedItems);
            items = extractedItems;
          }
      }

      // Chuẩn hóa dữ liệu items
      return items.map(item => {
        // Xác định đúng loại item
        let itemType = item.type;

        // Nếu không có type hoặc type không rõ ràng, sử dụng section type
        if (!itemType || itemType === '') {
          itemType = section.type;
        }

        return {
        _id: item._id,
        title: item.title || 'Untitled Item',
        description: item.description || '',
          type: itemType,
        duration: item.duration || 0,
        status: item.status || 'incomplete'
        };
      });

    } catch (error) {
      console.error(`Error fetching items for section ${sectionId}:`, error);
      return [];
    }
  };

  // Helper để kiểm tra component đã hoàn thành hay chưa
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

  // Helper function để kiểm tra section đã hoàn thành chưa
  const isSectionCompleted = (section) => {
    if (!section) {
      console.log('Section is null or undefined');
      return false;
    }

    console.log(`Checking completion for section: ${section.title || section._id}`);

    // Kiểm tra từ dữ liệu tiến trình
    if (courseProgress && courseProgress.modules) {
      // Tìm module chứa section này
      const progressModule = courseProgress.modules.find(m => m._id === moduleId);

      if (progressModule && progressModule.sections) {
        // Tìm section trong module
        const progressSection = progressModule.sections.find(s => s._id === section._id);

        if (progressSection) {
          console.log(`Found matching section in courseProgress for ${section.title || section._id}`);

          // Nếu tất cả components trong section đều 'completed'
          if (progressSection.components && Array.isArray(progressSection.components)) {
            console.log(`Section ${section.title || section._id} has ${progressSection.components.length} components to check`);
            let allComponentsCompleted = true;
            let hasComponents = false;
            let totalComponents = 0;
            let completedComponents = 0;

            for (const component of progressSection.components) {
              if (component) {
                hasComponents = true;
                totalComponents++;

                if (isComponentCompleted(component)) {
                  completedComponents++;
                } else {
                  allComponentsCompleted = false;
                  console.log(`Found incomplete component in section ${section.title || section._id}: ${component.title || component._id}`);
                }
              }
            }

            console.log(`Section ${section.title || section._id}: ${completedComponents}/${totalComponents} components completed`);

            if (hasComponents && allComponentsCompleted && totalComponents > 0) {
              console.log(`All components in section ${section.title || section._id} are completed!`);
              return true;
            }
          }
        }
      }
    }

    // Kiểm tra trực tiếp nếu có thuộc tính status
    if (section.status === 'complete') {
      return true;
    }

    // Kiểm tra items trong section
    if (section.items && Array.isArray(section.items) && section.items.length > 0) {
      const allItemsCompleted = section.items.every(item => item.status === 'complete');
      return allItemsCompleted;
    }

    return false;
  };

  // Helper function để kiểm tra item đã hoàn thành chưa
  const isItemCompleted = (item) => {
    if (!item) return false;

    // Check item status directly
    if (item.status === 'complete' || item.status === 'completed') return true;
    if (item.isCompleted === true) return true;

    // Type-specific checks
    if (item.type?.toUpperCase().includes('ASSIGNMENT') && item.isSubmitted === true) return true;
    if (item.type?.toUpperCase().includes('QUIZ') && item.isPassed === true) return true;
    if (item.type?.toUpperCase().includes('LESSON') && (item.isViewed === true || item.viewCount > 0)) return true;

    // Check from course progress data if available
    if (courseProgress && courseProgress.modules) {
      // Find the module
      const progressModule = courseProgress.modules.find(m => m._id === moduleId);

      if (progressModule && progressModule.sections) {
        // Iterate through all sections to find matching component
        for (const section of progressModule.sections) {
          if (section.components && Array.isArray(section.components)) {
            const component = section.components.find(c => c._id === item._id);
            if (component && isComponentCompleted(component)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  useEffect(() => {
    if (isDoingQuizPage || isDoingExercisePage) return;
    const fetchCourseData = async () => {
      if (!courseId) return;

      setLoading(true);
      try {
        // Lấy user ID từ localStorage
        const studentId = localStorage.getItem('userId');

        if (!studentId) {
          console.error('Student ID không tìm thấy');
          return;
        }

        // Gọi API để lấy thông tin khóa học kèm tiến trình
        try {
          const progressResponse = await courseService.getCourseWithProgress(courseId, studentId);
          console.log('Progress response:', progressResponse);

          // Lấy dữ liệu từ response
          const progressData = progressResponse?.data || {};
          console.log('Progress data:', progressData);

          // Lưu dữ liệu vào state
          setCourseProgress(progressData);
        } catch (progressError) {
          console.error('Error fetching course progress:', progressError);
          // Tiếp tục lấy thông tin khóa học thông thường
          const courseData = await courseService.getCourseById(courseId);
          // Không hiển thị lỗi nếu module đã hiển thị đúng (chỉ set lỗi khi thực sự không có dữ liệu)
          if (!courseData && !currentModule) {
            setError('Không thể tải thông tin khóa học');
          }
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        // Chỉ set lỗi nếu module chưa được load
        if (!currentModule) {
        setError('Lỗi khi tải dữ liệu khóa học: ' + (err.message || 'Không xác định'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, isDoingQuizPage, isDoingExercisePage, currentModule]);

  useEffect(() => {
    if (isDoingQuizPage || isDoingExercisePage) return;
    const fetchModuleData = async () => {
      if (!moduleId) return;
      setLoading(true);
      try {
        console.log('Fetching module by ID:', moduleId);
        const moduleResponse = await moduleService.getModuleById(moduleId); // Use getModuleById
        console.log('Module API response:', moduleResponse);

        if (moduleResponse?.data) {
            const moduleObj = moduleResponse.data;
            console.log('Found module:', moduleObj);
            setCurrentModule(moduleObj);

            if (moduleObj.sections && Array.isArray(moduleObj.sections) && moduleObj.sections.length > 0) {
                console.log('Module has section IDs:', moduleObj.sections);
                // Fetch details for each section ID
                const sectionsWithDetails = await Promise.all(
                  moduleObj.sections.map(async (sectionId) => {
                    try {
                            console.log('Fetching details for section ID:', sectionId);
                      const sectionResponse = await sectionService.getSectionById(String(sectionId));
                            console.log(`Section ${sectionId} details response:`, sectionResponse);
                      if (sectionResponse?.data) {
                        const section = {
                          _id: sectionId,
                          title: sectionResponse.data.title || `Section`,
                          type: sectionResponse.data.type || 'readings',
                          duration: sectionResponse.data.duration || 5,
                                    items: [] // Initialize items
                                };
                                // Fetch items for this specific section
                                section.items = await fetchSectionItems(section);
                        return section;
                            } else {
                                console.warn(`No data found for section ${sectionId}`);
                                return null; // Return null if section fetch failed
                      }
                    } catch (err) {
                           console.error(`Error fetching section ${sectionId} details:`, err);
                           return null; // Return null on error
                    }
                  })
                );

                const validSections = sectionsWithDetails.filter(s => s !== null);
                console.log('Valid sections with items:', validSections);
                const sortedSections = sortSectionsByType(validSections);
                setSections(sortedSections);
            } else {
                 console.log('Module has no sections or sections array is empty.');
              setSections([]);
            }
          } else {
            console.error('Module not found in response or no data property');
            setCurrentModule(null);
            setSections([]);
            setError('Không tìm thấy thông tin module.');
        }
      } catch (err) {
        console.error('Error fetching module data:', err);
        setError('Lỗi khi tải dữ liệu module: ' + (err.message || 'Không xác định'));
      } finally {
        setLoading(false);
      }
    };
    fetchModuleData();
    // fetchSectionItems is now defined in component scope, no need to list as dependency if stable
  }, [moduleId, isDoingQuizPage, isDoingExercisePage]);

  useEffect(() => {
    if (sections.length > 0) {
      const initialExpandState = {};
      sections.forEach(section => {
        const sectionId = section._id || section.id || '';
        initialExpandState[sectionId] = true;
      });
      setExpandedSections(initialExpandState);
    }
    // Clear expanded state if sections become empty
    else {
        setExpandedSections({});
    }
  }, [sections]);

  // Auto expand section containing active item
  useEffect(() => {
    if (lessonId || quizId || exerciseId || assignmentId) {
      // Nếu người dùng đang xem một item cụ thể, tìm kiếm section chứa nó
      sections.forEach(section => {
        if (section.items && Array.isArray(section.items)) {
          const hasActiveItem = section.items.some(item => 
            (item._id === lessonId) || 
            (item._id === quizId) || 
            (item._id === exerciseId) || 
            (item._id === assignmentId)
          );
          
          if (hasActiveItem) {
            // Tự động mở rộng section chứa item đang active
            setExpandedSections(prev => ({
              ...prev,
              [section._id]: true
            }));
          }
        }
      });
    }
  }, [sections, lessonId, quizId, exerciseId, assignmentId]);

  // *** Debug state hook - Moved BEFORE early return ***
  useEffect(() => {
    console.log('Current state:', {
      loading,
      error,
      currentModule,
      sectionsCount: sections.length
    });
  }, [loading, error, currentModule, sections]);

  // *** Early return AFTER all hooks ***
  if (isDoingQuizPage || isDoingExercisePage) {
    return null;
  }

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const getSectionIcon = (section) => {
    if (isSectionCompleted(section)) {
      return <CheckCircle sx={{ fontSize: 20, color: '#4CAF50' }} />
    }
    switch (section.type) {
      case 'readings':
      case 'LESSON':
        return <Book sx={{ fontSize: 20, color: '#757575' }} />
      case 'video':
        return <OndemandVideo sx={{ fontSize: 20, color: '#757575' }} />
      case 'exercise':
      case 'EXERCISE':
        return <Assignment sx={{ fontSize: 20, color: '#757575' }} />
      case 'quiz':
      case 'QUIZ':
      case 'assignment':
      case 'ASSIGNMENT':
        return <Lock sx={{ fontSize: 20, color: '#757575' }} />
      default:
        return <Book sx={{ fontSize: 20, color: '#757575' }} />
    }
  }

  // Kiểm tra xem section có thể truy cập được không
  const isSectionAccessible = (index) => {
    // Section 0, 1, 2 luôn có thể truy cập
    if (index <= 3) return true;

    // Nếu section trước đó là completed, thì section này cũng được truy cập
    if (index > 0 && sections[index - 1]?.status === 'complete') {
      return true;
    }

    // Các section khác có thể truy cập bình thường (có thể điều chỉnh logic này)
    return true;
  }

  // Tạo link hợp lệ đến lesson/item
  const getLessonLink = (section, item) => {
    // Đảm bảo các ID được chuyển đúng định dạng
    const courseIdStr = courseId || '1';
    const moduleIdStr = moduleId || currentModule?._id || '1';
    const sectionIdStr = section?._id || 'unknown-section';

    // Lấy itemId, nếu không có thì dùng fallback
    const itemIdStr = item?._id || item?.id || 'unknown-item';

    console.log(`Building link for lesson: ${item?.title || 'Unknown'} in section ${section?.title || 'Unknown'}`, {
      courseId: courseIdStr,
      moduleId: moduleIdStr,
      sectionId: sectionIdStr,
      itemId: itemIdStr
    });

    // Xây dựng path URL dựa trên loại item
    if (item?.type?.toUpperCase().includes('ASSIGNMENT')) {
      return `/student/course/${courseIdStr}/module/${moduleIdStr}/assignment/${itemIdStr}`;
    } else if (item?.type?.toUpperCase().includes('QUIZ')) {
      return `/student/course/${courseIdStr}/module/${moduleIdStr}/quiz/${itemIdStr}`;
    } else if (item?.type?.toUpperCase().includes('EXERCISE')) {
      return `/student/course/${courseIdStr}/module/${moduleIdStr}/exercise/${itemIdStr}`;
    } else {
      // Mặc định là lesson
      return `/learning/course/${courseIdStr}/module/${moduleIdStr}/lesson/${itemIdStr}`;
    }
  };

  // Thêm hàm để toggle trạng thái mở/đóng của section
  const toggleSectionExpand = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Hàm retry khi gặp lỗi
  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  // Kiểm tra xem một item có đang được active không
  const isItemActive = (item) => {
    if (!item || !item._id) return false;
    
    // Lấy loại item và kiểm tra nếu ID của nó trùng với ID hiện tại trong URL
    const itemType = (item.type || '').toUpperCase();
    
    switch(itemType) {
      case 'LESSON':
      case 'READING':
      case 'VIDEO':
        return item._id === lessonId;
      case 'QUIZ':
        return item._id === quizId;
      case 'EXERCISE':
        return item._id === exerciseId;
      case 'ASSIGNMENT':
        return item._id === assignmentId;
      default:
        return false;
    }
  };

  // Tạo hàm kiểm tra xem section có chứa item đang active không
  const isSectionActive = (section) => {
    if (!section || !section.items || !Array.isArray(section.items)) return false;
    
    return section.items.some(item => 
      (item._id === lessonId) || 
      (item._id === quizId) || 
      (item._id === exerciseId) || 
      (item._id === assignmentId)
    );
  };

  // Hiển thị loading state
  if (loading && !currentModule && !sections.length) {
    return (
      <Box sx={{
        width: 400,
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Hiển thị thông báo lỗi
  if (error && !currentModule && !sections.length) {
    return (
      <Box sx={{
        width: 400,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        p: 2,
      }}>
        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  // Nếu không tìm thấy dữ liệu và không đang loading
  if (!currentModule && !loading) {
    console.log('No module found, creating a default one');
    // Tạo module mặc định và sections tạm thời
    setTimeout(() => {
      setCurrentModule({
        _id: moduleId || '1',
        title: `Module ${moduleId || '1'}`
      });
      setSections([]);
    }, 0);

    return (
      <Box sx={{
        width: 400,
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {!menuOpen && (
        <Box
          sx={{
            width: '48px',
            height: '100vh',
            backgroundColor: 'white',
            textAlign: 'center',
            pt: 2,
            zIndex: 900,
            position: 'absolute',
            margin: 0,
            padding: 0,
            paddingTop: 2,
            boxSizing: 'border-box',
            left: 0
          }}
        >
          <IconButton
            onClick={handleToggleMenu}
            sx={{
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              margin: 0,
              padding: 1
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          width: 300,  // Luôn giữ chiều rộng cố định
          height: '100vh',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',  // Chỉ chuyển đổi transform, không chuyển đổi width
          overflow: 'hidden',
          zIndex: 900,
          position: 'absolute',  // Thay vì relative
          left: 0,  // Giữ vị trí bên trái
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'normal',
            boxSizing: 'border-box',
            margin: 0
          }}
        >
          <IconButton
            onClick={handleToggleMenu}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            onClick={handleToggleMenu}
            sx={{
              color: '#1976d2',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Hide menu
          </Typography>
        </Box>

        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          py: 2,
          boxSizing: 'border-box',
          margin: 0
        }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Chỉ hiển thị lỗi nếu không có dữ liệu module và sections */}
          {error && !currentModule && sections.length === 0 && (
            <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRetry}
                sx={{ mt: 2 }}
              >
                Thử lại
              </Button>
            </Box>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h6'
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                mb: 2,
                color: '#333',
                whiteSpace: 'normal',
              }}
            >
              {currentModule.title || 'Module has no title'}
            </Typography>

            <List sx={{ pl: 0 }}>
              {sections.length > 0 ? (
                sections.map((section, index) => {
                  const isAccessible = isSectionAccessible(index);

                  // Kiểm tra chi tiết và log các thuộc tính ID
                  console.log(`Section ${index} ID properties:`, {
                    _id: section._id,
                    id: section.id,
                    hasOwnProperty_id: Object.prototype.hasOwnProperty.call(section, '_id'),
                    hasOwnPropertyId: Object.prototype.hasOwnProperty.call(section, 'id'),
                    typeOf_id: typeof section._id,
                    typeOfId: typeof section.id
                  });

                  // Sử dụng _id hoặc id nếu khác null và undefined
                  // Nếu không có, mới sử dụng fallback
                  let sectionId;
                  if (section._id && section._id !== 'undefined' && section._id !== 'null') {
                    sectionId = section._id;
                  } else if (section.id && section.id !== 'undefined' && section.id !== 'null') {
                    sectionId = section.id;
                  } else {
                    sectionId = `section-${index}`;
                  }

                  // Log để debug
                  console.log(`Rendering section ${index}:`, {
                    useId: sectionId,
                    origId: section._id,
                    title: section.title,
                    type: section.type,
                    items: section.items || section.lessons || []
                  });

                  return (
                    <ListItem
                      key={sectionId}
                      sx={{
                        p: 0,
                        mb: 2,
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        whiteSpace: 'normal',
                        width: '100%',
                        opacity: isAccessible ? 1 : 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          position: 'relative',
                          pl: 4,
                          width: '100%',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            backgroundColor: isSectionActive(section) 
                              ? '#1976d2'
                              : location.pathname.includes(`/section/${sectionId}`)
                                ? '#1976d2'
                                : 'transparent',
                            borderRadius: 4,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            mr: 2,
                            mt: 0.5,
                            flexShrink: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onClick={() => toggleSectionExpand(sectionId)}
                        >
                          {getSectionIcon(section)}
                          {expandedSections[sectionId] ?
                            <ExpandLess sx={{ fontSize: 16, ml: 0.5 }} /> :
                            <ExpandMore sx={{ fontSize: 16, ml: 0.5 }} />
                          }
                        </Box>
                        <Box sx={{ width: 'calc(100% - 30px)' }}>
                          <Box
                            onClick={() => toggleSectionExpand(sectionId)}
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                              p: 1,
                              borderRadius: '4px',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.9rem',
                                color:
                                  section.status === 'complete' ? '#4CAF50' : '#000',
                                fontWeight: 'bold',
                                mb: 0.5,
                              }}
                            >
                              {section.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '0.8rem',
                                color: '#666',
                              }}
                            >
                              {section.duration || 0} min
                            </Typography>
                          </Box>

                          {/* Render các mục con của section trong dropdown */}
                          <Box
                            sx={{
                              ml: 1,
                              mt: 1,
                              borderLeft: '1px solid #ddd',
                              pl: 2,
                              height: expandedSections[sectionId] ? 'auto' : '0',
                              overflow: 'hidden',
                              transition: 'height 0.3s ease',
                              display: expandedSections[sectionId] ? 'block' : 'none',
                              backgroundColor: isSectionActive(section) ? '#f0f7ff' : 'transparent',
                              borderRadius: '0 0 8px 8px',
                              padding: isSectionActive(section) ? '8px' : '0',
                              margin: isSectionActive(section) ? '8px 0' : '0',
                              boxShadow: isSectionActive(section) ? '0 2px 4px rgba(25, 118, 210, 0.1)' : 'none',
                            }}
                          >
                            {section.items && section.items.length > 0 && (
                              <Box sx={{ /* styles */ }}>
                                {section.items.map((item, itemIndex) => {
                                  const itemId = item._id || item.id || `item-${itemIndex}`;
                                  const itemType = item.type?.toUpperCase() || '';

                                  // Xác định icon và label cho từng loại
                                  let itemIcon, itemLabel;
                                  if (itemType.includes('QUIZ')) {
                                    itemIcon = <QuizIcon sx={{ fontSize: 16, color: '#757575' }} />;
                                    itemLabel = 'Quiz:';
                                  } else if (itemType.includes('EXERCISE')) {
                                    itemIcon = <Assignment sx={{ fontSize: 16, color: '#757575' }} />;
                                    itemLabel = 'Exercise:';
                                  } else if (itemType.includes('ASSIGNMENT')) {
                                    itemIcon = <Lock sx={{ fontSize: 16, color: '#757575' }} />;
                                    itemLabel = 'Assignment:';
                                  } else {
                                    // Mặc định là lesson
                                    itemIcon = <Book sx={{ fontSize: 16, color: '#757575' }} />;
                                    itemLabel = 'Lesson:';
                                  }

                                  return (
                                    <Box
                                      key={itemId}
                                      component={Link}
                                      to={getLessonLink(section, item)}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        mb: 1.5,
                                        opacity: 1,
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        backgroundColor: isItemActive(item) ? '#e6f2ff' : 'transparent',
                                        p: 1,
                                        borderRadius: '4px',
                                        '&:hover': {
                                          backgroundColor: isItemActive(item) ? '#d0e7ff' : '#f5f5f5',
                                        }
                                      }}
                                    >
                                      <Box sx={{ mr: 1, mt: 0.5, flexShrink: 0 }}>
                                        {isItemCompleted(item) ? (
                                          <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                                        ) : (
                                          itemIcon
                                        )}
                                      </Box>
                                      <Box>
                                        <Typography
                                          sx={{
                                            fontSize: '0.75rem',
                                            color: item.status === 'complete' ? '#4CAF50' : '#555',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          {itemLabel}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: '0.7rem',
                                            color: '#555',
                                            whiteSpace: 'normal',
                                            wordWrap: 'break-word',
                                          }}
                                        >
                                          {item.title || 'Untitled Item'}
                                        </Typography>
                                        {item.duration > 0 && (
                                          <Typography
                                            sx={{
                                              fontSize: '0.7rem',
                                              color: '#777',
                                            }}
                                          >
                                            {item.duration} min
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })
              ) : (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
                  No lessons available in this module.
                </Typography>
              )}
            </List>
          </Box>
        </Box>
      </Box>
    </>
  )
}

LearningModulesMenu.propTypes = {
  // No props expected now
};

export default LearningModulesMenu
