import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Assignment
export const assignmentService = {
    // Lấy tất cả assignment
    getAllAssignments: async() => {
        try {
            const response = await baseApi.assignments.assignmentControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách assignment:', error);
            throw error;
        }
    },

    // Lấy chi tiết assignment theo ID
    getAssignmentById: async(assignmentId) => {
        try {
            console.log(`Assignment service: fetching assignment ${assignmentId}`);
            const response = await baseApi.assignments.assignmentControllerFindOne(assignmentId);
            console.log('Assignment service: Raw response:', response);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy assignment ID ${assignmentId}:`, error);
            const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin bài tập';
            console.error('Chi tiết lỗi:', errorMsg);
            throw error;
        }
    },

    // Lấy assignment theo section
    getAssignmentsBySection: async(sectionId) => {
        try {
            const response = await baseApi.assignments.assignmentControllerFindBySection(sectionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy assignment của section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Lấy assignment và danh sách bài nộp
    getAssignmentWithSubmissions: async(assignmentId) => {
        try {
            const response = await baseApi.assignments.assignmentControllerFindOneWithSubmissions(assignmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy assignment ID ${assignmentId} và danh sách bài nộp:`, error);
            throw error;
        }
    },

    // Lấy danh sách học sinh đã làm assignment
    getStudentsWhoSubmitted: async(assignmentId) => {
        try {
            const response = await baseApi.assignments.assignmentControllerGetStudentsWhoSubmitted(assignmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách học sinh đã làm assignment ID ${assignmentId}:`, error);
            throw error;
        }
    },

    // Lấy thống kê assignment
    getAssignmentStats: async(assignmentId) => {
        try {
            const response = await baseApi.assignments.assignmentControllerGetAssignmentStats(assignmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy thống kê assignment ID ${assignmentId}:`, error);
            throw error;
        }
    },

    // Tạo assignment mới
    createAssignment: async(assignmentData) => {
        try {
            const response = await baseApi.assignments.assignmentControllerCreate(assignmentData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo assignment mới:', error);
            throw error;
        }
    },

    // Cập nhật assignment
    updateAssignment: async(assignmentId, assignmentData) => {
        try {
            console.log(`Assignment service: updating assignment ${assignmentId}`, assignmentData);
            const response = await baseApi.assignments.assignmentControllerUpdate(assignmentId, assignmentData);
            console.log('Assignment service: Update response:', response);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật assignment ID ${assignmentId}:`, error);
            const errorMsg = error.response?.data?.message || error.message || 'Không thể cập nhật thông tin bài tập';
            console.error('Chi tiết lỗi:', errorMsg);
            throw error;
        }
    },

    // Xóa assignment
    deleteAssignment: async(assignmentId) => {
        try {
            const response = await baseApi.assignments.assignmentControllerRemove(assignmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa assignment ID ${assignmentId}:`, error);
            throw error;
        }
    }
};

// Service cho DoAssignment (bài làm của học sinh)
export const doAssignmentService = {
    // Nộp bài assignment
    submitAssignment: async(submitData) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerCreate(submitData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi nộp bài assignment:', error);
            throw error;
        }
    },

    // Lấy danh sách bài nộp
    getAllSubmissions: async(filters = {}) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerFindAll(filters);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài nộp:', error);
            throw error;
        }
    },

    // Lấy chi tiết bài nộp theo ID
    getSubmissionById: async(submissionId) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerFindOne(submissionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy bài nộp ID ${submissionId}:`, error);
            throw error;
        }
    },

    getSubmissionByAssignmentId: async(studentId, assignmentId) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerFindByStudentAndAssignment(studentId, assignmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy bài nộp theo assignment ID ${assignmentId}:`, error);
            throw error;
        }
    },

    // Lấy chi tiết đầy đủ về một bài nộp
    getSubmissionDetails: async(submissionId) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerGetSubmissionDetails(submissionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy chi tiết bài nộp ID ${submissionId}:`, error);
            throw error;
        }
    },

    // Cập nhật bài nộp (chấm điểm)
    updateSubmission: async(submissionId, updateData) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerUpdate(submissionId, updateData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật bài nộp ID ${submissionId}:`, error);
            throw error;
        }
    },

    // Học sinh cập nhật bài làm của mình (sử dụng API endpoint riêng biệt)
    updateStudentSubmission: async(submissionId, updateData) => {
        try {
            console.log(`Student submission update for ID ${submissionId}:`, updateData);
            const response = await baseApi.doAssignments.doAssignmentControllerUpdateStudentSubmission(submissionId, updateData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi học sinh cập nhật bài nộp ID ${submissionId}:`, error);
            throw error;
        }
    },

    // Xóa bài nộp
    deleteSubmission: async(submissionId) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerRemove(submissionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa bài nộp ID ${submissionId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách bài nộp theo assignment
    getSubmissionsByAssignment: async(assignmentId) => {
        try {
            console.log(`DoAssignment service: fetching submissions for assignment ${assignmentId}`);
            const response = await baseApi.doAssignments.doAssignmentControllerFindByAssignment(assignmentId);
            console.log('DoAssignment service: Raw submissions response:', response);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy bài nộp theo assignment ID ${assignmentId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách bài nộp theo học sinh
    getSubmissionsByStudent: async(studentId) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerFindByStudent(studentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy bài nộp của học sinh ID ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy thống kê điểm số cho assignment
    getAssignmentStatistics: async(assignmentId) => {
        try {
            const response = await baseApi.doAssignments.doAssignmentControllerGetAssignmentStatistics(assignmentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy thống kê điểm số assignment ID ${assignmentId}:`, error);
            throw error;
        }
    },

    // Lấy trạng thái nộp bài của sinh viên
    getStudentAssignmentStatus: async(studentId, assignmentId) => {
        try {
            console.log(`DoAssignment service: Kiểm tra trạng thái nộp bài cho sinh viên ${studentId}, assignment ${assignmentId}`);
            const response = await baseApi.doAssignments.doAssignmentControllerGetStudentAssignmentStatus(studentId, assignmentId);
            console.log('Kết quả kiểm tra trạng thái nộp bài:', response);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi kiểm tra trạng thái nộp bài của sinh viên ${studentId} cho assignment ${assignmentId}:`, error);
            throw error;
        }
    }
};