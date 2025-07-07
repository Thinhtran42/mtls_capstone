import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Box, LinearProgress, Typography } from "@mui/material";

// Hàm kiểm tra xem URL có phải là YouTube không và chuyển đổi sang định dạng nhúng
const getYouTubeEmbedUrl = (url) => {
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const VideoContent = ({ videoUrl, onComplete, isCompleted }) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [completionThreshold] = useState(0.8); // 80% xem là hoàn thành
  const [videoMarkedComplete, setVideoMarkedComplete] = useState(isCompleted);
  const playerRef = useRef(null);

  // Kiểm tra và đánh dấu hoàn thành khi tiến độ thay đổi
  useEffect(() => {
    if (!videoMarkedComplete && played >= completionThreshold) {
      console.log('Video đã xem đủ 80%, đánh dấu hoàn thành');
      setVideoMarkedComplete(true);
      if (onComplete) {
        onComplete(true);
      }
    }
  }, [played, completionThreshold, videoMarkedComplete, onComplete]);

  const handleProgress = (state) => {
    setPlayed(state.played);
    
    // Lưu tiến độ xem vào localStorage để có thể tiếp tục xem sau
    localStorage.setItem(`video_progress_${videoUrl}`, state.playedSeconds);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
    
    // Khôi phục tiến độ đã lưu (nếu có)
    const savedProgress = localStorage.getItem(`video_progress_${videoUrl}`);
    if (savedProgress && playerRef.current) {
      playerRef.current.seekTo(parseFloat(savedProgress));
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="auto"
        controls={true}
        onProgress={handleProgress}
        onDuration={handleDuration}
        progressInterval={1000} // Cập nhật progress mỗi 1 giây
      />
    </Box>
  );
};

export default VideoContent; 