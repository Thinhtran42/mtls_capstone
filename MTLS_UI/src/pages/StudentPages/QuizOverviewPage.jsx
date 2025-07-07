import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import QuizOverview from "../../components/student/QuizOverview";
import { quizService } from "../../api/services/quiz.service";
import { courseService } from "../../api/services/course.service";
import { moduleService } from "../../api/services/module.service";
import ModulesSidebar from "../../components/layout/students/ModulesSidebar";

const QuizOverviewPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState({
    courseName: "",
    moduleName: "",
  });
  const [hasAttempted, setHasAttempted] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState(null);

  useEffect(() => {
    // Fetch quiz data
    const fetchQuizData = async () => {
      try {
        setLoading(true);

        // Get student ID from localStorage
        const studentId = localStorage.getItem("userId");
        if (!studentId) {
          console.warn("Student ID not found in localStorage");
        }


        // Get quiz by section ID
        const quizResponse = await quizService.getQuizById(quizId);

        // Xử lý cấu trúc dữ liệu từ API
        const quizData = quizResponse;

        // If student ID is available, get quiz history
        let quizHistoryData = null;
        let latestAttemptData = null;
        let hasAttemptedQuiz = false;

        if (studentId && quizData && quizData._id) {
          try {
            const doQuizResponse =
              await quizService.getDoQuizByStudentAndQuizId(
                studentId,
                quizData._id
              );

            if (doQuizResponse && doQuizResponse.data) {
              hasAttemptedQuiz = true;
              latestAttemptData = doQuizResponse.data;
              quizHistoryData = doQuizResponse.allAttempts;

              console.log("Latest quiz attempt found:", latestAttemptData);
              console.log("All quiz attempts:", quizHistoryData);
              console.log("🔍 QUIZ HISTORY - Successfully retrieved history");
            } else {
              console.log("No quiz attempts found for this student");
              console.log("🔍 QUIZ HISTORY - No history found");
            }
          } catch (historyError) {
            console.error("Error fetching quiz history:", historyError);
            console.log("🔍 QUIZ HISTORY - Error:", historyError.message);
          }
        }

        // Format quiz data, use section information if no quiz information is available
        const formattedQuiz = {
          id: quizData?._id || quizId,
          title: quizData?.title || "Music Quiz",
          description: quizData?.description || "Music knowledge assessment",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          attemptsLeft: latestAttemptData ? 2 : 3, // Assume 3 total attempts
          attemptsMax: 3,
          timePerAttempt: quizData?.duration || 30,
          grade: latestAttemptData ? latestAttemptData.score : null,
          submitted: hasAttemptedQuiz,
        };

        // Update state
        setQuiz(formattedQuiz);
        setHasAttempted(hasAttemptedQuiz);
        setLatestAttempt(latestAttemptData);

        // Lấy thông tin khóa học và module
        try {

          const courseResponse = await courseService.getCourseById(courseId);
          const courseDetail = courseResponse?.data;

            // Lấy thông tin module
            const moduleResponse = await moduleService.getModuleById(moduleId);
            const moduleDetail = moduleResponse?.data;

            setCourseData({
              courseName: courseDetail?.title || "Khóa học",
              moduleName: moduleDetail?.title || "Bài kiểm tra",
          });
        } catch (courseError) {
          console.error("Error fetching course/module data:", courseError);
          // Sử dụng dữ liệu mẫu nếu không thể lấy thông tin khóa học
          setCourseData({
            courseName: "Lý thuyết âm nhạc cơ bản",
            moduleName: "Bài kiểm tra",
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError("Could not load quiz data. Please try again later.");
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, moduleId, courseId]);

  const handleStartQuiz = () => {
    // If this is a retry, pass the latest doQuizId as a state parameter
    if (hasAttempted && latestAttempt) {
      navigate(`/student/quiz/${quizId}`, {
        state: {
          isRetry: true,
          doQuizId: latestAttempt._id,
          previousScore: latestAttempt.score,
        },
      });
    } else {
      // First attempt
      navigate(`/student/quiz/${quizId}`);
    }
  };

  const handleViewSubmission = () => {
    if (hasAttempted && latestAttempt) {
      navigate(`/student/quiz/${quizId}`, {
        state: {
          isViewSubmission: true,
          doQuizId: latestAttempt._id,
          previousScore: latestAttempt.score,
        },
      });
    }
  };

  // Tạo nút tùy chỉnh để hiển thị cả nút Retry và View Submission khi đã làm bài
  const renderCustomButtons = () => {
    if (!hasAttempted) {
      return null; // Sử dụng nút mặc định
    }

    // Kiểm tra điểm số, nếu >= 5 thì hiển thị thông báo đã vượt qua
    if (latestAttempt && latestAttempt.score >= 5) {
      return (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography
            variant="subtitle1"
            color="success.main"
            sx={{ fontWeight: "bold", mr: 2 }}
          >
            Passed !
          </Typography>
          <Button
            variant="outlined"
            color="info"
            onClick={handleViewSubmission}
            size="large"
          >
            View Submission
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartQuiz}
          size="large"
        >
          Retry Quiz
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={handleViewSubmission}
          size="large"
        >
          View Submission
        </Button>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <ModulesSidebar />
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          paddingTop: 2,
          ml: 0,
          overflow: "auto",
          width: "calc(100% - 400px)",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {loading && (
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
        )}

        {error && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && quiz && (
          <QuizOverview
            title={quiz.title}
            description={quiz.description}
            dueDate={quiz.dueDate}
            attemptsLeft={quiz.attemptsLeft}
            attemptsMax={quiz.attemptsMax}
            timePerAttempt={quiz.timePerAttempt}
            grade={quiz.grade}
            submitted={quiz.submitted}
            isPractice={false}
            courseInfo={courseData}
            onStart={handleStartQuiz}
            navigation={{
              course: `/student/course/${courseId}`,
              module: `/student/course/${courseId}/module/${moduleId}`,
            }}
            customButtons={renderCustomButtons()}
          />
        )}
      </Box>
    </Box>
  );
};

export default QuizOverviewPage;
