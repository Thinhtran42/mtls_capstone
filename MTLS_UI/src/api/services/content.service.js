import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Content
export const contentService = {
    // Lấy tất cả contents
    getAllContents: async() => {
        try {
            const response = await baseApi.contents.contentControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách contents:', error);
            throw error;
        }
    },

    // Lấy chi tiết content theo ID
    getContentById: async(contentId) => {
        try {
            const response = await baseApi.contents.contentControllerFindOne(contentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy content ID ${contentId}:`, error);
            throw error;
        }
    },

    // Lấy content theo lesson
    getContentsByLesson: async(lessonId) => {
        try {
            const response = await baseApi.contents.contentControllerFindByLesson(lessonId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy content của lesson ID ${lessonId}:`, error);
            throw error;
        }
    },

    // Lấy content theo loại (Video hoặc Reading)
    getContentsByType: async(type) => {
        try {
            const response = await baseApi.contents.contentControllerFindByType(type);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy content loại ${type}:`, error);
            throw error;
        }
    },

    // Tạo content mới
    createContent: async(contentData) => {
        try {
            const response = await baseApi.contents.contentControllerCreate(contentData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo content mới:', error);
            throw error;
        }
    },

    // Thêm content vào lesson
    addContentToLesson: async(lessonId, contentData) => {
        try {
            // Đảm bảo dữ liệu gửi lên đúng format mà backend yêu cầu
            const dataToSend = {
                ...contentData,
                lesson: lessonId // Đảm bảo lesson được gửi như một string
            };
            console.log('Sending content data:', JSON.stringify(dataToSend, null, 2));
            
            const response = await baseApi.contents.contentControllerAddContentToLesson(lessonId, dataToSend);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi thêm content vào lesson ID ${lessonId}:`, error);
            
            // Chi tiết hơn về lỗi API
            if (error.response) {
                // Lỗi từ server với response
                console.error('Chi tiết lỗi response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            } else if (error.request) {
                // Đã gửi request nhưng không nhận được response
                console.error('Không nhận được response từ server:', error.request);
            } else {
                // Lỗi khi setup request
                console.error('Lỗi khi setup request:', error.message);
            }
            
            throw error;
        }
    },

    // Cập nhật content
    updateContent: async(contentId, contentData) => {
        try {
            // Đảm bảo lesson là string nếu nó tồn tại trong dữ liệu cập nhật
            const dataToSend = { ...contentData };
            if (dataToSend.lesson) {
                dataToSend.lesson = String(dataToSend.lesson);
            }
            
            console.log(`Cập nhật content ID: ${contentId}`);
            
            // Đảm bảo data không vượt quá kích thước cho phép nếu quá lớn
            if (dataToSend.data && dataToSend.data.length > 500000) {
                console.warn('Data quá lớn, có thể gây lỗi khi gửi đi');
            }
            
            // Thêm timeout dài hơn cho request có data lớn
            const response = await baseApi.contents.contentControllerUpdate(contentId, dataToSend);
            
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật content ID ${contentId}:`, error);
            
            // Chi tiết hơn về lỗi API
            if (error.response) {
                // Lỗi từ server với response
                console.error('Chi tiết lỗi response:', {
                    status: error.response.status,
                    data: error.response.data
                });
            } else if (error.request) {
                // Đã gửi request nhưng không nhận được response
                console.error('Không nhận được response từ server');
            } else {
                // Lỗi khi setup request
                console.error('Lỗi khi setup request:', error.message);
            }
            
            throw error;
        }
    },

    // Xóa content
    deleteContent: async(contentId) => {
        try {
            const response = await baseApi.contents.contentControllerRemove(contentId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa content ID ${contentId}:`, error);
            throw error;
        }
    },
    
    // Tạo nhiều content cùng lúc
    createMultipleContents: async(createMultipleContentsDto) => {
        try {
            const response = await baseApi.contents.contentControllerCreateMultiple(createMultipleContentsDto);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo nhiều content:', error);
            throw error;
        }
    }
};