import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  ArrowBack,
  ArrowForward,
  Refresh,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import MarkCompletedButton from "./MarkCompletedButton";
import AIFeedbackService from "../../services/AIFeedbackService";
import { quizService } from '../../api/services/quiz.service';
import { courseService } from '../../api/services/course.service';
import { questionService } from '../../api/services/question.service';
import { optionService } from '../../api/services/option.service';
import { lessonService } from '../../api/services/lesson.service';
import { sectionService } from '../../api/services/section.service';

// Import new component files
import ReadingContent from "../content/ReadingContent";
import VideoContent from "../content/VideoContent";
import QuizContent from "../content/QuizContent";
import ExerciseContent from "../content/ExerciseContent";
import AssignmentContent from "../content/AssignmentContent";

// Hàm để lấy dữ liệu từ localStorage hoặc dữ liệu mặc định
const getStoredCourses = () => {
  const storedData = localStorage.getItem("courseData");
  return storedData ? JSON.parse(storedData) : [];
};

const LessonContent = () => {
  const { courseId, moduleId, sectionId } = useParams();
  const navigate = useNavigate();

  console.log('LessonContent params:', { courseId, moduleId, sectionId });

  const [localCourses, setLocalCourses] = useState(getStoredCourses());
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [file, setFile] = useState(null);
  const [submissionTitle, setSubmissionTitle] = useState(""); // Tiêu đề bài nộp
  const [submissionName, setSubmissionName] = useState(""); // Tên bài nộp
  const [submissionDescription, setSubmissionDescription] = useState(""); // Mô tả bài nộp
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [aiFeedback, setAiFeedback] = useState({}); // New state for AI feedback
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false); // Loading state for AI feedback
  const [feedbackCancelled, setFeedbackCancelled] = useState(false); // State to track if feedback was cancelled
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get current course, module and section from API or context
  const currentCourse = localCourses.find((c) => c.id === Number(courseId));
  const currentModule = currentCourse?.modules.find(
    (m) => m.id === Number(moduleId)
  );
  const selectedSection = currentModule?.sections[Number(sectionId)];

  console.log('LessonContent data:', {
    currentCourse: currentCourse ? true : false,
    currentModule: currentModule ? true : false,
    selectedSection: selectedSection ? true : false,
    localCoursesLength: localCourses.length
  });
  const isCurrentSectionCompleted = selectedSection?.status === "complete";
  const currentSectionIndex = Number(sectionId);
  const hasPrevious = currentSectionIndex > 0;
  const hasNext = currentSectionIndex < (currentModule?.sections.length || 0) - 1;

  // For AssignmentContent
  const activeProvider = AIFeedbackService.getActiveProvider();
  const providerConfig = AIFeedbackService.getProviderConfig(activeProvider);
  const hasFallback = AIFeedbackService.isFallbackEnabled();
  const modelName = activeProvider === 'openai'
    ? providerConfig.model.replace('gpt-', '').toUpperCase()
    : providerConfig.model.replace('deepseek-', '').toUpperCase();

  // Thêm useEffect để lấy dữ liệu khóa học
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Đảm bảo courseId là một chuỗi hợp lệ
        if (!courseId || typeof courseId !== 'string') {
          console.error('CourseId không hợp lệ:', courseId);
          return;
        }

        console.log('Đang tải dữ liệu cho khóa học:', courseId);
        const response = await courseService.getCourseById(courseId);

        if (response?.data) {
          console.log('Dữ liệu khóa học đã tải:', response.data);
          setLocalCourses([response.data]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu khóa học:', error);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Lưu dữ liệu vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("courseData", JSON.stringify(localCourses));
  }, [localCourses]);

  // Tự động đánh dấu video là đã xem sau khi tải
  useEffect(() => {
    if (selectedSection?.type === "video" && !isCurrentSectionCompleted) {
      // Đánh dấu là đã xem sau 5 giây
      const timer = setTimeout(() => {
        handleComplete(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedSection, isCurrentSectionCompleted]);

  // Reset state khi component mount hoặc khi retry
  useEffect(() => {
    if (selectedSection && selectedSection.type === "exercise" && selectedSection.content) {
      // Log số lượng câu hỏi để debug
      console.log("Số lượng câu hỏi:", selectedSection.content.length);
      console.log("Loại section:", selectedSection.type);
      console.log("Nội dung section:", selectedSection.content);
      console.log("Title section:", selectedSection.title);
    }
  }, [selectedSection, isRetrying]);

  // Reset state khi chuyển section
  useEffect(() => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  }, [sectionId, moduleId, courseId]);

  // Thêm useEffect để fetch quiz data khi section type là 'QUIZ'
  useEffect(() => {
    const fetchQuizData = async () => {
      if (selectedSection?.type?.toUpperCase() === 'QUIZ' && selectedSection?._id) {
        setQuizLoading(true);
        try {
          // Lấy quiz theo section ID
          const quizResponse = await quizService.getQuizBySectionId(selectedSection._id);
          console.log('Dữ liệu quiz API response:', quizResponse);

          // Lấy dữ liệu quiz từ response, có thể được trả về dưới dạng danh sách hoặc đối tượng duy nhất
          const quizData = quizResponse?.data?.quizzes || quizResponse?.data || [];
          const firstQuiz = Array.isArray(quizData) ? quizData[0] : quizData;

          console.log('Dữ liệu quiz đã xử lý:', firstQuiz);

          if (!firstQuiz) {
            console.warn('Không tìm thấy dữ liệu quiz');
            setQuizData([]);
            setQuizError("Không tìm thấy dữ liệu quiz cho section này");
            setQuizLoading(false);
            return;
          }

          // Lấy danh sách câu hỏi của quiz
          let questions = [];
          try {
            const questionsResponse = await questionService.getQuestionsByQuizId(firstQuiz._id);
            console.log('Response câu hỏi:', questionsResponse);

            questions = questionsResponse?.data?.questions || [];
            if (questions.length === 0) {
              console.warn('Không có câu hỏi nào cho quiz này');
            }

            console.log('Dữ liệu câu hỏi:', questions);
          } catch (err) {
            console.error('Lỗi khi lấy câu hỏi:', err);
            setQuizError("Lỗi khi tải dữ liệu câu hỏi");
            setQuizLoading(false);
            return;
          }

          // Cho mỗi câu hỏi, lấy các tùy chọn
          if (questions.length > 0) {
            const questionsWithOptions = await Promise.all(questions.map(async (question) => {
              try {
                const optionsResponse = await optionService.getOptionsByQuestionId(question._id);
                console.log(`Tùy chọn cho câu hỏi ${question._id}:`, optionsResponse);

                const options = optionsResponse?.data || [];
                if (options.length === 0) {
                  console.warn(`Không có tùy chọn nào cho câu hỏi ${question._id}`);
                }

                return {
                  ...question,
                  options: options
                };
              } catch (err) {
                console.error(`Lỗi khi lấy tùy chọn cho câu hỏi ${question._id}:`, err);
                return {
                  ...question,
                  options: [],
                  error: `Lỗi khi tải tùy chọn: ${err.message}`
                };
              }
            }));

            console.log('Câu hỏi với tùy chọn:', questionsWithOptions);

            // Cập nhật state với dữ liệu đầy đủ
            setQuizData(questionsWithOptions);
            setQuizError(null);
          } else {
            setQuizData([]);
            setQuizError("Không có câu hỏi nào trong quiz này");
          }
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu quiz:', error);
          setQuizError('Không thể tải dữ liệu bài quiz. Vui lòng thử lại sau.');
          setQuizData([]);
        } finally {
          setQuizLoading(false);
        }
      }
    };

    fetchQuizData();
  }, [selectedSection]);

  // Thêm useEffect để lấy dữ liệu section và lesson
  useEffect(() => {
    const fetchSectionAndLessonData = async () => {
      if (sectionId) {
        setLessonLoading(true);
        try {
          // Đầu tiên lấy thông tin section
          const sectionResponse = await sectionService.getSectionById(sectionId);
          console.log('Dữ liệu section:', sectionResponse);

          if (sectionResponse?.data) {
            const sectionData = sectionResponse.data;
            setSectionData(sectionData);

            // Kiểm tra loại section
            const sectionType = (sectionData.type || '').toUpperCase();

            // Nếu là lesson, lấy nội dung lesson
            if (sectionType === 'LESSON' || sectionType === 'VIDEO') {
              try {
                const lessonResponse = await lessonService.getLessonsBySection(sectionId);
                console.log('Dữ liệu lesson:', lessonResponse);

                if (lessonResponse?.data) {
                  setLessonData(lessonResponse.data);
                  setLessonError(null);
                } else {
                  setLessonError('Không tìm thấy nội dung bài học');
                }
              } catch (error) {
                console.error('Lỗi khi lấy nội dung lesson:', error);
                setLessonError('Không thể tải nội dung bài học. Vui lòng thử lại sau.');
              }
            }
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin section:', error);
          setLessonError('Không thể tải thông tin section. Vui lòng thử lại sau.');
        } finally {
          setLessonLoading(false);
        }
      }
    };

    fetchSectionAndLessonData();
  }, [sectionId]);

  if (!currentCourse || !currentModule || !selectedSection) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Section not found</Typography>
      </Box>
    );
  }

  // Hiển thị loading khi đang tải dữ liệu
  if (lessonLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Đang tải nội dung bài học...</Typography>
      </Box>
    );
  }

  // Hiển thị thông báo lỗi nếu không thể tải dữ liệu
  if (lessonError && sectionData?.type?.toUpperCase() === 'LESSON') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{lessonError}</Typography>
      </Box>
    );
  }

  const handleNavigation = (direction) => {
    const newIndex =
      direction === "prev" ? currentSectionIndex - 1 : currentSectionIndex + 1;
    navigate(
      `/learning/course/${courseId}/module/${moduleId}/section/${newIndex}`
    );
  };

  const handleComplete = (isCompleted) => {
    setLocalCourses((prevCourses) => {
      const newCourses = [...prevCourses];
      const courseIndex = newCourses.findIndex(
        (c) => c.id === Number(courseId)
      );
      if (courseIndex !== -1) {
        const moduleIndex = newCourses[courseIndex].modules.findIndex(
          (m) => m.id === Number(moduleId)
        );
        if (moduleIndex !== -1) {
          newCourses[courseIndex].modules[moduleIndex] = {
            ...newCourses[courseIndex].modules[moduleIndex],
            sections: newCourses[courseIndex].modules[moduleIndex].sections.map(
              (section, index) => {
                if (index === currentSectionIndex) {
                  return {
                    ...section,
                    status: isCompleted ? "complete" : undefined,
                  };
                }
                return section;
              }
            ),
          };
        }
      }
      return newCourses;
    });
    if (isCompleted) {
      setSelectedAnswers({});
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleSubmitQuiz = () => {
    if (!quizData || quizData.length === 0) {
      console.error("Không có dữ liệu quiz để nộp bài");
      return;
    }

    console.log("Đang nộp bài quiz với đáp án:", selectedAnswers);

    let correctCount = 0;
    let totalQuestions = quizData.length;

    quizData.forEach((quiz, index) => {
      const selectedOption = selectedAnswers[index];
      console.log(`Câu hỏi ${index + 1}:`, quiz.questionText);
      console.log(`- Tùy chọn đã chọn:`, selectedOption);

      // Tìm option đúng trong mảng options của câu hỏi
      const correctOption = quiz.options.find(opt => opt.isCorrect);
      console.log(`- Tùy chọn đúng:`, correctOption?.content);

      if (selectedOption === correctOption?.content) {
        console.log(`- Kết quả: Đúng`);
        correctCount++;
      } else {
        console.log(`- Kết quả: Sai`);
      }
    });

    console.log(`Kết quả: ${correctCount}/${totalQuestions} câu đúng`);

    const finalScore = (correctCount / totalQuestions) * 10;
    console.log(`Điểm số: ${finalScore.toFixed(1)}/10`);

    setScore(finalScore);

    // Lưu kết quả vào cơ sở dữ liệu hoặc context nếu cần

    // Đánh dấu hoàn thành nếu đạt điểm tối thiểu
    if (finalScore >= 8) {
      console.log("Đạt yêu cầu, đánh dấu là đã hoàn thành");
      handleComplete(true);
    } else {
      console.log("Chưa đạt yêu cầu, cần làm lại");
    }

    // Hiển thị kết quả
    setShowResults(true);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setSubmissionName(event.target.files[0]?.name || "");
  };

  const handleSubmitAssignment = () => {
    if (!file || !submissionTitle) {
      alert("Vui lòng điền đầy đủ thông tin và tải lên file!");
      return;
    }
    if (!submissionTitle || !submissionName) {
      alert("Please enter a title and submission name!");
      return;
    }
    console.log("Submission details:", {
      title: submissionTitle,
      name: submissionName,
      description: submissionDescription,
      file: file,
    });
    handleComplete(true);
    navigate(
      `/learning/course/${courseId}/module/${moduleId}/section/${
        currentSectionIndex + 1
      }`
    );
  };

  const handleSubmitExercise = () => {
    const totalQuestions = selectedSection.content.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;

    if (answeredQuestions < totalQuestions) {
      alert("Vui lòng trả lời tất cả các câu hỏi trước khi hoàn thành!");
      return;
    }

    // Tính điểm
    let correctCount = 0;

    // Sử dụng trực tiếp selectedSection.content
    selectedSection.content.forEach((item, index) => {
      if (item.type === "multipleChoice" || item.type === "trueFalse") {
        const userAnswer = selectedAnswers[index];
        const correctAnswer =
          item.type === "trueFalse"
            ? item.data.correctAnswer.toString()
            : item.data.correctAnswer;

        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      } else if (item.type === "vexFlow" || item.type === "video") {
        // Đối với các loại bài tập khác, cần xử lý riêng
        // Tạm thời coi là đúng nếu người dùng đã trả lời
        if (selectedAnswers[index]) {
          correctCount++;
        }
      }
    });

    // Tính điểm trên thang 10
    const calculatedScore = Math.round((correctCount / totalQuestions) * 10);
    setScore(calculatedScore);
    setShowResults(true);

    // Nếu đạt điểm tối thiểu (8/10), đánh dấu là đã hoàn thành
    if (calculatedScore >= 8) {
      handleComplete(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setIsRetrying((prev) => !prev); // Toggle để trigger useEffect
  };

  // Thêm hàm generateAssignmentAIFeedback
  const generateAssignmentAIFeedback = async () => {
    setIsGeneratingFeedback(true);
    setFeedbackCancelled(false);

    try {
      // Lấy thông tin học sinh từ localStorage hoặc context
      const studentInfo = getStudentInfo();

      // Chuẩn bị context cho AI
      const assignmentContext = {
        assignmentType: "submission",
        title: submissionTitle,
        description: submissionDescription,
        fileName: submissionName,
        fileType: file ? file.type : "",
        fileSize: file ? file.size : 0,
        // Thêm thông tin học sinh
        studentName: studentInfo.name,
        studentLevel: studentInfo.level,
        studentBackground: studentInfo.background,
        courseTitle: currentCourse?.title,
        moduleTitle: currentModule?.title,
        sectionTitle: selectedSection?.title
      };

      // Gọi AI service để phân tích assignment, truyền cả file để phân tích nội dung
      const feedback = await AIFeedbackService.generateFeedback(assignmentContext, file);

      // Kiểm tra nếu phản hồi là chuỗi JSON, thì phân tích và định dạng nó
      let processedFeedback = feedback;

      // Kiểm tra nếu phản hồi là chuỗi
      if (typeof feedback === 'string') {
        try {
          // Kiểm tra nếu chuỗi bắt đầu với ``` (code block trong markdown)
          if (feedback.trim().startsWith('```')) {
            // Tìm vị trí bắt đầu và kết thúc của JSON
            const jsonStartIndex = feedback.indexOf('{');
            const jsonEndIndex = feedback.lastIndexOf('}') + 1;

            if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
              const jsonStr = feedback.substring(jsonStartIndex, jsonEndIndex);
              const parsedFeedback = JSON.parse(jsonStr);
              processedFeedback = AIFeedbackService.formatAIFeedback(parsedFeedback);
            }
          } else if (feedback.trim().startsWith('{') && feedback.trim().endsWith('}')) {
            // Nếu chuỗi là JSON trực tiếp
            const parsedFeedback = JSON.parse(feedback);
            processedFeedback = AIFeedbackService.formatAIFeedback(parsedFeedback);
          }
        } catch (parseError) {
          console.error("Error parsing feedback JSON:", parseError);
          // Nếu không phân tích được, giữ nguyên phản hồi
          processedFeedback = {
            feedbackText: feedback,
            error: false
          };
        }
      }

      // Cập nhật state với feedback đã xử lý
      setAiFeedback(prevFeedback => ({
        ...prevFeedback,
        assignment: processedFeedback
      }));
    } catch (error) {
      console.error("Error generating AI feedback for assignment:", error);
      setAiFeedback(prevFeedback => ({
        ...prevFeedback,
        assignment: {
          error: true,
          errorMessage: "Failed to generate feedback. Please try again later.",
          feedbackText: "Error occurred while analyzing your assignment."
        }
      }));
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Hàm lấy thông tin học sinh từ localStorage hoặc context
  const getStudentInfo = () => {
    try {
      // Thử lấy thông tin từ localStorage
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        return JSON.parse(savedUserInfo);
      }
    } catch (error) {
      console.error('Error loading student info:', error);
    }

    // Thông tin mặc định nếu không tìm thấy
    return {
      name: "Student",
      level: determineMusicLevel(),
      background: ""
    };
  };

  // Hàm xác định trình độ âm nhạc dựa trên tiến độ khóa học
  const determineMusicLevel = () => {
    // Kiểm tra tiến độ của học sinh trong khóa học
    const completedModules = currentCourse?.modules.filter(m =>
      m.sections.every(s => s.status === "complete")
    ).length || 0;

    const totalModules = currentCourse?.modules.length || 1;
    const progressPercentage = (completedModules / totalModules) * 100;

    // Xác định trình độ dựa trên tiến độ
    if (progressPercentage < 25) {
      return "beginner";
    } else if (progressPercentage < 60) {
      return "intermediate";
    } else {
      return "advanced";
    }
  };

  // Thêm các hàm tiện ích để xử lý liên kết web
  const isWebLink = (text) => {
    if (!text) return false;

    const trimmedText = text.trim();

    // Kiểm tra các tên miền cụ thể
    const specificDomains = [
      'musictheory.net',
      'teoria.com',
      'openai.com',
      'github.com',
      'youtube.com',
      'facebook.com',
      'google.com'
    ];

    // Kiểm tra nếu text chứa bất kỳ tên miền cụ thể nào
    const containsSpecificDomain = specificDomains.some(domain =>
      trimmedText.includes(domain)
    );

    // Kiểm tra nếu text là URL hợp lệ
    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
    const isValidUrl = urlPattern.test(trimmedText);

    // Kiểm tra nếu text chứa phần mở rộng tên miền phổ biến
    const commonDomainSuffixes = ['.com', '.org', '.net', '.edu', '.io', '.dev', '.vn'];
    const hasCommonDomainSuffix = commonDomainSuffixes.some(suffix =>
      trimmedText.includes(suffix)
    );

    return isValidUrl || hasCommonDomainSuffix || containsSpecificDomain;
  };

  const ensureHttpPrefix = (url) => {
    // Loại bỏ khoảng trắng đầu và cuối
    const trimmedUrl = url.trim();

    // Kiểm tra xem URL đã có http:// hoặc https:// chưa
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      // Kiểm tra xem URL có phải là đường dẫn tương đối không
      if (trimmedUrl.startsWith('/')) {
        // Đây là đường dẫn tương đối, giữ nguyên
        return trimmedUrl;
      } else {
        // Thêm https:// vào đầu URL
        return 'https://' + trimmedUrl;
      }
    }
    return trimmedUrl;
  };

  // Trong phần render, sử dụng lessonData nếu có
  // Cập nhật phần render cho các loại content khác nhau
  let contentElement;
  if (sectionData?.type?.toUpperCase() === 'LESSON' || selectedSection?.type?.toUpperCase() === 'LESSON') {
    // Sử dụng dữ liệu từ API nếu có, nếu không thì dùng dữ liệu từ local
    const lessonContent = lessonData?.lesson?.content || selectedSection?.content;
    contentElement = <ReadingContent content={lessonContent} />;
  } else if (sectionData?.type?.toUpperCase() === 'VIDEO' || selectedSection?.type?.toUpperCase() === 'VIDEO') {
    const videoUrl = lessonData?.lesson?.videoUrl || selectedSection?.videoUrl;
    contentElement = (
      <VideoContent 
        videoUrl={videoUrl} 
        onComplete={handleComplete} 
        isCompleted={isCurrentSectionCompleted} 
      />
    );
  } else if (sectionData?.type?.toUpperCase() === 'QUIZ' || selectedSection?.type?.toUpperCase() === 'QUIZ') {
    // Sử dụng quizData đã tải trong useEffect
    contentElement = (
      <QuizContent
        questions={quizData}
        selectedAnswers={selectedAnswers}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmitQuiz}
        showResults={showResults}
        score={score}
        onRetry={handleRetry}
        loading={quizLoading}
        error={quizError}
      />
    );
  } else if (sectionData?.type?.toUpperCase() === 'EXERCISE' || selectedSection?.type?.toUpperCase() === 'EXERCISE') {
    contentElement = (
      <ExerciseContent
        questions={selectedSection?.content}
        selectedAnswers={selectedAnswers}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmitExercise}
        showResults={showResults}
        score={score}
        onRetry={handleRetry}
      />
    );
  } else if (sectionData?.type?.toUpperCase() === 'ASSIGNMENT' || selectedSection?.type?.toUpperCase() === 'ASSIGNMENT') {
    contentElement = (
      <AssignmentContent
        assignment={selectedSection}
        onFileChange={handleFileChange}
        onSubmit={handleSubmitAssignment}
        file={file}
        submissionTitle={submissionTitle}
        setSubmissionTitle={setSubmissionTitle}
        submissionName={submissionName}
        setSubmissionName={setSubmissionName}
        submissionDescription={submissionDescription}
        setSubmissionDescription={setSubmissionDescription}
        aiFeedback={aiFeedback}
        onFeedbackRequest={generateAssignmentAIFeedback}
        isGeneratingFeedback={isGeneratingFeedback}
        feedbackCancelled={feedbackCancelled}
        providerName={activeProvider}
        modelName={modelName}
      />
    );
  } else {
    contentElement = (
      <Typography variant="body1">
        Loại nội dung không được hỗ trợ hoặc đang được phát triển.
      </Typography>
    );
  }

  // Thêm hàm để đánh dấu hoàn thành
  const handleVideoComplete = (isCompleted) => {
    if (isCompleted) {
      // Gọi API hoặc cập nhật state để đánh dấu bài học đã hoàn thành
      handleComplete(true);
      
      // Hiển thị thông báo
      setSnackbar({
        open: true,
        message: 'Đã hoàn thành video bài học!',
        severity: 'success'
      });
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Title và các thông tin khác */}
      <Box sx={{ width: "100%", maxWidth: "800px", mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          {sectionData?.title || selectedSection?.title || "Untitled Section"}
        </Typography>

        {contentElement ? (
          /* Hiển thị nội dung */
          contentElement
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            Không thể tải nội dung. Vui lòng thử lại sau.
          </Typography>
        )}

        {/* Navigation và các nút khác */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 6,
            pt: 2,
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => handleNavigation("prev")}
            startIcon={<ArrowBack />}
            disabled={!hasPrevious}
          >
            Previous
          </Button>

          {/* Hiển thị nút tùy theo loại lesson và trạng thái hoàn thành */}
          {isCurrentSectionCompleted ? (
            // Nếu đã hoàn thành, hiển thị "Go to Next Item" cho mọi loại lesson
            <Button
              variant="contained"
              color="success" 
              onClick={() => handleNavigation("next")}
              disabled={!hasNext}
            >
              Go to Next Item
            </Button>
          ) : (
            // Nếu chưa hoàn thành và không phải video, hiển thị "Mark as Completed"
            sectionData?.type?.toUpperCase() !== 'VIDEO' && 
            selectedSection?.type?.toUpperCase() !== 'VIDEO' && (
              <MarkCompletedButton
                isCompleted={false}
                onToggle={handleComplete}
              />
            )
          )}

          <Button
            variant="outlined"
            onClick={() => handleNavigation("next")}
            endIcon={<ArrowForward />}
            disabled={!hasNext}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LessonContent;
