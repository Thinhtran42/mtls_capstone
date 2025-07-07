import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Container,
  Paper,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Chip
} from '@mui/material'
import { NoteAdd as NoteIcon, Delete as DeleteIcon, Edit as EditIcon, FilterList as FilterIcon } from '@mui/icons-material'
import { courseService, moduleService } from '../../api'
import { noteService } from '../../api/services/note.service'

// Hàm kiểm tra xem một ID có phải là MongoDB ObjectID hợp lệ không
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

export function NotesPage() {
  const { courseId } = useParams() // Lấy courseId từ URL
  const [currentCourse, setCurrentCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All notes')
  const [notes, setNotes] = useState([])
  const [allNotes, setAllNotes] = useState([]) // Lưu tất cả notes của course
  const [selectedModule, setSelectedModule] = useState('') // Tiêu đề bài học (module)
  const [newNoteContent, setNewNoteContent] = useState('') // Nội dung note
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        let selectedCourse = null;

        // Kiểm tra xem courseId có phải là ObjectID không
        if (isValidObjectId(courseId)) {
          // Nếu là ObjectID, lấy khóa học trực tiếp bằng ID
          const courseResponse = await courseService.getCourseById(courseId);
          selectedCourse = courseResponse?.data;
        } else {
          // Nếu không phải ObjectID (có thể là index), dùng cách cũ
          const coursesResponse = await courseService.getAllCourses();
          const courses = coursesResponse?.data || [];
          selectedCourse = courses[parseInt(courseId) - 1];
        }

        if (!selectedCourse) {
          setError('Course not found');
          return;
        }

        setCurrentCourse(selectedCourse);

        // Lấy modules cho khóa học
        const modulesResponse = await moduleService.getModulesByCourse(selectedCourse._id);
        const moduleData = modulesResponse?.data || [];
        setModules(moduleData);

        // Lấy tất cả ghi chú của course bằng cách lấy ghi chú của từng module
        await fetchAllNotesForCourse(moduleData);

        // Đặt module mặc định là module đầu tiên nếu có
        if (moduleData.length > 0) {
          setSelectedModule(moduleData[0]._id);
        }

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Không thể tải dữ liệu khóa học: ' + (err.message || 'Lỗi không xác định'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Lấy tất cả notes cho tất cả module trong khóa học
  const fetchAllNotesForCourse = async (moduleData) => {
    try {
      setLoading(true);
      // Lấy notes cho từng module và gộp lại
      const allNotesPromises = moduleData.map(module =>
        noteService.getNotesByModuleId(module._id)
      );

      const allNotesResponses = await Promise.all(
        allNotesPromises.map(p => p.catch(error => {
          console.error('Error in fetchAllNotesForCourse:', error);
          return null; // Trả về null cho promise bị lỗi
        }))
      );

      // Gộp tất cả notes vào một mảng
      let combinedNotes = [];

      allNotesResponses.forEach((response, index) => {
        if (!response) return; // Bỏ qua response null (lỗi)

        if (response && response.data && response.data.notes) {
          // Thêm thông tin module vào mỗi note nếu chưa có
          const notesWithModuleInfo = response.data.notes.map(note => {
            if (!note.module || typeof note.module === 'string') {
              return {
                ...note,
                module: {
                  _id: moduleData[index]._id,
                  title: moduleData[index].title
                }
              };
            }
            return note;
          });

          combinedNotes = [...combinedNotes, ...notesWithModuleInfo];
        } else if (response && response.notes && Array.isArray(response.notes)) {
          // Thêm thông tin module vào mỗi note nếu chưa có
          const notesWithModuleInfo = response.notes.map(note => {
            if (!note.module || typeof note.module === 'string') {
              return {
                ...note,
                module: {
                  _id: moduleData[index]._id,
                  title: moduleData[index].title
                }
              };
            }
            return note;
          });

          combinedNotes = [...combinedNotes, ...notesWithModuleInfo];
        }
      });

      console.log('Combined notes after fetching all:', combinedNotes);
      setAllNotes(combinedNotes);

      // Nếu đang xem tất cả notes, cập nhật notes hiển thị
      if (filter === 'All notes' && !selectedModule) {
        setNotes(combinedNotes);
      }
      // Nếu đang lọc theo module, chỉ hiển thị notes của module đó
      else if (selectedModule) {
        const filteredNotes = combinedNotes.filter(note =>
          note.module && (typeof note.module === 'string'
            ? note.module === selectedModule
            : note.module._id === selectedModule)
        );
        setNotes(filteredNotes);
      }

    } catch (err) {
      console.error('Error fetching all notes:', err);
      setNotification({
        open: true,
        message: 'Không thể tải tất cả ghi chú: ' + (err.message || 'Lỗi không xác định'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Lấy notes từ API cho một module cụ thể
  const fetchNotes = async (moduleId) => {
    try {
      const response = await noteService.getNotesByModuleId(moduleId);
      console.log('API response:', response);

      // Xử lý cấu trúc response chính xác
      let moduleNotes = [];

      if (response && response.data && response.data.notes && Array.isArray(response.data.notes)) {
        moduleNotes = response.data.notes;
      } else if (response && response.notes && Array.isArray(response.notes)) {
        moduleNotes = response.notes;
      } else if (Array.isArray(response)) {
        moduleNotes = response;
      }

      // Thêm thông tin module nếu chưa có
      moduleNotes = moduleNotes.map(note => {
        if (!note.module || typeof note.module === 'string') {
          const module = modules.find(m => m._id === moduleId);
          return {
            ...note,
            module: {
              _id: moduleId,
              title: module ? module.title : 'Module không xác định'
            }
          };
        }
        return note;
      });

      // Cập nhật danh sách notes dựa vào filter hiện tại
      if (filter === 'All notes') {
        // Cập nhật allNotes với các notes mới từ module này
        const updatedAllNotes = [...allNotes.filter(note =>
          note.module && note.module._id !== moduleId
        ), ...moduleNotes];

        setAllNotes(updatedAllNotes);
        setNotes(updatedAllNotes);
      } else {
        setNotes(moduleNotes);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotification({
        open: true,
        message: 'Không thể tải ghi chú: ' + (err.message || 'Lỗi không xác định'),
        severity: 'error'
      });
    }
  };

  // Khi thay đổi filter hoặc module, cập nhật danh sách notes hiển thị
  useEffect(() => {
    if (filter === 'All notes' && !selectedModule) {
      // Chỉ hiển thị tất cả notes khi không có module nào được chọn
      setNotes(allNotes);
    } else if (filter === 'Module notes' && selectedModule) {
      // Lọc notes theo selectedModule từ allNotes
      const filteredNotes = allNotes.filter(note =>
        note.module && (typeof note.module === 'string'
          ? note.module === selectedModule
          : note.module._id === selectedModule)
      );
      setNotes(filteredNotes);

      // Nếu không có notes cho module này, thử lấy từ API
      if (filteredNotes.length === 0) {
        fetchNotes(selectedModule);
      }
    }
    // Không cần xử lý khi filter là 'All notes' và có selectedModule
    // vì đã xử lý trong hàm onClick của chip
  }, [filter, selectedModule, allNotes]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  }

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
  }

  const handleAddNote = async () => {
    if (selectedModule && newNoteContent.trim()) {
      setIsSubmitting(true);
      try {
        const noteData = {
          module: selectedModule,
          content: newNoteContent,
        };

        console.log('Sending note data:', noteData);

        if (editingNoteId) {
          // Cập nhật note
          const updateResponse = await noteService.updateNote(editingNoteId, noteData);
          console.log('Update response:', updateResponse);
          setNotification({
            open: true,
            message: 'Ghi chú đã được cập nhật thành công',
            severity: 'success'
          });
        } else {
          // Thêm note mới
          const createResponse = await noteService.createNote(noteData);
          console.log('Create response:', createResponse);
          setNotification({
            open: true,
            message: 'Ghi chú đã được tạo thành công',
            severity: 'success'
          });
        }

        // Cập nhật lại toàn bộ danh sách notes để đồng bộ
        await fetchAllNotesForCourse(modules);
        setNewNoteContent(''); // Reset nội dung note
        setEditingNoteId(null); // Reset trạng thái chỉnh sửa
      } catch (err) {
        console.error('Error saving note:', err);
        setNotification({
          open: true,
          message: 'Không thể lưu ghi chú: ' + (err.message || 'Lỗi không xác định'),
          severity: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setNewNoteContent(note.content);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (noteToDelete) {
      try {
        // Lưu lại ID module của note sẽ xóa để cập nhật đúng danh sách
        const moduleId = typeof noteToDelete.module === 'string'
          ? noteToDelete.module
          : noteToDelete.module?._id;

        console.log(`Deleting note with ID: ${noteToDelete._id}, belongs to module: ${moduleId}`);

        await noteService.deleteNote(noteToDelete._id);

        setNotification({
          open: true,
          message: 'Ghi chú đã được xóa thành công',
          severity: 'success'
        });

        // Cập nhật lại toàn bộ danh sách notes để đồng bộ
        await fetchAllNotesForCourse(modules);
      } catch (err) {
        console.error('Error deleting note:', err);
        setNotification({
          open: true,
          message: 'Không thể xóa ghi chú: ' + (err.message || 'Lỗi không xác định'),
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (error || !currentCourse) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>{error || 'Course not found'}</Typography>
      </Box>
    );
  }

  const hasNotes = notes.length > 0

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', width: '80vw' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: '1200px',
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography
          variant='h4'
          gutterBottom
          sx={{ fontWeight: 600, color: '#333', mb: 2 }}
        >
          Notes - {currentCourse.title || 'Khóa học'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <FilterIcon sx={{ mr: 1, color: '#666' }} />
          <Select
            value={filter}
            onChange={handleFilterChange}
            displayEmpty
            variant='standard'
            sx={{
              fontSize: '0.875rem',
              color: '#666',
              '& .MuiSelect-icon': { color: '#666' },
            }}
          >
            <MenuItem value='All notes'>All notes</MenuItem>
            <MenuItem value='Module notes'>Current module notes</MenuItem>
          </Select>
        </Box>

        <Box sx={{ mb: 4 }}>
          {/* Input cho tiêu đề bài học */}
          <Select
            value={selectedModule}
            onChange={handleModuleChange}
            displayEmpty
            fullWidth
            variant='outlined'
            sx={{ mb: 2 }}
            renderValue={(value) => {
              if (!value) return 'Select a module';
              const module = modules.find(m => m._id === value);
              return module ? module.title : 'Select a module';
            }}
          >
            {modules.map((module) => (
              <MenuItem
                key={module._id}
                value={module._id}
              >
                {module.title || `Module`}
              </MenuItem>
            ))}
          </Select>

          {/* Input cho nội dung note */}
          <TextField
            label='Note content'
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            fullWidth
            variant='outlined'
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Button
            variant='contained'
            color='primary'
            onClick={handleAddNote}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <NoteIcon />}
            disabled={!selectedModule || !newNoteContent.trim() || isSubmitting}
          >
            {isSubmitting
              ? (editingNoteId ? 'Đang cập nhật...' : 'Đang thêm...')
              : (editingNoteId ? 'Update Note' : 'Add Note')}
          </Button>
          {editingNoteId && (
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                setEditingNoteId(null);
                setNewNoteContent('');
              }}
              sx={{ ml: 2 }}
            >
              Cancel Edit
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: filter === 'All notes' && hasNotes ? 'flex-start' : 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 300px)',
            textAlign: !hasNotes ? 'center' : 'left',
            width: '100%'
          }}
        >
          {!hasNotes ? (
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 400, fontSize: '1rem', lineHeight: 1.6 }}
            >
              You have not added any notes yet. Select a module and start typing
              above!
            </Typography>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ color: '#333', mb: 3 }}
              >
                {filter === 'All notes'
                  ? (selectedModule
                    ? `Notes for ${modules.find(m => m._id === selectedModule)?.title || 'Selected Module'}`
                    : 'All Your Notes')
                  : 'Notes for Selected Module'}
              </Typography>

              {filter === 'All notes' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Filter by module:
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedModule('');
                        setNotes(allNotes);
                      }}
                      sx={{ mr: 2, fontSize: '0.75rem' }}
                    >
                      Clear Filter
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {modules.map(module => (
                      <Chip
                        key={module._id}
                        label={module.title}
                        color={selectedModule === module._id ? "primary" : "default"}
                        onClick={() => {
                          setSelectedModule(module._id);
                          // Khi chọn module qua chip, vẫn giữ filter là 'All notes' nhưng lọc dữ liệu
                          // Không cần chuyển sang 'Module notes'

                          // Lọc notes của module đã chọn
                          const filteredNotes = allNotes.filter(note =>
                            note.module && (typeof note.module === 'string'
                              ? note.module === module._id
                              : note.module._id === module._id)
                          );
                          setNotes(filteredNotes);
                        }}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {notes.map((note) => (
                <Paper
                  key={note._id}
                  sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 1 }}
                >
                  {/* Hiển thị tên module */}
                  <Typography
                    sx={{ fontSize: '1rem', fontWeight: 500, color: '#1976d2', mb: 1 }}
                  >
                    {note.module && note.module.title ? note.module.title : 'Module không xác định'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      sx={{ fontSize: '0.95rem', color: '#333', flex: 1 }}
                    >
                      {note.content}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleEditNote(note)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteNote(note)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{ color: '#666', display: 'block', mt: 1 }}
                  >
                    {new Date(note.createdAt || note.timestamp).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Container>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={confirmDeleteNote} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thông báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default NotesPage
