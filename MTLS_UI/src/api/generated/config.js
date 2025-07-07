export const API_CONFIG = {
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    timeout: 30000,
    maxContentLength: 10 * 1024 * 1024,
    maxBodyLength: 10 * 1024 * 1024,
    validateStatus: function(status) {
        return status >= 200 && status < 500; // Xử lý các mã lỗi HTTP giữa 200-499
    },
    retry: 3, // Số lần thử lại khi kết nối thất bại
    retryDelay: 1000 // Độ trễ giữa các lần thử lại (ms)
};