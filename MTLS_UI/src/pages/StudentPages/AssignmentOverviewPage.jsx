import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import AssignmentOverview from '../../components/student/AssignmentOverview';
import { assignmentService, moduleService, courseService, doAssignmentService } from '../../api';
import ModulesSidebar from '../../components/layout/students/ModulesSidebar';

// Hàm kiểm tra xem một ID có phải là MongoDB ObjectID hợp lệ không
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

const AssignmentOverviewPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, assignmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState({
    courseName: '',
    moduleName: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [grade, setGrade] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  // Thêm state để lưu thông tin assignment đã chuẩn hóa
  const [normalizedAssignment, setNormalizedAssignment] = useState(null);

  useEffect(() => {
    // Lấy dữ liệu bài tập từ API
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        console.log('Đang lấy dữ liệu assignment với ID:', assignmentId);

        // 1. Lấy thông tin assignment từ ID
        const assignmentResponse = await assignmentService.getAssignmentById(assignmentId);
        console.log('Kết quả lấy assignment:', assignmentResponse);

        // Đảm bảo assignmentResponse có dữ liệu hợp lệ
        if (!assignmentResponse || (!assignmentResponse.data && !assignmentResponse._id)) {
          throw new Error('Không tìm thấy thông tin bài tập');
        }

        // Chuẩn hóa dữ liệu assignment để sử dụng nhất quán
        const normalizedAssignmentData = {
          _id: assignmentResponse.data?._id || assignmentResponse._id,
          title: assignmentResponse.data?.title || assignmentResponse.title,
          description: assignmentResponse.data?.description || assignmentResponse.description,
          dueDate: assignmentResponse.data?.dueDate || assignmentResponse.dueDate,
          maxAttempts: assignmentResponse.data?.maxAttempts || assignmentResponse.maxAttempts || 1,
          timeLimit: assignmentResponse.data?.timeLimit || assignmentResponse.timeLimit
        };

        // Lưu dữ liệu đã chuẩn hóa vào state
        setNormalizedAssignment(normalizedAssignmentData);

        console.log('Dữ liệu assignment sau khi chuẩn hóa:', normalizedAssignmentData);

        // 2. Xử lý thông tin course và module
        let selectedCourse = null;
        let selectedModule = null;

        // Kiểm tra xem courseId có phải là ObjectID không
        if (isValidObjectId(courseId)) {
          // Nếu là ObjectID, lấy course trực tiếp
          const courseResponse = await courseService.getCourseById(courseId);
          selectedCourse = courseResponse?.data;
        } else {
          // Nếu không phải ObjectID, dùng phương pháp cũ (lấy theo index)
          const coursesResponse = await courseService.getAllCourses();
          const courses = coursesResponse?.data || [];
          const courseNumber = parseInt(courseId);
          selectedCourse = courses[courseNumber - 1];
        }

        if (!selectedCourse) {
          throw new Error('Khóa học không tồn tại');
        }

        // Lấy thông tin chi tiết course (đảm bảo dùng ID thực)
        const courseDetailResponse = await courseService.getCourseById(selectedCourse._id);
        const courseDetail = courseDetailResponse?.data;

        // Lấy danh sách module của course
        const modulesResponse = await moduleService.getModulesByCourse(selectedCourse._id);
        const modules = modulesResponse?.data || [];

        // Tìm module dựa trên moduleId
        if (isValidObjectId(moduleId)) {
          // Tìm module theo ID thực
          selectedModule = modules.find(module => String(module._id) === String(moduleId));
        } else {
          // Fallback: tìm module theo index (cách cũ)
          const moduleNumber = parseInt(moduleId);
          selectedModule = modules[moduleNumber - 1];
        }

        if (!selectedModule) {
          throw new Error('Module không tồn tại');
        }

        // 3. Kiểm tra xem học viên đã nộp bài chưa
        try {
          const userId = JSON.parse(localStorage.getItem('user'))?._id;
          if (userId) {
            // Kiểm tra xem normalizedAssignmentData._id có tồn tại và hợp lệ hay không
            if (normalizedAssignmentData && normalizedAssignmentData._id && isValidObjectId(normalizedAssignmentData._id)) {
              console.log('Đang kiểm tra bài nộp với assignmentId:', normalizedAssignmentData._id);

              // Sử dụng API getSubmissionByAssignmentId để kiểm tra bài nộp của học viên
              try {
                const submissionResponse = await doAssignmentService.getSubmissionByAssignmentId(userId, normalizedAssignmentData._id);
                console.log('Bài nộp của học viên theo assignment:', submissionResponse);

                if (submissionResponse && submissionResponse.data) {
                  console.log('Đã tìm thấy bài nộp:', submissionResponse.data);
                  setSubmitted(true);
                  setSubmissionId(submissionResponse.data._id);

                  // Nếu có điểm, lưu điểm
                  if (submissionResponse.data.score) {
                    setGrade(submissionResponse.data.score);
                  }

                  // Lưu lại thông tin bài nộp
                  setUserSubmissions([submissionResponse.data]);
                } else {
                  console.log('Không tìm thấy bài nộp qua API getSubmissionByAssignmentId, thử phương pháp thay thế');
                }
              } catch (apiError) {
                console.warn('Lỗi khi gọi API getSubmissionByAssignmentId:', apiError);
                console.log('Chuyển qua phương pháp thay thế');
              }

              // Phương pháp thay thế: Nếu phương pháp trên không có kết quả hoặc lỗi
              if (!submitted) {
                console.log('Sử dụng phương pháp thay thế: getSubmissionsByStudent');
                const submissionsResponse = await doAssignmentService.getSubmissionsByStudent(userId);
                console.log('Danh sách bài nộp của học viên API response:', submissionsResponse);

                // Xử lý nhiều cấu trúc dữ liệu khác nhau
                let submissionsArray = [];

                // Kiểm tra các cấu trúc dữ liệu khác nhau
                if (submissionsResponse?.data && Array.isArray(submissionsResponse.data)) {
                  submissionsArray = submissionsResponse.data;
                  console.log('Tìm thấy bài nộp trong mảng data:', submissionsArray);
                } else if (submissionsResponse?.data && typeof submissionsResponse.data === 'object') {
                  // Một số API trả về cấu trúc {0: {...}, 1: {...}}
                  if (Object.keys(submissionsResponse.data).length > 0) {
                    submissionsArray = Object.values(submissionsResponse.data);
                    console.log('Tìm thấy bài nộp trong đối tượng data:', submissionsArray);
                  }
                } else if (Array.isArray(submissionsResponse)) {
                  submissionsArray = submissionsResponse;
                  console.log('Tìm thấy bài nộp trong mảng trực tiếp:', submissionsArray);
                }

                console.log('Mảng bài nộp sau xử lý:', submissionsArray);
                console.log('ID bài tập hiện tại:', normalizedAssignmentData._id);

                if (submissionsArray.length > 0) {
                  // Tìm bài nộp khớp với assignment hiện tại
                  const matchingSubmissions = submissionsArray.filter(
                    submission => {
                      // Kiểm tra trường hợp assignment là null
                      if (submission.assignment === null) {
                        // Kiểm tra xem có thông tin assignmentId từ field khác không
                        if (submission.assignmentId) {
                          console.log(`Tìm thấy assignmentId thay thế: ${submission.assignmentId}`);
                          return String(submission.assignmentId) === String(normalizedAssignmentData._id);
                        }

                        // In ra toàn bộ submission để kiểm tra
                        console.log("Submission có assignment=null:", JSON.stringify(submission));

                        // Trong trường hợp này, không thể so sánh bằng title vì title của submission
                        // và title của assignment khác nhau

                        // Sử dụng userId đã được xác nhận ở điều kiện bên trên
                        // Vì đã lọc theo student ID khi gọi API getSubmissionsByStudent
                        // Nếu chỉ có 1 submission cho bài tập này, hãy coi đó là bài nộp hợp lệ
                        console.log(`Coi đây là bài nộp cho assignment ${normalizedAssignmentData._id} vì assignment ID đã bị null`);

                        // Đánh dấu tìm được bài nộp cho assignment này
                        return true;
                      }

                      const submissionAssignmentId = typeof submission.assignment === 'object'
                        ? submission.assignment._id
                        : submission.assignment;

                      console.log(`So sánh ID bài tập của bài nộp: ${submissionAssignmentId} với ID bài tập hiện tại: ${normalizedAssignmentData._id}`);
                      return String(submissionAssignmentId) === String(normalizedAssignmentData._id);
                    }
                  );

                  console.log('Số bài nộp phù hợp tìm thấy:', matchingSubmissions.length);
                  setUserSubmissions(matchingSubmissions);

                  // Kiểm tra trạng thái đã nộp
                  if (matchingSubmissions.length > 0) {
                    try {
                      setSubmitted(true);
                      setSubmissionId(matchingSubmissions[0]._id);
                      console.log('Đã xác nhận học viên đã nộp bài, submissionId:', matchingSubmissions[0]._id);

                      // Lấy submission mới nhất theo thời gian
                      const latestSubmission = matchingSubmissions.reduce((latest, current) => {
                        const latestDate = new Date(latest.submittedAt || latest.createdAt);
                        const currentDate = new Date(current.submittedAt || current.createdAt);
                        return currentDate > latestDate ? current : latest;
                      }, matchingSubmissions[0]);

                      // Kiểm tra xem submission có đang chờ chấm điểm không
                      if (latestSubmission.isGraded === false) {
                        setGrade(null); // Reset grade về null nếu đang chờ chấm điểm
                        console.log('Bài nộp đang chờ chấm điểm');
                      } else if (latestSubmission.score != null) {
                        setGrade(latestSubmission.score);
                        console.log('Điểm của bài nộp mới nhất:', latestSubmission.score);
                      }
                    } catch (error) {
                      console.error('Lỗi khi xử lý thông tin bài nộp:', error);
                    }
                  } else {
                    console.log('Không tìm thấy bài nộp phù hợp');
                  }
                } else {
                  console.log('Không tìm thấy bài nộp nào trong mảng');
                }

                // Nếu vẫn chưa tìm thấy bài nộp sau khi kiểm tra mảng, thử phương pháp thứ 3 - gọi API trực tiếp
                if (!submitted) {
                  console.log('Thử phương pháp thứ 3: gọi API kiểm tra trạng thái bài nộp trực tiếp');
                  try {
                    // Kiểm tra trạng thái bài nộp trực tiếp từ API
                    const statusResponse = await doAssignmentService.getStudentAssignmentStatus(userId, normalizedAssignmentData._id);
                    console.log('Kết quả kiểm tra trạng thái bài nộp:', statusResponse);

                    if (statusResponse?.data?.started || statusResponse?.data?.completed || statusResponse?.started || statusResponse?.completed) {
                      console.log('API trạng thái xác nhận học viên đã nộp bài');
                      setSubmitted(true);

                      // Nếu có thêm thông tin, cập nhật
                      if (statusResponse.data?.submissionId || statusResponse?.submissionId) {
                        const submissionId = statusResponse.data?.submissionId || statusResponse?.submissionId;
                        setSubmissionId(submissionId);
                        console.log('Đã lấy được submissionId từ API trạng thái:', submissionId);

                        // Thử lấy thêm thông tin chi tiết về bài nộp
                        try {
                          const submissionDetail = await doAssignmentService.getSubmissionById(submissionId);
                          console.log('Chi tiết bài nộp:', submissionDetail);

                          if (submissionDetail?.data) {
                            const submission = submissionDetail.data;
                            setUserSubmissions([submission]);
                            if (submission.score) {
                              setGrade(submission.score);
                            }
                          }
                        } catch (detailError) {
                          console.error('Lỗi khi lấy chi tiết bài nộp:', detailError);
                        }
                      }
                    }
                  } catch (statusError) {
                    console.error('Lỗi khi kiểm tra trạng thái bài nộp:', statusError);
                  }
                }
              } else {
                console.warn('normalizedAssignmentData._id không hợp lệ:', normalizedAssignmentData?._id);
              }
            }
          }
        } catch (submissionError) {
          console.error('Lỗi khi lấy thông tin bài nộp:', submissionError);
          // Không throw lỗi này để vẫn hiển thị thông tin assignment
        }

        // Chuẩn bị dữ liệu
        const assignmentFormatted = {
          id: normalizedAssignmentData._id,
          title: normalizedAssignmentData.title || 'Bài tập không có tiêu đề',
          description: normalizedAssignmentData.description || 'Không có mô tả cho bài tập này',
          dueDate: normalizedAssignmentData.dueDate ? new Date(normalizedAssignmentData.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          attemptsLeft: normalizedAssignmentData.maxAttempts ? normalizedAssignmentData.maxAttempts - (userSubmissions?.length || 0) : 1,
          attemptsMax: normalizedAssignmentData.maxAttempts || 1,
          timePerAttempt: normalizedAssignmentData.timeLimit || null,
          grade: grade,
          submitted: submitted
        };

        const courseDataFormatted = {
          courseName: courseDetail?.title || 'Khóa học',
          moduleName: selectedModule.title || 'Bài tập'
        };

        console.log('Final assignment object before setting state:', assignmentFormatted);
        setAssignment(assignmentFormatted);
        setCourseData(courseDataFormatted);
        setLoading(false);

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bài tập lớn:', error);
        setError(error.message || 'Không thể tải dữ liệu bài tập lớn. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [assignmentId, moduleId, courseId]);

  useEffect(() => {
    // Component đã render lần đầu
    // Đợi 1 giây và thử lại việc kiểm tra submission status
    const timer = setTimeout(() => {
      if (!submitted && normalizedAssignment) {
        // Chạy lại hàm kiểm tra trạng thái nộp bài
        checkSubmissionStatus();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [normalizedAssignment, submitted]); // Thêm submitted để ngăn việc kiểm tra lặp lại nếu đã xác định submitted=true

  // Tách riêng hàm kiểm tra trạng thái nộp bài để dễ gọi lại
  const checkSubmissionStatus = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?._id;
      if (userId && normalizedAssignment?._id) {
        console.log('Đang kiểm tra lại bài nộp với userId:', userId, 'assignmentId:', normalizedAssignment._id);

        // Thay vì dùng getStudentAssignmentStatus, sử dụng trực tiếp getSubmissionsByStudent
        const submissionsResponse = await doAssignmentService.getSubmissionsByStudent(userId);
        console.log('Kết quả lấy bài nộp của học viên trong re-check:', submissionsResponse);

        // Xử lý nhiều cấu trúc dữ liệu khác nhau
        let submissionsArray = [];

        if (submissionsResponse?.data && Array.isArray(submissionsResponse.data)) {
          submissionsArray = submissionsResponse.data;
        } else if (submissionsResponse?.data && typeof submissionsResponse.data === 'object') {
          // Một số API trả về cấu trúc {0: {...}, 1: {...}}
          if (Object.keys(submissionsResponse.data).length > 0) {
            submissionsArray = Object.values(submissionsResponse.data);
          }
        } else if (Array.isArray(submissionsResponse)) {
          submissionsArray = submissionsResponse;
        }

        console.log('Mảng bài nộp sau xử lý trong re-check:', submissionsArray);

        if (submissionsArray.length > 0) {
          // Tìm bài nộp khớp với assignment hiện tại
          const matchingSubmissions = submissionsArray.filter(
            submission => {
              // Kiểm tra trường hợp assignment là null
              if (submission.assignment === null) {
                // Kiểm tra xem có thông tin assignmentId từ field khác không
                if (submission.assignmentId) {
                  console.log(`Tìm thấy assignmentId thay thế: ${submission.assignmentId}`);
                  return String(submission.assignmentId) === String(normalizedAssignment._id);
                }

                // In ra toàn bộ submission để kiểm tra
                console.log("Submission có assignment=null:", JSON.stringify(submission));

                // Trong trường hợp này, không thể so sánh bằng title vì title của submission
                // và title của assignment khác nhau

                // Sử dụng userId đã được xác nhận ở điều kiện bên trên
                // Vì đã lọc theo student ID khi gọi API getSubmissionsByStudent
                // Nếu chỉ có 1 submission cho bài tập này, hãy coi đó là bài nộp hợp lệ
                console.log(`Coi đây là bài nộp cho assignment ${normalizedAssignment._id} vì assignment ID đã bị null`);

                // Đánh dấu tìm được bài nộp cho assignment này
                return true;
              }

              const submissionAssignmentId = typeof submission.assignment === 'object'
                ? submission.assignment._id
                : submission.assignment;

              console.log(`So sánh ID bài tập của bài nộp: ${submissionAssignmentId} với ID bài tập hiện tại: ${normalizedAssignment._id}`);
              return String(submissionAssignmentId) === String(normalizedAssignment._id);
            }
          );

          console.log('Số bài nộp phù hợp tìm thấy trong re-check:', matchingSubmissions.length);

          // Nếu tìm thấy bài nộp phù hợp
          if (matchingSubmissions.length > 0) {
            setSubmitted(true);
            setSubmissionId(matchingSubmissions[0]._id);
            setUserSubmissions(matchingSubmissions);
            console.log('Đã xác nhận học viên đã nộp bài từ re-check, submissionId:', matchingSubmissions[0]._id);

            // Lấy submission mới nhất theo thời gian
            const latestSubmission = matchingSubmissions.reduce((latest, current) => {
              const latestDate = new Date(latest.submittedAt || latest.createdAt);
              const currentDate = new Date(current.submittedAt || current.createdAt);
              return currentDate > latestDate ? current : latest;
            }, matchingSubmissions[0]);

            // Kiểm tra xem submission có đang chờ chấm điểm không
            if (latestSubmission.isGraded === false) {
              setGrade(null); // Reset grade về null nếu đang chờ chấm điểm
              console.log('Bài nộp đang chờ chấm điểm');
            } else if (latestSubmission.score != null) {
              setGrade(latestSubmission.score);
              console.log('Điểm của bài nộp mới nhất:', latestSubmission.score);
            }
          }
        } else {
          console.log('Không tìm thấy bài nộp nào trong re-check');

          // Nếu không tìm thấy bài nộp qua cách trên, thử cách cũ một lần nữa
          try {
            const statusResponse = await doAssignmentService.getStudentAssignmentStatus(userId, normalizedAssignment._id);
            console.log('Re-check với API status cũ:', statusResponse);

            if (statusResponse?.data?.completed || statusResponse?.completed) {
              setSubmitted(true);

              if (statusResponse.data?.submissionId || statusResponse?.submissionId) {
                const submissionId = statusResponse.data?.submissionId || statusResponse?.submissionId;
                setSubmissionId(submissionId);
                console.log('Đã lấy được submissionId từ re-check API status:', submissionId);

                // Lấy chi tiết submission
                try {
                  const submissionDetail = await doAssignmentService.getSubmissionById(submissionId);
                  console.log('Chi tiết bài nộp từ re-check API status:', submissionDetail);

                  if (submissionDetail?.data) {
                    const submission = submissionDetail.data;
                    setUserSubmissions([submission]);
                    if (submission.score) {
                      setGrade(submission.score);
                    }
                  }
                } catch (detailError) {
                  console.error('Lỗi khi lấy chi tiết bài nộp từ re-check API status:', detailError);
                }
              }
            }
          } catch (statusError) {
            console.error('Lỗi khi kiểm tra trạng thái bài nộp với API status cũ:', statusError);
          }
        }
      }
    } catch (err) {
      console.error('Error in re-checking submission:', err);
    }
  };

  const handleStartAssignment = () => {
    // Nếu đang retry (có grade và không pass), chuyển thẳng vào chế độ retry
    const isRetrying = grade !== null && grade < 5;
    
    // Điều hướng đến trang làm bài và truyền thông tin courseId và moduleId
    navigate(`/student/assignment/${assignmentId}`, {
      state: {
        courseId: courseId,
        moduleId: moduleId,
        isRetrying: isRetrying,
        submissionId: isRetrying ? submissionId : null
      }
    });
  };

  const handleViewSubmission = () => {
    // Điều hướng đến trang xem bài đã nộp với state chỉ định rằng đây là chế độ xem
    navigate(`/student/assignment/${assignmentId}`, {
      state: {
        isViewSubmission: true,
        submissionId: submissionId,
        courseId: courseId,
        moduleId: moduleId
      }
    });
  };

  const renderCustomButtons = () => {
    if (!submitted) {
      return null; // Sử dụng nút mặc định
    }

    // Kiểm tra điểm số
    const isPassed = grade !== null && grade >= 5;

    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: "center" }}>
        {isPassed ? (
          <Typography
            variant="subtitle1"
            color="success.main"
            sx={{ fontWeight: "bold", mr: 2 }}
          >
            Passed !
          </Typography>
        ) : grade !== null ? ( // Chỉ hiện nút Retry khi có điểm và không pass
          <Button
            variant='contained'
            color='primary'
            onClick={handleStartAssignment}
            size='large'
          >
            Retry Assignment
          </Button>
        ) : (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ fontWeight: "bold", mr: 2 }}
          >
            Waiting for grade
          </Typography>
        )}
        <Button
          variant='outlined'
          color='info'
          onClick={handleViewSubmission}
          size='large'
        >
          View Submission
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <ModulesSidebar />
      <Box sx={{
        flexGrow: 1,
        p: 3,
        paddingTop: 2,
        ml: 0,
        overflow: 'auto',
        width: 'calc(100% - 400px)',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && assignment && (
          <AssignmentOverview
            title={assignment.title}
            type="assignment"
            courseName={courseData.courseName}
            moduleName={courseData.moduleName}
            details={{
              dueDate: assignment.dueDate,
              attemptsLeft: assignment.attemptsLeft,
              attemptsMax: assignment.attemptsMax,
              timePerAttempt: assignment.timePerAttempt,
              grade: grade,
              submitted: submitted
            }}
            onStart={handleStartAssignment}
            buttonText="Start Assignment"
            navigation={{
              course: `/student/course/${courseId}`,
              module: `/student/course/${courseId}/module/${moduleId}`
            }}
            customButtons={renderCustomButtons()}
          />
        )}
      </Box>
    </Box>
  );
};

export default AssignmentOverviewPage;