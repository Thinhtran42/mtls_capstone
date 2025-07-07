import { baseApi } from '../generated/baseApi';

// Service wrapper cho discussion reply API
export const discussionReplyService = {
    // Lấy tất cả replies
    getAllReplies: async() => {
        try {
            const response = await baseApi.discussionReplies.discussionReplyControllerFindAll();
            return response;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phản hồi:', error);
            throw error;
        }
    },

    // Lấy replies theo discussion ID - Cập nhật để hỗ trợ nhiều endpoint
    getRepliesByDiscussion: async(discussionId) => {
        try {
            console.log(`Gọi API lấy replies cho discussion ID ${discussionId}`);

            try {
                // Thử với endpoint chính
                const response = await baseApi.discussionReplies.discussionReplyControllerFindByDiscussion(discussionId);
                console.log('API response từ endpoint chính:', response);
                return response;
            } catch (primaryError) {
                console.error('Lỗi khi gọi endpoint chính:', primaryError);

                // Thử với endpoint dự phòng
                try {
                    console.log('Thử gọi API với endpoint dự phòng');
                    // Gọi API thủ công
                    const fallbackResponse = await baseApi.request({
                        url: `/discussion-replies/discussion/${discussionId}`,
                        method: 'GET',
                    });
                    console.log('API response từ endpoint dự phòng:', fallbackResponse);
                    return fallbackResponse;
                } catch (fallbackError) {
                    console.error('Lỗi khi gọi endpoint dự phòng:', fallbackError);
                    throw fallbackError;
                }
            }
        } catch (error) {
            console.error(`Lỗi khi lấy phản hồi cho discussion ID ${discussionId}:`, error);
            throw error;
        }
    },

    // Lấy reply theo ID
    getReplyById: async(replyId) => {
        try {
            const response = await baseApi.discussionReplies.discussionReplyControllerFindById(replyId);
            return response;
        } catch (error) {
            console.error(`Lỗi khi lấy phản hồi ID ${replyId}:`, error);
            throw error;
        }
    },

    // Tạo reply mới
    createReply: async(replyData) => {
        try {
            console.log('Dữ liệu phản hồi gửi đi:', replyData);
            const response = await baseApi.discussionReplies.discussionReplyControllerCreate(replyData);
            console.log('Kết quả API tạo phản hồi:', response);
            return response;
        } catch (error) {
            console.error('Lỗi khi tạo phản hồi mới:', error);
            throw error;
        }
    },

    // Cập nhật reply
    updateReply: async(replyId, replyData) => {
        try {
            const response = await baseApi.discussionReplies.discussionReplyControllerUpdate(replyId, replyData);
            return response;
        } catch (error) {
            console.error(`Lỗi khi cập nhật phản hồi ID ${replyId}:`, error);
            throw error;
        }
    },

    // Xóa reply
    deleteReply: async(replyId) => {
        try {
            const response = await baseApi.discussionReplies.discussionReplyControllerRemove(replyId);
            return response;
        } catch (error) {
            console.error(`Lỗi khi xóa phản hồi ID ${replyId}:`, error);
            throw error;
        }
    }
};