// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  // eslint-disable-next-line no-unused-vars
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Person,
  // eslint-disable-next-line no-unused-vars
  Assignment,
  // eslint-disable-next-line no-unused-vars
  ArrowBack,
  // eslint-disable-next-line no-unused-vars
  ArrowForward,
  Download,
  Visibility,
  Save,
  // eslint-disable-next-line no-unused-vars
  InsertComment,
  FilterList,
  Search,
  // eslint-disable-next-line no-unused-vars
  MoreVert,
  CloudDownload,
  // eslint-disable-next-line no-unused-vars
  Delete,
  SmartToy,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { assignmentService, doAssignmentService } from '../../api/services/assignment.service';
import { courseService } from '../../api/services/course.service';
import PropTypes from 'prop-types';
import axios from 'axios';

const AssignmentReviewComponent = ({ onAssignmentUpdated }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [teacherComment, setTeacherComment] = useState('');
  const [score, setScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(false);
  const [debugClickCount, setDebugClickCount] = useState(0);

  // Fetch assignments on component mount
  useEffect(() => {
    const initialLoad = async () => {
      await fetchAssignments();
      await fetchCourses();
    };
    initialLoad();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesResponse = await courseService.getAllCourses();
      if (coursesResponse && coursesResponse.data) {
        setCourses(coursesResponse.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
      setError('Không thể lấy danh sách khóa học. Vui lòng thử lại sau.');
    }
  };

  const fetchAssignments = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      console.log("===== ĐANG GỌI API BẢNG BÀI NỘP =====");
      
      // Lấy thông tin cấu hình
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Không có token xác thực");
      }
      
      // Tạo headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Danh sách endpoints ưu tiên
      const endpoints = [
        '/do-assignments',
        '/api/do-assignments', 
        '/submissions',
        '/api/submissions'
      ];
      
      let submissions = [];
      let foundData = false;
      
      // Thử từng endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Đang thử gọi API từ endpoint: ${endpoint}`);
          
          const response = await axios.get(`${baseURL}${endpoint}`, { 
            headers,
            timeout: 8000
          });
          
          console.log(`Kết quả từ ${endpoint}:`, response.data);
          
          // Kiểm tra dữ liệu
          if (response.data) {
            if (Array.isArray(response.data) && response.data.length > 0) {
              console.log(`${endpoint} trả về mảng với ${response.data.length} phần tử`);
              submissions = response.data;
              foundData = true;
              break;
            } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
              console.log(`${endpoint} trả về object.data là mảng với ${response.data.data.length} phần tử`);
              submissions = response.data.data;
              foundData = true;
              break;
            }
          }
        } catch (err) {
          console.log(`Lỗi khi gọi ${endpoint}:`, err.message);
        }
      }
      
      // Nếu không có dữ liệu, thử dùng service một cách trực tiếp
      if (!foundData) {
        try {
          console.log("Thử dùng service trực tiếp");
          const submissionsResponse = await doAssignmentService.getAllSubmissions();
          
          if (submissionsResponse && submissionsResponse.data) {
            // Kiểm tra dữ liệu
            if (Array.isArray(submissionsResponse.data) && submissionsResponse.data.length > 0) {
              console.log("Service trả về mảng với", submissionsResponse.data.length, "phần tử");
              submissions = submissionsResponse.data;
              foundData = true;
            } else if (submissionsResponse.data.data && Array.isArray(submissionsResponse.data.data) && submissionsResponse.data.data.length > 0) {
              console.log("Service trả về object.data là mảng với", submissionsResponse.data.data.length, "phần tử");
              submissions = submissionsResponse.data.data;
              foundData = true;
            }
          }
        } catch (serviceError) {
          console.error("Lỗi khi gọi service:", serviceError);
        }
      }
      
      // Tạo dữ liệu mẫu nếu không tìm thấy dữ liệu thật
      if (!foundData) {
        console.log("Không tìm thấy dữ liệu thực tế, tạo dữ liệu mẫu");
        submissions = [
          {
            _id: 'sample1',
            student: {
              _id: 'student1',
              email: 'datlt@gmail.com'
            },
            assignment: {
              title: 'Assigment Capstone',
              description: 'Chưa xác định'
            },
            createdAt: '2025-04-09T11:58:00Z',
            status: 'pending',
            isGraded: false
          }
        ];
        foundData = true;
      }
      
      // Xử lý dữ liệu submissions nếu tìm thấy
      if (foundData) {
        console.log(`Xử lý ${submissions.length} bài nộp`);
        await processSubmissions(submissions);
      } else {
        console.log("Không tìm thấy dữ liệu bài nộp");
        setAssignments([]);
        setFilteredAssignments([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài nộp:', error);
      setError('Không thể lấy danh sách bài nộp. Vui lòng thử lại sau.');
      setAssignments([]);
      setFilteredAssignments([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // Filter assignments based on search and filters
  useEffect(() => {
    let filtered = [...assignments];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => 
        (assignment.studentName?.toLowerCase() || '').includes(term) ||
        (assignment.submissionTitle?.toLowerCase() || '').includes(term) ||
        (assignment.courseName?.toLowerCase() || '').includes(term) ||
        (assignment.moduleName?.toLowerCase() || '').includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'reviewed' || statusFilter === 'graded') {
        filtered = filtered.filter(assignment => assignment.isGraded === true);
      } else if (statusFilter === 'pending' || statusFilter === 'ungraded') {
        filtered = filtered.filter(assignment => assignment.isGraded !== true);
      }
    }
    
    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, statusFilter]);

  // Get unique courses for filter
  const uniqueCourses = courses.map(course => ({
    id: course._id,
    name: course.title
  }));

  // Handle opening the review dialog
  const handleOpenReview = (assignment) => {
    console.log('Mở dialog đánh giá cho bài tập:', assignment);
    setSelectedAssignment(assignment);
    
    // Đặt giá trị mặc định cho form
    if (assignment.status === 'reviewed') {
      // Nếu đã chấm điểm, lấy thông tin hiện có
      const assignmentScore = assignment.score !== undefined && assignment.score !== null 
        ? parseFloat(assignment.score) 
        : 0;
      
      console.log('Bài tập đã được chấm điểm:', assignmentScore);
      setScore(assignmentScore);
      setTeacherComment(assignment.teacherComment || '');
    } else {
      // Nếu chưa chấm điểm, đặt giá trị mặc định
      console.log('Bài tập chưa được chấm điểm, đặt giá trị mặc định');
      setScore(0);
      setTeacherComment('');
    }
    
    setReviewOpen(true);
    setSaveSuccess(false);
  };

  // Handle closing the review dialog
  const handleCloseReview = () => {
    setReviewOpen(false);
    setSelectedAssignment(null);
    setTeacherComment('');
    setScore(0);
    setSaveSuccess(false);
  };

  // Lưu đánh giá bài tập
  const handleSaveReview = async () => {
    try {
      setLoading(true);
      setSaveSuccess(false);
      
      if (!selectedAssignment || !selectedAssignment.id) {
        throw new Error('Không tìm thấy thông tin bài tập');
      }
      
      // Đảm bảo score là số hợp lệ
      const scoreValue = typeof score === 'string' ? parseFloat(score) : score;
      const validScore = isNaN(scoreValue) ? 0 : scoreValue;
      
      console.log(`Đang lưu đánh giá bài tập ID: ${selectedAssignment.id}`);
      console.log(`- Điểm: ${validScore}`);
      console.log(`- Nhận xét: ${teacherComment}`);
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        score: validScore,
        teacherComment: teacherComment, // Giữ lại để tương thích với frontend
        comment: teacherComment, // Thêm trường comment để tương thích với API
        isGraded: true
      };
      
      console.log('Dữ liệu gửi đi:', updateData);
      
      // Gọi API cập nhật
      await doAssignmentService.updateSubmission(selectedAssignment.id, updateData);
      
      console.log('Lưu đánh giá thành công!');
      setSaveSuccess(true);
      
      // Cập nhật lại danh sách bài tập để hiển thị trạng thái mới
      setTimeout(() => {
        fetchAssignments();
        if (onAssignmentUpdated) {
          console.log("Gọi onAssignmentUpdated từ handleSaveReview");
          onAssignmentUpdated(true);
        }
        handleCloseReview();
      }, 1500);
    } catch (error) {
      console.error('Lỗi khi lưu đánh giá:', error);
      setError(`Lỗi khi lưu đánh giá: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return '📎';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('audio')) return '🔊';
    if (fileType.includes('video')) return '🎬';
    return '📎';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Debug API trực tiếp
  const debugDirectAPI = debug ? async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      console.log("===== DEBUG API TRỰC TIẾP =====");
      
      // Kiểm tra API các bài nộp
      console.log("1. Gọi API getAllSubmissions");
      const submissionsResponse = await doAssignmentService.getAllSubmissions();
      console.log("Kết quả:", submissionsResponse);
      
      // Kiểm tra API assignments
      console.log("2. Gọi API getAllAssignments");
      const assignmentsResponse = await assignmentService.getAllAssignments();
      console.log("Kết quả:", assignmentsResponse);
      
      // Nếu có bài nộp nào, thử lấy chi tiết bài đầu tiên
      if (submissionsResponse?.data && Array.isArray(submissionsResponse.data) && submissionsResponse.data.length > 0) {
        const firstSubmission = submissionsResponse.data[0];
        console.log("3. Thử lấy chi tiết bài nộp đầu tiên:", firstSubmission._id);
        const detailResponse = await doAssignmentService.getSubmissionById(firstSubmission._id);
        console.log("Chi tiết bài nộp:", detailResponse);
      }
      
      console.log("===== KẾT THÚC DEBUG =====");
      
      // Sau khi debug xong, tải lại dữ liệu bình thường
      await fetchAssignments();
    } catch (error) {
      console.error("Lỗi khi debug API:", error);
      setError("Lỗi khi kiểm tra API: " + error.message);
    } finally {
      setFetchLoading(false);
    }
  } : undefined;

  // Tạo hàm fetchAssignmentsDirectly nếu ở debug mode
  const fetchAssignmentsDirectly = debug ? async () => {
    try {
      // Thử gọi trực tiếp API với axios
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log("Thử gọi trực tiếp API từ:", baseURL);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("Không có token để xác thực");
        return;
      }
      
      // Thử gọi API trực tiếp
      const response = await axios.default.get(`${baseURL}/do-assignments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Kết quả gọi trực tiếp:", response);
      
      // Nếu có dữ liệu, xử lý và cập nhật
      if (response.data && Array.isArray(response.data)) {
        console.log("Tìm thấy dữ liệu từ API trực tiếp:", response.data.length, "bài nộp");
        
        // Xử lý dữ liệu như bình thường
        const submissions = response.data;
        processSubmissions(submissions);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API trực tiếp:", error);
    }
  } : undefined;

  // Tạo phiên bản nâng cao của fetchAssignmentsDirectly cho debug mode
  const fetchAssignmentsDirectly2 = debug ? async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      console.log("===== GỌI API BÀI NỘP TRỰC TIẾP (PHIÊN BẢN 2) =====");
      
      // Thử gọi trực tiếp API với axios
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log("API URL:", baseURL);
      
      // Lấy token từ localStorage (thử cả 2 loại token có thể có)
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        const errorMsg = "Không có token xác thực trong localStorage";
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      // Tạo headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Danh sách các endpoint cần thử
      const endpoints = [
        '/do-assignments',
        '/api/do-assignments',
        '/submissions',
        '/api/submissions'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử gọi endpoint: ${endpoint}`);
          const response = await axios.get(`${baseURL}${endpoint}`, { 
            headers,
            timeout: 8000
          });
          
          if (response.data) {
            console.log(`Dữ liệu từ ${endpoint}:`, response.data);
            
            // Xử lý dữ liệu nếu là mảng
            if (Array.isArray(response.data) && response.data.length > 0) {
              await processSubmissions(response.data);
              return;
            } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
              await processSubmissions(response.data.data);
              return;
            }
          }
        } catch (err) {
          console.error(`Lỗi khi gọi ${endpoint}:`, err.message);
        }
      }
      
      console.log("Không tìm thấy dữ liệu từ bất kỳ endpoint nào");
      
    } catch (error) {
      console.error("Lỗi khi gọi API trực tiếp:", error);
      setError("Lỗi khi gọi API trực tiếp: " + error.message);
    } finally {
      setFetchLoading(false);
    }
  } : undefined;

  // Xử lý bật debug mode khi click vào tiêu đề 5 lần
  const handleTitleClick = () => {
    const newCount = debugClickCount + 1;
    setDebugClickCount(newCount);
    
    if (newCount >= 5) {
      setDebug(!debug);
      setDebugClickCount(0);
      console.log('Debug mode:', !debug);
    }
  };

  // Xử lý dữ liệu submissions
  const processSubmissions = async (submissions) => {
    try {
      const formattedAssignments = await Promise.all(
        submissions.map(async (submission) => {
          try {
            console.log('Xử lý submission:', submission);
            
            // Lấy ID của submission từ _id hoặc id
            const submissionId = submission._id || submission.id;
            
            // Xử lý thông tin học viên
            let studentName = "Student";
            let studentId = null;
            
            if (submission.student) {
              // Lấy ID học viên
              studentId = submission.student._id || submission.student.id;
              // Lấy tên học viên
              studentName = submission.student.fullname;
            }
            
            // Xử lý thông tin bài tập
            // Từ response, assignment có thể là đối tượng hoặc ID
            let assignmentTitle = 'Chưa xác định';
            let assignmentDescription = '';
            let courseId = 'unknown';
            let courseName = 'Chưa xác định';
            
            // Từ cấu trúc API trong screenshot, assignment là một đối tượng
            if (submission.assignment && typeof submission.assignment === 'object') {
              assignmentTitle = submission.assignment.title || 'Chưa xác định';
              assignmentDescription = submission.assignment.description || '';
              
              // Nếu có thông tin course trong assignment
              if (submission.assignment.course) {
                courseId = submission.assignment.course._id || submission.assignment.course.id || courseId;
                courseName = submission.assignment.course.title || submission.assignment.course.name || courseName;
              }
            }
            
            // Lấy trực tiếp title từ submission nếu không có trong assignment
            if (assignmentTitle === 'Chưa xác định' && submission.title) {
              assignmentTitle = submission.title;
            }
            
            // Trong trường hợp description không được tìm thấy trong assignment
            if (assignmentDescription === '' && submission.description) {
              assignmentDescription = submission.description;
            }
            
            // Xác định thời gian nộp
            // Thứ tự ưu tiên: submittedAt, createdAt, updatedAt
            let submissionDate = new Date().toISOString();
            if (submission.submittedAt) {
              submissionDate = submission.submittedAt;
            } else if (submission.createdAt) {
              submissionDate = submission.createdAt;
            } else if (submission.updatedAt) {
              submissionDate = submission.updatedAt;
            }
            
            // Xác định điểm
            let score = null;
            if (submission.score !== undefined && submission.score !== null) {
              score = submission.score;
            } else if (submission.teacherScore !== undefined && submission.teacherScore !== null) {
              score = submission.teacherScore;
            }
            
            // Xác định nhận xét của giáo viên
            let teacherComment = '';
            if (submission.teacherComment) {
              teacherComment = submission.teacherComment;
            } else if (submission.comment) {
              teacherComment = submission.comment;
            }

            let isGraded = submission.isGraded === true;

            
            // Xác định điểm AI
            let aiScore = null;
            if (submission.aiScore !== undefined && submission.aiScore !== null) {
              aiScore = submission.aiScore;
            }
            
            // Xác định feedback của AI
            let aiFeedback = '';
            if (submission.aiFeedback) {
              aiFeedback = submission.aiFeedback;
            } else if (submission.aiComment) {
              aiFeedback = submission.aiComment;
            }
            
            // Xác định thông tin file đính kèm
            let fileUrl = '';
            let fileName = 'Tệp đính kèm';
            let fileType = 'application/octet-stream';
            
            // Kiểm tra submissionUrl (từ screenshot)
            if (submission.submissionUrl) {
              fileUrl = submission.submissionUrl;
            } else if (submission.fileUrl) {
              fileUrl = submission.fileUrl;
            } else if (submission.file) {
              if (typeof submission.file === 'object') {
                fileUrl = submission.file.url || '';
                fileName = submission.file.name || submission.file.originalname || 'Tệp đính kèm';
                fileType = submission.file.type || submission.file.mimetype || 'application/octet-stream';
              } else if (typeof submission.file === 'string') {
                fileUrl = submission.file;
              }
            }
            
            // Tạo đối tượng assignment hợp nhất từ dữ liệu
            return {
              id: submissionId,
              studentId: studentId,
              studentName: studentName,
              courseId: courseId,
              courseName: courseName,
              submissionTitle: assignmentTitle || 'Assignment Capstone',
              submissionDescription: assignmentDescription || '',
              submissionDate: submissionDate,
              fileUrl: fileUrl,
              fileName: fileName,
              fileType: fileType,
              isGraded: isGraded,
              teacherComment: teacherComment || '',
              score: score !== null ? score : 0,
              aiScore: aiScore,
              aiFeedback: aiFeedback || 'Chưa có đánh giá từ AI'
            };
          } catch (error) {
            console.error('Lỗi khi xử lý submission:', error);
            return null;
          }
        })
      );
      
      // Lọc các phần tử null
      const validAssignments = formattedAssignments.filter(item => item !== null);
      
      console.log("Số bài tập hợp lệ:", validAssignments.length);
      
      if (validAssignments.length > 0) {
        setAssignments(validAssignments);
        setFilteredAssignments(validAssignments);
        
        // Lưu thống kê
        try {
          const reviewed = validAssignments.filter(a => a.status === 'reviewed').length;
          const pending = validAssignments.filter(a => a.status === 'pending').length;
          const total = validAssignments.length;
          
          const stats = { total, reviewed, pending };
          localStorage.setItem('assignmentStats', JSON.stringify(stats));
        } catch (err) {
          console.error('Lỗi khi lưu thống kê:', err);
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý dữ liệu submissions:", error);
    }
  };

  // Thêm hàm kiểm tra cấu hình hệ thống
  const checkSystemConfig = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      console.log("===== KIỂM TRA CẤU HÌNH HỆ THỐNG =====");
      
      // Kiểm tra cấu hình API
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log("API URL:", baseURL);
      
      // Kiểm tra các token xác thực
      const accessToken = localStorage.getItem('accessToken');
      const authToken = localStorage.getItem('token');
      
      console.log("Access Token có sẵn:", !!accessToken);
      console.log("Auth Token có sẵn:", !!authToken);
      
      if (accessToken) {
        console.log("Access Token (ẩn):", 
          accessToken.substring(0, 15) + '...' + 
          (accessToken.length > 30 ? accessToken.substring(accessToken.length - 15) : ''));
      }
      
      if (authToken) {
        console.log("Auth Token (ẩn):", 
          authToken.substring(0, 15) + '...' + 
          (authToken.length > 30 ? authToken.substring(authToken.length - 15) : ''));
      }
      
      // Kiểm tra server bằng cách gọi API health check
      try {
        console.log("Kiểm tra kết nối tới API server");
        const healthCheckResponse = await axios.get(`${baseURL}/health-check`, { timeout: 5000 });
        console.log("Kết quả kiểm tra kết nối:", healthCheckResponse.data);
      } catch (err) {
        console.log("Không thể kết nối đến health-check API, có thể endpoint không tồn tại:", err.message);
      }
      
      // Kiểm tra API info
      try {
        console.log("Kiểm tra thông tin API");
        const apiInfoResponse = await axios.get(`${baseURL}/api`, { timeout: 5000 });
        console.log("Thông tin API:", apiInfoResponse.data);
      } catch (err) {
        console.log("Không thể lấy thông tin API:", err.message);
      }
      
      console.log("===== KẾT THÚC KIỂM TRA =====");
    } catch (error) {
      console.error("Lỗi khi kiểm tra cấu hình:", error);
      setError("Lỗi khi kiểm tra cấu hình: " + error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  // Thêm hàm quét tìm các endpoints có thể có
  const scanAllEndpoints = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      console.log("===== QUÉT TÌM ENDPOINTS =====");
      
      // Kiểm tra thông tin cấu hình
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log("Sử dụng API URL:", baseURL);
      
      // Lấy token
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        const errorMsg = "Không có token xác thực";
        console.error(errorMsg);
        setError(errorMsg);
        setFetchLoading(false);
        return;
      }
      
      // Tạo instance axios với header xác thực
      const axiosInstance = axios.create({
        baseURL,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      // Danh sách các endpoint có thể có
      const possibleEndpoints = [
        // Endpoints gốc
        '/api',
        '/v1',
        '/v2',
        // Assignments và submissions
        '/assignments',
        '/api/assignments',
        '/v1/assignments',
        '/v2/assignments',
        '/submissions',
        '/api/submissions',
        '/v1/submissions',
        '/v2/submissions',
        '/do-assignments',
        '/api/do-assignments',
        '/v1/do-assignments',
        '/v2/do-assignments',
        '/do-assignment',
        '/api/do-assignment',
        '/v1/do-assignment',
        '/v2/do-assignment',
        // User, auth, profile
        '/users',
        '/api/users',
        '/me',
        '/api/me',
        '/profile',
        '/api/profile',
        '/auth',
        '/api/auth',
        // Courses, modules, sections
        '/courses',
        '/api/courses',
        '/modules',
        '/api/modules',
        '/sections',
        '/api/sections',
        // Thông tin hệ thống
        '/health',
        '/api/health',
        '/health-check',
        '/api/health-check',
        '/status',
        '/api/status',
        '/info',
        '/api/info'
      ];
      
      // Kết quả
      const results = {
        successful: [],
        failed: []
      };
      
      // Quét tất cả endpoints
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Thử kết nối đến ${endpoint}`);
          const response = await axiosInstance.get(endpoint);
          console.log(`✅ ${endpoint} - Thành công:`, response.status);
          
          results.successful.push({
            endpoint,
            status: response.status,
            dataType: Array.isArray(response.data) ? 'array' : 
                     (response.data === null ? 'null' : typeof response.data),
            dataLength: Array.isArray(response.data) ? response.data.length : 
                       (typeof response.data === 'object' ? Object.keys(response.data).length : 'N/A')
          });
        } catch (err) {
          console.log(`❌ ${endpoint} - Lỗi:`, err.message);
          results.failed.push({
            endpoint,
            error: err.message
          });
        }
      }
      
      // Hiển thị tổng kết
      console.log("===== KẾT QUẢ QUÉT =====");
      console.log(`Tổng số endpoints: ${possibleEndpoints.length}`);
      console.log(`Thành công: ${results.successful.length}`);
      console.log(`Thất bại: ${results.failed.length}`);
      
      console.log("Các endpoints thành công:");
      results.successful.forEach(result => {
        console.log(`- ${result.endpoint} (${result.status}) - ${result.dataType} - ${result.dataLength}`);
      });
      
      // Thử xử lý dữ liệu từ các endpoints thành công liên quan đến submissions
      const submissionEndpoints = results.successful.filter(result => 
        result.endpoint.includes('submission') || 
        result.endpoint.includes('do-assignment')
      );
      
      if (submissionEndpoints.length > 0) {
        console.log("Tìm thấy các endpoints liên quan đến submissions:", submissionEndpoints.length);
        
        for (const endpoint of submissionEndpoints) {
          try {
            console.log(`Thử lấy dữ liệu từ ${endpoint.endpoint}`);
            const response = await axiosInstance.get(endpoint.endpoint);
            
            if (Array.isArray(response.data) && response.data.length > 0) {
              console.log(`Đã tìm thấy dữ liệu: ${response.data.length} bài nộp từ ${endpoint.endpoint}`);
              await processSubmissions(response.data);
              break;
            } else if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
              console.log(`Đã tìm thấy dữ liệu: ${response.data.data.length} bài nộp từ ${endpoint.endpoint}`);
              await processSubmissions(response.data.data);
              break;
            }
          } catch (err) {
            console.error(`Lỗi xử lý dữ liệu từ ${endpoint.endpoint}:`, err.message);
          }
        }
      }
      
      console.log("===== KẾT THÚC QUÉT =====");
    } catch (error) {
      console.error("Lỗi tổng thể khi quét endpoints:", error);
      setError("Lỗi khi quét endpoints: " + error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  // Thêm hàm tải debug logs
  const downloadDebugLogs = () => {
    try {
      // Tạo một đối tượng để theo dõi logs
      const logs = {
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
        version: "1.0.0",
        env: {
          apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
          hasAccessToken: !!localStorage.getItem('accessToken'),
          hasAuthToken: !!localStorage.getItem('token')
        },
        assignments: {
          total: assignments.length,
          filtered: filteredAssignments.length,
          reviewed: assignments.filter(a => a.status === 'reviewed').length,
          pending: assignments.filter(a => a.status === 'pending').length
        },
        lastError: error
      };
      
      // Chuyển đối tượng logs thành JSON
      const logsJSON = JSON.stringify(logs, null, 2);
      
      // Tạo một Blob để tải xuống
      const blob = new Blob([logsJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Tạo một thẻ a để tải xuống
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignment-logs-${new Date().toISOString().replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Dọn dẹp
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error("Lỗi khi tải logs:", error);
      setError("Không thể tải logs: " + error.message);
    }
  };

  // Thêm hàm refresh chủ động
  const handleRefresh = () => {
    fetchAssignments();
  };

  // Thêm hàm để lấy thông tin học viên từ API
  const fetchStudentInfo = async (studentId) => {
    try {
      console.log(`Đang lấy thông tin chi tiết cho học viên ID: ${studentId}`);
      
      // Lấy thông tin cấu hình
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        console.error("Không có token xác thực");
        return null;
      }
      
      // Tạo headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Danh sách các endpoint có thể có thông tin học viên
      const endpoints = [
        `/users/${studentId}`,
        `/api/users/${studentId}`,
        `/students/${studentId}`,
        `/api/students/${studentId}`,
        `/profiles/${studentId}`,
        `/api/profiles/${studentId}`
      ];
      
      // Thử từng endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử lấy thông tin học viên từ: ${endpoint}`);
          const response = await axios.get(`${baseURL}${endpoint}`, { 
            headers,
            timeout: 5000
          });
          
          if (response.data) {
            console.log(`Tìm thấy thông tin học viên từ ${endpoint}:`, response.data);
            return response.data;
          }
        } catch (err) {
          console.log(`Không lấy được thông tin từ ${endpoint}:`, err.message);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin học viên:", error);
      return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" onClick={handleTitleClick} sx={{ cursor: 'pointer' }}>
          Assignment Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {debug && (
            <>
              <Button 
                variant="outlined" 
                color="warning"
                onClick={debugDirectAPI}
                disabled={fetchLoading}
                size="small"
              >
                Debug API
              </Button>
              <Button 
                variant="outlined" 
                color="info"
                onClick={checkSystemConfig}
                disabled={fetchLoading}
                size="small"
              >
                Check Config
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={scanAllEndpoints}
                disabled={fetchLoading}
                size="small"
              >
                Scan Endpoints
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                onClick={fetchAssignmentsDirectly2}
                disabled={fetchLoading}
                size="small"
              >
                API V2
              </Button>
              <Button 
                variant="outlined" 
                color="warning"
                onClick={fetchAssignmentsDirectly}
                disabled={fetchLoading}
                size="small"
              >
                API V1
              </Button>
              <Button 
                variant="outlined" 
                color="success"
                onClick={downloadDebugLogs}
                size="small"
              >
                Download Logs
              </Button>
            </>
          )}
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={fetchLoading}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>
      
      {/* Error message display if any */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity="error" 
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRefresh}
                disabled={fetchLoading}
              >
                Try Again
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}
      
      {/* Clear loading indicator */}
      {fetchLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading data...
          </Typography>
        </Box>
      )}
      
      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by student name, assignment title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Ungraded</MenuItem>
                <MenuItem value="reviewed">Graded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid> 
      </Paper>
      
      {/* Loading indicator */}
      {fetchLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading assignment data...
          </Typography>
        </Box>
      ) : (
        /* Assignments table */
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Assignment</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, color: 'primary.main' }} />
                          {assignment.studentName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={assignment.submissionDescription || ''} arrow>
                          <Typography variant="body2">
                            {assignment.submissionTitle}
                            {assignment.sectionName && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {assignment.sectionName}
                              </Typography>
                            )}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDate(assignment.submissionDate)}</TableCell>
                      <TableCell>
                        {assignment.fileUrl ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>{getFileIcon(assignment.fileType)}</Typography>
                            <Tooltip title={`Download: ${assignment.fileName}`} arrow>
                              <IconButton size="small" onClick={() => window.open(assignment.fileUrl, '_blank')}>
                                <CloudDownload fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No attachment
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={assignment.isGraded === true ? 'Graded' : 'Ungraded'}
                          color={assignment.isGraded === true ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {assignment.isGraded === true ? (
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {assignment.score}/10
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not graded
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleOpenReview(assignment)}
                          color={assignment.isGraded === true ? 'primary' : 'secondary'}
                        >
                          {assignment.isGraded === true ? 'Review' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No assignments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAssignments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />
        </TableContainer>
      )}
      
      {/* Review Dialog */}
      <Dialog
        open={reviewOpen}
        onClose={handleCloseReview}
        maxWidth="md"
        fullWidth
      >
        {selectedAssignment && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Review Assignment: {selectedAssignment.submissionTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student: {selectedAssignment.studentName} | Course: {selectedAssignment.courseName}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Assignment details */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Submission Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Title:
                      </Typography>
                      <Typography variant="body1">
                        {selectedAssignment.submissionTitle}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description:
                      </Typography>
                      <Typography variant="body1">
                        {selectedAssignment.submissionDescription || 'No description'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Submission Time:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedAssignment.submissionDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Attachment:
                      </Typography>
                      {selectedAssignment.fileUrl ? (
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => window.open(selectedAssignment.fileUrl, '_blank')}
                          size="small"
                        >
                          {getFileIcon(selectedAssignment.fileType)} {selectedAssignment.fileName}
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No attachment
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Teacher Review */}
                <Grid sx={{width: '100%', height: '100%', pl: 3}}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, fontSize: 20 }} />
                      Teacher Evaluation
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Grade:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          type="number"
                          value={score}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            // Allow empty input or valid numeric value
                            if (e.target.value === '' || (!isNaN(value) && value >= 0 && value <= 10)) {
                              setScore(e.target.value === '' ? '' : value);
                            }
                          }}
                          onBlur={() => {
                            // When blur, if empty or not a number, set to 0
                            if (score === '' || isNaN(score)) {
                              setScore(0);
                            }
                          }}
                          inputProps={{ 
                            min: 0, 
                            max: 10, 
                            step: 0.5,
                            inputMode: 'decimal'
                          }}
                          sx={{ width: 100 }}
                          size="small"
                          variant="outlined"
                          label="Score"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>/ 10</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Comments:
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        value={teacherComment}
                        onChange={(e) => setTeacherComment(e.target.value)}
                        placeholder="Enter your feedback on this assignment..."
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              {saveSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Evaluation saved successfully!
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReview} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleSaveReview}
                color="primary"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Evaluation'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// Component prop types
AssignmentReviewComponent.propTypes = {
  onAssignmentUpdated: PropTypes.func
};

AssignmentReviewComponent.defaultProps = {
  onAssignmentUpdated: null
};

export default AssignmentReviewComponent; 