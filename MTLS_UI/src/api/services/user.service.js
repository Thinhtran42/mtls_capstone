import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho User
export const userService = {
    // Lấy tất cả người dùng
    getAllUsers: async() => {
        try {
            const response = await baseApi.users.usersControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            throw error;
        }
    },

    // Lấy tất cả học sinh
    getAllStudents: async() => {
        try {
            const response = await baseApi.users.usersControllerFindAllStudents();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách học sinh:', error);
            throw error;
        }
    },

    // Lấy tất cả giáo viên
    getAllTeachers: async() => {
        try {
            const response = await baseApi.users.usersControllerFindAllTeachers();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách giáo viên:', error);
            throw error;
        }
    },

    // Lấy tất cả người dùng bị khóa (locked)
    getAllLockedUsers: async() => {
        try {
            const response = await baseApi.users.usersControllerFindAllLockedUsers();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng bị khóa:', error);
            throw error;
        }
    },

    // Lấy chi tiết người dùng theo ID
    getUserById: async(userId) => {
        try {
            const response = await baseApi.users.usersControllerFindById(userId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, error);
            throw error;
        }
    },

    // Lấy người dùng theo email
    getUserByEmail: async(email) => {
        try {
            const response = await baseApi.users.usersControllerFindByEmail(email);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy người dùng với email ${email}:`, error);
            throw error;
        }
    },

    // Tạo người dùng mới
    createUser: async(userData) => {
        try {
            const response = await baseApi.users.usersControllerCreate(userData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo người dùng mới:', error);
            throw error;
        }
    },

    // Cập nhật thông tin người dùng
    updateUser: async(userId, userData) => {
        try {
            const response = await baseApi.users.usersControllerUpdate(userId, userData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật thông tin người dùng ID ${userId}:`, error);
            throw error;
        }
    },

    // Mở khóa tài khoản người dùng
    unlockUser: async(userId) => {
        try {
            const response = await baseApi.users.usersControllerUnlockUser(userId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi mở khóa tài khoản người dùng ID ${userId}:`, error);
            throw error;
        }
    },

    // Xóa người dùng
    deleteUser: async(userId) => {
        try {
            const response = await baseApi.users.usersControllerRemove(userId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa người dùng ID ${userId}:`, error);
            throw error;
        }
    },

    // Lấy thông tin người dùng hiện tại từ localStorage
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                return JSON.parse(userStr);
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
            return null;
        }
    },

    // Lưu thông tin người dùng hiện tại
    setCurrentUser: (user) => {
        try {
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Lỗi khi lưu thông tin người dùng:', error);
        }
    },

    // Xóa thông tin người dùng hiện tại
    clearCurrentUser: () => {
        localStorage.removeItem('user');
    },

    // Thêm hàm xử lý deactivate/activate user trong userService
    toggleUserStatus: async(userId, isActive) => {
        try {
            // Chỉ gửi thông tin cần thiết, không gửi phone
            const updateData = { 
                isActive: isActive,
                updateAt: new Date().toISOString()
            };
            
            // Sử dụng API để cập nhật trạng thái
            const response = await baseApi.users.usersControllerUpdate(userId, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error when changing user status ID ${userId}:`, error);
            if (error.response && error.response.data) {
                console.error('Error details:', error.response.data);
            }
            throw error;
        }
    },

    // Thêm hàm mới này vào userService
    getAllUsersIncludingInactive: async() => {
        try {
            // Gọi API lấy tất cả người dùng không phân biệt trạng thái active
            const response = await baseApi.users.usersControllerFindAllUsersIncludingInactive();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy tất cả người dùng:', error);
            throw error;
        }
    }
};