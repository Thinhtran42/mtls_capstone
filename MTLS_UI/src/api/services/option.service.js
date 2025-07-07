import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Option
export const optionService = {
    // Lấy tất cả tùy chọn
    getAllOptions: async() => {
        try {
            const response = await baseApi.options.optionControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tùy chọn:', error);
            throw error;
        }
    },

    // Lấy chi tiết tùy chọn theo ID
    getOptionById: async(optionId) => {
        try {
            const response = await baseApi.options.optionControllerFindOne(optionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy tùy chọn ID ${optionId}:`, error);
            throw error;
        }
    },

    // Lấy tùy chọn theo question ID
    getOptionsByQuestionId: async(questionId) => {
        try {
            console.log(`Đang gọi API lấy options cho question ID: ${questionId}`);

            // Đảm bảo questionId là một chuỗi hợp lệ
            if (!questionId) {
                console.error('questionId không hợp lệ:', questionId);
                throw new Error('Question ID không hợp lệ');
            }

            // Format questionId nếu cần
            const id = typeof questionId === 'object' ? questionId._id : String(questionId);
            console.log(`ID đã xử lý: ${id}`);

            // Gọi API để lấy options theo questionId
            const response = await baseApi.options.optionControllerFindListOptionByQuestionId(id);
            console.log(`Kết quả API options:`, response);

            // Xử lý dữ liệu trả về
            let options = [];
            if (response.data && response.data.options && Array.isArray(response.data.options)) {
                options = response.data.options;
            } else if (Array.isArray(response.data)) {
                options = response.data;
            } else if (response.data) {
                options = [response.data]; // Trường hợp chỉ có 1 option
            }

            console.log(`Đã xử lý ${options.length} options`);

            return {
                data: options
            };
        } catch (error) {
            console.error(`Lỗi khi lấy options theo question ID ${questionId}:`, error);
            // Trả về mảng rỗng để không làm crash ứng dụng
            return { data: [] };
        }
    },

    // Tạo tùy chọn mới
    createOption: async(optionData) => {
        try {
            const response = await baseApi.options.optionControllerCreate(optionData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo tùy chọn mới:', error);
            throw error;
        }
    },

    // Tạo nhiều tùy chọn cùng lúc
    createMultipleOptions: async(optionsData) => {
        try {
            const response = await baseApi.options.optionControllerCreateMultiple({
                options: optionsData
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo nhiều tùy chọn:', error);
            throw error;
        }
    },

    // Cập nhật tùy chọn
    updateOption: async(optionId, optionData) => {
        try {
            const response = await baseApi.options.optionControllerUpdate(optionId, optionData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật tùy chọn ID ${optionId}:`, error);
            throw error;
        }
    },

    // Xóa tùy chọn
    deleteOption: async(optionId) => {
        try {
            const response = await baseApi.options.optionControllerRemove(optionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa tùy chọn ID ${optionId}:`, error);
            throw error;
        }
    },

    // Alias cho getOptionsByQuestionId để tương thích ngược
    getOptionsByQuestion: async(questionId) => {
        console.log('Using getOptionsByQuestion alias for getOptionsByQuestionId');
        return optionService.getOptionsByQuestionId(questionId);
    }
};

export default optionService;
