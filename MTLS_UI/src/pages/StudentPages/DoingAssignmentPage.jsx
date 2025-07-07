import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Divider,
  Grid,
  Fade,
  Slide,
} from "@mui/material";
import { ArrowBack, Visibility, Refresh } from "@mui/icons-material";
import AssignmentContent from "../../components/content/AssignmentContent";
import { assignmentService, doAssignmentService } from "../../api";
import { s3StorageService } from "../../awsS3/s3Storage.service";
import AIFeedbackService from "../../services/AIFeedbackService";
// Giữ lại import AIFeedbackService cho tương lai khi cần sử dụng
// import AIFeedbackService from '../../services/AIFeedbackService';

// Hàm kiểm tra xem một ID có phải là MongoDB ObjectID hợp lệ không
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

const DoingAssignmentPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a view submission from state
  const stateData = location.state || {};
  const isViewSubmission = stateData.isViewSubmission || false;
  const submissionId = stateData.submissionId || null;
  const courseId = stateData.courseId || null;
  const moduleId = stateData.moduleId || null;
  const isRetryingFromOverview = stateData.isRetrying || false;

  // States
  const [assignment, setAssignment] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [assignmentError, setAssignmentError] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");

  // File upload states
  const [file, setFile] = useState(null);
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [submissionName, setSubmissionName] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");

  // AI feedback states
  const [aiFeedback, setAIFeedback] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackCancelled, setFeedbackCancelled] = useState(false);

  // Submission states
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isCurrentSectionCompleted, setIsCurrentSectionCompleted] =
    useState(false);
  const [grade, setGrade] = useState(null);

  // Thêm state cho dữ liệu bài nộp
  const [submissionData, setSubmissionData] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Thêm state này để hiển thị trạng thái đang submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm state cho chế độ retry
  const [isRetrying, setIsRetrying] = useState(false);

  // Thêm state theo dõi tiến trình
  const [uploadProgress, setUploadProgress] = useState(0);

  // Thêm AI state mới
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [aiScore, setAiScore] = useState(null);
  const [aiEvaluationLoading, setAiEvaluationLoading] = useState(false);
  const [showAiEvaluation, setShowAiEvaluation] = useState(false);

  // Thêm state để theo dõi khi file thay đổi
  const [fileChanged, setFileChanged] = useState(false);

  // Khởi tạo trạng thái retry nếu đến từ overview page
  useEffect(() => {
    if (isRetryingFromOverview && submissionId) {
      setIsRetrying(true);
      setIsCurrentSectionCompleted(false);
    }
  }, [isRetryingFromOverview, submissionId]);

  // Placeholder functions that will need to be implemented
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSubmissionName(selectedFile.name);
      setFileChanged(true); // Đánh dấu file đã thay đổi
    }
  };

  const generateAssignmentAIFeedback = async () => {
    // Kiểm tra xem người dùng đã điền đủ thông tin chưa
    if (!file || !submissionTitle || !submissionDescription) {
      alert("Please fill in all required fields and upload a file.");
      return;
    }

    setAiEvaluationLoading(true);
    setShowAiEvaluation(true);
    setIsGeneratingFeedback(true);
    setFileChanged(false); // Reset fileChanged khi đánh giá

    try {
      // Lấy thông tin user nếu có
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Lấy thông tin chi tiết về câu hỏi và bài tập
      const assignmentQuestion =
        assignment?.content?.find((item) => item.type === "submission")?.data
          ?.question || "";
      const instructionsForSubmission =
        assignment?.content?.find((item) => item.type === "submission")?.data
          ?.submissionInstructions || "";

      // Tìm nội dung text từ các phần khác của bài tập (nếu có)
      const otherTextContent =
        assignment?.content
          ?.filter((item) => item.type === "text" && item.data)
          ?.map((item) => item.data)
          ?.join("\n\n") || "";

      // Chuẩn bị context cho phân tích AI - truyền đầy đủ thông tin về bài tập và câu hỏi
      const questionContext = {
        assignmentType: "submission",
        title: submissionTitle,
        description: submissionDescription,
        studentName: user?.fullName || "Student",
        studentLevel: "intermediate", // Mặc định
        studentBackground: "",

        // Thông tin chi tiết về bài tập và câu hỏi
        questionText: assignmentQuestion,
        assignmentTitle: assignmentTitle || "",
        assignmentDescription: otherTextContent,
        instructionsForSubmission: instructionsForSubmission,

        // Quan trọng: Nội dung đề bài gốc để AI phân tích và đối chiếu
        originalAssignmentContent: `
Assignment Title: "${assignmentTitle || ""}"
Assignment Content: "${otherTextContent}"
Specific Question/Requirement: "${assignmentQuestion}"
Submission Instructions: "${instructionsForSubmission}"
`,

        // Thêm metadata của file để xử lý đúng
        fileType: file.type,
        fileName: file.name,
      };

      console.log(
        "Sending analysis request to OpenAI with context:",
        questionContext
      );
      console.log(
        "Attached file:",
        file.name,
        file.type,
        Math.round(file.size / 1024),
        "KB"
      );

      // Gọi service để phân tích bài làm
      const aiResponse = await AIFeedbackService.generateFeedback(
        questionContext,
        file
      );

      console.log("Received feedback from OpenAI:", aiResponse);

      // Kiểm tra có lỗi không
      if (aiResponse.error) {
        console.error("AI Feedback Error:", aiResponse.errorMessage);
        throw new Error(aiResponse.errorMessage || "Cannot create AI evaluation");
      }

      // Tính điểm AI từ kết quả trả về
      let score = 0;
      if (aiResponse.score) {
        score = parseFloat(aiResponse.score);
      } else if (aiResponse.confidenceScore) {
        score = Math.round(aiResponse.confidenceScore * 10);
      } else {
        // Tính điểm dựa trên quy tắc đơn giản nếu không có điểm từ AI
        score = 7.5; // Điểm mặc định
        if (submissionDescription.length > 100) score += 0.5;
        if (file.size > 200000) score += 0.5;
        if (submissionName.includes(".jpg") || submissionName.includes(".pdf"))
          score += 0.5;
        score = Math.min(10, Math.max(5, score));
      }

      console.log("AI score calculated:", score);

      // Chuẩn hóa phản hồi để phù hợp với cấu trúc hiển thị
      // Những trường hợp thiếu mà UI cần, tạo giá trị trống
      const normalizedFeedback = {
        feedbackText:
          aiResponse.feedbackText ||
          aiResponse.formattedText ||
          aiResponse.requirementAnalysis ||
          "",
        strengths: aiResponse.strengths || [],
        weaknesses: aiResponse.improvementAreas
          ? Array.isArray(aiResponse.improvementAreas)
            ? aiResponse.improvementAreas
            : [aiResponse.improvementAreas]
          : [],
        improvementAreas:
          aiResponse.improvementAreas || aiResponse.suggestions || "",
        suggestions: aiResponse.suggestions || "",
        recommendedResources: aiResponse.recommendedResources || [],
      };

      // Cập nhật state với dữ liệu từ API
      setAIFeedback(normalizedFeedback);
      setAiScore(score.toFixed(1));
      setAiEvaluation({
        feedback: normalizedFeedback,
        score: score.toFixed(1),
      });
    } catch (error) {
      console.error("Error generating AI feedback:", error);
      alert(
        "Cannot create AI evaluation. Error: " + (error.message || "Unknown")
      );
    } finally {
      setAiEvaluationLoading(false);
      setIsGeneratingFeedback(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!file || !submissionTitle || !submissionDescription) {
      setSubmitError("Please fill in all fields and upload a file");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Lấy thông tin user
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;

      if (!userId) {
        throw new Error("User information not found. Please login again.");
      }

      // Cấu hình thông tin student để upload file lên S3
      const studentInfo = {
        id: userId,
        name: user?.fullName || "Unknown",
      };

      // Upload file lên S3 với cấu trúc thư mục đơn giản
      const fileData = await s3StorageService.uploadFile(file, studentInfo);
      setUploadProgress(100); // Đặt tiến trình là 100% khi hoàn thành

      if (!fileData || !fileData.fileUrl) {
        throw new Error("Cannot upload file. Please try again later.");
      }

      // Chuẩn bị dữ liệu gửi đến API theo định dạng yêu cầu
      const submission = {
        assignment: assignmentId,
        student: userId,
        title: submissionTitle,
        description: submissionDescription,
        submissionUrl: fileData.fileUrl,
      };

      let response;
      // Nếu đang ở chế độ retry, sử dụng hàm updateStudentSubmission
      if (isRetrying && submissionData && submissionData._id) {
        // Thêm các trường để reset trạng thái chấm điểm
        const updateData = {
          ...submission,
          isGraded: false, // Đánh dấu là chưa được chấm điểm
          score: null, // Reset điểm về null (không phải 0 để phân biệt với điểm 0)
          comment: null // Reset comment về null thay vì string rỗng
        };

        console.log("Sending update data to API:", updateData);
        response = await doAssignmentService.updateStudentSubmission(
          submissionData._id,
          updateData
        );
      } else {
        // Nếu không, sử dụng hàm submitAssignment
        response = await doAssignmentService.submitAssignment(submission);
      }

      if (response && response.data) {
        console.log(
          "API Response after update:",
          JSON.stringify(response.data, null, 2)
        );

        // Cập nhật dữ liệu submission
        const updatedSubmission = response.data.data || response.data;
        console.log(
          "Updated submission data after API call:",
          updatedSubmission
        );

        // Đảm bảo trạng thái isGraded là false nếu đang trong chế độ retry
        if (isRetrying) {
          updatedSubmission.isGraded = false;
          console.log("Forcefully setting isGraded to false for UI display");
        }

        setSubmissionData(updatedSubmission);
        setSubmitSuccess(true);
        setIsCurrentSectionCompleted(true);
        setIsRetrying(false); // Reset trạng thái retry

        // Hiển thị thông báo thành công
        alert(
          isRetrying
            ? "Assignment resubmitted successfully!"
            : "Assignment submitted successfully!"
        );
      } else {
        throw new Error("No response received from server after submission");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while submitting.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }

    // Reset fileChanged khi submit
    setFileChanged(false);
  };

  // Thêm hàm xử lý khi retry
  const handleRetryAssignment = () => {
    setIsRetrying(true);
    setIsCurrentSectionCompleted(false);

    // Giữ lại thông tin cũ từ submission để học sinh không phải nhập lại
    if (submissionData) {
      setSubmissionTitle(submissionData.title || "");
      setSubmissionDescription(submissionData.description || "");
    }

    // Reset file để học sinh có thể upload lại
    setFile(null);
    setSubmissionName("");

    // Reset trạng thái submit
    setSubmitSuccess(false);
    setSubmitError(null);

    // Cập nhật trạng thái hiển thị điểm số
    if (submissionData) {
      // Cập nhật dữ liệu trong state để hiển thị trạng thái "chưa chấm điểm"
      // Không làm mất dữ liệu gốc, chỉ cập nhật UI
      setSubmissionData({
        ...submissionData,
        score: 0,
        isGraded: false,
        comment: "", // Xóa phản hồi của giáo viên trong UI
      });

      // Reset state grade nếu đang hiển thị
      setGrade(null);
    }
  };

  // Fetch submission data if in view mode
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (isViewSubmission && submissionId) {
        setSubmissionLoading(true);
        try {
          console.log("Đang lấy thông tin bài nộp với ID:", submissionId);
          const response =
            await doAssignmentService.getSubmissionById(submissionId);
          console.log("Kết quả lấy bài nộp:", response);

          if (response) {
            // Chuẩn hóa dữ liệu để đảm bảo truy cập nhất quán
            const normalizedSubmission = {
              _id: response.data?._id || response._id,
              title: response.data?.title || response.title || "",
              description:
                response.data?.description || response.description || "",
              questionText:
                response.data?.questionText || response.questionText || "",
              submissionUrl:
                response.data?.submissionUrl || response.submissionUrl || "",
              score: response.data?.score || response.score,
              comment: response.data?.comment || response.comment,
              submittedAt:
                response.data?.submittedAt ||
                response.submittedAt ||
                response.data?.createdAt ||
                response.createdAt,
              student: response.data?.student || response.student,
            };

            console.log(
              "Dữ liệu submission sau khi chuẩn hóa:",
              normalizedSubmission
            );

            setSubmissionData(normalizedSubmission);
            setSubmissionTitle(normalizedSubmission.title);
            setSubmissionDescription(normalizedSubmission.description);
            setSubmissionName(
              normalizedSubmission.submissionUrl
                ? normalizedSubmission.submissionUrl.split("/").pop()
                : ""
            );
            setIsCurrentSectionCompleted(true);

            if (normalizedSubmission.grade) {
              setGrade(normalizedSubmission.grade);
            }
          } else {
            throw new Error("Không tìm thấy thông tin bài nộp");
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin bài nộp:", error);
          setAssignmentError(
            "Cannot load submission information. " + error.message
          );
        } finally {
          setSubmissionLoading(false);
        }
      }
    };

    fetchSubmissionData();
  }, [isViewSubmission, submissionId]);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignmentData = async () => {
      setAssignmentLoading(true);
      try {
        console.log("Đang lấy thông tin assignment với ID:", assignmentId);

        // Kiểm tra assignmentId có tồn tại không
        if (!assignmentId) {
          throw new Error("ID bài tập không tồn tại hoặc không hợp lệ");
        }

        // Kiểm tra xem assignmentId có đúng định dạng ObjectID không
        if (!isValidObjectId(assignmentId)) {
          throw new Error("ID bài tập không đúng định dạng ObjectID");
        }

        // Get assignment by ID (not section ID)
        const assignmentResponse =
          await assignmentService.getAssignmentById(assignmentId);
        console.log("Kết quả lấy assignment:", assignmentResponse);

        if (
          !assignmentResponse ||
          (!assignmentResponse.data && !assignmentResponse._id)
        ) {
          throw new Error("Không tìm thấy thông tin bài tập với ID này");
        }

        // Chuẩn hóa dữ liệu assignment để sử dụng nhất quán
        // Handle different response formats that might come from the API
        const normalizedAssignment = {
          _id: assignmentResponse.data?._id || assignmentResponse._id,
          title: assignmentResponse.data?.title || assignmentResponse.title,
          description:
            assignmentResponse.data?.description ||
            assignmentResponse.description,
          questionText:
            assignmentResponse.data?.questionText ||
            assignmentResponse.questionText,
          // Thêm các trường khác nếu cần
        };

        console.log(
          "Dữ liệu assignment sau khi chuẩn hóa:",
          normalizedAssignment
        );

        // Format assignment data
        const formattedAssignment = {
          id: normalizedAssignment._id,
          title: normalizedAssignment.title,
          content: [
            {
              type: "text",
              data:
                normalizedAssignment.description ||
                "Không có mô tả chi tiết cho bài tập này.",
            },
            {
              type: "submission",
              data: {
                question:
                  normalizedAssignment.questionText ||
                  "Nộp bài tập của bạn cho phần này.",
                submissionInstructions: isViewSubmission
                  ? "This is your submitted assignment."
                  : "Upload your file and add a title and description.",
                allowedFileTypes: [
                  "image/*",
                  "application/pdf",
                  ".midi",
                  ".mid",
                  "audio/*",
                  "text/plain",
                ],
                readOnly: isViewSubmission, // Thêm thuộc tính readOnly để AssignmentContent có thể xử lý khác biệt
              },
            },
          ],
        };

        setAssignment(formattedAssignment);
        setAssignmentTitle(formattedAssignment.title);

        // Nếu không phải chế độ xem bài nộp, kiểm tra xem đã nộp bài chưa
        if (!isViewSubmission) {
          try {
            const userId = JSON.parse(localStorage.getItem("user"))?._id;
            if (userId) {
              const submissionsResponse =
                await doAssignmentService.getSubmissionsByStudent(userId);
              console.log(
                "Student submissions API response:",
                submissionsResponse
              );

              // Check for valid submissions data with better structure handling
              let submissionsArray = [];

              // Handle different possible response structures
              if (
                submissionsResponse?.data &&
                Array.isArray(submissionsResponse.data)
              ) {
                submissionsArray = submissionsResponse.data;
                console.log(
                  "Found submissions in data array:",
                  submissionsArray
                );
              } else if (
                submissionsResponse?.data &&
                typeof submissionsResponse.data === "object"
              ) {
                // Some APIs return {0: {...}, 1: {...}} structure
                if (Object.keys(submissionsResponse.data).length > 0) {
                  submissionsArray = Object.values(submissionsResponse.data);
                  console.log(
                    "Found submissions in data object values:",
                    submissionsArray
                  );
                }
              } else if (Array.isArray(submissionsResponse)) {
                submissionsArray = submissionsResponse;
                console.log(
                  "Found submissions in direct array:",
                  submissionsArray
                );
              }

              console.log("Processed submissions array:", submissionsArray);
              console.log("Current assignmentId:", assignmentId);

              if (submissionsArray.length > 0) {
                // Check if there's a submission for this assignment - chuyển sang so sánh string
                const existingSubmission = submissionsArray.find(
                  (submission) => {
                    const submissionAssignmentId =
                      typeof submission.assignment === "object"
                        ? submission.assignment._id
                        : submission.assignment;

                    console.log(
                      `Comparing submission assignment: ${submissionAssignmentId} with current assignment: ${assignmentId}`
                    );
                    return (
                      String(submissionAssignmentId) === String(assignmentId)
                    );
                  }
                );

                console.log("Found matching submission:", existingSubmission);

                if (existingSubmission) {
                  setIsCurrentSectionCompleted(true);

                  // Also fetch and set submission data for completed assignments
                  try {
                    console.log(
                      "Loading existing submission data:",
                      existingSubmission
                    );
                    // Normalize submission data in the same format as in view mode
                    const normalizedSubmission = {
                      _id: existingSubmission._id,
                      title: existingSubmission.title || "",
                      description: existingSubmission.description || "",
                      submissionUrl: existingSubmission.submissionUrl || "",
                      score: existingSubmission.score,
                      comment: existingSubmission.comment,
                      submittedAt:
                        existingSubmission.submittedAt ||
                        existingSubmission.createdAt,
                      student: existingSubmission.student,
                    };

                    console.log(
                      "Setting submission data:",
                      normalizedSubmission
                    );
                    setSubmissionData(normalizedSubmission);
                    setSubmissionTitle(normalizedSubmission.title);
                    setSubmissionDescription(normalizedSubmission.description);
                    setSubmissionName(
                      normalizedSubmission.submissionUrl
                        ? normalizedSubmission.submissionUrl.split("/").pop()
                        : ""
                    );

                    if (normalizedSubmission.score) {
                      setGrade(normalizedSubmission.score);
                    }
                  } catch (err) {
                    console.error("Error setting submission data:", err);
                  }
                } else {
                  console.log(
                    "No submissions found in the array, trying direct API call"
                  );

                  // Try a different approach - direct API call
                  try {
                    const directSubmissionResponse =
                      await doAssignmentService.getSubmissionByAssignmentId(
                        userId,
                        assignmentId
                      );
                    console.log(
                      "Direct submission API response:",
                      directSubmissionResponse
                    );

                    if (
                      directSubmissionResponse &&
                      directSubmissionResponse.data
                    ) {
                      const submission = directSubmissionResponse.data;
                      console.log("Direct submission found:", submission);

                      setIsCurrentSectionCompleted(true);

                      const normalizedSubmission = {
                        _id: submission._id,
                        title: submission.title || "",
                        description: submission.description || "",
                        submissionUrl: submission.submissionUrl || "",
                        score: submission.score,
                        comment: submission.comment,
                        submittedAt:
                          submission.submittedAt || submission.createdAt,
                        student: submission.student,
                      };

                      console.log(
                        "Setting submission data from direct API:",
                        normalizedSubmission
                      );
                      setSubmissionData(normalizedSubmission);
                      setSubmissionTitle(normalizedSubmission.title);
                      setSubmissionDescription(
                        normalizedSubmission.description
                      );
                      setSubmissionName(
                        normalizedSubmission.submissionUrl
                          ? normalizedSubmission.submissionUrl.split("/").pop()
                          : ""
                      );

                      if (normalizedSubmission.score) {
                        setGrade(normalizedSubmission.score);
                      }
                    }
                  } catch (directApiErr) {
                    console.error(
                      "Error fetching submission directly:",
                      directApiErr
                    );
                  }
                }
              }
            }
          } catch (err) {
            console.error("Error checking submission status:", err);
          }
        }

        setAssignmentError(null);
      } catch (error) {
        console.error("Error fetching assignment data:", error);
        setAssignmentError(
          error.message ||
            "Không thể tải dữ liệu bài tập. Vui lòng thử lại sau."
        );
      } finally {
        setAssignmentLoading(false);
      }
    };

    fetchAssignmentData();
  }, [assignmentId, isViewSubmission]);

  const handleBackClick = () => {
    // Nếu có thông tin course và module, quay lại trang overview
    if (courseId && moduleId) {
      navigate(
        `/student/course/${courseId}/module/${moduleId}/assignment/${assignmentId}`
      );
    } else {
      // Fallback: quay lại trang courses
      navigate("/student/course");
    }
  };

  // Placeholder functions for AI functionality
  const getStudentInfo = () => {
    return {
      level: "beginner",
      progress: 30,
      strengths: ["theory", "notation"],
      weaknesses: ["composition", "rhythm"],
    };
  };

  const isWebLink = (text) => {
    const domainPattern =
      /\b(?:www\.|https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/i;
    return domainPattern.test(text);
  };

  const ensureHttpPrefix = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Provider config placeholder
  const providerConfig = {
    model: "gpt-4",
    apiKey: "mock-key",
  };

  if (assignmentLoading || submissionLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading.....
        </Typography>
      </Box>
    );
  }

  if (assignmentError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{assignmentError}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Box>
    );
  }

  console.log("Render state:", {
    isViewSubmission,
    isCurrentSectionCompleted,
    hasSubmissionData: !!submissionData,
    submissionData,
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        pt: 2,
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, mx: "auto" }}>
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackClick}
            sx={{ mb: 2 }}
          >
            {"Back"}
          </Button>
        </Box>

        {/* Tiêu đề chính của trang */}
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {assignmentTitle}
        </Typography>

        {isViewSubmission}

        {/* Show submission info in either view mode or when completed */}
        {(isViewSubmission || (isCurrentSectionCompleted && !isRetrying)) && (
          <Box
            sx={{
              mb: 4,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              width: "100%",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Submission Information
              {isRetrying && " (Updating Submission)"}
            </Typography>

            {/* Hiển thị thông báo đặc biệt khi đang retry */}
            {isRetrying && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You&apos;re currently updating your submission. Previous grade
                and feedback will be cleared when you submit.
              </Alert>
            )}

            {/* Bảng lịch sử nộp bài */}
            <Box sx={{ mb: 3, overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {submissionData
                        ? new Date(
                            submissionData?.submittedAt ||
                              submissionData?.createdAt ||
                              new Date()
                          ).toLocaleString()
                        : "Submitted"}
                    </TableCell>
                    <TableCell>
                      {
                        /* Cải thiện logic để xử lý trường hợp isGraded là null/undefined */
                        submissionData?.isGraded === false ||
                        (isRetrying &&
                          submissionData?._id === submissionData?._id) // Extra check for isRetrying
                          ? "Waiting to be regraded"
                          : submissionData?.score != null // Sử dụng != null để bắt cả null và undefined
                            ? `${submissionData.score}/10`
                            : grade
                              ? `${grade}/10`
                              : "Not graded"
                      }
                    </TableCell>
                    <TableCell>
                      {
                        /* Cải thiện logic để xử lý trường hợp isGraded là null/undefined */
                        submissionData?.isGraded === false ||
                        (isRetrying &&
                          submissionData?._id === submissionData?._id) // Extra check for isRetrying
                          ? "-"
                          : (submissionData?.score != null &&
                                submissionData.score >= 5) ||
                              (grade && grade >= 5)
                            ? "Passed"
                            : "Not Passed"
                      }
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Thêm nút Retry ở đây nếu đang ở chế độ xem và không phải chế độ view submission */}
            {isCurrentSectionCompleted && !isViewSubmission && !submitSuccess && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Refresh />}
                  onClick={handleRetryAssignment}
                >
                  Retry Assignment
                </Button>
              </Box>
            )}

            {/* Phản hồi của giáo viên nếu có */}
            {submissionData?.comment && (
              <Box
                sx={{
                  mt: 3,
                  mb: 3,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Teacher Feedback
                </Typography>
                <Typography variant="body2">
                  {submissionData.comment}
                </Typography>
              </Box>
            )}

            {submissionData ? (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Title:</strong>{" "}
                  {submissionData?.title || "No title provided"}
                </Typography>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Description:</strong>{" "}
                  {submissionData?.description || "No description provided"}
                </Typography>

                {/* Hiển thị thông tin file - sử dụng submissionUrl thay vì fileUrl */}
                {submissionData?.submissionUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Attachment:</strong>
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      href={submissionData.submissionUrl}
                      target="_blank"
                    >
                      View
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body1">
                Your submission has been received. Details will be shown here
                when available.
              </Typography>
            )}
          </Box>
        )}

        {/* Layout với Grid và animated boxes */}
        {(!isViewSubmission && (!isCurrentSectionCompleted || isRetrying)) && (
          <Grid
            container
            spacing={3}
            sx={{
              position: "relative",
              justifyContent: showAiEvaluation ? "space-between" : "center",
            }}
          >
            {/* Box form nhập liệu - ban đầu ở giữa, sau đó di chuyển sang trái khi có đánh giá AI */}
            <Grid
              item
              xs={12}
              md={showAiEvaluation ? 6 : 8}
              sx={{
                transition: "all 0.5s ease-out",
                transform: showAiEvaluation ? "translateX(0)" : "translateX(0)",
              }}
            >
              <Slide direction="right" in={true} appear={showAiEvaluation}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {assignment && (
                    <Box sx={{ width: "100%" }}>
                      <AssignmentContent
                        content={assignment.content}
                        isCurrentSectionCompleted={
                          isCurrentSectionCompleted && !isRetrying
                        }
                        file={file}
                        submissionTitle={submissionTitle}
                        submissionName={submissionName}
                        submissionDescription={submissionDescription}
                        aiFeedback={aiFeedback}
                        isGeneratingFeedback={isGeneratingFeedback}
                        feedbackCancelled={feedbackCancelled}
                        navigate={navigate}
                        handleFileChange={handleFileChange}
                        setSubmissionTitle={setSubmissionTitle}
                        setSubmissionDescription={setSubmissionDescription}
                        handleSubmitAssignment={handleSubmitAssignment}
                        generateAssignmentAIFeedback={
                          generateAssignmentAIFeedback
                        }
                        setFeedbackCancelled={setFeedbackCancelled}
                        setIsGeneratingFeedback={setIsGeneratingFeedback}
                        activeProvider="openai"
                        providerConfig={providerConfig}
                        hasFallback={false}
                        modelName="GPT-4"
                        getStudentInfo={getStudentInfo}
                        isWebLink={isWebLink}
                        ensureHttpPrefix={ensureHttpPrefix}
                        isViewMode={
                          isViewSubmission ||
                          (isCurrentSectionCompleted && !isRetrying)
                        }
                        readOnly={
                          isViewSubmission ||
                          (isCurrentSectionCompleted && !isRetrying)
                        }
                      />
                    </Box>
                  )}

                  {/* Button đánh giá AI hiển thị khi chưa có đánh giá hoặc khi file đã thay đổi */}
                  {!isViewSubmission &&
                    (!isCurrentSectionCompleted || isRetrying) &&
                    file &&
                    submissionTitle &&
                    submissionDescription &&
                    (!showAiEvaluation || fileChanged) && (
                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={generateAssignmentAIFeedback}
                          disabled={aiEvaluationLoading}
                          sx={{ minWidth: "250px" }}
                        >
                          {fileChanged && showAiEvaluation ? "Re-evaluate with new file" : "Evaluate your work with AI"}
                        </Button>
                      </Box>
                    )}
                </Paper>
              </Slide>
            </Grid>

            {/* Box đánh giá AI - chỉ xuất hiện sau khi click nút đánh giá */}
            {showAiEvaluation && (
              <Grid item xs={12} md={6}>
                <Slide direction="left" in={showAiEvaluation} timeout={500}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    {aiEvaluationLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                        AI is analyzing your assignment...
                        </Typography>
                      </Box>
                    ) : aiEvaluation ? (
                      <Fade in={!!aiEvaluation} timeout={800}>
                        <Box sx={{ height: "100%", overflow: "auto" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              AI Feedback
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                bgcolor: "#e8f5e9",
                                p: 1,
                                borderRadius: 2,
                                border: "1px solid #c8e6c9",
                              }}
                            >
                              <Typography fontWeight="bold" color="#388e3c">
                                Score: {aiScore}/10
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 2 }} />

                          <Typography
                            variant="body1"
                            sx={{ mb: 2, whiteSpace: "pre-line" }}
                          >
                            {aiEvaluation.feedback.feedbackText}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ mt: 3, mb: 1 }}
                          >
                            Strengths
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            {aiEvaluation.feedback.strengths &&
                              aiEvaluation.feedback.strengths.map(
                                (strength, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{ mb: 0.5 }}
                                  >
                                    • {strength}
                                  </Typography>
                                )
                              )}
                          </Box>

                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ mt: 3, mb: 1 }}
                          >
                            Improvement Areas
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            {aiEvaluation.feedback.weaknesses &&
                              aiEvaluation.feedback.weaknesses.map(
                                (weakness, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{ mb: 0.5 }}
                                  >
                                    • {weakness}
                                  </Typography>
                                )
                              )}
                          </Box>

                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ mt: 3, mb: 1 }}
                          >
                            Suggestions for Improvement
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            {aiEvaluation.feedback.improvementAreas}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ mt: 3, mb: 1 }}
                          >
                            Recommended Resources
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            {aiEvaluation.feedback.recommendedResources &&
                              aiEvaluation.feedback.recommendedResources.map(
                                (resource, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{ mb: 0.5 }}
                                  >
                                    • {resource}
                                  </Typography>
                                )
                              )}
                          </Box>

                          <Box
                            sx={{
                              mt: 3,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setShowAiEvaluation(false)}
                            >
                              Hide Evaluation
                            </Button>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              * Note: This is an automatic evaluation and may
                              not be 100% accurate. The official score will be
                              determined by the teacher.
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    ) : (
                      <Alert severity="error">
                        Unable to create AI evaluation. Please try again later.
                      </Alert>
                    )}
                  </Paper>
                </Slide>
              </Grid>
            )}
          </Grid>
        )}

        {!isViewSubmission && (!isCurrentSectionCompleted || isRetrying) && (
          <>
            {submitError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2, width: "100%" }}>
                {submitError}
              </Alert>
            )}

            {submitSuccess && (
              <Alert severity="success" sx={{ mt: 2, mb: 2, width: "100%" }}>
                {isRetrying
                  ? "Assignment resubmitted successfully!"
                  : "Assignment submitted successfully!"}
              </Alert>
            )}

            {submitSuccess && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowBack />}
                  onClick={handleBackClick}
                  size="large"
                >
                  Return to Overview
                </Button>
              </Box>
            )}

            {isSubmitting && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <Typography variant="body2">
                  Uploading: {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default DoingAssignmentPage;
