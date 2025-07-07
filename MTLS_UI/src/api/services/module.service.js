import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Module
export const moduleService = {
    // Lấy tất cả module
    getAllModules: async() => {
        try {
            const response = await baseApi.modules.moduleControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách module:', error);
            throw error;
        }
    },

    // Lấy chi tiết module theo ID
    getModuleById: async(moduleId) => {
        try {
            // Kiểm tra và xử lý moduleId
            if (!moduleId) {
                throw new Error('ModuleID is required');
            }

            // Xử lý trường hợp moduleId là object
            let processedId = moduleId;
            if (typeof moduleId === 'object' && moduleId !== null) {
                if (moduleId._id) {
                    processedId = moduleId._id;
                } else {
                    throw new Error('Invalid moduleId format: object without _id');
                }
            }

            // Đảm bảo moduleId là string
            processedId = String(processedId);

            const response = await baseApi.modules.moduleControllerFindById(processedId);

            if (response && response.data) {
                return response.data;
            } else {
                return { data: null, error: 'Invalid response structure' };
            }
        } catch (error) {

            if (error.response) {
                console.error('module.service: Error response status:', error.response.status);
                console.error('module.service: Error response data:', error.response.data);
            }

            throw error;
        }
    },

    // Lấy module theo khóa học
    getModulesByCourse: async(courseId) => {
        try {
            const response = await baseApi.modules.moduleControllerFindByCourseId(courseId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy module của khóa học ID ${courseId}:`, error);
            throw error;
        }
    },

    // Tạo module mới
    createModule: async(moduleData) => {
        try {
            const response = await baseApi.modules.moduleControllerCreate(moduleData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo module mới:', error);
            throw error;
        }
    },

    // Cập nhật module
    updateModule: async(moduleId, moduleData) => {
        try {
            const response = await baseApi.modules.moduleControllerUpdate(moduleId, moduleData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật module ID ${moduleId}:`, error);
            throw error;
        }
    },

    // Xóa module
    deleteModule: async(moduleId) => {
        try {
            const response = await baseApi.modules.moduleControllerRemove(moduleId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa module ID ${moduleId}:`, error);
            throw error;
        }
    },

    // Cập nhật trạng thái module
    updateModuleStatus: async(moduleId) => {
        try {
            const response = await baseApi.modules.moduleControllerUpdateStatus(moduleId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật trạng thái module ID ${moduleId}:`, error);
            throw error;
        }
    }
};