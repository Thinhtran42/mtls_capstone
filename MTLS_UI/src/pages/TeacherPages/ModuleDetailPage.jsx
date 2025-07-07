import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Dialog,
} from "@mui/material";
import {
  Edit as EditIcon,
  VideoLibrary as VideoIcon,
  Description as ReadingIcon,
  Add as AddIcon,
  Timer as DurationIcon,
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  FitnessCenter as ExerciseIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { moduleService } from "../../api/services/module.service";
import { courseService } from "../../api/services/course.service";
import { sectionService } from "../../api/services/section.service";
import { lessonService } from "../../api/services/lesson.service";
import { contentService } from "../../api/services/content.service";
import { exerciseService } from "../../api/services/exercise.service";
import { quizService } from "../../api/services/quiz.service";
import { assignmentService } from "../../api/services/assignment.service";
import BackButton from "../../components/common/BackButton";

const ModuleDetailPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [sections, setSections] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [editModeSection, setEditModeSection] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  
  // State cho các dialog Delete và Success
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (successDialogOpen) {
      timer = setTimeout(() => {
        setSuccessDialogOpen(false);
      }, 3000); // Tự động đóng sau 3 giây
    }
    return () => clearTimeout(timer);
  }, [successDialogOpen]);

  const handleExpandSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleToggleEditMode = (e, sectionId) => {
    e.stopPropagation();
    if (editModeSection === sectionId) {
      setEditModeSection(null);
    } else {
      setEditModeSection(sectionId);
      // If section is not expanded, expand it
      if (expandedSection !== sectionId) {
        setExpandedSection(sectionId);
      }
    }
  };

  const handleEditLesson = async (e, lesson) => {
    e.stopPropagation();
    try {
      console.log("Edit lesson:", lesson);
      if (lesson && lesson._id) {
        navigate(
          `/teacher/course/${courseId}/module/${moduleId}/lessons/${lesson._id}/edit`
        );
      } else {
        console.error("Cannot edit: Invalid lesson ID");
      }
    } catch (error) {
      console.error("Error when redirecting to lesson edit page:", error);
    }
  };

  const handleOpenDeleteDialog = (e, content) => {
    e.stopPropagation();
    setContentToDelete(content);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setContentToDelete(null);
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      // Process deleting content based on type
      if (contentToDelete.type === "Quiz") {
        await quizService.deleteQuiz(contentToDelete._id);
      } else if (contentToDelete.type === "Assignment") {
        await assignmentService.deleteAssignment(contentToDelete._id);
      } else if (contentToDelete.type === "Exercise") {
        await exerciseService.deleteExercise(contentToDelete._id);
      } else {
        // For regular lessons
        await lessonService.deleteLesson(contentToDelete._id);
      }

      // Đóng dialog xác nhận ngay lập tức
      setDeleteDialogOpen(false);
      
      // Hiển thị dialog thành công
      setSuccessDialogOpen(true);

      // Update the lesson list
      fetchSections(moduleId);
    } catch (error) {
      console.error("Error deleting content:", error);
      setSnackbar({
        open: true,
        message: "Content deletion failed. Please try again.",
        severity: "error"
      });
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const courseResponse = await courseService.getCourseById(courseId);
        const courseData = courseResponse.data;
        setCourseTitle(courseData?.title || "Course");

        // Fetch module details
        const moduleResponse = await moduleService.getModuleById(moduleId);
        console.log("Fetched module:", moduleResponse);

        if (moduleResponse.data) {
          setModule(moduleResponse.data);
          setError(null);

          // After getting module, get sections information
          fetchSections(moduleId);
        } else {
          setError("Module information not found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Could not load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId]);

  const fetchSections = async (moduleId) => {
    try {
      setLoadingSections(true);
      console.log("Getting sections for module:", moduleId);
      const sectionsResponse =
        await sectionService.getSectionsByModule(moduleId);
      console.log("Sections data:", sectionsResponse);

      if (sectionsResponse && sectionsResponse.data) {
        // Get data for each section based on section type
        const sectionsWithContent = [];

        for (const section of sectionsResponse.data) {
          try {
            let sectionWithItems = { ...section, lessons: [] };

            // Process based on section type
            if (
              section.type === "Lesson" ||
              section.type.toLowerCase() === "lesson"
            ) {
              // Get lessons for Lesson type section
              console.log(`Getting lessons for section ${section._id}`);
              const lessonsResponse = await lessonService.getLessonsBySection(
                section._id
              );

              // Get content for each lesson
              const lessonsWithContent = [];
              if (lessonsResponse?.data) {
                for (const lesson of lessonsResponse.data) {
                  try {
                    console.log(`Getting content for lesson ${lesson._id}`);
                    const contentResponse =
                      await contentService.getContentsByLesson(lesson._id);
                    lessonsWithContent.push({
                      ...lesson,
                      contents: contentResponse?.data || [],
                    });
                  } catch (contentError) {
                    console.error(
                      `Error getting content for lesson ${lesson._id}:`,
                      contentError
                    );
                    lessonsWithContent.push({
                      ...lesson,
                      contents: [],
                    });
                  }
                }
              }

              sectionWithItems.lessons = lessonsWithContent || [];
            } else if (section.type === "Quiz") {
              // Get quizzes for Quiz type section
              console.log(`Getting quizzes for section ${section._id}`);

              try {
                // Import quizService and questionService
                const { quizService } = await import(
                  "../../api/services/quiz.service"
                );
                const { questionService } = await import(
                  "../../api/services/question.service"
                );
                console.log(
                  "Starting getQuizzesBySection with sectionId:",
                  section._id
                );
                const quizzesResponse = await quizService.getQuizzesBySection(
                  section._id
                );
                console.log("Quizzes response:", quizzesResponse);

                // Check response structure
                let quizData = [];
                if (quizzesResponse && quizzesResponse.data) {
                  quizData = quizzesResponse.data;
                }

                // Lấy số lượng câu hỏi cho mỗi quiz
                const quizzesWithQuestionCount = await Promise.all(
                  quizData.map(async (quiz) => {
                    try {
                      // Gọi API để lấy số lượng câu hỏi
                      const questionsResponse =
                        await questionService.getQuestionsByQuizId(quiz._id);
                      return {
                        ...quiz,
                        questionCount: questionsResponse.count || 0,
                      };
                    } catch (error) {
                      console.error(
                        `Lỗi khi lấy số lượng câu hỏi cho quiz ${quiz._id}:`,
                        error
                      );
                      return {
                        ...quiz,
                        questionCount: 0,
                      };
                    }
                  })
                );

                // Convert quizzes to "lesson" format for display
                const quizzesAsLessons = quizzesWithQuestionCount.map(
                  (quiz) => ({
                    _id: quiz._id,
                    title: quiz.title || "Quiz without title",
                    description: quiz.description || "No description",
                    duration: quiz.duration || 0,
                    type: "Quiz", // Mark type for correct icon display
                    section: quiz.section,
                    questionCount: quiz.questionCount || 0,
                  })
                );

                console.log(
                  "Converted quizzes to lesson format:",
                  quizzesAsLessons
                );
                sectionWithItems.lessons = quizzesAsLessons;
              } catch (quizError) {
                console.error(
                  `Error getting quizzes for section ${section._id}:`,
                  quizError
                );
                console.error("Detailed error:", quizError.stack);
                // Continue with other sections
                sectionWithItems.lessons = [];
              }
            } else if (section.type === "Exercise") {
              // Get exercises for Exercise type section
              console.log(`Getting exercises for section ${section._id}`);

              try {
                // Import correct exercise service and questionService
                const exerciseService = await import(
                  "../../api/services/exercise.service"
                ).then((module) => module.exerciseService);
                const { questionService } = await import(
                  "../../api/services/question.service"
                );

                console.log(
                  "Starting getExercisesBySection with sectionId:",
                  section._id
                );
                const exercisesResponse =
                  await exerciseService.getExercisesBySection(section._id);
                console.log("Exercises response:", exercisesResponse);

                // Check response structure in detail
                let exerciseData = [];

                // Debug detailed step-by-step
                console.log(
                  "Check response.data structure:",
                  exercisesResponse?.data
                );

                // Process data based on multiple possible scenarios
                if (exercisesResponse) {
                  if (exercisesResponse.data) {
                    if (Array.isArray(exercisesResponse.data)) {
                      console.log("exercisesResponse.data is an array");
                      exerciseData = exercisesResponse.data;
                    } else if (
                      exercisesResponse.data.data &&
                      Array.isArray(exercisesResponse.data.data)
                    ) {
                      console.log("exercisesResponse.data.data is an array");
                      exerciseData = exercisesResponse.data.data;
                    } else if (
                      typeof exercisesResponse.data === "object" &&
                      !Array.isArray(exercisesResponse.data)
                    ) {
                      // Single object case (not an array)
                      console.log(
                        "exercisesResponse.data is single object (not an array)"
                      );
                      exerciseData = [exercisesResponse.data];
                    }
                  } else if (Array.isArray(exercisesResponse)) {
                    // If direct response is an array
                    console.log("exercisesResponse is an array");
                    exerciseData = exercisesResponse;
                  } else {
                    console.log(
                      "Response structure not determined, defaulting to empty array"
                    );
                    exerciseData = [];
                  }
                } else {
                  console.log("exercisesResponse is null or undefined");
                  exerciseData = [];
                }

                // Ensure no duplicates by using Set with ID
                if (exerciseData && exerciseData.length > 0) {
                  const uniqueIds = new Set();
                  exerciseData = exerciseData.filter((exercise) => {
                    if (!exercise || !exercise._id) return false;
                    if (uniqueIds.has(exercise._id)) return false;
                    uniqueIds.add(exercise._id);
                    return true;
                  });
                }

                console.log(
                  "Processed and deduplicated exercise data:",
                  exerciseData
                );

                // Lấy số lượng câu hỏi cho mỗi exercise
                const exercisesWithQuestionCount = await Promise.all(
                  exerciseData.map(async (exercise) => {
                    try {
                      // Gọi API để lấy số lượng câu hỏi
                      const questionsResponse =
                        await questionService.getQuestionsByExerciseId(
                          exercise._id
                        );
                      return {
                        ...exercise,
                        questionCount: questionsResponse.count || 0,
                      };
                    } catch (error) {
                      console.error(
                        `Lỗi khi lấy số lượng câu hỏi cho exercise ${exercise._id}:`,
                        error
                      );
                      return {
                        ...exercise,
                        questionCount: 0,
                      };
                    }
                  })
                );

                // Add detailed debug information for each important field
                if (
                  exercisesWithQuestionCount &&
                  exercisesWithQuestionCount.length > 0
                ) {
                  console.log(
                    `Found ${exercisesWithQuestionCount.length} exercises for this section:`
                  );
                  exercisesWithQuestionCount.forEach((exercise, index) => {
                    console.log(`Exercise #${index + 1}:`);
                    console.log("- _id:", exercise._id);
                    console.log("- title:", exercise.title);
                    console.log("- section:", exercise.section);
                    console.log("- questionCount:", exercise.questionCount);
                  });
                }

                // Convert exercises to "lesson" format for display
                const exercisesAsLessons = Array.isArray(
                  exercisesWithQuestionCount
                )
                  ? exercisesWithQuestionCount.map((exercise) => ({
                      _id: exercise._id,
                      title: exercise.title || "Exercise without title",
                      description: exercise.description || "No description",
                      duration: exercise.duration || 0,
                      type: "Exercise", // Mark type for correct icon display
                      section: exercise.section,
                      questionCount: exercise.questionCount || 0,
                    }))
                  : [];

                console.log(
                  "Converted exercises to lesson format:",
                  exercisesAsLessons
                );
                if (exercisesAsLessons.length > 0) {
                  sectionWithItems.lessons = exercisesAsLessons;
                }
              } catch (exerciseError) {
                console.error(
                  `Error getting exercises for section ${section._id}:`,
                  exerciseError
                );
                console.error("Detailed error:", exerciseError.stack);
                // Continue with other sections
                sectionWithItems.lessons = [];
              }
            } else if (
              section.type === "Assignment" ||
              section.type.toLowerCase() === "assignment"
            ) {
              // Get assignments for Assignment type section
              console.log(
                `Getting assignments for section ${section._id} (type: ${section.type})`
              );

              try {
                // Import assignmentService
                const { assignmentService } = await import(
                  "../../api/services/assignment.service"
                );
                console.log(
                  "Starting getAssignmentsBySection with sectionId:",
                  section._id
                );
                const assignmentsResponse =
                  await assignmentService.getAssignmentsBySection(section._id);
                console.log("Assignments response:", assignmentsResponse);

                // Check response structure in detail
                let assignmentData = [];

                // Debug detailed step-by-step
                console.log(
                  "Check response.data structure:",
                  assignmentsResponse?.data
                );

                if (assignmentsResponse && assignmentsResponse.data) {
                  if (Array.isArray(assignmentsResponse.data)) {
                    console.log("assignmentsResponse.data is an array");
                    assignmentData = assignmentsResponse.data;
                  } else if (
                    assignmentsResponse.data.data &&
                    Array.isArray(assignmentsResponse.data.data)
                  ) {
                    console.log("assignmentsResponse.data.data is an array");
                    assignmentData = assignmentsResponse.data.data;
                  } else if (typeof assignmentsResponse.data === "object") {
                    // Single object case
                    console.log(
                      "assignmentsResponse.data is object, checking details:"
                    );
                    console.log(
                      JSON.stringify(assignmentsResponse.data, null, 2)
                    );

                    // For current console output
                    if (assignmentsResponse.data[0]) {
                      console.log(
                        "Getting data from assignmentsResponse.data[0]"
                      );
                      assignmentData = [assignmentsResponse.data[0]];
                    } else {
                      // If data is in different fields
                      assignmentData = [assignmentsResponse.data];
                    }
                  }
                }

                console.log("Processed assignment data:", assignmentData);

                // If still no data, check array structure
                if (assignmentData.length === 0 && assignmentsResponse) {
                  console.log(
                    "Try checking different structure:",
                    assignmentsResponse
                  );

                  // Top level data case
                  if (Array.isArray(assignmentsResponse)) {
                    assignmentData = assignmentsResponse;
                  }
                }

                // Add detailed debug information for each important field
                if (assignmentData && assignmentData.length > 0) {
                  console.log("Important field of first assignment:");
                  console.log("- _id:", assignmentData[0]._id);
                  console.log("- title:", assignmentData[0].title);
                  console.log("- section:", assignmentData[0].section);
                }

                // Convert assignments to "lesson" format for display
                const assignmentsAsLessons = assignmentData.map(
                  (assignment) => ({
                    _id: assignment._id,
                    title: assignment.title || "Assignment without title",
                    description: assignment.description || "No description",
                    duration: assignment.duration || 0,
                    type: "Assignment", // Mark type for correct icon display
                    section: assignment.section,
                  })
                );

                console.log(
                  "Converted assignments to lesson format:",
                  assignmentsAsLessons
                );
                if (assignmentsAsLessons.length > 0) {
                  sectionWithItems.lessons = assignmentsAsLessons;
                }
              } catch (assignmentError) {
                console.error(
                  `Error getting assignments for section ${section._id}:`,
                  assignmentError
                );
                console.error("Detailed error:", assignmentError.stack);
                // Continue with other sections
                sectionWithItems.lessons = [];
              }
            }

            sectionsWithContent.push(sectionWithItems);
          } catch (error) {
            console.error(`Error processing section ${section._id}:`, error);
            sectionsWithContent.push({
              ...section,
              lessons: [],
            });
          }
        }

        console.log("Sections with lessons and contents:", sectionsWithContent);

        // Sort sections by type to ensure consistent display order
        const orderedTypes = ["Lesson", "Quiz", "Exercise", "Assignment"];
        const orderedSections = [...sectionsWithContent].sort(
          (a, b) => orderedTypes.indexOf(a.type) - orderedTypes.indexOf(b.type)
        );

        setSections(orderedSections);

        // Expand first section if no section is expanded
        if (orderedSections.length > 0 && !expandedSection) {
          setExpandedSection(orderedSections[0]._id);
        }
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error("Error getting section list:", error);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleBackToModules = () => {
    navigate(`/teacher/course/${courseId}`);
  };

  const handleViewLesson = (lesson) => {
    console.log("View content:", lesson);

    if (!lesson || !lesson._id) {
      console.error("Cannot view: Invalid ID");
      return;
    }

    // Check content type for correct navigation
    const contentType = (lesson.type || "").toLowerCase();

    switch (contentType) {
      case "quiz":
        navigate(
          `/teacher/course/${courseId}/module/${moduleId}/quizzes/${lesson._id}`
        );
        break;
      case "exercise":
        navigate(
          `/teacher/course/${courseId}/module/${moduleId}/exercises/${lesson._id}`
        );
        break;
      case "assignment":
        navigate(
          `/teacher/course/${courseId}/module/${moduleId}/assignments/${lesson._id}`
        );
        break;
      default:
        // Default is lesson
        navigate(
          `/teacher/course/${courseId}/module/${moduleId}/lessons/${lesson._id}`
        );
    }
  };

  // Process creating new content based on section type
  const handleCreateContent = (sectionId, sectionType) => {
    if (!sectionId) {
      console.error("Section ID not determined");
      return;
    }

    let createPath;

    switch (sectionType) {
      case "Lesson":
        createPath = `/teacher/course/${courseId}/module/${moduleId}/lessons/create?sectionId=${sectionId}`;
        break;
      case "Quiz":
        createPath = `/teacher/course/${courseId}/module/${moduleId}/quizzes/create?sectionId=${sectionId}`;
        break;
      case "Exercise":
        createPath = `/teacher/course/${courseId}/module/${moduleId}/exercises/create?sectionId=${sectionId}`;
        break;
      case "Assignment":
        createPath = `/teacher/course/${courseId}/module/${moduleId}/assignments/create?sectionId=${sectionId}`;
        break;
      default:
        console.error(`Unsupported section type: ${sectionType}`);
        return;
    }

    navigate(createPath);
  };

  // Get icon based on lesson type
  const getLessonTypeIcon = (lesson) => {
    // Classify based on content type or lesson type
    const contents = lesson.contents || [];

    // If it's quiz
    if (lesson.type === "Quiz") {
      return <QuizIcon sx={{ color: "#9c27b0" }} />;
    }

    // If it's exercise
    if (lesson.type === "Exercise") {
      return <ExerciseIcon sx={{ color: "#ed6c02" }} />;
    }

    // If it's assignment
    if (lesson.type === "Assignment") {
      return <AssignmentIcon sx={{ color: "#1976d2" }} />;
    }

    // Default based on content type for regular lessons
    const contentType = contents.length > 0 ? contents[0].type : null;

    if (contentType === "Video") {
      return <VideoIcon color="primary" />;
    } else {
      return <ReadingIcon color="primary" />;
    }
  };

  // Get icon and button text for new button based on section type
  const getCreateButtonConfig = (sectionType) => {
    switch (sectionType) {
      case "Lesson":
        return {
          icon: <AddIcon />,
          text: "Add lesson",
          color: "#0F62FE",
        };
      case "Quiz":
        return {
          icon: <QuizIcon />,
          text: "Add quiz",
          color: "#9c27b0",
        };
      case "Exercise":
        return {
          icon: <ExerciseIcon />,
          text: "Add exercise",
          color: "#ed6c02",
        };
      case "Assignment":
        return {
          icon: <AssignmentIcon />,
          text: "Add assignment",
          color: "#1976d2",
        };
      default:
        return {
          icon: <AddIcon />,
          text: "Add content",
          color: "#0F62FE",
        };
    }
  };

  // Get icon and color for each section type
  const getSectionTypeConfig = (sectionType) => {
    switch (sectionType) {
      case "Lesson":
        return {
          icon: <ReadingIcon sx={{ fontSize: 20, mr: 1 }} />,
          color: "#0F62FE",
          bgColor: "rgba(15, 98, 254, 0.1)",
          label: "Lesson",
        };
      case "Quiz":
        return {
          icon: <QuizIcon sx={{ fontSize: 20, mr: 1 }} />,
          color: "#9c27b0",
          bgColor: "rgba(156, 39, 176, 0.1)",
          label: "Quiz",
        };
      case "Exercise":
        return {
          icon: <ExerciseIcon sx={{ fontSize: 20, mr: 1 }} />,
          color: "#ed6c02",
          bgColor: "rgba(237, 108, 2, 0.1)",
          label: "Exercise",
        };
      case "Assignment":
        return {
          icon: <AssignmentIcon sx={{ fontSize: 20, mr: 1 }} />,
          color: "#1976d2",
          bgColor: "rgba(25, 118, 210, 0.1)",
          label: "Large assignment",
        };
      default:
        return {
          icon: null,
          color: "#666",
          bgColor: "rgba(0, 0, 0, 0.08)",
          label: sectionType,
        };
    }
  };

  // Handle managing all sections
  const handleManageSections = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/manage-sections`);
  };

  const renderLessonsList = (lessons, sectionId, sectionType) => {
    const buttonConfig = getCreateButtonConfig(sectionType);

    return (
      <>
        <List dense>
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson) => (
              <ListItem
                key={lesson._id}
                onClick={() => handleViewLesson(lesson)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  "&:hover": {
                    bgcolor: "rgba(25, 118, 210, 0.08)",
                  },
                  padding: "8px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}
              >
                <Box sx={{ display: "flex", width: "100%", mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: "40px" }}>
                    {getLessonTypeIcon(lesson)}
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                      >
                        <DurationIcon
                          sx={{
                            fontSize: 16,
                            color: "text.secondary",
                            mr: 0.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {lesson.duration} minutes
                        </Typography>
                        {(lesson.type === "Quiz" ||
                          lesson.type === "Exercise") && (
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mx: 1 }}
                            >
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {lesson.questionCount || 0} questions
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {editModeSection === sectionId && (
                      <>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling up to ListItem
                            handleEditLesson(e, lesson);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling up to ListItem
                            handleOpenDeleteDialog(e, lesson);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No content in this section yet
              </Typography>
            </Box>
          )}
        </List>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button
            variant="contained"
            startIcon={buttonConfig.icon}
            onClick={() => handleCreateContent(sectionId, sectionType)}
            size="small"
            sx={{
              bgcolor: buttonConfig.color,
              "&:hover": {
                bgcolor:
                  buttonConfig.color === "#0F62FE"
                    ? "#0043a8"
                    : buttonConfig.color,
              },
              textTransform: "none",
            }}
          >
            {buttonConfig.text}
          </Button>
        </Box>
      </>
    );
  };

  // Create default sections if none exist
  // eslint-disable-next-line no-unused-vars
  const handleCreateDefaultSections = async () => {
    try {
      setLoading(true);
      const moduleId = module._id;

      // Default section types
      const defaultSectionTypes = [
        { type: "Lesson", title: "Lesson content" },
        { type: "Quiz", title: "Quiz" },
        { type: "Exercise", title: "Practice exercises" },
        { type: "Assignment", title: "Assignments" },
      ];

      // Create default sections
      for (const sectionConfig of defaultSectionTypes) {
        await sectionService.createSection({
          module: moduleId,
          title: sectionConfig.title,
          type: sectionConfig.type,
          duration: 0, // Default value, will be updated when content is added
        });
      }

      // Update section list
      fetchSections(moduleId);
    } catch (error) {
      console.error("Error creating default sections:", error);
      setError("Cannot create default sections. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle closing snackbar notification
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <BackButton
          text="Back to module list"
          onClick={handleBackToModules}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  if (!module) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          Module not found
        </Typography>
        <BackButton
          text="Back to module list"
          onClick={handleBackToModules}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  return (
    <>
      <PageTitle title={module.title} />
      <Box sx={{ maxWidth: 1200, mx: 5 }}>
        <Stack spacing={3}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate("/teacher/courses")}
              sx={{ color: "#666", textDecoration: "none" }}
            >
              Courses
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate(`/teacher/course/${courseId}`)}
              sx={{ color: "#666", textDecoration: "none" }}
            >
              {courseTitle}
            </Link>
            <Typography color="text.primary">{module.title}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", mb: 2 }}>
            <BackButton 
              text={courseTitle}
              onClick={handleBackToModules}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" fontWeight="bold" color="#1a1a1a">
                {module.title}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleManageSections}
                sx={{
                  color: "#0F62FE",
                  borderColor: "#0F62FE",
                  "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
                  textTransform: "none",
                }}
              >
                Manage sections
              </Button>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {module.description || "No description"}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5">Module content</Typography>
              </Box>
              {loadingSections ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : sections.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      This module has no structure yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Initialize the module structure with create first section.
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {sections.map((section) => {
                    const typeConfig = getSectionTypeConfig(section.type);
                    return (
                      <Accordion
                        key={section._id}
                        expanded={expandedSection === section._id}
                        onChange={() => handleExpandSection(section._id)}
                        sx={{
                          border: "1px solid #e0e0e0",
                          boxShadow: "none",
                          "&:before": { display: "none" },
                          borderRadius: "8px !important",
                          overflow: "hidden",
                          mb: 1,
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            bgcolor: typeConfig.bgColor,
                            "&:hover": { bgcolor: `${typeConfig.bgColor}` },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flexGrow: 1,
                              }}
                            >
                              {typeConfig.icon}
                              <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                                color={typeConfig.color}
                              >
                                {section.title}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mr: 2 }}
                              >
                                {section.lessons?.length || 0} contents
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) =>
                                  handleToggleEditMode(e, section._id)
                                }
                                sx={{
                                  color: typeConfig.color,
                                  bgcolor:
                                    editModeSection === section._id
                                      ? "rgba(255, 255, 255, 0.8)"
                                      : "transparent",
                                  "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 0.5)",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          <Divider />
                          <Box sx={{ p: 0 }}>
                            {renderLessonsList(
                              section.lessons,
                              section._id,
                              section.type
                            )}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              bgcolor: 'rgba(244, 67, 54, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              animation: 'scaleIn 0.3s ease-out forwards, pulse 1.5s infinite 0.3s',
              '@keyframes scaleIn': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.95)',
                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
                },
                '70%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                },
                '100%': {
                  transform: 'scale(0.95)',
                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                }
              }
            }}
          >
            <CloseIcon sx={{ color: '#f44336', fontSize: 32 }} />
          </Box>
          
          <Typography variant="h5" id="delete-dialog-title" sx={{ mb: 2 }}>
            Are you sure?
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Do you really want to delete the content{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {contentToDelete?.title}
            </Box>
            ? This process cannot be undone.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleCloseDeleteDialog}
              sx={{ 
                bgcolor: '#d9d9d9', 
                color: '#555',
                '&:hover': { bgcolor: '#c9c9c9' },
                minWidth: 100
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={confirmDelete}
              sx={{ 
                bgcolor: '#f44336', 
                '&:hover': { bgcolor: '#d32f2f' },
                minWidth: 100
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
      
      {/* SUCCESS DIALOG */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        aria-labelledby="success-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              bgcolor: 'rgba(76, 175, 80, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              animation: 'scaleIn 0.3s ease-out',
              '@keyframes scaleIn': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              }
            }}
          >
            <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
          </Box>
          
          <Typography variant="h5" id="success-dialog-title" sx={{ mb: 2, color: '#555' }}>
            Success!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#777' }}>
            The content has been deleted successfully.
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={() => setSuccessDialogOpen(false)}
            sx={{ 
              bgcolor: '#4caf50', 
              '&:hover': { bgcolor: '#388e3c' },
              minWidth: 100
            }}
          >
            OK
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default ModuleDetailPage;
