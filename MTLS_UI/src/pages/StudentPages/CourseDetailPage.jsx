import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Rating,
  Tabs,
  Tab,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import LogoImg from "../../assets/Logo.svg";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DoneIcon from "@mui/icons-material/Done";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
  courseService,
  moduleService,
  sectionService,
  enrollmentService,
} from "../../api";
import { ratingService } from "../../api/services/rating.service";
import { userService } from "../../api/services/user.service";

// Hàm kiểm tra xem một ID có phải là MongoDB ObjectID hợp lệ không
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

const CourseDetailPage = () => {
  const { number } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [expandedCourseIds, setExpandedCourseIds] = useState([]);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [courseRating, setCourseRating] = useState({
    averageRating: 0,
    totalRatings: 0,
  });
  const [courseRatings, setCourseRatings] = useState([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [teachers, setTeachers] = useState([]);
  // Thêm state cho tiến trình học của sinh viên
  const [courseProgress, setCourseProgress] = useState(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Lấy user ID (từ localStorage hoặc context tùy vào cách app lưu trữ)
  const getUserId = () => {
    // Đây là ví dụ, thay thế bằng cách lấy userId thực tế của ứng dụng
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id || null;
  };

  // Kiểm tra trạng thái đăng ký khóa học
  const checkEnrollmentStatus = async (courseId) => {
    try {
      const userId = getUserId();
      if (!userId || !courseId) return false;

      console.log(
        "Kiểm tra đăng ký cho user:",
        userId,
        "và khóa học:",
        courseId
      );
      const response =
        await enrollmentService.checkEnrollmentForStudentAndCourse(
          userId,
          courseId
        );
      console.log("Kết quả kiểm tra đăng ký:", response);

      if (response && response.data) {
        setIsEnrolled(true);
        // Lưu ID đăng ký để sử dụng sau này (ví dụ: hủy đăng ký)
        setEnrollmentId(response.data._id);
        return true;
      } else {
        setIsEnrolled(false);
        setEnrollmentId(null);
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái đăng ký:", error);
      setIsEnrolled(false);
      setEnrollmentId(null);
      return false;
    }
  };

  // Đăng ký khóa học mới
  const enrollCourse = async () => {
    try {
      setEnrollmentLoading(true);
      const userId = getUserId();

      if (!userId || !course?._id) {
        throw new Error("Thiếu thông tin cần thiết để đăng ký khóa học");
      }

      const enrollmentData = {
        student: userId,
        course: course._id,
        status: "active",
        enrolledAt: new Date().toISOString(),
      };

      console.log("Đăng ký khóa học với dữ liệu:", enrollmentData);
      const response = await enrollmentService.createEnrollment(enrollmentData);
      console.log("Kết quả đăng ký:", response);

      if (response && response.data) {
        setIsEnrolled(true);
        setEnrollmentId(response.data._id);
        // Chuyển hướng đến module đầu tiên hoặc hiển thị thông báo thành công
        if (course?.module?.[0]?._id) {
          handleModuleClick(course.module[0]._id, 0);
        }
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký khóa học:", error);
      // Hiển thị thông báo lỗi cho người dùng nếu cần
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Xử lý nút hành động chính
  const handleMainAction = () => {
    if (!course || !course._id) {
      console.error("Cannot perform action: Missing course ID");
      setError("Cannot perform action: Missing course ID");
      return;
    }

    if (isEnrolled) {
      // Nếu đã đăng ký, kiểm tra module trước khi điều hướng
      if (course?.module && course.module.length > 0 && course.module[0]._id) {
        handleModuleClick(course.module[0]._id, 0);
      } else {
        console.error("Cannot navigate: No modules found for this course");
        setError("Cannot navigate: No modules found for this course");
      }
    } else {
      // Nếu chưa đăng ký, thực hiện đăng ký
      enrollCourse();
    }
  };

  // Fetch course ratings
  const fetchCourseRatings = async (courseId) => {
    try {
      const response = await ratingService.getRatingsByCourse(courseId);
      console.log("Course ratings response:", response);
      // Kiểm tra và lấy mảng ratings từ response
      if (response?.data?.ratings && Array.isArray(response.data.ratings)) {
        console.log("Course ratings data:", response.data.ratings);
        setCourseRatings(response.data.ratings);
      } else {
        console.error("Invalid ratings data format:", response);
        setCourseRatings([]);
      }
    } catch (error) {
      console.error("Error fetching course ratings:", error);
      setCourseRatings([]);
    }
  };

  // Lấy thông tin giáo viên từ ID
  const fetchTeacherInfo = async (teacherId) => {
    try {
      if (!teacherId) return null;
      const response = await userService.getUserById(teacherId);
      console.log("Thông tin giáo viên:", response);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin giáo viên:", error);
      return null;
    }
  };

  // Cải thiện hàm để in log và debug cấu trúc dữ liệu
  const fetchCourseProgress = async (courseId) => {
    try {
      const userId = getUserId();
      if (!userId || !courseId) return;

      console.log(
        "Đang lấy tiến trình học cho user:",
        userId,
        "và khóa học:",
        courseId
      );
      const response = await courseService.getCourseWithProgress(
        courseId,
        userId
      );

      if (response && response.data) {
        console.log(
          "Cấu trúc dữ liệu tiến trình:",
          JSON.stringify(response.data, null, 2)
        );

        // Log chi tiết về cấu trúc modules để debug
        if (response.data.modules && Array.isArray(response.data.modules)) {
          console.log("Số lượng modules:", response.data.modules.length);
          response.data.modules.forEach((mod, index) => {
            console.log(`Module ${index + 1}:`, {
              id: mod._id,
              title: mod.title,
              progress: mod.progress,
              percentage: mod.percentage,
              completed: mod.completed,
              total: mod.total,
              sections: mod.sections ? mod.sections.length : 0,
            });

            // Log các sections nếu có
            if (mod.sections && Array.isArray(mod.sections)) {
              mod.sections.forEach((section, sIdx) => {
                console.log(`  Section ${sIdx + 1} of module ${index + 1}:`, {
                  id: section._id,
                  title: section.title,
                  type: section.type,
                  progress: section.progress,
                  percentage: section.percentage,
                  completed: section.completed,
                  total: section.total,
                });
              });
            }
          });
        }

        setCourseProgress(response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Lỗi khi lấy tiến trình học:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        // Kiểm tra xem đang ở chế độ edit không
        const editCourseData = JSON.parse(
          localStorage.getItem("editCourseData") || "null"
        );

        // Biến để lưu ID của khóa học
        let courseId = null;

        // Nếu đang ở chế độ edit và có courseId
        if (editCourseData && editCourseData.courseId) {
          console.log("Edit mode detected:", editCourseData);
          courseId = editCourseData.courseId;

          // Xóa dữ liệu edit sau khi sử dụng để tránh tình trạng lưu cache
          localStorage.removeItem("editCourseData");
        } else {
          // Kiểm tra xem 'number' có phải là ObjectID không
          if (isValidObjectId(number)) {
            // Nếu là ObjectID, dùng trực tiếp
            courseId = number;
          } else {
            // Nếu không phải ObjectID, giả sử là index như trước đây
            // Lấy tất cả khóa học
            const response = await courseService.getAllCourses();
            const courses = response?.data || [];
            console.log("1. All courses:", courses);

            // Tìm khóa học theo index (number parameter bắt đầu từ 1)
            const selectedCourse = courses[parseInt(number) - 1];
            console.log("2. Selected course:", selectedCourse);
            if (!selectedCourse) {
              throw new Error("Course not found");
            }

            courseId = selectedCourse._id;
          }
        }

        // Bây giờ có courseId, tiếp tục lấy chi tiết khóa học
        if (!courseId) {
          throw new Error("Course ID not found");
        }

        // Fetch the specific course details using the actual ID
        const courseResponse = await courseService.getCourseById(courseId);
        const courseData = courseResponse?.data || null;
        console.log("3. Course details:", courseData);

        // Kiểm tra xem courseData có tồn tại và có _id không
        if (!courseData) {
          throw new Error("Course data not found");
        }

        if (!courseData._id) {
          console.error("Invalid course data - missing _id");
          throw new Error("Course data is invalid - missing _id");
        }

        // Fetch all modules for this course
        if (courseData) {
          const modulesResponse = await moduleService.getModulesByCourse(
            courseData._id
          );
          const modules = modulesResponse?.data || [];
          console.log("4. Modules for course:", modules);

          // Fetch sections for each module
          const modulesWithSections = await Promise.all(
            modules.map(async (mod, index) => {
              try {
                console.log(`5. Processing module ${index + 1}:`, {
                  moduleId: mod._id,
                  moduleTitle: mod.title,
                  sections: mod.sections,
                });

                const sectionsResponse =
                  await sectionService.getSectionsByModule(mod._id);
                console.log(
                  `6. Sections response for module ${index + 1}:`,
                  sectionsResponse
                );
                const sections = sectionsResponse?.data || [];
                console.log(
                  `7. Processed sections for module ${index + 1}:`,
                  sections
                );

                return {
                  ...mod,
                  title: mod.title || "Untitled Module",
                  description: mod.description || "No description available",
                  rating: 0,
                  ratingCount: 0,
                  learningObjectives: [],
                  sections: sections.map((section) => ({
                    ...section,
                    icon:
                      section.type === "Lesson" ? (
                        <PlayCircleOutlineIcon />
                      ) : section.type === "Quiz" ? (
                        <QuizIcon />
                      ) : (
                        <AssignmentIcon />
                      ),
                  })),
                  isActive: mod.isActive,
                };
              } catch (error) {
                console.error("Error details:", {
                  moduleId: mod._id,
                  error: error.message,
                  response: error.response?.data,
                });
                return {
                  ...mod,
                  title: mod.title || "Untitled Module",
                  description: mod.description || "No description available",
                  rating: 0,
                  ratingCount: 0,
                  learningObjectives: [],
                  sections: [],
                  isActive: mod.isActive,
                };
              }
            })
          );

          courseData.module = modulesWithSections;
        }

        // Fetch course rating
        if (courseData && courseData._id) {
          try {
            const ratingResponse = await ratingService.getCourseRatingStats(
              courseData._id
            );
            console.log("Rating data:", ratingResponse);
            if (ratingResponse && ratingResponse.data) {
              setCourseRating(ratingResponse.data);
            }
            // Fetch course ratings
            await fetchCourseRatings(courseData._id);

            // Fetch enrollment count
            try {
              const enrollmentResponse =
                await enrollmentService.getEnrollmentsByCourse(courseData._id);
              console.log("Enrollment data:", enrollmentResponse);
              if (enrollmentResponse && enrollmentResponse.data) {
                // Đếm số lượng đăng ký từ mảng kết quả trả về
                const enrollments = Array.isArray(enrollmentResponse.data)
                  ? enrollmentResponse.data
                  : enrollmentResponse.data.enrollments || [];
                setEnrollmentCount(enrollments.length);
              }
            } catch (enrollmentError) {
              console.error(
                "Error fetching enrollment count:",
                enrollmentError
              );
            }
          } catch (ratingError) {
            console.error("Error fetching course rating:", ratingError);
          }
        }

        console.log(
          "Transformed course data with modules and sections:",
          courseData
        );
        setCourse(courseData);
        setError(null);

        // Lưu courseId vào localStorage để RandomRatingModal có thể sử dụng
        if (courseData && courseData._id) {
          localStorage.setItem("currentCourseId", courseData._id);
        }

        // Kiểm tra trạng thái đăng ký khóa học
        const isUserEnrolled = await checkEnrollmentStatus(courseData?._id);

        // Nếu đã đăng ký, lấy tiến trình học
        if (isUserEnrolled && courseData?._id) {
          await fetchCourseProgress(courseData._id);
        }

        // Lấy thông tin giáo viên nếu có teacherId
        if (courseData?.teacher) {
          try {
            const teacherInfo = await fetchTeacherInfo(courseData.teacher);
            if (teacherInfo) {
              // Lấy danh sách khóa học của giáo viên
              const teacherCoursesResponse =
                await courseService.getCoursesByTeacher(courseData.teacher);
              const teacherCourses = teacherCoursesResponse?.data || [];
              console.log("Các khóa học của giáo viên:", teacherCourses);

              // Tạo thông tin giáo viên với số lượng khóa học
              setTeachers([
                {
                  ...teacherInfo,
                  courses: teacherCourses.length,
                  // Sử dụng ảnh mặc định nếu không có
                  image:
                    teacherInfo.avatar ||
                    "https://randomuser.me/api/portraits/men/1.jpg",
                },
              ]);
            }
          } catch (error) {
            console.error("Error fetching teacher info:", error);
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err?.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (number || localStorage.getItem("editCourseData")) {
      fetchCourse();
    }
  }, [number]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 300) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const headerOffset = 64;
      const currentPosition = scrollPosition + headerOffset + 10;

      for (let i = 0; i < 5; i++) {
        const section = document.getElementById(`section-${i}`);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (currentPosition >= sectionTop && currentPosition < sectionBottom) {
          if (tabValue !== i) {
            setTabValue(i);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tabValue]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideDown {
        from {
          max-height: 0;
          opacity: 0;
        }
        to {
          max-height: 1000px;
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleModuleClick = (moduleId, index) => {
    console.log("Navigating to module:", moduleId, "Index:", index + 1);

    // Kiểm tra moduleId
    if (!moduleId) {
      console.error("Invalid module ID for navigation");
      return;
    }

    // Kiểm tra xem number có phải là ObjectID không
    if (isValidObjectId(number)) {
      // Nếu number đã là ObjectID, sử dụng trực tiếp
      navigate(`/student/course/${number}/module/${moduleId}`);
    } else {
      // Nếu number là index, lấy _id thực của course để sử dụng cho URL
      if (course && course._id) {
        navigate(`/student/course/${course._id}/module/${moduleId}`);
      } else {
        // Thông báo lỗi nếu không có course._id
        console.error("Cannot navigate: Missing course ID");
        setError("Cannot navigate to module: Missing course ID");
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const section = document.getElementById(`section-${newValue}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleCourseExpansion = (courseId, event) => {
    event.stopPropagation();
    setExpandedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Hàm tính toán tiến trình của module dựa trên cấu trúc dữ liệu thực tế
  const calculateModuleProgress = (moduleId) => {
    try {
      if (!courseProgress || !courseProgress.modules) {
        return 0;
      }

      // Tìm module trong danh sách modules
      const moduleData = courseProgress.modules.find((m) => m._id === moduleId);
      if (!moduleData || !moduleData.sections) {
        return 0;
      }

      // Tính tổng số components và số components đã hoàn thành trong module
      let totalComponents = 0;
      let completedComponents = 0;

      moduleData.sections.forEach((section) => {
        if (section.components && Array.isArray(section.components)) {
          totalComponents += section.components.length;

          section.components.forEach((component) => {
            if (component.status === "completed") {
              completedComponents += 1;
            }
          });
        }
      });

      // Tính phần trăm hoàn thành
      if (totalComponents > 0) {
        return Math.round((completedComponents / totalComponents) * 100);
      }

      return 0;
    } catch (error) {
      console.error(`Lỗi khi tính tiến trình cho module ${moduleId}:`, error);
      return 0;
    }
  };

  // Hàm tính toán tiến trình của section dựa trên cấu trúc dữ liệu thực tế
  const calculateSectionProgress = (moduleId, sectionId) => {
    try {
      if (!courseProgress || !courseProgress.modules) return 0;

      // Tìm module trong danh sách modules
      const moduleData = courseProgress.modules.find((m) => m._id === moduleId);
      if (!moduleData || !moduleData.sections) return 0;

      // Tìm section trong module
      const sectionData = moduleData.sections.find((s) => s._id === sectionId);
      if (
        !sectionData ||
        !sectionData.components ||
        !Array.isArray(sectionData.components)
      )
        return 0;

      // Tính tổng số components và số components đã hoàn thành trong section
      const totalComponents = sectionData.components.length;
      const completedComponents = sectionData.components.filter(
        (comp) => comp.status === "completed"
      ).length;

      // Tính phần trăm hoàn thành
      if (totalComponents > 0) {
        return Math.round((completedComponents / totalComponents) * 100);
      }

      return 0;
    } catch (error) {
      console.error(`Lỗi khi tính tiến trình cho section ${sectionId}:`, error);
      return 0;
    }
  };

  // Lấy tổng tiến trình của toàn bộ khóa học
  const getTotalCourseProgress = () => {
    try {
      // Nếu API đã cung cấp tiến trình tổng thể, sử dụng nó
      if (
        courseProgress &&
        courseProgress.progress &&
        courseProgress.progress.percentage !== undefined
      ) {
        return courseProgress.progress.percentage;
      }

      // Nếu không có tiến trình tổng thể, tính toán từ components
      if (!courseProgress || !courseProgress.modules) return 0;

      let totalComponents = 0;
      let completedComponents = 0;

      courseProgress.modules.forEach((module) => {
        if (module.sections && Array.isArray(module.sections)) {
          module.sections.forEach((section) => {
            if (section.components && Array.isArray(section.components)) {
              totalComponents += section.components.length;

              section.components.forEach((component) => {
                if (component.status === "completed") {
                  completedComponents += 1;
                }
              });
            }
          });
        }
      });

      // Tính phần trăm hoàn thành
      if (totalComponents > 0) {
        return Math.round((completedComponents / totalComponents) * 100);
      }

      return 0;
    } catch (error) {
      console.error("Lỗi khi tính tiến trình cho khóa học:", error);
      return 0;
    }
  };

  // Hàm lấy nội dung hiển thị cho completed/total
  const getCompletedTotalText = () => {
    try {
      // Nếu API đã cung cấp tiến trình tổng thể, sử dụng nó
      if (courseProgress && courseProgress.progress) {
        return `${courseProgress.progress.completed || 0} / ${courseProgress.progress.total || 0} completed`;
      }

      // Nếu không, tính toán
      if (!courseProgress || !courseProgress.modules) return "0 / 0 completed";

      let totalComponents = 0;
      let completedComponents = 0;

      courseProgress.modules.forEach((module) => {
        if (module.sections && Array.isArray(module.sections)) {
          module.sections.forEach((section) => {
            if (section.components && Array.isArray(section.components)) {
              totalComponents += section.components.length;

              section.components.forEach((component) => {
                if (component.status === "completed") {
                  completedComponents += 1;
                }
              });
            }
          });
        }
      });

      return `${completedComponents} / ${totalComponents} completed`;
    } catch (error) {
      console.error("Lỗi khi lấy text completed/total:", error);
      return "0 / 0 đã hoàn thành";
    }
  };

  // Hàm lấy thông tin chi tiết của section
  const getSectionInfo = (moduleId, sectionId) => {
    try {
      if (!courseProgress || !courseProgress.modules)
        return { total: 0, completed: 0 };

      // Tìm module trong danh sách modules
      const moduleData = courseProgress.modules.find((m) => m._id === moduleId);
      if (!moduleData || !moduleData.sections)
        return { total: 0, completed: 0 };

      // Tìm section trong module
      const sectionData = moduleData.sections.find((s) => s._id === sectionId);
      if (
        !sectionData ||
        !sectionData.components ||
        !Array.isArray(sectionData.components)
      )
        return { total: 0, completed: 0 };

      // Tính tổng số components và số components đã hoàn thành trong section
      const total = sectionData.components.length;
      const completed = sectionData.components.filter(
        (comp) => comp.status === "completed"
      ).length;

      return { total, completed };
    } catch (error) {
      console.error(
        `Lỗi khi lấy thông tin chi tiết section ${sectionId}:`,
        error
      );
      return { total: 0, completed: 0 };
    }
  };

  // Hàm lấy màu cho thanh tiến trình
  const getProgressColor = (progress) => {
    if (progress >= 100) return "#4caf50"; // xanh lá
    if (progress >= 50) return "#ff9800"; // cam
    return "#2196f3"; // xanh dương
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherModalOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Course not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: "#F5F7FA", color: "#000000", pt: 6, pb: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <img
              src={LogoImg}
              alt="Music Academy Logo"
              style={{ height: 50, width: "auto" }}
            />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  color: "#000000",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                {course?.title || "Course Title Not Available"}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#000000",
                  mb: 3,
                  fontSize: "1.1rem",
                  lineHeight: 1.5,
                }}
              >
                {course?.description || "Course description not available"}
              </Typography>

              {/* Hiển thị tiến trình tổng thể nếu đã đăng ký */}
              {isEnrolled && courseProgress && (
                <Box sx={{ mb: 4, width: "100%", maxWidth: "500px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                      width: "100%",
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      Learning Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {getTotalCourseProgress()}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getTotalCourseProgress()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "rgba(0, 0, 0, 0.08)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: getProgressColor(
                          getTotalCourseProgress()
                        ),
                      },
                      width: "100%",
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {getCompletedTotalText()}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleMainAction}
                disabled={enrollmentLoading}
                sx={{
                  bgcolor: "#0F62FE",
                  color: "white",
                  "&:hover": { bgcolor: "#0043CE" },
                  fontWeight: "bold",
                  borderRadius: 1,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  mr: 2,
                }}
              >
                {enrollmentLoading
                  ? "PROCESSING..."
                  : isEnrolled
                    ? "CONTINUE LEARNING"
                    : "ENROLL"}
              </Button>

              <Typography variant="body2" sx={{ color: "#333", mt: 3 }}>
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  {enrollmentCount.toLocaleString()}
                </Box>
                {" already enrolled"}
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={course?.image}
                alt={course?.title}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                  borderRadius: 2,
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Course Summary Section */}
      <Box sx={{ position: "relative", mt: -3, mb: 3, zIndex: 1 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              backgroundColor: "#ffffff",
              py: 3,
              px: { xs: 2, md: 3 },
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                py: 1,
                px: { xs: 1, md: 2 },
                borderRight: { xs: "none", md: "1px solid #e8e8e8" },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "1.1rem" }}
              >
                {course?.module?.length} module series
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "center",
                py: 1,
                px: { xs: 1, md: 2 },
                borderRight: { xs: "none", md: "1px solid #e8e8e8" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mr: 1, fontSize: "1.1rem", color: "#000" }}
                >
                  {courseRating.averageRating.toFixed(1)}
                </Typography>
                <Rating
                  value={courseRating.averageRating}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{ color: "#0F62FE" }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                ({courseRating.totalRatings.toLocaleString()} reviews)
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 1,
                px: { xs: 1, md: 2 },
                // borderRight: { xs: "none", md: "1px solid #e8e8e8" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "1.1rem" }}
              >
                {course?.level || "Basic"} level
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Tabs Navigation */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "white",
          position: "sticky",
          top: 55,
          zIndex: 1000,
          boxShadow: scrolled ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
          transition: "box-shadow 0.3s, padding 0.3s",
          py: scrolled ? 0 : 0.5,
        }}
      >
        <Container maxWidth="lg">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="module tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                minWidth: 100,
                px: 3,
                py: scrolled ? 1.5 : 2,
                transition: "padding 0.3s",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                backgroundColor: "#0F62FE",
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label="About" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Outcomes" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Modules" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Reviews" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container>
          <Grid item xs={12}>
            {/* About Section */}
            <Box id="section-0" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                About this Course
              </Typography>
              {course?.about ? (
                <Box
                  sx={{
                    mt: 2,
                    "& img": { maxWidth: "100%", height: "auto" },
                    "& a": { color: "#0F62FE", textDecoration: "underline" },
                    "& ul, & ol": { paddingLeft: 3, marginBottom: 2 },
                    "& p": { marginBottom: 2 },
                    "& h1, & h2, & h3, & h4, & h5, & h6": {
                      marginTop: 2,
                      marginBottom: 1,
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: course.about }}
                />
              ) : (
                <Typography variant="body1" paragraph>
                  No information available
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Outcomes Section */}
            <Box id="section-1" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                What you&apos;ll learn
              </Typography>

              {/* Hiển thị outcomes hoặc learning objectives từ API */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                {/* Hiển thị learningObjectives từ API */}
                {course?.learningObjectives &&
                course.learningObjectives.length > 0 ? (
                  course.learningObjectives.map((objective, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        bgcolor: "#f0f7ff",
                        color: "#333",
                        borderRadius: "8px",
                        p: 2,
                        width: {
                          xs: "100%",
                          sm: "calc(50% - 16px)",
                          lg: "calc(33.33% - 16px)",
                        },
                        border: "1px solid rgba(15, 98, 254, 0.1)",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <DoneIcon
                        sx={{ color: "#0F62FE", mr: 2, mt: 0.3, flexShrink: 0 }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          "& img": { maxWidth: "100%", height: "auto" },
                          "& a": {
                            color: "#0F62FE",
                            textDecoration: "underline",
                          },
                          "& ul, & ol": { paddingLeft: 3, marginBottom: 1 },
                          "& p": { marginBottom: 1, marginTop: 0 },
                          "& h1, & h2, & h3, & h4, & h5, & h6": {
                            marginTop: 1,
                            marginBottom: 0.5,
                          },
                          "& *:first-child": { marginTop: 0 },
                          "& *:last-child": { marginBottom: 0 },
                        }}
                        dangerouslySetInnerHTML={{ __html: objective }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No learning objectives information available
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Skills Section */}
            <Box id="section-skills" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Skills you&apos;ll gain
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                {course?.skills && course.skills.length > 0 ? (
                  // Hiển thị skills từ API
                  course.skills.map((skill, index) => (
                    <Box
                      key={index}
                      sx={{
                        bgcolor: "#f0f7ff",
                        color: "#0F62FE",
                        borderRadius: "16px",
                        px: 2,
                        py: 0.75,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No skills information available
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Course Content Section */}
            <Box id="section-2" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Professional Certificate - {course?.module?.length || 0}{" "}
                    module series
                  </Typography>

                  <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                    {course?.description || "No description available"}
                  </Typography>

                  {(course?.module || []).map((module, index) => (
                    <Paper
                      key={module._id}
                      elevation={0}
                      sx={{
                        mb: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        overflow: "hidden",
                        position: "relative",
                        width: "100%",
                      }}
                      onMouseEnter={() => setHoveredCourseId(module._id)}
                      onMouseLeave={() => setHoveredCourseId(null)}
                    >
                      <Box
                        sx={{
                          p: 3,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "rgba(15, 98, 254, 0.04)",
                          },
                          width: "100%",
                        }}
                        onClick={(e) => toggleCourseExpansion(module._id, e)}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ width: "100%" }}>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              Module {index + 1}
                              {module.title ? ` - ${module.title}` : ""}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                color: "#666",
                              }}
                            >
                              <Typography variant="body2">
                                {module.description}
                              </Typography>
                              {module.duration && (
                                <>
                                  <Typography variant="body2" sx={{ mx: 1 }}>
                                    •
                                  </Typography>
                                  <Typography variant="body2">
                                    {module.duration}
                                  </Typography>
                                </>
                              )}
                              {(module.rating > 0 ||
                                module.ratingCount > 0) && (
                                <>
                                  <Typography variant="body2" sx={{ mx: 1 }}>
                                    •
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Rating
                                      value={module.rating}
                                      precision={0.5}
                                      readOnly
                                      size="small"
                                      sx={{ color: "#0F62FE", mr: 1 }}
                                    />
                                    <Typography variant="body2">
                                      ({module.ratingCount} ratings)
                                    </Typography>
                                  </Box>
                                </>
                              )}
                            </Box>

                            {/* Hiển thị thanh tiến trình nếu đã đăng ký khóa học */}
                            {isEnrolled && (
                              <Box sx={{ mt: 2, width: "100%" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Learning Progress
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mr: 15 }}
                                  >
                                    {calculateModuleProgress(module._id)}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={calculateModuleProgress(module._id)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: getProgressColor(
                                        calculateModuleProgress(module._id)
                                      ),
                                    },
                                    width: "80%",
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              backgroundColor:
                                hoveredCourseId === module._id
                                  ? "rgba(15, 98, 254, 0.08)"
                                  : "transparent",
                              border:
                                hoveredCourseId === module._id
                                  ? "1px solid rgba(15, 98, 254, 0.2)"
                                  : "1px solid transparent",
                              borderRadius: 1,
                              px: 1.5,
                              py: 0.5,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                backgroundColor: "rgba(15, 98, 254, 0.12)",
                              },
                              width: 180,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#0F62FE",
                                fontWeight: "medium",
                                mr: 1,
                                opacity: hoveredCourseId === module._id ? 1 : 0,
                                transition: "opacity 0.2s",
                              }}
                            >
                              Module details
                            </Typography>
                            <ExpandMoreIcon
                              sx={{
                                color: "#0F62FE",
                                transform: expandedCourseIds.includes(
                                  module._id
                                )
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.3s ease",
                                fontSize: 20,
                              }}
                            />
                          </Box>
                        </Box>

                        {expandedCourseIds.includes(module._id) && (
                          <Box
                            sx={{
                              mt: 3,
                              width: "100%",
                              overflow: "hidden",
                              animation: "slideDown 0.3s ease-out forwards",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              gutterBottom
                            >
                              Module Content
                            </Typography>

                            <List
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                              }}
                            >
                              {module.sections.map((section, idx) => (
                                <ListItem
                                  key={section._id}
                                  sx={{
                                    borderBottom:
                                      idx < module.sections.length - 1
                                        ? "1px solid #f0f0f0"
                                        : "none",
                                    py: 1.5,
                                    "&:hover": {
                                      bgcolor: "rgba(15, 98, 254, 0.04)",
                                      cursor: "pointer",
                                    },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    {section.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      section.title || `Section ${idx + 1}`
                                    }
                                    secondary={
                                      isEnrolled ? (
                                        <Box sx={{ mt: 1, width: "100%" }}>
                                          {section.description && (
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                              sx={{ mb: 1 }}
                                            >
                                              {section.description}
                                            </Typography>
                                          )}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              mb: 0.5,
                                              width: "80%",
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Progress
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {calculateSectionProgress(
                                                module._id,
                                                section._id
                                              )}
                                              %
                                            </Typography>
                                          </Box>
                                          <LinearProgress
                                            variant="determinate"
                                            value={calculateSectionProgress(
                                              module._id,
                                              section._id
                                            )}
                                            sx={{
                                              height: 4,
                                              borderRadius: 2,
                                              backgroundColor:
                                                "rgba(0, 0, 0, 0.05)",
                                              "& .MuiLinearProgress-bar": {
                                                backgroundColor:
                                                  getProgressColor(
                                                    calculateSectionProgress(
                                                      module._id,
                                                      section._id
                                                    )
                                                  ),
                                              },
                                              width: "80%",
                                            }}
                                          />
                                          {/* Hiển thị số lượng components đã hoàn thành */}
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 0.5, display: "block" }}
                                          >
                                            {(() => {
                                              const info = getSectionInfo(
                                                module._id,
                                                section._id
                                              );
                                              return `${info.completed}/${info.total} completed`;
                                            })()}
                                          </Typography>
                                        </Box>
                                      ) : (
                                        section.description ||
                                        "No description available"
                                      )
                                    }
                                    primaryTypographyProps={{
                                      fontWeight: "medium",
                                      color: "#000",
                                    }}
                                    secondaryTypographyProps={{
                                      variant: "body2",
                                      color: "text.secondary",
                                      component: "div", // Quan trọng khi secondary là một component React
                                    }}
                                  />
                                  {section.duration && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ ml: 2 }}
                                    >
                                      {section.duration}
                                    </Typography>
                                  )}
                                </ListItem>
                              ))}
                            </List>

                            <Button
                              variant="contained"
                              onClick={() =>
                                handleModuleClick(module._id, index)
                              }
                              disabled={!isEnrolled}
                              sx={{
                                mt: 3,
                                bgcolor: isEnrolled ? "#0F62FE" : "#e0e0e0",
                                color: "white",
                                "&:hover": {
                                  bgcolor: isEnrolled ? "#0043CE" : "#e0e0e0",
                                },
                                textTransform: "none",
                                cursor: isEnrolled ? "pointer" : "not-allowed",
                              }}
                            >
                              {isEnrolled ? "Start" : "Need to enroll"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ position: "sticky", top: 88, pt: 2 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Instructors
                      </Typography>

                      {teachers.map((instructor, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 3,
                            pb: idx < teachers.length - 1 ? 2 : 0,
                            borderBottom:
                              idx < teachers.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          <Avatar
                            src={instructor.image}
                            alt={instructor.name}
                            sx={{ width: 48, height: 48, mr: 2 }}
                          />
                          <Box>
                            <Typography
                              variant="subtitle1"
                              onClick={() => handleTeacherClick(instructor)}
                              sx={{
                                fontWeight: "bold",
                                color: "#000",
                                "&:hover": {
                                  color: "#0F62FE",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                },
                              }}
                            >
                              {instructor.fullname || "No information"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {instructor.role === "teacher"
                                ? "Teacher"
                                : "Music Expert"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}

                      {teachers.length === 0 && (
                        <Box sx={{ py: 2, textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            No teacher information available for this course
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Reviews Section */}
            <Box id="section-3" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Student Reviews
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box sx={{ mr: 2 }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ color: "#0F62FE" }}
                  >
                    {courseRating.averageRating.toFixed(1)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Rating
                    value={courseRating.averageRating}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{ color: "#0F62FE" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {courseRating.totalRatings.toLocaleString()} ratings
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {Array.isArray(courseRatings) && courseRatings.length > 0 ? (
                courseRatings.map((review) => (
                  <Box
                    key={review._id}
                    sx={{ mb: 3, pb: 3, borderBottom: "1px solid #f0f0f0" }}
                  >
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Box
                        sx={{
                          bgcolor: "#f0f4ff",
                          color: "#0F62FE",
                          width: 40,
                          height: 40,
                          mr: 2,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.student?.email?.[0].toUpperCase() || "S"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {review.student?.email || "Anonymous"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Rating
                            value={review.stars}
                            size="small"
                            readOnly
                            sx={{ color: "#0F62FE" }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      {review.comment || "No comment provided"}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 3 }}
                >
                  No reviews yet
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 600,
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Teacher Information</Typography>
            <IconButton
              onClick={() => setTeacherModalOpen(false)}
              aria-label="close"
              sx={{ color: "#757575" }}
            ></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedTeacher && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  src={selectedTeacher.image}
                  alt={selectedTeacher.fullname}
                  sx={{ width: 90, height: 90, mr: 3 }}
                />
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {selectedTeacher.fullname}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedTeacher.role === "teacher"
                      ? "Teacher"
                      : "Music Expert"}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Introduction
              </Typography>
              <Box
                sx={{ mb: 3 }}
                dangerouslySetInnerHTML={{
                  __html: selectedTeacher.about || "No information available.",
                }}
              />

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Specialization
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, mb: 3 }}
              >
                {selectedTeacher.specialization ? (
                  // Hiển thị specialization từ API
                  selectedTeacher.specialization
                    .split(",")
                    .map((skill, index) => (
                      <Box
                        key={index}
                        sx={{
                          bgcolor: "#f0f7ff",
                          color: "#0F62FE",
                          borderRadius: "16px",
                          px: 2,
                          py: 0.75,
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        {skill.trim()}
                      </Box>
                    ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specialization information available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setTeacherModalOpen(false)}
            sx={{
              bgcolor: "#0F62FE",
              color: "white",
              "&:hover": { bgcolor: "#0043CE" },
              textTransform: "none",
              px: 3,
              py: 1,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;
