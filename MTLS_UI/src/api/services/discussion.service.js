import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Discussion
export const discussionService = {
    // Lấy tất cả discussions
    getAllDiscussions: async() => {
        try {
            const response = await baseApi.discussions.discussionControllerFindAll();
            return { data: response.data };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách discussions:', error);
            throw error;
        }
    },

    // Lấy chi tiết discussion theo ID
    getDiscussionById: async(discussionId) => {
        try {
            if (!discussionId) {
                throw new Error('DiscussionID is required');
            }

            // Đảm bảo discussionId là string
            const processedId = String(discussionId);

            const response = await baseApi.discussions.discussionControllerFindOne(processedId);
            return { data: response.data };
        } catch (error) {
            console.error(`Lỗi khi lấy discussion ID ${discussionId}:`, error);
            throw error;
        }
    },

    // Lấy discussions theo module
    getDiscussionsByModule: async(moduleId) => {
        try {
            if (!moduleId) {
                throw new Error('ModuleID is required');
            }

            const response = await baseApi.discussions.discussionControllerFindByModule(moduleId);
            return { data: response.data };
        } catch (error) {
            console.error(`Lỗi khi lấy discussions của module ID ${moduleId}:`, error);
            throw error;
        }
    },

    // Lấy discussions theo student
    getDiscussionsByStudent: async(studentId) => {
        try {
            if (!studentId) {
                throw new Error('StudentID is required');
            }

            const response = await baseApi.discussions.discussionControllerFindByStudentId(studentId);
            return { data: response.data };
        } catch (error) {
            console.error(`Lỗi khi lấy discussions của student ID ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy discussions theo student và module
    getDiscussionsByStudentAndModule: async(studentId, moduleId) => {
        try {
            if (!studentId || !moduleId) {
                throw new Error('StudentID and ModuleID are required');
            }

            const response = await baseApi.discussions.discussionControllerFindByStudentAndModule(studentId, moduleId);
            return { data: response.data };
        } catch (error) {
            console.error(`Lỗi khi lấy discussions của student ID ${studentId} và module ID ${moduleId}:`, error);
            throw error;
        }
    },

    // Tạo discussion mới
    createDiscussion: async(discussionData) => {
        try {
            const response = await baseApi.discussions.discussionControllerCreate(discussionData);
            return { data: response.data };
        } catch (error) {
            console.error('Lỗi khi tạo discussion mới:', error);
            throw error;
        }
    },

    // Cập nhật discussion
    updateDiscussion: async(discussionId, discussionData) => {
        try {
            const response = await baseApi.discussions.discussionControllerUpdate(discussionId, discussionData);
            return { data: response.data };
        } catch (error) {
            console.error(`Lỗi khi cập nhật discussion ID ${discussionId}:`, error);
            throw error;
        }
    },

    // Xóa discussion
    deleteDiscussion: async(discussionId) => {
        try {
            const response = await baseApi.discussions.discussionControllerRemove(discussionId);
            return { data: response.data };
        } catch (error) {
            console.error(`Lỗi khi xóa discussion ID ${discussionId}:`, error);
            throw error;
        }
    }
};