import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Course
export const courseService = {
    // Lấy tất cả khóa học
    getAllCourses: async() => {
        try {
            const response = await baseApi.courses.courseControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách khóa học:', error);
            throw error;
        }
    },

    // Lấy chi tiết khóa học theo ID
    getCourseById: async(courseId) => {
        try {

            // Kiểm tra và xử lý courseId
            if (!courseId) {
                throw new Error('CourseID is required');
            }

            // Xử lý trường hợp courseId là object
            let processedId = courseId;
            if (typeof courseId === 'object' && courseId !== null) {
                if (courseId._id) {
                    processedId = courseId._id;
                } else {
                    throw new Error('Invalid courseId format: object without _id');
                }
            }

            // Đảm bảo courseId là string
            processedId = String(processedId);

            const response = await baseApi.instance.get(`/courses/${processedId}`);

            if (response && response.data) {
                return response.data;
            } else {
                return { data: null, error: 'Invalid response structure' };
            }
        } catch (error) {
            console.error(`course.service: Error when fetching course ID ${courseId}:`, error);

            throw error;
        }
    },

    // Lấy chi tiết khóa học kèm tiến trình của học sinh
    getCourseWithProgress: async(courseId, studentId) => {
        try {
            // Kiểm tra thông tin đầu vào
            if (!courseId) {
                throw new Error('CourseID là bắt buộc');
            }
            if (!studentId) {
                throw new Error('StudentID là bắt buộc');
            }

            // Đảm bảo courseId và studentId là string
            const processedCourseId = String(courseId);
            const processedStudentId = String(studentId);

            // Gọi API lấy thông tin khóa học kèm tiến trình
            const response = await baseApi.instance.get(`/courses/${processedCourseId}/${processedStudentId}/progress`);

            if (response && response.data) {
                // Log cấu trúc dữ liệu để debug
                console.log('Course with progress response structure:', response.data);

                // Kiểm tra cấu trúc dữ liệu
                const courseData = response.data.data || response.data;

                // Lưu ý: Trả về dữ liệu ngay cả khi không có _id để khắc phục lỗi nhanh
                // Chúng ta sẽ kiểm tra _id trong các component sử dụng
                return { data: courseData };
            } else {
                console.error('Empty response received from API');
                throw new Error('Cấu trúc phản hồi không hợp lệ');
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin khóa học kèm tiến trình cho học sinh:`, error);
            throw error;
        }
    },

    // Lấy chi tiết khóa học kèm cấu trúc (modules, sections, lessons, v.v.)
    getCourseWithStructure: async(courseId) => {
        try {
            // Kiểm tra thông tin đầu vào
            if (!courseId) {
                throw new Error('CourseID là bắt buộc');
            }

            // Xử lý trường hợp courseId là object
            let processedId = courseId;
            if (typeof courseId === 'object' && courseId !== null) {
                if (courseId._id) {
                    processedId = courseId._id;
                } else {
                    throw new Error('ID khóa học không hợp lệ: object không có _id');
                }
            }

            // Đảm bảo courseId là string
            processedId = String(processedId);

            // Gọi API lấy thông tin khóa học kèm cấu trúc
            const response = await baseApi.instance.get(`/courses/${processedId}/structure`);

            if (response && response.data) {
                // Log cấu trúc dữ liệu để debug
                console.log('Course with structure response:', response.data);

                // Kiểm tra cấu trúc dữ liệu
                const courseData = response.data.data || response.data;

                return { data: courseData };
            } else {
                console.error('Phản hồi API trống');
                throw new Error('Cấu trúc phản hồi không hợp lệ');
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin cấu trúc khóa học ID ${courseId}:`, error);
            throw error;
        }
    },

    // Lấy khóa học theo giáo viên
    getCoursesByTeacher: async(teacherId) => {
        try {
            const response = await baseApi.courses.courseControllerFindByTeacherId(teacherId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy khóa học của giáo viên ID ${teacherId}:`, error);
            throw error;
        }
    },

    // Tạo khóa học mới
    createCourse: async(courseData) => {
        try {
            const response = await baseApi.courses.courseControllerCreate(courseData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo khóa học mới:', error);
            throw error;
        }
    },

    // Cập nhật khóa học
    updateCourse: async(courseId, courseData) => {
        try {
            const response = await baseApi.courses.courseControllerUpdate(courseId, courseData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật khóa học ID ${courseId}:`, error);
            throw error;
        }
    },

    // Xóa khóa học
    deleteCourse: async(courseId) => {
        try {
            const response = await baseApi.courses.courseControllerRemove(courseId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa khóa học ID ${courseId}:`, error);
            throw error;
        }
    }
};