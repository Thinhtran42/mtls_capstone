import axios from 'axios';
import { API_CONFIG } from '../generated/config';

// Tạo instance axios riêng cho settings API
const settingsApi = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Thêm interceptor để xử lý token
settingsApi.interceptors.request.use(
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

/**
 * Service xử lý các cài đặt hệ thống
 */
export const settingsService = {
  /**
   * Lấy thông tin cài đặt hệ thống (đã cấu trúc thành các nhóm)
   */
  getSystemSettings: async () => {
    try {
      const response = await settingsApi.get('/settings/system');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy cài đặt hệ thống:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả cài đặt (chỉ admin)
   */
  getAllSettings: async () => {
    try {
      const response = await settingsApi.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả cài đặt:', error);
      throw error;
    }
  },

  /**
   * Lấy các cài đặt công khai
   */
  getPublicSettings: async () => {
    try {
      const response = await settingsApi.get('/settings/public');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy cài đặt công khai:', error);
      throw error;
    }
  },

  /**
   * Lấy cài đặt theo khóa
   */
  getSettingByKey: async (key) => {
    try {
      const response = await settingsApi.get(`/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy cài đặt với khóa ${key}:`, error);
      throw error;
    }
  },

  /**
   * Tạo cài đặt mới (chỉ admin)
   */
  createSetting: async (settingData) => {
    try {
      const response = await settingsApi.post('/settings', settingData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo cài đặt mới:', error);
      throw error;
    }
  },

  /**
   * Cập nhật nhiều cài đặt cùng lúc (chỉ admin)
   */
  updateMultipleSettings: async (settingsArray) => {
    try {
      const response = await settingsApi.post('/settings/bulk', settingsArray);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật nhiều cài đặt:', error);
      throw error;
    }
  },

  /**
   * Cập nhật cài đặt theo khóa (chỉ admin)
   */
  updateSetting: async (key, settingData) => {
    try {
      const response = await settingsApi.put(`/settings/${key}`, settingData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật cài đặt với khóa ${key}:`, error);
      throw error;
    }
  },

  /**
   * Xóa cài đặt theo khóa (chỉ admin)
   */
  deleteSetting: async (key) => {
    try {
      const response = await settingsApi.delete(`/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa cài đặt với khóa ${key}:`, error);
      throw error;
    }
  }
}; 