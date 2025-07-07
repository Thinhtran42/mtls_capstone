import axios from 'axios';
import { API_CONFIG } from '../generated/config';

// Tạo instance axios riêng cho analytics API
const analyticsApi = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Thêm interceptor để xử lý token
analyticsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const analyticsService = {
    // Lấy thông tin tổng quan cho dashboard
    getDashboardOverview: async () => {
        try {
            const response = await analyticsApi.get('/analytics/dashboard/overview');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            throw error;
        }
    },

    // Lấy dữ liệu hoạt động người dùng theo thời gian
    getUserActivity: async (timeRange = 'week') => {
        try {
            const response = await analyticsApi.get(`/analytics/user-activity?timeRange=${timeRange}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user activity:', error);
            throw error;
        }
    },

    // Lấy phân phối người dùng theo vai trò
    getUserDistribution: async () => {
        try {
            const response = await analyticsApi.get('/analytics/user-distribution');
            return response.data;
        } catch (error) {
            console.error('Error fetching user distribution:', error);
            throw error;
        }
    },

    // Lấy dữ liệu đăng ký người dùng theo tháng
    getUserRegistrationTrend: async () => {
        try {
            const response = await analyticsApi.get('/analytics/user-registration-trend');
            return response.data;
        } catch (error) {
            console.error('Error fetching user registration trend:', error);
            throw error;
        }
    },

    // Lấy tỷ lệ hoàn thành khóa học
    getCourseCompletionRates: async () => {
        try {
            const response = await analyticsApi.get('/analytics/course-completion-rates');
            return response.data;
        } catch (error) {
            console.error('Error fetching course completion rates:', error);
            throw error;
        }
    },

    // Lấy dữ liệu sử dụng lưu trữ
    getStorageUsage: async () => {
        try {
            const response = await analyticsApi.get('/analytics/storage-usage');
            return response.data;
        } catch (error) {
            console.error('Error fetching storage usage:', error);
            throw error;
        }
    },

    // Lấy thông tin điểm trung bình và hoàn thành khóa học
    getCoursePerformanceAnalytics: async () => {
        try {
            const response = await analyticsApi.get('/analytics/course-performance');
            return response.data;
        } catch (error) {
            console.error('Error fetching course performance analytics:', error);
            throw error;
        }
    },

    // Lấy nội dung phổ biến
    getPopularContent: async () => {
        try {
            const response = await analyticsApi.get('/analytics/popular-content');
            return response.data;
        } catch (error) {
            console.error('Error fetching popular content:', error);
            throw error;
        }
    },

    // Lấy phân tích thời gian học tập
    getLearningTimeAnalytics: async () => {
        try {
            const response = await analyticsApi.get('/analytics/learning-time');
            return response.data;
        } catch (error) {
            console.error('Error fetching learning time analytics:', error);
            throw error;
        }
    },
    
    // Lấy hoạt động gần đây của người dùng
    getRecentActivities: async (limit = 5) => {
        try {
            // Sử dụng API thực tế để lấy dữ liệu
            const response = await analyticsApi.get(`/analytics/recent-activities?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        }
    },

    // Lấy thông tin hệ thống hiện tại
    getSystemCurrent: async () => {
        try {
            const response = await analyticsApi.get('/analytics/system/current');
            return response.data;
        } catch (error) {
            console.error('Error fetching current system info:', error);
            throw error;
        }
    },

    // Lấy lịch sử CPU
    getSystemCpuHistory: async () => {
        try {
            const response = await analyticsApi.get('/analytics/system/cpu-history');
            return response.data;
        } catch (error) {
            console.error('Error fetching CPU history:', error);
            throw error;
        }
    },

    // Lấy lịch sử memory
    getSystemMemoryHistory: async () => {
        try {
            const response = await analyticsApi.get('/analytics/system/memory-history');
            return response.data;
        } catch (error) {
            console.error('Error fetching memory history:', error);
            throw error;
        }
    },

    // Lấy hiệu suất API
    getSystemApiPerformance: async () => {
        try {
            const response = await analyticsApi.get('/analytics/system/api-performance');
            return response.data;
        } catch (error) {
            console.error('Error fetching API performance:', error);
            throw error;
        }
    },

    // Lấy lịch sử lỗi
    getSystemErrorHistory: async () => {
        try {
            const response = await analyticsApi.get('/analytics/system/error-history');
            return response.data;
        } catch (error) {
            console.error('Error fetching error history:', error);
            throw error;
        }
    }
}; 