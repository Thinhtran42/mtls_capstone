import { useState, useEffect } from 'react';
import { s3StorageService } from '../awsS3/s3Storage.service';
import { Box, Typography, Button, Alert, CircularProgress, Paper, Input } from '@mui/material';
import { testS3Connection } from '../awsS3/testS3Connection';
import config from '../awsS3/configS3';

const TestS3Connection = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Log thông tin AWS config để debug
    console.log('AWS Region:', config.region);
    console.log('AWS Bucket Name:', config.bucketName);
    if (config.credentials) {
      console.log('AWS Access Key:', config.credentials.accessKeyId
        ? `${config.credentials.accessKeyId.substring(0, 4)}...${config.credentials.accessKeyId.slice(-4)}`
        : 'Không có');
    }

    const checkConnection = async () => {
      setLoading(true);
      try {
        const result = await testS3Connection();
        setConnectionStatus(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Xử lý khi chọn file
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null); // Reset error khi chọn file mới
    }
  };

  // Xử lý upload file đã chọn
  const handleUploadSelected = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file trước khi upload');
      return;
    }

    setLoading(true);
    setUploadSuccess(null);
    setError(null);

    try {
      // Thông tin test
      const testInfo = {
        id: 'test-upload',
        name: 'Test Upload'
      };
      const testAssignment = {
        courseId: 'test-manual-upload',
        sectionId: 'test-section'
      };

      // Upload file
      const result = await s3StorageService.uploadFile(selectedFile, testInfo, testAssignment);

      if (result && result.fileUrl) {
        setUploadSuccess({
          url: result.fileUrl,
          path: result.filePath,
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        });

        // Reset file input
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      setError(`Lỗi upload: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>Kiểm Tra Cài Đặt AWS S3</Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Thông tin cấu hình:</Typography>
        <Typography variant="body2">Bucket: {config.bucketName}</Typography>
        <Typography variant="body2">Region: {config.region}</Typography>
        <Typography variant="body2">Endpoint: {config.endpoint || 'Mặc định của AWS'}</Typography>
      </Box>

      {/* Trạng thái kết nối */}
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Đang xử lý...</Typography>
        </Box>
      )}

      {connectionStatus === true && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Kết nối S3 thành công! Bucket đã sẵn sàng.
        </Alert>
      )}

      {connectionStatus === false && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Kết nối AWS thành công nhưng không tìm thấy bucket. Kiểm tra lại tên bucket và quyền truy cập.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Phần upload file */}
      <Box sx={{ mb: 3, mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Upload File Test:</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleUploadSelected}
            disabled={loading || !selectedFile}
          >
            {loading ? 'Đang upload...' : 'Upload File'}
          </Button>
        </Box>
      </Box>

      {/* Kết quả upload */}
      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Upload thành công!</Typography>
          <Typography variant="body2">Tên file: {uploadSuccess.fileName}</Typography>
          <Typography variant="body2">Kích thước: {(uploadSuccess.fileSize / 1024).toFixed(2)} KB</Typography>
          <Typography variant="body2">Đường dẫn: {uploadSuccess.path}</Typography>
          <Box component="a" href={uploadSuccess.url} target="_blank"
               sx={{ display: 'block', mt: 1, wordBreak: 'break-all', color: 'primary.main' }}>
            Xem file tại đây
          </Box>
        </Alert>
      )}
    </Paper>
  );
};

export default TestS3Connection;