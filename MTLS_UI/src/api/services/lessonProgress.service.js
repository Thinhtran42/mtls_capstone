import { baseApi } from '../generated/baseApi';

export const lessonProgressService = {
    // Tạo tiến độ bài học mới (POST /lesson-progress)
    createLessonProgress: async(progressData) => {
        try {
            const response = await baseApi.lessonProgress.lessonProgressControllerCreate(progressData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo tiến độ bài học:', error);
            if (error.response) {
                console.error('Chi tiết lỗi:', error.response.data);
            }
            throw error;
        }
    },

    // Lấy tiến độ của học viên (GET /lesson-progress/student/:studentId)
    getLessonProgressByStudent: async(studentId) => {
        try {
            const response = await baseApi.lessonProgress.lessonProgressControllerFindByStudent(studentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy tiến độ của học viên ID ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy tiến độ của học viên trong lesson đó (GET /lesson-progress/student/:studentId/lesson/:lessonId)
    getLessonProgressByStudentAndLesson: async(studentId, lessonId) => {
        try {
            const response = await baseApi.lessonProgress.lessonProgressControllerFindByStudentAndLesson(studentId, lessonId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy tiến độ của học viên ID ${studentId} trong lesson ID ${lessonId}:`, error);
            throw error;
        }
    }
};