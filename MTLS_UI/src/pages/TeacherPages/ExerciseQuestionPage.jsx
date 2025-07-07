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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CorrectIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon,
  FitnessCenter as ExerciseIcon
} from '@mui/icons-material';
import { exerciseService } from '../../api/services/exercise.service';
import { questionService } from '../../api/services/question.service';
import { optionService } from '../../api/services/option.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';
import { sectionService } from '../../api/services/section.service';
import VexFlowComponent from '../../vexflow/VexFlowComponent';

const ExerciseQuestionPage = () => {
  const navigate = useNavigate();
  const { exerciseId, courseId, moduleId } = useParams();
  
  const [exercise, setExercise] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [error, setError] = useState(null);
  
  // State cho form tạo/sửa câu hỏi
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multipleChoice'); // Thêm loại câu hỏi (multipleChoice, trueFalse, vexFlow)
  const [notationString, setNotationString] = useState('c/4/q, e/4/q, g/4/q'); // Thêm chuỗi notation cho VexFlow
  const [vexFlowAnswerType, setVexFlowAnswerType] = useState('multipleChoice'); // Thêm loại câu trả lời cho VexFlow (multipleChoice hoặc text)
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
        setLoadingExercise(true);
        // Lấy thông tin Exercise
        const exerciseResponse = await exerciseService.getExerciseById(exerciseId);
        
        if (exerciseResponse && exerciseResponse.data) {
          setExercise(exerciseResponse.data);
          
          // Lấy thông tin section
          if (exerciseResponse.data.section) {
            await fetchSectionInfo(exerciseResponse.data.section);
          }
          
          // Lấy danh sách câu hỏi
          fetchQuestions();
        } else {
          setError('Không thể tải thông tin bài tập');
        }
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        setError('Đã xảy ra lỗi khi tải dữ liệu: ' + (error.message || 'Unknown error'));
      } finally {
        setLoadingExercise(false);
      }
    };
    
    fetchData();
  }, [exerciseId]);
  
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
      console.log('Fetching questions for exercise ID:', exerciseId);
      
      const questionResponse = await questionService.getQuestionsByExercise(exerciseId);
      console.log('Questions response:', questionResponse);
      
      let questionData = [];
      
      if (questionResponse && questionResponse.data) {
        if (Array.isArray(questionResponse.data)) {
          questionData = questionResponse.data;
        } else if (questionResponse.data.questions && Array.isArray(questionResponse.data.questions)) {
          questionData = questionResponse.data.questions;
        } else if (questionResponse.data.data && Array.isArray(questionResponse.data.data)) {
          questionData = questionResponse.data.data;
        }
      } else if (questionResponse && Array.isArray(questionResponse)) {
        questionData = questionResponse;
      }
      
      console.log('Extracted question data:', questionData);
      
      // Log chi tiết từng câu hỏi để debug
      questionData.forEach((question, index) => {
        console.log(`Question ${index + 1} details:`, {
          id: question._id,
          text: question.questionText,
          type: question.questionType,
          notation: question.notation
        });
      });
      
      // Lấy options cho mỗi câu hỏi
      const questionsWithOptions = [];
      
      for (const question of questionData) {
        try {
          if (!question._id) {
            console.error('Question without _id:', question);
            continue;
          }
          
          console.log('Fetching options for question ID:', question._id);
          const optionResponse = await optionService.getOptionsByQuestion(question._id);
          console.log('Option response for question', question._id, ':', optionResponse);
          
          let optionData = [];
          if (optionResponse && optionResponse.data) {
            if (Array.isArray(optionResponse.data)) {
              optionData = optionResponse.data;
            } else if (optionResponse.data.options && Array.isArray(optionResponse.data.options)) {
              optionData = optionResponse.data.options;
            } else if (optionResponse.data.data && Array.isArray(optionResponse.data.data)) {
              optionData = optionResponse.data.data;
            }
          } else if (Array.isArray(optionResponse)) {
            optionData = optionResponse;
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
      
      // Log chi tiết sau khi đã lấy options
      questionsWithOptions.forEach((question, index) => {
        console.log(`Complete question ${index + 1}:`, {
          id: question._id,
          text: question.questionText,
          type: question.questionType,
          notation: question.notation,
          options: question.options
        });
      });
      
      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError({
        message: 'Không thể tải danh sách câu hỏi: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  const handleQuestionTextChange = (e) => {
    setQuestionText(e.target.value);
    if (formErrors.questionText) {
      setFormErrors({ ...formErrors, questionText: null });
    }
  };
  
  const handleQuestionTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionType(newType);
    
    // Nếu thay đổi loại câu hỏi sang VexFlow, đặt loại câu trả lời mặc định là trắc nghiệm
    if (newType === 'vexFlow') {
      setVexFlowAnswerType('multipleChoice');
    }
  };
  
  const handleNotationStringChange = (e) => {
    setNotationString(e.target.value);
    if (formErrors.notationString) {
      setFormErrors({ ...formErrors, notationString: null });
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
  
  const validateForm = () => {
    const errors = {};
    
    if (!questionText.trim()) {
      errors.questionText = 'Please enter the question content';
    }
    
    if (questionType === 'vexFlow' && !notationString.trim()) {
      errors.notationString = 'Please enter notation string';
    }
    
    if (questionType === 'multipleChoice' || (questionType === 'vexFlow' && vexFlowAnswerType === 'multipleChoice')) {
      // Kiểm tra các lựa chọn trả lời
      let hasCorrectOption = false;
      
      options.forEach((option, index) => {
        if (!option.content.trim()) {
          errors[`option${index}`] = 'Please enter content for this option';
        }
        
        if (option.isCorrect) {
          hasCorrectOption = true;
        }
      });
      
      if (!hasCorrectOption) {
        errors.correctOption = 'Please select at least one correct answer';
      }
    }
    
    return errors;
  };
  
  const handleCreateQuestion = async () => {
    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSavingQuestion(true);
    
    try {
      console.log("Creating question with type:", questionType);
      
      // Tạo câu hỏi mới
      const questionData = {
        exercise: exerciseId,
        questionText: questionText,
        questionType: questionType || 'multipleChoice', // Ensure questionType is always present
        notation: questionType === 'vexFlow' ? notationString : null,
      };
      
      // Log để debug
      console.log("Question data to be sent:", JSON.stringify(questionData, null, 2));
      
      const response = await questionService.createQuestion(questionData);
      
      if (response && (response.data || response._id)) {
        const questionId = response.data?._id || response._id;
        console.log("Question created with ID:", questionId);
        console.log("Response from server:", JSON.stringify(response, null, 2));
        
        // Tạo các tùy chọn cho câu hỏi
        for (const option of options) {
          if (option.content.trim()) {
            const optionData = {
              question: questionId,
              content: option.content,
              isCorrect: option.isCorrect
            };
            
            console.log("Creating option:", optionData);
            await optionService.createOption(optionData);
          }
        }
        
        // Reset form and fetch updated questions
        resetQuestionForm();
        fetchQuestions();
        
        setError({
          message: 'Question added successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error creating question:", error);
      setError({
        message: 'Could not create question: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSavingQuestion(false);
    }
  };
  
  const handleEditQuestion = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSavingQuestion(true);
      
      // Cập nhật câu hỏi
      const questionData = {
        questionText,
        questionType: questionType || 'multipleChoice', // Ensure questionType is always present
        notation: questionType === 'vexFlow' ? notationString : null,
      };
      
      console.log("Updating question with data:", JSON.stringify(questionData, null, 2));
      
      await questionService.updateQuestion(editingQuestionId, questionData);
      
      // Cập nhật các đáp án
      const existingQuestion = questions.find(q => q._id === editingQuestionId);
      const existingOptions = existingQuestion?.options || [];
      
      // 1. Update existing options
      for (let i = 0; i < Math.min(existingOptions.length, options.length); i++) {
        const existingOption = existingOptions[i];
        const updatedOption = options[i];
        
        await optionService.updateOption(existingOption._id, {
          content: updatedOption.content,
          isCorrect: updatedOption.isCorrect
        });
      }
      
      // 2. Create new options
      if (options.length > existingOptions.length) {
        for (let i = existingOptions.length; i < options.length; i++) {
          await optionService.createOption({
            question: editingQuestionId,
            content: options[i].content,
            isCorrect: options[i].isCorrect
          });
        }
      }
      
      // 3. Delete excess options
      if (existingOptions.length > options.length) {
        for (let i = options.length; i < existingOptions.length; i++) {
          await optionService.deleteOption(existingOptions[i]._id);
        }
      }
      
      // Update question list
      await fetchQuestions();
      
      // Reset form
      resetQuestionForm();
      
      // Show success message
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
      
      // Show success message
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
    setEditingQuestionId(null);
    setQuestionText('');
    setQuestionType('multipleChoice');
    setNotationString('c/4/q, e/4/q, g/4/q');
    setVexFlowAnswerType('multipleChoice');
    setOptions([
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ]);
    setFormErrors({});
  };
  
  const loadQuestionToEdit = (question) => {
    setEditingQuestionId(question._id);
    setQuestionText(question.questionText);
    setQuestionType(question.questionType || 'multipleChoice');
    
    if (question.questionType === 'vexFlow') {
      setNotationString(question.notation || '');
      setVexFlowAnswerType('multipleChoice');
    }
    
    // Set options based on question type
    if (question.options && question.options.length > 0) {
      // For multiple choice or VexFlow with multiple choice answers
      setOptions(question.options.map(opt => ({
        content: opt.content,
        isCorrect: opt.isCorrect
      })));
    } else {
      // Default options if none exist
      setOptions([
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]);
    }
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleOpenDeleteDialog = (questionId) => {
    setDeletingQuestionId(questionId);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingQuestionId(null);
  };
  
  const handleGoBack = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}`);
  };
  
  if (loadingExercise) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && typeof error === 'string') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
        >
          Back to exercise
        </Button>
      </Box>
    );
  }
  
  if (error && error.severity === 'error') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error.message}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
        >
          Back to exercise
        </Button>
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
          onClick={() => navigate('/teacher/courses')}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          Courses
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/teacher/course/${courseId}`)}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {courseTitle}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}`)}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {moduleTitle}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}`)}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {exercise?.title || 'Chi tiết bài tập'}
        </Link>
        <Typography color="text.primary">
          Questions
        </Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Manage Questions: {exercise?.title}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ExerciseIcon sx={{ color: '#ed6c02', mr: 1 }} />
              <Typography variant="h6">
                {editingQuestionId ? 'Edit Question' : 'Add New Question'}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="question-type-label">Question Type</InputLabel>
              <Select
                labelId="question-type-label"
                value={questionType}
                onChange={handleQuestionTypeChange}
                label="Question Type"
              >
                <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
                <MenuItem value="vexFlow">Music Notation (VexFlow)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Question Content"
              value={questionText}
              onChange={handleQuestionTextChange}
              error={!!formErrors.questionText}
              helperText={formErrors.questionText}
              margin="normal"
              required
              multiline
              rows={3}
            />
            
            {questionType === 'vexFlow' && (
              <>
                <TextField
                  fullWidth
                  label="Notation VexFlow String"
                  value={notationString}
                  onChange={handleNotationStringChange}
                  error={!!formErrors.notationString}
                  helperText={formErrors.notationString || "Example: c/4/q, e/4/q, g/4/q (notes C, E, G octave 4, 1/4 note)"}
                  margin="normal"
                  required
                  multiline
                  rows={2}
                />
                
                <Box sx={{ mt: 2, border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Preview:
                  </Typography>
                  <VexFlowComponent
                    notes={notationString}
                    width={500}
                    height={150}
                    editable={true}
                    onNotationChange={handleNotationStringChange}
                  />
                </Box>
              </>
            )}
            
            {/* Options section - Now outside the VexFlow condition so it appears for both question types */}
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
                {editingQuestionId ? 'Cancel Edit' : 'Clear Form'}
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={editingQuestionId ? handleEditQuestion : handleCreateQuestion}
                disabled={savingQuestion}
              >
                {savingQuestion ? 'Saving...' : (editingQuestionId ? 'Update' : 'Add Question')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Question List ({questions.length})
              </Typography>
              <Chip 
                label={`${exercise?.duration || 0} minutes`} 
                icon={<ExerciseIcon />}
                sx={{ 
                  bgcolor: 'rgba(237, 108, 2, 0.1)', 
                  color: '#ed6c02', 
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
                        {' '}<Chip 
                          size="small" 
                          label={question.questionType || 'multipleChoice'} 
                          color={question.questionType === 'vexFlow' ? 'secondary' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Divider sx={{ mb: 2 }} />
                      
                      {question.questionType === 'vexFlow' && question.notation && (
                        <Box sx={{ my: 3, borderRadius: 1, p: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Music Notation: (Type: {question.questionType}, Notation: {question.notation ? 'Available' : 'Not available'})
                          </Typography>
                          <VexFlowComponent
                            notes={question.notation}
                            width={400}
                            height={120}
                            editable={false}
                          />
                        </Box>
                      )}
                      
                      {question.questionType === 'vexFlow' && !question.notation && (
                        <Box sx={{ my: 3, borderRadius: 1, p: 2, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
                          <Typography variant="subtitle1" color="error" gutterBottom>
                            Music notation cannot be displayed (Missing notation data)
                          </Typography>
                        </Box>
                      )}
                      
                      {!question.questionType && question.notation && (
                        <Box sx={{ my: 3, borderRadius: 1, p: 2, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Has notation but no questionType: {question.notation}
                          </Typography>
                          <VexFlowComponent
                            notes={question.notation}
                            width={400}
                            height={120}
                            editable={false}
                          />
                        </Box>
                      )}
                      
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
        <DialogTitle>Confirm Delete</DialogTitle>
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

export default ExerciseQuestionPage; 