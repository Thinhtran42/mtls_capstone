// Dữ liệu mẫu ban đầu
const initialLessons = [
  {
    id: 1,
    title: 'Nhạc lý cơ bản',
    moduleId: 1,
    type: 'readings',
    duration: 30,
    content: 'Giới thiệu về nhạc lý cơ bản và các khái niệm...',
    videoUrl: '',
    objectives: ['Hiểu về nốt nhạc', 'Làm quen với khuông nhạc'],
    relatedSkills: ['Lý thuyết âm nhạc', 'Ký hiệu nhạc'],
    status: 'published',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 2,
    title: 'Bài tập thực hành 1',
    moduleId: 1,
    type: 'exercise',
    duration: 45,
    content: 'Hướng dẫn thực hành các bài tập cơ bản...',
    videoUrl: '',
    objectives: ['Thực hành đọc nốt nhạc', 'Luyện tập nhịp điệu'],
    relatedSkills: ['Thực hành', 'Đọc nhạc'],
    status: 'draft',
    createdAt: '2024-03-20T11:00:00Z',
    updatedAt: '2024-03-20T11:00:00Z'
  }
];

// Lấy dữ liệu từ localStorage hoặc sử dụng dữ liệu mẫu ban đầu
let lessons = JSON.parse(localStorage.getItem('mockLessons')) || initialLessons;

// Hàm để lưu dữ liệu vào localStorage
const saveLessons = () => {
  localStorage.setItem('mockLessons', JSON.stringify(lessons));
};

// Mock service để thao tác với dữ liệu
export const mockLessonService = {
  // Lấy danh sách bài học theo module
  getLessonsByModule: async (courseId, moduleId) => {
    return lessons.filter(lesson => lesson.moduleId === parseInt(moduleId));
  },

  // Lấy chi tiết một bài học
  getLessonById: async (courseId, moduleId, lessonId) => {
    const lesson = lessons.find(l => l.id === parseInt(lessonId));
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    return lesson;
  },

  // Tạo bài học mới
  createLesson: async (courseId, moduleId, lessonData) => {
    const newId = lessons.length > 0 ? Math.max(...lessons.map(l => l.id)) + 1 : 1;
    const newLesson = {
      ...lessonData,
      id: newId,
      moduleId: parseInt(moduleId)
    };
    lessons.push(newLesson);
    saveLessons(); // Lưu vào localStorage
    return newLesson;
  },

  // Cập nhật bài học
  updateLesson: async (courseId, moduleId, lessonId, lessonData) => {
    const index = lessons.findIndex(l => l.id === parseInt(lessonId));
    if (index === -1) {
      throw new Error('Lesson not found');
    }
    lessons[index] = {
      ...lessons[index],
      ...lessonData,
      updatedAt: new Date().toISOString()
    };
    saveLessons(); // Lưu vào localStorage
    return lessons[index];
  },

  // Xóa bài học
  deleteLesson: async (courseId, moduleId, lessonId) => {
    const index = lessons.findIndex(l => l.id === parseInt(lessonId));
    if (index === -1) {
      throw new Error('Lesson not found');
    }
    lessons.splice(index, 1);
    saveLessons(); // Lưu vào localStorage
    return true;
  }
}; 