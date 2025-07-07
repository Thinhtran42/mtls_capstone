import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Enrollment
export const enrollmentService = {
    // Lấy tất cả đăng ký khóa học
    getAllEnrollments: async() => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đăng ký khóa học:', error);
            throw error;
        }
    },

    // Lấy chi tiết đăng ký khóa học theo ID
    getEnrollmentById: async(enrollmentId) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerFindById(enrollmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy đăng ký khóa học ID ${enrollmentId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách đăng ký theo học viên
    getEnrollmentsByStudent: async(studentId) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerFindByStudentId(studentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy đăng ký khóa học của học viên ID ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách đăng ký theo khóa học
    getEnrollmentsByCourse: async(courseId) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerFindByCourseId(courseId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy đăng ký cho khóa học ID ${courseId}:`, error);
            throw error;
        }
    },

    // Kiểm tra đăng ký của học viên cho khóa học cụ thể
    checkEnrollmentForStudentAndCourse: async(studentId, courseId) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerFindByStudentAndCourse(studentId, courseId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi kiểm tra đăng ký của học viên ID ${studentId} cho khóa học ID ${courseId}:`, error);
            throw error;
        }
    },

    // Tạo đăng ký khóa học mới
    createEnrollment: async(enrollmentData) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerCreate(enrollmentData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo đăng ký khóa học mới:', error);
            throw error;
        }
    },

    // Cập nhật đăng ký khóa học
    updateEnrollment: async(enrollmentId, enrollmentData) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerUpdate(enrollmentId, enrollmentData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật đăng ký khóa học ID ${enrollmentId}:`, error);
            throw error;
        }
    },

    // Hủy đăng ký khóa học
    deleteEnrollment: async(enrollmentId) => {
        try {
            const response = await baseApi.enrollments.enrollmentControllerRemove(enrollmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi hủy đăng ký khóa học ID ${enrollmentId}:`, error);
            throw error;
        }
    }
};