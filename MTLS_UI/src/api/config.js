// Cấu hình API
export const API_CONFIG = {
    // Đường dẫn API base
    // Đổi thành URL thực tế khi deploy
    //baseURL: (window.env && window.env.REACT_APP_API_URL) || 'http://0.0.0.0:3000',

    // Sử dụng đường dẫn tương đối để Vercel proxy chuyển tiếp đến backend
    baseURL: '/api',
    // Headers mặc định
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    },

    // Timeout cho các request (10 giây)
    timeout: 10000
};