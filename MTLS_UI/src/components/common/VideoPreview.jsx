// Tách VideoPreview ra và dùng React.memo để tránh render lại không cần thiết
import { memo } from 'react';
import { Box, Typography } from '@mui/material';


const VideoPreview = ({ videoUrl, title, description }) => {

  return (
    <Box
      sx={{
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 0,
          paddingTop: '100%',
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <iframe
          src={videoUrl}
          title={title}
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover',
          }}
        />
      </Box>
      <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
        {description}
      </Typography>
    </Box>
  );
};

export default memo(VideoPreview);

