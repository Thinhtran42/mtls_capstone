import { Api } from './api';
import { API_CONFIG } from './config';

// Tạo instance API base để tái sử dụng
const baseApi = new Api({
    ...API_CONFIG
});

// Thêm interceptor request
baseApi.instance.interceptors.request.use(
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

// Thêm interceptor response
baseApi.instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ERR_NETWORK' || !error.response) {
            console.error('Network error - Cannot connect to API server:', error);
            // Thông báo lỗi cụ thể về kết nối
            error.isConnectionError = true;
            error.userMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và xác nhận rằng API server đang chạy.';
        } else {
            console.error('Response error:', error);
            if (error.response) {
                console.log('Error status:', error.response.status);
                console.log('Error data:', error.response.data);

                // Thêm thông báo người dùng dựa vào mã lỗi
                switch (error.response.status) {
                    case 401:
                        error.userMessage = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.';
                        break;
                    case 403:
                        error.userMessage = 'Bạn không có quyền truy cập vào tài nguyên này.';
                        break;
                    case 404:
                        error.userMessage = 'Không tìm thấy tài nguyên yêu cầu.';
                        break;
                    case 500:
                        error.userMessage = 'Lỗi máy chủ, vui lòng thử lại sau.';
                        break;
                    default:
                        error.userMessage = error.response.data ? error.response.data.message : 'Đã xảy ra lỗi khi xử lý yêu cầu.';
                }
            }
        }

        return Promise.reject(error);
    }
);

export { baseApi };