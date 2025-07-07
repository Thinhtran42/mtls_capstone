import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, InputAdornment,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, Divider, Tabs, Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Book as BookIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { userService } from '../../api/services/user.service';
import { enrollmentService } from '../../api/services/enrollment.service';
import { courseService } from '../../api/services/course.service';
import CustomSnackbar from '../../components/common/Snackbar';

const ManageStudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentCourses, setStudentCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailedProgress, setDetailedProgress] = useState({});

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllStudents();
      if (response && response.data && response.data.users) {
        setStudents(response.data.users);
        setLoading(false);
        console.log('Student data:', response.data.users);
      } else {
        setLoading(false);
        setError('No student data found');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching student list:', error);
      setError('An error occurred while loading data. Please try again later.');
    }
  };

  // Fetch student's courses when dialog opens
  const fetchStudentCourses = async (studentId) => {
    if (!studentId) return;
    
    try {
      setLoadingCourses(true);
      const enrollmentsResponse = await enrollmentService.getEnrollmentsByStudent(studentId);
      
      console.log('Enrollments response:', enrollmentsResponse); // Debug
      
      if (enrollmentsResponse && enrollmentsResponse.data) {
        const enrollments = Array.isArray(enrollmentsResponse.data) 
          ? enrollmentsResponse.data 
          : [enrollmentsResponse.data];
        
        console.log('Processed enrollments:', enrollments); // Debug
        
        const coursesData = [];
        
        // Fetch each course details
        for (const enrollment of enrollments) {
          // Kiểm tra cấu trúc của enrollment và lấy courseId
          const courseId = enrollment.course?._id || enrollment.courseId;
          
          if (courseId) {
            try {
              // Nếu đã có thông tin khóa học trong enrollment, sử dụng nó
              if (enrollment.course && enrollment.course.title) {
                coursesData.push({
                  _id: courseId,
                  title: enrollment.course.title,
                  description: enrollment.course.description || 'No description available',
                  progress: 0, // Để trống, sẽ cập nhật sau khi lấy tiến độ thực tế
                  lastAccessed: enrollment.lastAccessed || enrollment.enrolledAt,
                  enrollmentDate: enrollment.enrolledAt || enrollment.createdAt
                });
              } else {
                // Nếu không, gọi API để lấy thông tin khóa học
                const courseResponse = await courseService.getCourseById(courseId);
                if (courseResponse && courseResponse.data) {
                  coursesData.push({
                    ...courseResponse.data,
                    progress: 0, // Để trống, sẽ cập nhật sau khi lấy tiến độ thực tế
                    lastAccessed: enrollment.lastAccessed || enrollment.enrolledAt,
                    enrollmentDate: enrollment.enrolledAt || enrollment.createdAt
                  });
                }
              }
            } catch (courseError) {
              console.error('Error fetching course:', courseError);
            }
          }
        }
        
        console.log('Final courses data:', coursesData); // Debug
        setStudentCourses(coursesData);
        
        // Gọi hàm fetchDetailedProgressForCourses sau khi đã có coursesData
        if (coursesData.length > 0) {
          await fetchDetailedProgressForCourses(studentId, coursesData);
        }
      }
    } catch (error) {
      console.error('Error fetching student courses:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load student courses',
        severity: 'error'
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  // Handle opening student detail dialog
  const handleOpenDialog = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
    fetchStudentCourses(student._id);
  };

  // Handle closing student detail dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTab(0);
    setStudentCourses([]);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    (student.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.phone && student.phone.includes(searchTerm))
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (studentCourses.length === 0) return 0;
    
    const totalProgress = studentCourses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return Math.round(totalProgress / studentCourses.length);
  };

  // Thêm hàm này vào ManageStudentsPage.jsx
  const fetchStudentDetailedProgress = async (studentId, courseId) => {
    try {
      const response = await courseService.getCourseWithProgress(courseId, studentId);
      if (response && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching detailed progress:', error);
    }
    return null;
  };

  const fetchDetailedProgressForCourses = async (studentId, courses) => {
    const progressData = {};
    const updatedCourses = [...courses];
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      try {
        const courseProgress = await fetchStudentDetailedProgress(studentId, course._id);
        if (courseProgress) {
          // Lưu progress chi tiết cho hiển thị module
          progressData[course._id] = courseProgress;
          
          // Cập nhật tiến độ thực tế cho course
          if (courseProgress.progress && courseProgress.progress.percentage !== undefined) {
            updatedCourses[i] = {
              ...updatedCourses[i],
              progress: courseProgress.progress.percentage
            };
          }
        }
      } catch (error) {
        console.error(`Error fetching progress for course ${course._id}:`, error);
      }
    }
    
    // Cập nhật state
    setDetailedProgress(progressData);
    setStudentCourses(updatedCourses);
  };

  const isModuleCompleted = (module) => {
    if (!module || !module.sections) return false;
    
    let totalComponents = 0;
    let completedComponents = 0;
    
    module.sections.forEach(section => {
      if (section.components && Array.isArray(section.components)) {
        totalComponents += section.components.length;
        completedComponents += section.components.filter(comp => comp.status === 'completed').length;
      }
    });
    
    return totalComponents > 0 && completedComponents > 0;
  };

  return (
    <>
      <PageTitle title="Student Management" />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Student Management
          </Typography>
        </Box>

        {/* Search and filter */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '50%' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search students..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow
                      key={student._id}
                      onClick={() => handleOpenDialog(student)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={student.avatar}
                            sx={{ mr: 2, bgcolor: 'primary.main' }}
                          >
                            {student.fullname?.charAt(0) || 'S'}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {student.fullname}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.phone || (
                          <Typography color="text.secondary">Not updated</Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(student.createAt)}</TableCell>
                      <TableCell>
                        <Chip
                          color={student.isActive ? "success" : "default"}
                          size="small"
                          label={student.isActive ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      {searchTerm ? 'No students found matching your search' : 'No students available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Student Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedStudent && (
          <>
            <DialogTitle>
              <Typography variant="h6">Student Information</Typography>
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange} 
                sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<BookIcon sx={{ mr: 1 }} />} label="Profile" />
                <Tab icon={<TimelineIcon sx={{ mr: 1 }} />} label="Learning Progress" />
              </Tabs>
            </DialogTitle>
            <DialogContent>
              {selectedTab === 0 ? (
                // Profile Tab
                <Box sx={{ py: 1 }}>
                  {/* Avatar (căn giữa) */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Avatar
                      src={selectedStudent.avatar}
                      sx={{ 
                        width: 100, 
                        height: 100,
                        bgcolor: 'primary.main',
                        fontSize: '2.5rem'
                      }}
                    >
                      {selectedStudent.fullname?.charAt(0) || 'S'}
                    </Avatar>
                  </Box>
                  
                  {/* Thông tin chi tiết (căn trái) */}
                  <Box sx={{ py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Full Name</Typography>
                    <Typography paragraph>{selectedStudent.fullname}</Typography>

                    <Typography variant="subtitle1" fontWeight="bold">Email</Typography>
                    <Typography paragraph>{selectedStudent.email}</Typography>

                    <Typography variant="subtitle1" fontWeight="bold">Phone</Typography>
                    <Typography paragraph>{selectedStudent.phone || 'Not updated'}</Typography>

                    <Typography variant="subtitle1" fontWeight="bold">Join Date</Typography>
                    <Typography paragraph>{formatDate(selectedStudent.createAt || Date.now())}</Typography>
                  </Box>
                </Box>
              ) : (
                // Learning Progress Tab
                <Box sx={{ py: 2 }}>
                  {loadingCourses ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : studentCourses.length === 0 ? (
                    <Alert severity="info">
                      This student hasn't enrolled in any courses yet.
                    </Alert>
                  ) : (
                    <>
                      {/* Tiến độ theo khóa học */}
                      <Typography variant="h6" gutterBottom>
                        Course Progress
                      </Typography>
                      
                      {studentCourses.map((course, index) => (
                        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{course.title}</Typography>
                            <Typography variant="body2">
                              {course.progress || 0}% completed
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {course.description || 'No description available'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, height: 8, mb: 2 }}>
                            <Box 
                              sx={{ 
                                bgcolor: course.progress > 75 ? '#4caf50' : course.progress > 25 ? '#2196f3' : '#ff9800',
                                height: '100%',
                                borderRadius: 1,
                                width: `${course.progress || 0}%`
                              }} 
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Enrolled: {formatDate(course.enrollmentDate)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
};

export default ManageStudentsPage;