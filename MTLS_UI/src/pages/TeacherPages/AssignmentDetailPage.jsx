import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Chip,
  Stack,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
  List
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Timer as DurationIcon,
  NavigateNext as NavigateNextIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { moduleService } from '../../api/services/module.service';
import { courseService } from '../../api/services/course.service';
import { assignmentService, doAssignmentService } from '../../api/services/assignment.service';
import BackButton from '../../components/common/BackButton';

const AssignmentDetailPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        
        // Fetch assignment data
        const assignmentResponse = await assignmentService.getAssignmentById(assignmentId);
        console.log('Assignment response:', assignmentResponse);
        
        // Kiểm tra xem response có dữ liệu không, và xử lý nhiều cấu trúc dữ liệu có thể có
        if (assignmentResponse) {
          // Lưu assignment vào state
          setAssignment(assignmentResponse);
          
          // Lấy thông tin course
          const courseResponse = await courseService.getCourseById(courseId);
          if (courseResponse) {
            // Xử lý nhiều cấu trúc dữ liệu có thể có
            if (courseResponse.data && courseResponse.data.title) {
              setCourseTitle(courseResponse.data.title);
            } else if (courseResponse.title) {
              setCourseTitle(courseResponse.title);
            } else {
              setCourseTitle('Course ' + courseId);
            }
          } else {
            setCourseTitle('Course ' + courseId);
          }
          
          // Lấy thông tin module
          const moduleResponse = await moduleService.getModuleById(moduleId);
          if (moduleResponse) {
            setModuleTitle(moduleResponse.data.title);
          } else {
            setModuleTitle('Module ' + moduleId);
          }
          
          // Lấy danh sách bài nộp (nếu có)
          try {
            const submissionsResponse = await doAssignmentService.getSubmissionsByAssignment(assignmentId);
            console.log('Submissions response:', submissionsResponse);
            
            // Kiểm tra và lấy mảng submissions từ response
            let submissionsData = [];
            if (submissionsResponse) {
              // Đảm bảo submissionsData là một mảng
              submissionsData = Array.isArray(submissionsResponse) 
                ? submissionsResponse 
                : [];
                
              setSubmissions(submissionsData);
              
              // Tính toán thống kê cơ bản nếu có dữ liệu
              if (submissionsData.length > 0) {
                const submittedCount = submissionsData.length;
                // Kiểm tra nhiều trường khác nhau để xác định bài đã được chấm điểm
                const gradedCount = submissionsData.filter(sub => {
                  // Kiểm tra isGraded property
                  if (sub.isGraded === true) return true;
                  
                  // Kiểm tra nếu có điểm số
                  if (sub.grade !== undefined && sub.grade !== null) return true;
                  if (sub.score !== undefined && sub.score !== null) return true;
                  if (sub.teacherScore !== undefined && sub.teacherScore !== null) return true;
                  
                  return false;
                }).length;
                
                const avgGrade = gradedCount > 0 
                  ? submissionsData.reduce((total, sub) => {
                      // Ưu tiên lấy điểm từ trường grade, nếu không có thì lấy từ score hoặc teacherScore
                      const score = sub.grade !== undefined && sub.grade !== null 
                        ? sub.grade 
                        : (sub.score !== undefined && sub.score !== null 
                            ? sub.score 
                            : sub.teacherScore);
                      return score !== undefined && score !== null ? total + score : total;
                    }, 0) / gradedCount
                  : 0;
                
                setStats({
                  totalSubmissions: submittedCount,
                  gradedSubmissions: gradedCount,
                  averageGrade: avgGrade.toFixed(2)
                });
              }
            } else {
              console.warn('No submission data found');
            }
          } catch (submissionError) {
            console.error('Error fetching submission list:', submissionError);
          }
        } else {
          setError('Assignment information not found');
        }
      } catch (error) {
        console.error('Error fetching assignment data:', error);
        setError('Cannot load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [assignmentId]);

  const handleEdit = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/assignments/${assignmentId}/edit`);
  };

  const handleBack = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleShowSubmissions = () => {
    navigate('/teacher/assignments');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            mt: 2,
            bgcolor: '#0F62FE',
            '&:hover': { bgcolor: '#0043a8' },
            textTransform: 'none'
          }}
        >
          Back to module
        </Button>
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Assignment not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            mt: 2,
            bgcolor: '#0F62FE',
            '&:hover': { bgcolor: '#0043a8' },
            textTransform: 'none'
          }}
        >
          Back to module
        </Button>
      </Box>
    );
  }

  return (
    <>
      <PageTitle title={assignment.title || 'Assignment details'} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/teacher/courses')}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            Course
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/teacher/course/${courseId}`)}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {courseTitle || `Course ID: ${courseId}`}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}`)}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {moduleTitle || `Module ID: ${moduleId}`}
          </Link>
          <Typography color="text.primary">
            {assignment.title}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'block', alignItems: 'center' }}>
            <BackButton
              text={moduleTitle}
              onClick={handleBack}
            />
            <Typography variant="h4" fontWeight="bold" color="#1a1a1a">
              {assignment.title}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{
              color: '#0F62FE',
              borderColor: '#0F62FE',
              '&:hover': { bgcolor: 'rgba(15, 98, 254, 0.08)' },
              textTransform: 'none'
            }}
          >
            Edit assignment
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Thông tin chi tiết bài tập */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={0} 
              sx={{ 
                mb: 3, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                border: '1px solid #e0e0e0' 
              }}
            >
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="#444" sx={{ mb: 2 }}>
                    {assignment.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DurationIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Time limit: {assignment.duration || assignment.timeLimit || 0} minutes
                    </Typography>
                  </Box>
                  
                  {sectionTitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Section:</strong> {sectionTitle}
                    </Typography>
                  )}
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Question
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.04)' }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {assignment.questionText || 'No question'}
                  </Typography>
                </Paper>
                
                {assignment.allowFileUpload && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Submission rules
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(245, 247, 250, 0.8)', p: 3, borderRadius: 2 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CloudUploadIcon sx={{ mr: 1, color: '#1976d2' }} />
                          <Typography variant="body1">
                            Allow file submission
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachFileIcon sx={{ mr: 1, color: '#1976d2' }} />
                          <Typography variant="body1">
                            Allowed file types: {assignment.allowedFileTypes?.join(', ') || 'All'}
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          Maximum file size: {assignment.maxFileSize || 5}MB
                        </Typography>
                      </Stack>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Thông tin bên phải - thống kê */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                border: '1px solid #e0e0e0',
                mb: 3
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Submission statistics
                </Typography>
                
                {stats ? (
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Total submissions:</Typography>
                      <Chip 
                        label={stats.totalSubmissions} 
                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Graded submissions:</Typography>
                      <Chip 
                        label={stats.gradedSubmissions} 
                        sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32' }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Ungraded submissions:</Typography>
                      <Chip 
                        label={stats.totalSubmissions - stats.gradedSubmissions} 
                        sx={{ bgcolor: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02' }} 
                      />
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No data available
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#0F62FE',
                '&:hover': { bgcolor: '#0043a8' },
                textTransform: 'none',
                py: 1.5,
                mb: 3
              }}
              onClick={handleShowSubmissions}
            >
              View all submissions
            </Button>
            
            {/* Danh sách các bài nộp gần đây */}
            {submissions && Array.isArray(submissions) && submissions.length > 0 && (
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                  border: '1px solid #e0e0e0' 
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent submissions
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {submissions.slice(0, 5).map((submission) => (
                      <Box 
                        key={submission._id || submission.id} 
                        sx={{ 
                          mb: 2, 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' },
                          cursor: 'pointer'
                        }}
                        onClick={() => handleShowSubmissions(submission._id || submission.id)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {submission.student?.name || submission.student?.fullname || 'Student'}
                          </Typography>
                          <Chip 
                            size="small" 
                            icon={isSubmissionGraded(submission) ? <CheckIcon /> : <CloseIcon />} 
                            label={isSubmissionGraded(submission) ? 'Graded' : 'Ungraded'} 
                            sx={{ 
                              bgcolor: isSubmissionGraded(submission) ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)', 
                              color: isSubmissionGraded(submission) ? '#2e7d32' : '#ed6c02'
                            }} 
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Submitted at: {new Date(submission.submittedAt || submission.createdAt || submission.createAt).toLocaleString('en-US')}
                          </Typography>
                          {getSubmissionScore(submission) !== null && (
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1976d2' }}>
                              {getSubmissionScore(submission)}/10
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

// Helper function để kiểm tra submission đã được chấm điểm chưa
const isSubmissionGraded = (submission) => {
  // Kiểm tra isGraded property
  if (submission.isGraded === true) return true;
  
  // Kiểm tra nếu có điểm số
  if (submission.grade !== undefined && submission.grade !== null) return true;
  if (submission.score !== undefined && submission.score !== null) return true;
  if (submission.teacherScore !== undefined && submission.teacherScore !== null) return true;
  
  return false;
};

// Helper function để lấy điểm số của submission
const getSubmissionScore = (submission) => {
  // Ưu tiên lấy điểm từ trường grade, nếu không có thì lấy từ score hoặc teacherScore
  if (submission.grade !== undefined && submission.grade !== null) return submission.grade;
  if (submission.score !== undefined && submission.score !== null) return submission.score;
  if (submission.teacherScore !== undefined && submission.teacherScore !== null) return submission.teacherScore;
  
  return null;
};

export default AssignmentDetailPage; 