import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  CircularProgress,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CorrectIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { quizService } from '../../api/services/quiz.service';
import { questionService } from '../../api/services/question.service';
import { optionService } from '../../api/services/option.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';
import { sectionService } from '../../api/services/section.service';
import BackButton from "../../components/common/BackButton";

const QuizQuestionPage = () => {
  const navigate = useNavigate();
  const { quizId, courseId, moduleId } = useParams();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [error, setError] = useState(null);
  
  // State cho form tạo/sửa câu hỏi
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ]);
  const [formErrors, setFormErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingQuiz(true);
        // Lấy thông tin Quiz
        const quizResponse = await quizService.getQuizById(quizId);
        
        // Xử lý nhiều dạng cấu trúc data khác nhau
        let quizData = null;
        
        if (quizResponse) {
          // Kiểm tra các cấu trúc dữ liệu khác nhau
          if (quizResponse.data) {
            quizData = quizResponse.data;
          } else if (quizResponse._id) {
            // Trường hợp response trực tiếp là object quiz
            quizData = quizResponse;
          } else if (quizResponse.quiz) {
            // Trường hợp data được bọc trong field 'quiz'
            quizData = quizResponse.quiz;
          } else {
            // Kiểm tra xem response có phải là JSON string không
            try {
              if (typeof quizResponse === 'string') {
                const parsedData = JSON.parse(quizResponse);
                if (parsedData && (parsedData.data || parsedData._id)) {
                  quizData = parsedData.data || parsedData;
                }
              }
            } catch (parseError) {
              console.error('QuizQuestionPage: Error parsing response string:', parseError);
            }
          }
        }
        
        if (quizData) {
          setQuiz(quizData);
          
          // Lấy thông tin section
          if (quizData.section) {
            await fetchSectionInfo(quizData.section);
          }
          
          // Lấy danh sách câu hỏi
          fetchQuestions();
        } else {
          console.error('QuizQuestionPage: No data in quiz response', quizResponse);
          setError('Cannot load quiz data');
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setError('An error occurred while loading data: ' + (error.message || 'Unknown error'));
      } finally {
        setLoadingQuiz(false);
      }
    };
    
    fetchData();
  }, [quizId]);
  
  const fetchSectionInfo = async (sectionId) => {
    try {
      const sectionResponse = await sectionService.getSectionById(sectionId);
      
      if (sectionResponse && sectionResponse.data) {
        // Lấy thông tin module
        if (sectionResponse.data.module) {
          const moduleResponse = await moduleService.getModuleById(sectionResponse.data.module);
          
          if (moduleResponse && moduleResponse.data) {
            setModuleTitle(moduleResponse.data.title);
            
            // Lấy thông tin course
            if (moduleResponse.data.course) {
              const courseResponse = await courseService.getCourseById(moduleResponse.data.course);
              
              if (courseResponse && courseResponse.data) {
                setCourseTitle(courseResponse.data.title);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching section info:', error);
    }
  };
  
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      console.log('Fetching questions for quiz ID:', quizId);
      
      const questionResponse = await questionService.getQuestionsByQuizId(quizId);
      console.log('Question response:', questionResponse);
      
      let questionData = [];
      
      if (questionResponse && questionResponse.questions) {
        questionData = questionResponse.questions;
      } else if (questionResponse && Array.isArray(questionResponse)) {
        questionData = questionResponse;
      } else if (questionResponse && questionResponse.data) {
        if (Array.isArray(questionResponse.data)) {
          questionData = questionResponse.data;
        } else if (questionResponse.data.questions && Array.isArray(questionResponse.data.questions)) {
          questionData = questionResponse.data.questions;
        } else if (questionResponse.data.data && Array.isArray(questionResponse.data.data)) {
          questionData = questionResponse.data.data;
        }
      }
      
      console.log('Extracted question data:', questionData);
      
      // Lấy options cho mỗi câu hỏi
      const questionsWithOptions = [];
      
      for (const question of questionData) {
        try {
          if (!question._id) {
            console.error('Question without _id:', question);
            continue;
          }
          
          console.log('Fetching options for question ID:', question._id);
          const optionResponse = await optionService.getOptionsByQuestionId(question._id);
          console.log('Option response for question', question._id, ':', optionResponse);
          
          let optionData = [];
          if (Array.isArray(optionResponse)) {
            optionData = optionResponse;
          } else if (optionResponse && optionResponse.data) {
            if (Array.isArray(optionResponse.data)) {
              optionData = optionResponse.data;
            } else if (optionResponse.data.options && Array.isArray(optionResponse.data.options)) {
              optionData = optionResponse.data.options;
            } else if (optionResponse.data.data && Array.isArray(optionResponse.data.data)) {
              optionData = optionResponse.data.data;
            }
          }
          
          questionsWithOptions.push({
            ...question,
            options: optionData
          });
        } catch (error) {
          console.error(`Error fetching options for question ${question._id}:`, error);
          questionsWithOptions.push({
            ...question,
            options: []
          });
        }
      }
      
      console.log('Questions with options:', questionsWithOptions);
      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError({
        message: 'Cannot load question list: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  const handleQuestionTextChange = (e) => {
    setQuestionText(e.target.value);
    // Clear error when user types
    if (formErrors.questionText) {
      setFormErrors(prev => ({ ...prev, questionText: '' }));
    }
  };
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    
    if (field === 'isCorrect') {
      // Nếu đánh dấu một đáp án là đúng, các đáp án khác phải là sai
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    } else {
      newOptions[index][field] = value;
      
      // Clear error for this option
      if (formErrors[`option${index}`]) {
        setFormErrors(prev => ({ ...prev, [`option${index}`]: '' }));
      }
    }
    
    setOptions(newOptions);
  };
  
  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { content: '', isCorrect: false }]);
    }
  };
  
  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      
      // Nếu xóa đáp án đúng, đáp án đầu tiên sẽ trở thành đáp án đúng
      if (options[index].isCorrect && newOptions.length > 0) {
        newOptions[0].isCorrect = true;
      }
      
      setOptions(newOptions);
    }
  };
  
  const validateQuestionForm = () => {
    const errors = {};
    
    if (!questionText.trim()) {
      errors.questionText = 'Please enter the question content';
    }
    
    // Kiểm tra các đáp án
    let hasCorrectOption = false;
    options.forEach((option, index) => {
      if (!option.content.trim()) {
        errors[`option${index}`] = 'Please enter the answer content';
      }
      
      if (option.isCorrect) {
        hasCorrectOption = true;
      }
    });
    
    if (!hasCorrectOption) {
      errors.correctOption = 'Please select at least one correct answer';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCreateQuestion = async () => {
    if (!validateQuestionForm()) {
      return;
    }
    
    try {
      setSavingQuestion(true);
      
      // Tạo câu hỏi
      const questionData = {
        quiz: quizId,
        questionText: questionText,
      };
      
      console.log('Creating question with data:', questionData);
      const createdQuestion = await questionService.createQuestion(questionData);
      console.log('Created question response:', createdQuestion);
      
      let questionId = null;
      if (createdQuestion?.data?._id) {
        questionId = createdQuestion.data._id;
      } else if (createdQuestion?._id) {
        questionId = createdQuestion._id;
      } else if (createdQuestion?.id) {
        questionId = createdQuestion.id;
      } else if (typeof createdQuestion === 'string') {
        // Có thể API trả về ID trực tiếp dưới dạng string
        questionId = createdQuestion;
      }
      
      if (!questionId) {
        // Kiểm tra thêm các khả năng khác trong response
        if (typeof createdQuestion === 'object') {
          // Duyệt qua tất cả các thuộc tính cấp cao nhất để tìm ID
          for (const key in createdQuestion) {
            if (key === '_id' || key === 'id' || key === 'questionId') {
              questionId = createdQuestion[key];
              break;
            } else if (typeof createdQuestion[key] === 'object' && createdQuestion[key]) {
              if (createdQuestion[key]._id) {
                questionId = createdQuestion[key]._id;
                break;
              } else if (createdQuestion[key].id) {
                questionId = createdQuestion[key].id;
                break;
              }
            }
          }
        }
      }
      
      if (!questionId) {
        console.error('Could not extract question ID from response:', createdQuestion);
        throw new Error('Cannot determine question ID from server response');
      }
      
      console.log('Extracted question ID:', questionId);
      
      // Tạo các đáp án cho câu hỏi
      for (const option of options) {
        const optionData = {
          question: questionId,
          content: option.content,
          isCorrect: option.isCorrect
        };
        console.log('Creating option:', optionData);
        await optionService.createOption(optionData);
      }
      
      // Cập nhật danh sách câu hỏi
      await fetchQuestions();
      
      // Reset form
      resetQuestionForm();
      
      // Hiển thị thông báo thành công
      setError({
        message: 'Question created successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating question:', error);
      setError({
        message: 'Error creating question: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSavingQuestion(false);
    }
  };
  
  const handleEditQuestion = async () => {
    if (!validateQuestionForm()) {
      return;
    }
    
    try {
      setSavingQuestion(true);
      
      // Cập nhật câu hỏi
      const questionData = {
        questionText: questionText,
      };
      
      await questionService.updateQuestion(editingQuestionId, questionData);
      
      // Cập nhật các đáp án
      const existingQuestion = questions.find(q => q._id === editingQuestionId);
      const existingOptions = existingQuestion?.options || [];
      
      // 1. Cập nhật các đáp án đã có
      for (let i = 0; i < Math.min(existingOptions.length, options.length); i++) {
        const existingOption = existingOptions[i];
        const updatedOption = options[i];
        
        await optionService.updateOption(existingOption._id, {
          content: updatedOption.content,
          isCorrect: updatedOption.isCorrect
        });
      }
      
      // 2. Tạo mới các đáp án thêm vào
      if (options.length > existingOptions.length) {
        for (let i = existingOptions.length; i < options.length; i++) {
          await optionService.createOption({
            question: editingQuestionId,
            content: options[i].content,
            isCorrect: options[i].isCorrect
          });
        }
      }
      
      // 3. Xóa các đáp án dư thừa
      if (existingOptions.length > options.length) {
        for (let i = options.length; i < existingOptions.length; i++) {
          await optionService.deleteOption(existingOptions[i]._id);
        }
      }
      
      // Cập nhật danh sách câu hỏi
      await fetchQuestions();
      
      // Reset form
      resetQuestionForm();
      
      // Hiển thị thông báo thành công
      setError({
        message: 'Question updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating question:', error);
      setError({
        message: 'Error updating question: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSavingQuestion(false);
    }
  };
  
  const handleDeleteQuestion = async () => {
    if (!deletingQuestionId) return;
    
    try {
      // Xóa câu hỏi
      await questionService.deleteQuestion(deletingQuestionId);
      
      // Cập nhật danh sách câu hỏi
      setQuestions(questions.filter(q => q._id !== deletingQuestionId));
      
      // Đóng dialog
      setDeleteDialogOpen(false);
      setDeletingQuestionId(null);
      
      // Hiển thị thông báo thành công
      setError({
        message: 'Question deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      setError({
        message: 'Error deleting question: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };
  
  const resetQuestionForm = () => {
    setQuestionText('');
    setOptions([
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ]);
    setEditingQuestionId(null);
    setFormErrors({});
  };
  
  const loadQuestionToEdit = (question) => {
    setQuestionText(question.questionText);
    
    // Kiểm tra nếu câu hỏi có đáp án
    if (question.options && question.options.length > 0) {
      const formattedOptions = question.options.map(opt => ({
        content: opt.content,
        isCorrect: opt.isCorrect
      }));
      
      setOptions(formattedOptions);
    } else {
      // Nếu không có đáp án, sử dụng mặc định
      setOptions([
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]);
    }
    
    setEditingQuestionId(question._id);
  };
  
  const handleOpenDeleteDialog = (questionId) => {
    setDeletingQuestionId(questionId);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingQuestionId(null);
  };
  
  const handleBack = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}`);
  };
  
  const handleCourseBreadcrumb = () => {
    navigate(`/teacher/course/${courseId}`);
  };

  const handleModuleBreadcrumb = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };
  
  if (loadingQuiz) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Hiển thị lỗi nếu có mà không phải lỗi thành công
  if (error && typeof error === 'string') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <BackButton 
          text="Back to Quiz" 
          onClick={handleBack} 
        />
      </Box>
    );
  }
  
  if (error && error.severity === 'error') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {error.message}
        </Alert>
        <BackButton 
          text="Back to Quiz" 
          onClick={handleBack} 
        />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {error && error.severity === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}
      
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={handleCourseBreadcrumb}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {courseTitle}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={handleModuleBreadcrumb}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {moduleTitle}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {quiz?.title || 'Quiz'}
        </Link>
        <Typography color="text.primary">
          Question management
        </Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'block', alignItems: 'center', mb: 2 }}>
        <BackButton 
          text={quiz?.title || "Back to Quiz"} 
          onClick={handleBack} 
        />
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          Question management: {quiz?.title}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <QuizIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6">
                {editingQuestionId ? 'Edit question' : 'Add new question'}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              label="Question content"
              value={questionText}
              onChange={handleQuestionTextChange}
              error={!!formErrors.questionText}
              helperText={formErrors.questionText}
              margin="normal"
              required
              multiline
              rows={3}
            />
            
            <Box sx={{ mt: 3, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Answer Options</Typography>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={handleAddOption}
                  disabled={options.length >= 6}
                >
                  Add Option
                </Button>
              </Box>
              
              {formErrors.correctOption && (
                <FormHelperText error>{formErrors.correctOption}</FormHelperText>
              )}
            </Box>
            
            <RadioGroup>
              {options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FormControlLabel
                    value={index.toString()}
                    control={<Radio checked={option.isCorrect} />}
                    onChange={() => handleOptionChange(index, 'isCorrect', true)}
                    sx={{ mr: 1 }}
                  />
                  <TextField
                    fullWidth
                    value={option.content}
                    onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                    error={!!formErrors[`option${index}`]}
                    helperText={formErrors[`option${index}`]}
                    placeholder={`Option ${index + 1}`}
                    size="small"
                    required
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 2}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </RadioGroup>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={resetQuestionForm}
                disabled={savingQuestion}
              >
                {editingQuestionId ? 'Cancel edit' : 'Delete form'}
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={editingQuestionId ? handleEditQuestion : handleCreateQuestion}
                disabled={savingQuestion}
              >
                {savingQuestion ? 'Saving...' : (editingQuestionId ? 'Update' : 'Add question')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Question list ({questions.length})
              </Typography>
              <Chip 
                label={`${quiz?.duration || 0} minutes`} 
                icon={<QuizIcon />}
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)', 
                  color: '#1976d2', 
                  mr: 1 
                }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {loadingQuestions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : questions.length === 0 ? (
              <Alert severity="info">
                No questions yet. Add a new question!
              </Alert>
            ) : (
              <Stack spacing={2} sx={{ maxHeight: 600, overflow: 'auto', pr: 1 }}>
                {questions.map((question, index) => (
                  <Accordion key={question._id} elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        <strong>Question {index + 1}:</strong> {question.questionText}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Divider sx={{ mb: 2 }} />
                      
                      <RadioGroup>
                        {question.options && question.options.map((option, optIndex) => (
                          <FormControlLabel
                            key={option._id || optIndex}
                            value={optIndex.toString()}
                            control={<Radio checked={option.isCorrect} />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography>{option.content}</Typography>
                                {option.isCorrect && (
                                  <Chip 
                                    size="small" 
                                    color="success" 
                                    icon={<CorrectIcon />}
                                    label="Correct Answer" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            }
                            disabled
                          />
                        ))}
                      </RadioGroup>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          startIcon={<EditIcon />} 
                          onClick={() => loadQuestionToEdit(question)}
                          sx={{ mr: 2 }}
                        >
                          Edit
                        </Button>
                        <Button 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleOpenDeleteDialog(question._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuestion} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizQuestionPage; 