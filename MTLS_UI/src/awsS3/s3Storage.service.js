import AWS from 'aws-sdk';
import config from './configS3';

// Cấu hình AWS từ file config
AWS.config.update({
    region: config.region
});

// Thêm credentials nếu có
if (config.credentials) {
    AWS.config.credentials = new AWS.Credentials(config.credentials);
} else {
    console.warn('AWS credentials không được cấu hình. Vui lòng kiểm tra file .env');
}

// Tạo instance S3 với cấu hình đầy đủ từ config
const s3 = new AWS.S3({
    endpoint: config.endpoint,
    s3ForcePathStyle: config.forcePathStyle, // Chú ý: Với AWS SDK v2, thuộc tính này là s3ForcePathStyle
    signatureVersion: config.signatureVersion
});

// Log cấu hình để debug
console.log('S3 config đang sử dụng:', {
    region: config.region,
    bucket: config.bucketName,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    hasCredentials: !!config.credentials
});

const BUCKET_NAME = config.bucketName;

// Thêm hàm tạo presigned URL cho upload
const getPresignedUploadUrl = async(key, contentType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        Expires: 3600 // URL có hiệu lực trong 1 giờ
    };

    try {
        const url = await s3.getSignedUrlPromise('putObject', params);
        return url;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
};

export const s3StorageService = {
    uploadFile: async(file, studentInfo) => {
        if (!file) return null;

        const timestamp = new Date().getTime();
        const studentId = studentInfo && studentInfo.id ? studentInfo.id : 'anonymous';

        // Tạo key đơn giản: assignment/studentId/timestamp_filename
        const key = `assignment/${studentId}/${timestamp}_${file.name}`;

        try {
            // Lấy presigned URL để upload
            const uploadUrl = await getPresignedUploadUrl(key, file.type);

            // Upload file sử dụng presigned URL
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            // Tạo URL để truy cập file
            const fileUrl = await s3StorageService.getSignedUrl(key);

            return {
                fileUrl,
                filePath: key,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Hàm theo dõi tiến trình upload
    uploadFileWithProgress: (file, studentInfo, assignmentInfo, onProgress) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            // Tạo key như trên
            const timestamp = new Date().getTime();
            const courseId = assignmentInfo && assignmentInfo.courseId ? assignmentInfo.courseId : 'unknown-course';
            const studentId = studentInfo && studentInfo.id ? studentInfo.id : 'anonymous';
            const key = `assignments/${courseId}/${assignmentInfo && assignmentInfo.sectionId ? assignmentInfo.sectionId : 'unknown-section'}/${studentId}/${timestamp}_${file.name}`;

            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file,
                ContentType: file.type,
                Metadata: {
                    'studentName': studentInfo && studentInfo.name ? studentInfo.name : 'Unknown',
                    'courseTitle': assignmentInfo && assignmentInfo.courseTitle ? assignmentInfo.courseTitle : 'Unknown',
                    'sectionTitle': assignmentInfo && assignmentInfo.sectionTitle ? assignmentInfo.sectionTitle : 'Unknown',
                    'uploadTime': new Date().toISOString()
                }
            };

            // Sử dụng S3 ManagedUpload để theo dõi tiến trình
            const upload = s3.upload(params);

            upload.on('httpUploadProgress', (progress) => {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                if (onProgress) {
                    onProgress(percentage);
                }
            });

            upload.send((err, data) => {
                if (err) {
                    console.error('Error uploading to S3:', err);
                    reject(err);
                } else {
                    resolve({
                        fileUrl: data.Location,
                        filePath: key,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size
                    });
                }
            });
        });
    },

    // Thêm phương thức mới: Upload hình ảnh cho bài học
    uploadLessonImage: async(imageFile, courseInfo, teacherInfo) => {
        if (!imageFile) return null;

        // Kiểm tra loại file
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('File phải là hình ảnh');
        }

        const timestamp = new Date().getTime();
        const courseId = courseInfo && courseInfo.courseId ? courseInfo.courseId : 'unknown-course';
        const moduleId = courseInfo && courseInfo.moduleId ? courseInfo.moduleId : 'unknown-module';

        // Tạo cấu trúc thư mục riêng cho hình ảnh bài học
        const key = `lessons/images/${courseId}/${moduleId}/${timestamp}_${imageFile.name}`;

        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: imageFile,
            ContentType: imageFile.type,
            // ACL: public-read removed - not supported, // Để hình ảnh có thể xem trực tiếp mà không cần signed URL
            Metadata: {
                'teacherId': teacherInfo && teacherInfo.id ? teacherInfo.id : 'unknown',
                'teacherName': teacherInfo && teacherInfo.name ? teacherInfo.name : 'Unknown',
                'courseTitle': courseInfo && courseInfo.title ? courseInfo.title : 'Unknown Course',
                'moduleTitle': courseInfo && courseInfo.moduleTitle ? courseInfo.moduleTitle : 'Unknown Module',
                'uploadTime': new Date().toISOString()
            }
        };

        try {
            const { Location } = await s3.upload(params).promise();
            console.log('Lesson image uploaded successfully:', Location);

            return {
                imageUrl: Location,
                imagePath: key,
                fileName: imageFile.name,
                fileType: imageFile.type,
                fileSize: imageFile.size
            };
        } catch (error) {
            console.error('Error uploading lesson image:', error);
            throw error;
        }
    },

    // Upload video cho bài học
    uploadLessonVideo: async(videoFile, courseInfo, teacherInfo, onProgress) => {
        return new Promise((resolve, reject) => {
            if (!videoFile) {
                reject(new Error('Không có file video'));
                return;
            }

            // Kiểm tra loại file
            if (!videoFile.type.startsWith('video/')) {
                reject(new Error('File phải là video'));
                return;
            }

            const timestamp = new Date().getTime();
            const courseId = courseInfo && courseInfo.courseId ? courseInfo.courseId : 'unknown-course';
            const moduleId = courseInfo && courseInfo.moduleId ? courseInfo.moduleId : 'unknown-module';

            // Tạo cấu trúc thư mục riêng cho video bài học
            const key = `lessons/videos/${courseId}/${moduleId}/${timestamp}_${videoFile.name}`;

            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: videoFile,
                ContentType: videoFile.type,
                // ACL: public-read removed - not supported, // Để video có thể xem trực tiếp
                Metadata: {
                    'teacherId': teacherInfo && teacherInfo.id ? teacherInfo.id : 'unknown',
                    'teacherName': teacherInfo && teacherInfo.name ? teacherInfo.name : 'Unknown',
                    'courseTitle': courseInfo && courseInfo.title ? courseInfo.title : 'Unknown Course',
                    'moduleTitle': courseInfo && courseInfo.moduleTitle ? courseInfo.moduleTitle : 'Unknown Module',
                    'uploadTime': new Date().toISOString(),
                    'duration': 'unknown' // Có thể cập nhật sau khi xử lý video
                }
            };

            // Sử dụng ManagedUpload để theo dõi tiến trình (quan trọng với video vì file lớn)
            const upload = s3.upload(params);

            upload.on('httpUploadProgress', (progress) => {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                if (onProgress) {
                    onProgress(percentage);
                }
            });

            upload.send((err, data) => {
                if (err) {
                    console.error('Error uploading lesson video:', err);
                    reject(err);
                } else {
                    resolve({
                        videoUrl: data.Location,
                        videoPath: key,
                        fileName: videoFile.name,
                        fileType: videoFile.type,
                        fileSize: videoFile.size
                    });
                }
            });
        });
    },

    // Upload nhiều hình ảnh cùng lúc
    uploadMultipleImages: async(imageFiles, courseInfo, teacherInfo, onProgress) => {
        if (!imageFiles || imageFiles.length === 0) {
            return [];
        }

        const results = [];
        let uploadedCount = 0;

        for (const imageFile of imageFiles) {
            try {
                const result = await s3StorageService.uploadLessonImage(imageFile, courseInfo, teacherInfo);
                results.push(result);
                uploadedCount++;

                // Cập nhật tiến trình tổng thể
                if (onProgress) {
                    onProgress(Math.round((uploadedCount / imageFiles.length) * 100));
                }
            } catch (error) {
                console.error(`Error uploading image ${imageFile.name}:`, error);
                // Tiếp tục với file tiếp theo nếu có lỗi
            }
        }

        return results;
    },

    // Lấy URL có thời hạn để xem file private
    getSignedUrl: async(fileKey, expirationSeconds = 3600) => {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: fileKey,
                Expires: expirationSeconds
            };

            const url = await s3.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.error('Error generating signed URL:', error);
            throw error;
        }
    },

    // Xóa file
    deleteFile: async(fileKey) => {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: fileKey
            };

            await s3.deleteObject(params).promise();
            console.log('File deleted successfully:', fileKey);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};
