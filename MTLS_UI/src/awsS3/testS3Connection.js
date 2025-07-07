import AWS from 'aws-sdk';
import config from './configS3';

// Function kiểm tra kết nối
export const testS3Connection = async() => {
    try {
        // Cấu hình AWS
        AWS.config.update({
            region: config.region,
            credentials: config.credentials ? new AWS.Credentials(config.credentials) : undefined
        });

        // Tạo S3 client với đầy đủ cấu hình
        const s3 = new AWS.S3({
            region: config.region,
            endpoint: config.endpoint,
            s3ForcePathStyle: true, // Thay đổi thành true
            signatureVersion: 'v4',
            credentials: config.credentials
        });

        // Thử kiểm tra bucket tồn tại thay vì liệt kê tất cả buckets
        try {
            console.log('Đang kiểm tra bucket:', config.bucketName);
            await s3.headBucket({ Bucket: config.bucketName }).promise();
            console.log('✅ KẾT NỐI THÀNH CÔNG! Tìm thấy bucket:', config.bucketName);
            return true;
        } catch (bucketError) {
            if (bucketError.code === 'NotFound') {
                console.warn('⚠️ Không tìm thấy bucket:', config.bucketName);
            } else if (bucketError.code === 'Forbidden') {
                console.error('🚫 Không có quyền truy cập bucket:', config.bucketName);
            }
            console.error('Chi tiết lỗi bucket:', bucketError);
            return false;
        }
    } catch (error) {
        console.error('❌ LỖI KẾT NỐI AWS S3:', error.message);
        console.error('Chi tiết lỗi:', error);

        if (error.code === 'InvalidAccessKeyId') {
            console.error('🔑 Access Key không chính xác hoặc không tồn tại');
        } else if (error.code === 'SignatureDoesNotMatch') {
            console.error('🔑 Secret Key không chính xác');
        } else if (error.code === 'NetworkingError') {
            console.error('🌐 Lỗi mạng. Kiểm tra kết nối internet');
        }
        throw error;
    }
};