/* eslint-disable no-unused-vars */
import { useParams, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle,
  Lock,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  MenuBook,
  SportsScore,
  CloudUpload,
  HourglassEmpty,
  Pending
} from '@mui/icons-material'
import { courseService } from '../../api'

// Hàm kiểm tra xem một ID có phải là MongoDB ObjectID hợp lệ không
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

export function GradePage() {
  const { courseId } = useParams()
  const location = useLocation()
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assessableItems, setAssessableItems] = useState([])
  const [overallGrade, setOverallGrade] = useState(0)

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Get user ID from localStorage
        const studentId = localStorage.getItem('userId');

        if (!studentId || !courseId) {
          setError('Student ID or Course ID not found');
          return;
        }

        // Call API to get course data with progress
        const response = await courseService.getCourseWithProgress(courseId, studentId);
        const data = response?.data;

        if (!data) {
          setError('Course data not found');
          return;
        }

        setCourseData(data);

        // Extract assessable items (quizzes, exercises, assignments)
        const items = [];
        let totalWeight = 0;
        let totalGrade = 0;

        // Process each module
        data.modules.forEach(module => {
          // Process each section
          module.sections.forEach(section => {
            const sectionType = section.type.toUpperCase();

            // Only include sections with components that can be graded
            if (['QUIZ', 'EXERCISE', 'ASSIGNMENT'].includes(sectionType) &&
                section.components &&
                Array.isArray(section.components)) {

              section.components.forEach(component => {
                // Calculate weight (equal distribution for simplicity)
                const weight = 100 / (data.progress.total || 1);

                // Calculate grade based on component status and score
                let grade = 0;
                let statusDisplay = 'Locked';

                if (component.status === 'completed') {
                  grade = component.score || 100; // Default to 100 if no score provided
                  statusDisplay = 'Completed';
                  totalGrade += grade * (weight / 100);
                } else if (component.status === 'submitted') {
                  statusDisplay = 'Submitted';
                  // Could be 0 if not graded yet
                  grade = component.score || 0;
                  if (component.score) {
                    totalGrade += grade * (weight / 100);
                  }
                } else if (component.status === 'pending') {
                  statusDisplay = 'Pending';
                }

                totalWeight += weight;

                // Add to assessable items
                items.push({
                  id: component._id,
                  title: component.title,
                  moduleTitle: module.title,
                  type: sectionType,
                  status: statusDisplay,
                  weight: Math.round(weight),
                  grade: grade,
                  dueDate: component.dueDate || null,
                  submittedAt: component.submittedAt || null,
                  isGraded: component.isGraded || false
                });
              });
            }
          });
        });

        setAssessableItems(items);

        // Calculate overall grade (weighted average)
        if (totalWeight > 0) {
          setOverallGrade(Math.round(totalGrade));
        }

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Unable to load course data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, location.key]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !courseData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>{error || 'Course not found'}</Typography>
      </Box>
    );
  }

  // Progress data from API
  const { percentage, completed, total } = courseData.progress || { percentage: 0, completed: 0, total: 1 };

  // Check if all items are completed
  const allCompleted = assessableItems.every(item => item.status === 'Completed');

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';

    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get icon based on item type
  const getItemIcon = (type) => {
    switch (type) {
      case 'QUIZ':
        return <QuizIcon sx={{ color: '#9c27b0' }} />;
      case 'EXERCISE':
        return <SportsScore sx={{ color: '#ff9800' }} />;
      case 'ASSIGNMENT':
        return <AssignmentIcon sx={{ color: '#2196f3' }} />;
      default:
        return <MenuBook />;
    }
  };

  // Default due date for display if not provided
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 7)
  const formattedDefaultDueDate = formatDate(defaultDueDate);

  return (
    <Box
      sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 4, ml: 10, width: 'calc(100% - 80px)', maxWidth: '1600px', alignItems: 'center' }}
    >
      <Typography
        variant='h4'
        gutterBottom
        fontWeight='bold'
        sx={{ color: '#1976d2', mb: 2 }}
      >
        {courseData.title || 'Course'}
      </Typography>

      <Typography
        variant='h4'
        gutterBottom
        sx={{ fontWeight: 600, color: '#333' }}
      >
        Grades
      </Typography>

      {allCompleted && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#e8f5e9',
            borderRadius: 2,
            border: '1px solid #a5d6a7',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: '#4CAF50' }} />
            <Typography
              variant='body1'
              color='success.main'
            >
              You have completed all of the assessments that are currently due.
            </Typography>
          </Box>
        </Paper>
      )}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: '#e3f2fd',
          borderRadius: 2,
          border: '1px solid #90caf9',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#2196f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
            }}
          >
            <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
          </Box>
          <Typography
            variant='body1'
            color='primary'
          >
            {percentage >= 70
              ? `You passed this course! Your grade is ${overallGrade}.`
              : `Your current grade is ${overallGrade}. You need 70% to pass.`}
          </Typography>
        </Box>
      </Paper>

      <TableContainer
        component={Paper}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, color: '#666' }}>
                Item
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666' }}>Due</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666' }}>
                Weight
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666' }}>
                Grade
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessableItems.map((item, index) => {
              return (
                <TableRow
                  key={item.id || index}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getItemIcon(item.type)}
                      <Typography sx={{ fontSize: '0.875rem', color: '#333' }}>
                        {item.moduleTitle}: {item.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {item.status === 'Completed' ? (
                      <Chip
                        icon={<CheckCircle sx={{ color: '#4CAF50' }} />}
                        label='Completed'
                        sx={{ backgroundColor: '#e8f5e9', color: '#4CAF50' }}
                      />
                    ) : item.status === 'Submitted' ? (
                      <Chip
                        icon={<CloudUpload sx={{ color: '#FF9800' }} />}
                        label='Submitted'
                        sx={{ backgroundColor: '#FFF3E0', color: '#FF9800' }}
                      />
                    ) : (
                      <Chip
                        icon={<Lock sx={{ color: '#757575' }} />}
                        label='Locked'
                        sx={{ backgroundColor: '#f5f5f5', color: '#757575' }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>
                      {item.dueDate ? formatDate(item.dueDate) : formattedDefaultDueDate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>
                      {item.weight}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#333' }}>
                      {item.status === 'Completed' || (item.status === 'Submitted' && item.isGraded)
                        ? `${item.grade}`
                        : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional messages based on course status */}
      {assessableItems.some(item => item.status === 'Submitted' && !item.isGraded) && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#fff3e0',
            borderRadius: 2,
            border: '1px solid #ffe0b2',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsScore sx={{ color: '#FF9800' }} />
            <Typography
              variant='body1'
              color='warning.main'
            >
              Some of your submissions are still waiting to be graded. Your final score will be updated once grading is complete.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default GradePage
