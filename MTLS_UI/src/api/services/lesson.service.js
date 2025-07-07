import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Lesson
export const lessonService = {
    // Lấy tất cả lesson (GET /lessons)
    getAllLessons: async() => {
        try {
            const response = await baseApi.lessons.lessonControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách lesson:', error);
            throw error;
        }
    },

    // Lấy chi tiết lesson theo ID (GET /lessons/:id)
    getLessonById: async(lessonId) => {
        try {
            const response = await baseApi.lessons.lessonControllerFindOne(lessonId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy lesson ID ${lessonId}:`, error);
            throw error;
        }
    },

    // Lấy lesson theo section (GET /lessons/section/:sectionId)
    getLessonsBySection: async(sectionId) => {
        try {
            const response = await baseApi.lessons.lessonControllerFindBySection(sectionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy lesson của section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách lesson theo module (GET /lessons/module/:moduleId)
    getLessonsByModule: async(moduleId) => {
        try {
            // Kiểm tra xem API endpoint có tồn tại không
            if (baseApi.lessons.lessonControllerFindByModule) {
                const response = await baseApi.lessons.lessonControllerFindByModule(moduleId);
                return response.data;
            } else {
                // Fallback: Lấy tất cả bài học và lọc theo moduleId
                console.warn('API endpoint cho getLessonsByModule không tồn tại, đang sử dụng phương thức thay thế');
                const response = await baseApi.lessons.lessonControllerFindAll();
                const allLessons = response.data;

                // Nếu có dữ liệu, lọc các bài học thuộc module
                if (allLessons && allLessons.data) {
                    let lessons = allLessons.data;
                    if (Array.isArray(lessons)) {
                        // Lọc các bài học có moduleId tương ứng
                        return {
                            data: lessons.filter(lesson => lesson.module === moduleId || lesson.moduleId === moduleId)
                        };
                    }
                }

                // Trả về mảng rỗng nếu không có dữ liệu phù hợp
                return { data: [] };
            }
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách bài học của module ID ${moduleId}:`, error);
            throw error;
        }
    },

    // Tạo lesson mới (POST /lessons)
    createLesson: async(lessonData) => {
        try {
            const response = await baseApi.lessons.lessonControllerCreate(lessonData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo lesson mới:', error);
            throw error;
        }
    },

    // Thêm lesson vào section (POST /lessons/section/:sectionId)
    addLessonToSection: async(sectionId, lessonData) => {
        try {
            const response = await baseApi.lessons.lessonControllerAddLessonToSection(sectionId, lessonData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi thêm lesson vào section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Cập nhật lesson (PUT /lessons/:id)
    updateLesson: async(lessonId, lessonData) => {
        try {
            console.log('Sending update to API for lesson:', lessonId);
            console.log('With data:', JSON.stringify(lessonData, null, 2));

            const response = await baseApi.lessons.lessonControllerUpdate(lessonId, lessonData);
            console.log('API response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật lesson ID ${lessonId}:`, error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            throw error;
        }
    },

    // Xóa lesson (DELETE /lessons/:id)
    deleteLesson: async(lessonId) => {
        try {
            const response = await baseApi.lessons.lessonControllerRemove(lessonId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa lesson ID ${lessonId}:`, error);
            throw error;
        }
    }
};