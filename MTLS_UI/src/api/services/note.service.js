import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Note
export const noteService = {
    // Lấy tất cả ghi chú
    getAllNotes: async() => {
        try {
            const response = await baseApi.notes.noteControllerFindAll();
            console.log('getAllNotes response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching all notes:', error);
            throw error;
        }
    },

    // Lấy ghi chú theo ID
    getNoteById: async(noteId) => {
        try {
            if (!noteId) {
                throw new Error('Note ID is required');
            }

            const response = await baseApi.notes.noteControllerFindOne(noteId);
            console.log('getNoteById response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching note with ID ${noteId}:`, error);
            throw error;
        }
    },

    // Lấy ghi chú của học viên hiện tại
    getMyNotes: async() => {
        try {
            const response = await baseApi.notes.noteControllerFindMyNotes();
            console.log('getMyNotes response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching my notes:', error);
            throw error;
        }
    },

    // Lấy ghi chú theo học viên ID
    getNotesByStudentId: async(studentId) => {
        try {
            if (!studentId) {
                throw new Error('Student ID is required');
            }

            const response = await baseApi.notes.noteControllerFindByStudentId(studentId);
            console.log('getNotesByStudentId response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching notes for student ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy ghi chú theo module ID
    getNotesByModuleId: async(moduleId) => {
        try {
            if (!moduleId) {
                throw new Error('Module ID is required');
            }

            const response = await baseApi.notes.noteControllerFindByModuleId(moduleId);
            console.log('getNotesByModuleId response:', response);

            // Cấu trúc response: { statusCode, message, data: { count, notes: [...] } }
            if (response && response.data) {
                return response.data;
            }

            return { notes: [] };
        } catch (error) {
            console.error(`Error fetching notes for module ${moduleId}:`, error);
            throw error;
        }
    },

    // Tạo ghi chú mới
    createNote: async(noteData) => {
        try {
            console.log('Creating note with data:', noteData);
            const response = await baseApi.notes.noteControllerCreate(noteData);
            console.log('createNote response:', response);
            return response.data;
        } catch (error) {
            console.error('Error creating new note:', error);
            throw error;
        }
    },

    // Cập nhật ghi chú
    updateNote: async(noteId, noteData) => {
        try {
            if (!noteId) {
                throw new Error('Note ID is required');
            }

            // Đảm bảo chỉ gửi dữ liệu content lên API theo yêu cầu
            const updateData = {
                content: noteData.content
            };

            console.log(`Updating note ${noteId} with data:`, updateData);
            const response = await baseApi.notes.noteControllerUpdate(noteId, updateData);
            console.log('updateNote response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error updating note ${noteId}:`, error);
            throw error;
        }
    },

    // Xóa ghi chú
    deleteNote: async(noteId) => {
        try {
            if (!noteId) {
                throw new Error('Note ID is required');
            }

            console.log(`Deleting note with ID: ${noteId}`);
            const response = await baseApi.notes.noteControllerRemove(noteId);
            console.log('deleteNote response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error deleting note ${noteId}:`, error);
            throw error;
        }
    }
};