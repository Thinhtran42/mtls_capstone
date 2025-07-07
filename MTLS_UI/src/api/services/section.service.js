import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Section
export const sectionService = {
    // Lấy tất cả section
    getAllSections: async() => {
        try {
            const response = await baseApi.sections.sectionControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách section:', error);
            throw error;
        }
    },

    // Lấy chi tiết section theo ID
    getSectionById: async(sectionId) => {
        try {
            const response = await baseApi.sections.sectionControllerFindById(sectionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Lấy section theo module
    getSectionsByModule: async(moduleId) => {
        try {
            const response = await baseApi.sections.sectionControllerFindByModuleId(moduleId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy section của module ID ${moduleId}:`, error);
            throw error;
        }
    },

    // Lấy section theo loại (Lesson, Quiz, Exercise, Assignment)
    getSectionsByType: async(type) => {
        try {
            const response = await baseApi.sections.sectionControllerFindByType(type);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy section loại ${type}:`, error);
            throw error;
        }
    },

    // Tạo section mới
    createSection: async(sectionData) => {
        try {
            const response = await baseApi.sections.sectionControllerCreate(sectionData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo section mới:', error);
            throw error;
        }
    },

    // Cập nhật section
    updateSection: async(sectionId, sectionData) => {
        try {
            const response = await baseApi.sections.sectionControllerUpdate(sectionId, sectionData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Xóa section
    deleteSection: async(sectionId) => {
        try {
            const response = await baseApi.sections.sectionControllerRemove(sectionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Cập nhật trạng thái section
    updateSectionStatus: async(sectionId) => {
        try {
            const response = await baseApi.sections.sectionControllerUpdateStatus(sectionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật trạng thái section ID ${sectionId}:`, error);
            throw error;
        }
    },

    // Thêm bài học vào section
    addLessonToSection: async(sectionId, lessonData) => {
        try {
            const response = await baseApi.sections.sectionControllerAddLessonToSection(sectionId, lessonData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi thêm bài học vào section ID ${sectionId}:`, error);
            throw error;
        }
    }
};