// Import các module cần thiết
import express from 'express';
const app = express();

console.log('Server starting...');
const port = process.env.PORT || 3000;

// Thêm một route đơn giản để kiểm tra
app.get('/', (req, res) => {
    res.send('Server đang chạy bình thường!');
});

// Khởi động server
app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log(`Server running on port ${port}`);
});