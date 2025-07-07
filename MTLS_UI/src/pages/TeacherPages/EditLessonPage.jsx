import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { lessonService, sectionService } from "../../api";
import { contentService } from "../../api/services/content.service";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  IconButton,
  ListItemIcon,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Dialog,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  TextFields as TextFieldsIcon,
  Movie as MovieIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  DragIndicator as DragIndicatorIcon,
  NavigateNext as NavigateNextIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { TinyMCEEditor } from "../../components/common/TinyMCEEditor";
import { courseService } from "../../api/services/course.service";
import { moduleService } from "../../api/services/module.service";
import CustomSnackbar from "../../components/common/Snackbar";
import { s3StorageService } from "../../awsS3/s3Storage.service";
import VideoPreview from "../../components/common/VideoPreview";
import BackButton from "../../components/common/BackButton";

// Define helper components outside EditLessonPage

// --- ContentItemEditor Component ---
const ContentItemEditor = forwardRef(
  ({ item, onContentChange, onSave, onCancelEdit, showSnackbar }, ref) => {
    const tinyEditorRef = useRef(null);
    const [editorReady, setEditorReady] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [debouncedCaption, setDebouncedCaption] = useState(
      item?.caption || ""
    );
    const [debouncedVideoUrl, setDebouncedVideoUrl] = useState(
      item?.data || ""
    );
    const [debouncedImageUrl, setDebouncedImageUrl] = useState(
      item?.data || ""
    );
    const [previewImageUrl, setPreviewImageUrl] = useState(item?.data || "");
    const [originalData] = useState({
      caption: item?.caption || "",
      data: item?.data || "",
    });

    // Debug: Log item.data when it changes
    useEffect(() => {
      if (item?.type === "Reading") {
        console.log("[ContentItemEditor] Received item.data:", item?.data);
      }
    }, [item?.data, item?.type]);

    // Mark editor as ready
    useEffect(() => {
      // Ensure editor is initialized and has received content
      if (tinyEditorRef.current) {
        setEditorReady(true);
      }
    }, [tinyEditorRef.current]);

    // Expose getContent for Reading type
    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (item?.type === "Reading" && tinyEditorRef.current) {
          const content = tinyEditorRef.current.getContent();
          console.log("[getContent via ref] Editor content:", content);
          return content;
        }
        return null; // Return null if not Reading type or editor not ready
      },
    }));

    // Sử dụng useEffect để debounce cập nhật caption
    useEffect(() => {
      const timer = setTimeout(() => {
        if (debouncedCaption !== item.caption) {
          onContentChange(item.id, "caption", debouncedCaption);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [debouncedCaption, item.id, item.caption]);

    // Thêm useEffect để debounce cập nhật URL video
    useEffect(() => {
      const timer = setTimeout(() => {
        if (
          debouncedVideoUrl !== item.data &&
          debouncedVideoUrl !== uploadedUrl
        ) {
          onContentChange(item.id, "data", debouncedVideoUrl);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [debouncedVideoUrl, item.id, item.data, uploadedUrl]);

    // Thêm useEffect để xử lý debounce cho image URL
    useEffect(() => {
      if (item?.type !== "Image") return;

      const timer = setTimeout(() => {
        if (debouncedImageUrl !== item.data) {
          onContentChange(item.id, "data", debouncedImageUrl);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [debouncedImageUrl, item?.id, item?.data, item?.type]);

    // Thêm useEffect để cập nhật previewImageUrl
    useEffect(() => {
      if (item?.type !== "Image") return;

      const timer = setTimeout(() => {
        setPreviewImageUrl(debouncedImageUrl);
      }, 1000); // Delay dài hơn để đảm bảo ổn định

      return () => clearTimeout(timer);
    }, [debouncedImageUrl, item?.type]);

    if (!item) return null;

    const handleInputChange = (field, value) => {
      // Kiểm tra nếu giá trị mới giống giá trị cũ thì không cập nhật
      if (item[field] === value) return;

      // Đảm bảo value là chuỗi nếu field là 'data' hoặc 'caption'
      if (
        (field === "data" || field === "caption") &&
        typeof value === "object"
      ) {
        const stringValue = String(value);
        onContentChange(item.id, field, stringValue);
      } else {
        onContentChange(item.id, field, value);
      }
    };

    // Modified triggerSave to use exposed getContent
    const triggerSave = () => {
      if (item.type === "Reading") {
        try {
          // Get content from TinyMCE editor
          const currentData = tinyEditorRef.current?.getContent() || "";
          console.log("[triggerSave] TinyMCE content:", currentData);

          // Check content before saving
          if (
            !currentData ||
            currentData.trim() === "" ||
            currentData.trim() === "<p></p>" ||
            currentData.trim() === "<p><br></p>"
          ) {
            console.log("[triggerSave] Empty content detected");
            showSnackbar("Please enter content before saving", "warning");
            return;
          }

          // Update state in parent component
          onContentChange(item.id, "data", currentData);

          // Delay to ensure state is updated
          setTimeout(() => {
            console.log("[triggerSave] Calling onSave with data:", currentData);
            onSave(item.id, currentData); // Pass content directly
          }, 100);
        } catch (error) {
          console.error(
            "[triggerSave] Error getting content from TinyMCE:",
            error
          );
          showSnackbar("Error getting content from editor", "error");
        }
      } else {
        // Not a Reading type, call onSave directly
        onSave(item.id);
      }
    };

    const handleEditorChange = (content) => {
      console.log("[handleEditorChange] Editor content changed:", content);
      onContentChange(item.id, "data", content);
    };

    // Thêm hàm xử lý kích thước ảnh
    const resizeImage = (file) => {
      return new Promise((resolve, reject) => {
        // Tạo FileReader để đọc file
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            // Kiểm tra xem ảnh có cần resize không
            const MAX_WIDTH = 3840; // Giới hạn 4K
            const MAX_HEIGHT = 2160; // Giới hạn 4K
            const MAX_SIZE_MB = 5; // Giới hạn dung lượng 5MB

            let width = img.width;
            let height = img.height;
            let needResize = false;

            // Kiểm tra kích thước
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
              needResize = true;

              // Tính toán tỉ lệ resize
              const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }

            // Nếu không cần resize, trả về file gốc
            if (!needResize && file.size <= MAX_SIZE_MB * 1024 * 1024) {
              resolve(file);
              return;
            }

            // Nếu cần resize hoặc nén, thực hiện
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Convert sang blob với chất lượng giảm dần cho đến khi đạt kích thước mong muốn
            let quality = 0.9;
            const tryCompress = () => {
              canvas.toBlob(
                (blob) => {
                  if (
                    blob.size <= MAX_SIZE_MB * 1024 * 1024 ||
                    quality <= 0.5
                  ) {
                    // Chuyển blob thành File
                    const resizedFile = new File([blob], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                  } else {
                    // Giảm chất lượng và thử lại
                    quality -= 0.1;
                    tryCompress();
                  }
                },
                file.type,
                quality
              );
            };

            tryCompress();
          };
          img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
      });
    };

    const handleCancel = () => {
      // Reset các state về giá trị ban đầu
      setDebouncedCaption(originalData.caption);
      setDebouncedVideoUrl(originalData.data);
      setUploadedUrl("");

      // Reset state cho image
      if (item?.type === "Image") {
        setDebouncedImageUrl(originalData.data);
        setPreviewImageUrl(originalData.data);
      }

      // Gọi hàm onCancelEdit từ component cha
      onCancelEdit();
    };

    switch (item.type) {
      case "Reading":
        return (
          <Box sx={{ mb: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Edit Reading Content
            </Typography>
            <TextField
              fullWidth
              label="Title (optional)"
              value={debouncedCaption}
              onChange={(e) => setDebouncedCaption(e.target.value)}
              sx={{ mb: 2 }}
            />
            {/* Pass ref to TinyMCEEditor */}
            <TinyMCEEditor
              ref={tinyEditorRef}
              key={item.id}
              initialValue={item.data}
              onEditorChange={handleEditorChange}
            />
            {!editorReady && (
              <Typography color="text.secondary" variant="caption">
                Loading editor...
              </Typography>
            )}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={triggerSave}
                disabled={!editorReady}
              >
                Save Content
              </Button>
            </Box>
          </Box>
        );
      case "Video":
        return (
          <Box sx={{ mb: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Edit Video Content
            </Typography>
            <TextField
              fullWidth
              label="Video Title (optional)"
              value={debouncedCaption}
              onChange={(e) => setDebouncedCaption(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                fullWidth
                label="Video URL (YouTube, Vimeo, etc.)"
                value={debouncedVideoUrl || uploadedUrl || ""}
                onChange={(e) => setDebouncedVideoUrl(e.target.value)}
                placeholder="example: https://www.youtube.com/watch?v=..."
                sx={{ mr: 1 }}
                disabled={uploading}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                hoặc
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ whiteSpace: "nowrap" }}
              >
                Tải lên
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        setUploading(true);

                        // Kiểm tra kích thước file
                        const MAX_SIZE_MB = 200; // 200MB là giới hạn tối đa
                        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showSnackbar(
                            `Video quá lớn. Kích thước tối đa là ${MAX_SIZE_MB}MB`,
                            "error"
                          );
                          return;
                        }

                        // Hiển thị thông báo đang xử lý
                        showSnackbar(
                          "Đang tải video lên, vui lòng đợi...",
                          "info"
                        );

                        // Lấy thông tin khóa học và module
                        const courseInfo = {
                          courseId:
                            localStorage.getItem("currentCourseId") ||
                            "unknown",
                          moduleId:
                            localStorage.getItem("currentModuleId") ||
                            "unknown",
                        };

                        const teacherInfo = {
                          id: localStorage.getItem("userId") || "unknown",
                          name:
                            localStorage.getItem("fullname") ||
                            "Unknown Teacher",
                        };

                        try {
                          // Upload video lên S3
                          const uploadResult =
                            await s3StorageService.uploadLessonVideo(
                              file,
                              courseInfo,
                              teacherInfo
                            );

                          // Cập nhật URL từ S3 vào trường data
                          if (uploadResult && uploadResult.videoUrl) {
                            console.log(
                              "Upload success, video URL:",
                              uploadResult.videoUrl
                            );
                            const videoUrl = uploadResult.videoUrl;

                            // Cập nhật uploadedUrl trước
                            setUploadedUrl(videoUrl);

                            // Sau đó mới cập nhật item.data
                            // Đặt timeout nhỏ để đảm bảo state được cập nhật đúng thứ tự
                            setTimeout(() => {
                              handleInputChange("data", videoUrl);
                            }, 50);

                            showSnackbar(
                              "Video đã được tải lên thành công!",
                              "success"
                            );
                          } else {
                            throw new Error("Upload failed - no URL returned");
                          }
                        } catch (uploadError) {
                          console.error("S3 upload error:", uploadError);
                          showSnackbar(
                            "Lỗi khi tải video lên: " +
                              (uploadError.message || "Unknown error"),
                            "error"
                          );
                        } finally {
                          setUploading(false);
                        }
                      } catch (error) {
                        console.error("Error handling video:", error);
                        showSnackbar(
                          "Lỗi khi xử lý video: " +
                            (error.message || "Unknown error"),
                          "error"
                        );
                      }
                    }
                  }}
                />
              </Button>
            </Box>

            {/* Hiển thị thông tin về giới hạn video */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Giới hạn: Kích thước tối đa 200MB, định dạng hỗ trợ: MP4, WebM,
              Ogg
            </Typography>

            {/* Preview for Video */}
            {(item.data || uploadedUrl) && (
              <VideoPreview videoUrl={uploadedUrl || item.data} id={item.id} />
            )}

            {/* Fallback download options (initially hidden, shown on error) */}
            <Box
              id={`video-fallback-${item.id}`}
              sx={{
                p: 3,
                display: "none",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              <Typography variant="body2" color="warning.main">
                Không thể phát video này trực tiếp. Vui lòng tải xuống để xem.
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => onSave(item.id)}
              >
                Save Content
              </Button>
            </Box>
          </Box>
        );
      case "Image":
        return (
          <Box sx={{ mb: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Edit Image Content
            </Typography>
            <TextField
              fullWidth
              label="Image Caption (optional)"
              value={debouncedCaption}
              onChange={(e) => setDebouncedCaption(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                fullWidth
                label="Image URL"
                value={debouncedImageUrl || ""}
                onChange={(e) => setDebouncedImageUrl(e.target.value)}
                placeholder="example: https://example.com/image.jpg"
                sx={{ mr: 1 }}
                disabled={uploading}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                hoặc
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ whiteSpace: "nowrap" }}
                disabled={uploading}
              >
                Tải lên
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        setUploading(true);

                        // Hiển thị thông báo đang xử lý
                        showSnackbar("Đang xử lý ảnh...", "info");

                        // Tạm thời hiển thị base64 làm preview trước khi upload thành công
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64Image = reader.result;
                          // Cập nhật preview URL ngay lập tức để UI phản hồi nhanh
                          setPreviewImageUrl(base64Image);
                        };
                        reader.readAsDataURL(file);

                        // Resize ảnh trước khi tải lên
                        const resizedFile = await resizeImage(file);

                        // Thông báo đang tải lên
                        showSnackbar("Đang tải ảnh lên...", "info");

                        // Upload lên AWS S3
                        const courseInfo = {
                          courseId:
                            localStorage.getItem("currentCourseId") ||
                            "unknown",
                          moduleId:
                            localStorage.getItem("currentModuleId") ||
                            "unknown",
                        };

                        const teacherInfo = {
                          id: localStorage.getItem("userId") || "unknown",
                          name:
                            localStorage.getItem("fullname") ||
                            "Unknown Teacher",
                        };

                        try {
                          const uploadResult =
                            await s3StorageService.uploadLessonImage(
                              resizedFile,
                              courseInfo,
                              teacherInfo
                            );

                          // Cập nhật URL từ S3 vào trường data
                          if (uploadResult && uploadResult.imageUrl) {
                            // Cập nhật cả hai state
                            setDebouncedImageUrl(uploadResult.imageUrl);
                            setPreviewImageUrl(uploadResult.imageUrl);

                            // Sau đó mới cập nhật item.data
                            setTimeout(() => {
                              handleInputChange("data", uploadResult.imageUrl);
                            }, 50);

                            showSnackbar(
                              "Ảnh đã được tải lên thành công!",
                              "success"
                            );
                          } else {
                            throw new Error("Upload failed - no URL returned");
                          }
                        } catch (uploadError) {
                          console.error("S3 upload error:", uploadError);

                          // Xử lý lỗi ETag
                          if (
                            uploadError.message &&
                            (uploadError.message.includes("ETag") ||
                              uploadError.message.includes("CORS"))
                          ) {
                            // Sử dụng base64 làm phương án dự phòng khi có lỗi CORS/ETag
                            const base64Image = reader.result;
                            setDebouncedImageUrl(base64Image);
                            handleInputChange("data", base64Image);
                            showSnackbar(
                              "Lưu ảnh dưới dạng base64 (S3 upload failed: CORS/ETag issue)",
                              "warning"
                            );
                          } else {
                            throw uploadError; // Rethrow lỗi khác để xử lý bên ngoài
                          }
                        }
                      } catch (error) {
                        console.error("Error handling image:", error);
                        showSnackbar(
                          "Lỗi khi tải ảnh lên: " +
                            (error.message || "Unknown error"),
                          "error"
                        );
                      } finally {
                        setUploading(false);
                      }
                    }
                  }}
                />
              </Button>
            </Box>

            {/* Hiển thị thông tin về giới hạn ảnh */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Giới hạn: Độ phân giải tối đa 4K (3840x2160), dung lượng tối đa
              5MB
            </Typography>

            {/* Preview for Image - Cải thiện UI */}
            {previewImageUrl && (
              <Box
                sx={{
                  my: 2,
                  p: 2,
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" mb={1}>
                  Preview:
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    minHeight: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    bgcolor: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  <img
                    id={`preview-${item.id}`}
                    src={previewImageUrl}
                    alt={debouncedCaption || "Preview"}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/150?text=Image+Not+Found";
                    }}
                  />
                </Box>
                {debouncedCaption && (
                  <Typography
                    variant="body2"
                    mt={1}
                    fontStyle="italic"
                    textAlign="center"
                  >
                    {debouncedCaption}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => onSave(item.id)}
                disabled={uploading}
              >
                Save Content
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  }
);
ContentItemEditor.displayName = "ContentItemEditor"; // Added display name
ContentItemEditor.propTypes = {
  item: PropTypes.object,
  onContentChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

// --- ContentItem Component ---
const ContentItem = ({ item, provided, onEdit, onDelete }) => {
  // ... (getIcon, getTitle, getPreview logic remains the same) ...
  const getIcon = () => {
    switch (item.type) {
      case "Reading":
        return <TextFieldsIcon />;
      case "Video":
        return <MovieIcon />;
      case "Image":
        return <ImageIcon />;
      default:
        return <TextFieldsIcon />;
    }
  };
  const getTitle = () => item.caption || item.type; // Show type if no caption
  const getPreview = () => {
    switch (item.type) {
      case "Reading": {
        const textPreview = item.data?.replace(/<[^>]*>/g, "") || "";
        return (
          textPreview.substring(0, 80) + (textPreview.length > 80 ? "..." : "")
        );
      }
      case "Video":
      case "Image":
        return item.data || "No URL";
      default:
        return "";
    }
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        display: "flex",
        alignItems: "center",
        p: 1,
        "&:hover": { bgcolor: "#f9f9f9" },
      }}
      elevation={1}
    >
      <Box
        {...provided.dragHandleProps}
        sx={{ cursor: "grab", mr: 1.5, display: "flex", alignItems: "center" }}
      >
        <DragIndicatorIcon color="action" />
      </Box>
      <ListItemIcon sx={{ minWidth: 36 }}>{getIcon()}</ListItemIcon>
      <Box sx={{ flexGrow: 1, mr: 1, overflow: "hidden" }}>
        <Typography variant="subtitle2" fontWeight="medium" noWrap>
          {getTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {getPreview()}
        </Typography>
      </Box>
      <Box>
        <IconButton
          size="small"
          onClick={() => onEdit(item)}
          color="primary"
          title="Edit content"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(item.id)}
          color="error"
          title="Delete content"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
ContentItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    data: PropTypes.string,
    caption: PropTypes.string,
  }).isRequired,
  provided: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// --- EditLessonPage Component ---
const EditLessonPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, lessonId } = useParams();
  const [expanded, setExpanded] = useState("panel1");
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    section: "",
    duration: "",
    status: "draft",
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // State mới cho contentItems
  const [contentItems, setContentItems] = useState([]);
  // Item đang chỉnh sửa
  const [editingContent, setEditingContent] = useState(null);
  // Thêm state error
  const [error, setError] = useState(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  // Add state for content delete confirmation
  const [deleteContentDialogOpen, setDeleteContentDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  // Add states for success dialogs
  const [deleteContentSuccessOpen, setDeleteContentSuccessOpen] = useState(false);
  const [deletedContentName, setDeletedContentName] = useState("");

  const contentEditorRef = useRef(null);

  // Define handlers
  const showSnackbar = (message, severity = "info") => {
    setSnackbarState({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await sectionService.getSectionsByModule(moduleId);
      console.log("Sections response:", response);
      if (response && response.data) {
        setSections(response.data);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonData = async () => {
    try {
      setLoading(true);

      // Fetch course details
      try {
        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse?.data) {
          setCourseTitle(courseResponse.data.title);
        }
      } catch (courseError) {
        console.error("Error fetching course details:", courseError);
      }

      // Fetch module details
      try {
        const moduleResponse = await moduleService.getModuleById(moduleId);
        if (moduleResponse?.data) {
          setModuleTitle(moduleResponse.data.title);
        }
      } catch (moduleError) {
        console.error("Error fetching module details:", moduleError);
      }

      // Fetch lesson details
      try {
        const lessonResponse = await lessonService.getLessonById(lessonId);
        if (lessonResponse?.data) {
          setLessonTitle(lessonResponse.data.title);
        }
      } catch (lessonError) {
        console.error("Error fetching lesson details:", lessonError);
      }

      // Fetch sections for this module
      const sectionsResponse =
        await sectionService.getSectionsByModule(moduleId);
      if (sectionsResponse?.data) {
        // Filter for lesson sections only
        const lessonSections = sectionsResponse.data.filter(
          (section) => section.type === "Lesson"
        );
        setSections(lessonSections);
      }

      // Fetch lesson data
      const lessonResponse = await lessonService.getLessonById(lessonId);

      if (!lessonResponse || !lessonResponse.data) {
        setError("Lesson information not found");
        setLoading(false);
        return;
      }

      const lessonData = lessonResponse.data;
      console.log("Lesson data:", lessonData);

      // Get content related to the lesson
      console.log(`Fetching content for lesson ID: ${lessonId}`);
      const contentResponse =
        await contentService.getContentsByLesson(lessonId);
      console.log("Content data received:", contentResponse);

      if (
        contentResponse &&
        contentResponse.data &&
        Array.isArray(contentResponse.data) &&
        contentResponse.data.length > 0
      ) {
        // Convert content data from API and ensure each item has an ID
        const contents = contentResponse.data
          .filter((content) => content && (content._id || content.id)) // Ensure content has id
          .map((content) => ({
            id: content._id || content.id,
            type: content.type || "Reading",
            data: content.data || "",
            caption: content.caption || "",
            isEditing: false,
            order: content.order || 0,
          }));

        // Sort by order if available
        contents.sort((a, b) => (a.order || 0) - (b.order || 0));

        setContentItems(contents);
        console.log("Setting content items:", contents);
      } else {
        setContentItems([]);
        console.log("No content found for this lesson");
      }

      // Set data for form
      const initialData = {
        title: lessonData.title || "",
        section: lessonData.section._id || "",
        description: lessonData.description || "",
        duration: lessonData.duration || 0,
        status: lessonData.status || "draft",
      };

      console.log("Setting form data:", initialData);
      setFormData(initialData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lesson data:", error);
      setError(
        "Unable to retrieve lesson information. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchLessonData();

    // Reset isNewlySaved state when switching lessons
    return () => {
      // Cleanup when unmounting or switching to another lesson
      setContentItems([]);
      setEditingContent(null);
    };
  }, [lessonId, moduleId]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    if (panel === "panel2" && editingContent && !isExpanded) {
      showSnackbar(
        "Please save or cancel the current content edit first.",
        "warning"
      );
      return;
    }
    setExpanded(isExpanded ? panel : false);
  };

  const handleInputChange = (field, value) => {
    // Kiểm tra nếu giá trị mới giống giá trị cũ thì không cập nhật
    if (formData[field] === value) return;

    // Đảm bảo value là chuỗi nếu field là 'data' hoặc 'caption'
    if (
      (field === "data" || field === "caption") &&
      typeof value === "object"
    ) {
      const stringValue = String(value);
      setFormData({ ...formData, [field]: stringValue });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const validateForm = (isFinalSave = false) => {
    console.log("Validating form data:", formData);
    console.log("Content items:", contentItems);

    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Lesson title is required!";
    }

    if (!formData.section) {
      newErrors.section = "Section is required!";
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Lesson duration must be greater than 0!";
    }

    // Filter valid content items (not empty)
    const validContentItems = contentItems.filter((item) => {
      return (
        item.data &&
        item.data.trim() !== "" &&
        item.data.trim() !== "<p></p>" &&
        item.data.trim() !== "<p><br></p>"
      );
    });

    // Check if there is at least one valid content item
    if (validContentItems.length === 0) {
      newErrors.contentItems = "Lesson needs at least one valid content item!";
      showSnackbar("Lesson needs at least one valid content item!", "warning");
    }

    // Check each invalid content and notify specifically
    contentItems.forEach((item, index) => {
      // Check for empty content
      if (
        !item.data ||
        item.data.trim() === "" ||
        item.data.trim() === "<p></p>" ||
        item.data.trim() === "<p><br></p>"
      ) {
        newErrors[`content_${index}`] =
          `Content '${item.caption || item.type}' cannot be empty`;
        showSnackbar(
          `Content '${item.caption || item.type}' cannot be empty`,
          "warning"
        );
      }
    });

    if (isFinalSave && editingContent) {
      newErrors.editingContent = `Content '${editingContent.caption || editingContent.type}' is being edited. Please save or cancel first.`;
    }

    if (Object.keys(newErrors).length > 0) {
      console.error("Form validation errors:", newErrors);
      setErrors(newErrors);
      if (newErrors.contentItems) showSnackbar(newErrors.contentItems, "error");
      if (newErrors.editingContent)
        showSnackbar(newErrors.editingContent, "warning");
      return false;
    }

    console.log("Form validation passed");
    setErrors({});
    return true;
  };

  const handleContentChange = (id, field, value) => {
    console.log(`Content change: ${id}, ${field}, value:`, value);

    setContentItems((prev) => {
      const itemIndex = prev.findIndex((i) => i.id === id);
      if (itemIndex === -1) return prev;

      const item = prev[itemIndex];
      const updatedItems = [...prev];

      // Chuyển đổi Object thành String nếu cần
      let processedValue = value;
      if (typeof value === "object" && value !== null) {
        console.log("Converting object to string:", value);
        try {
          processedValue = JSON.stringify(value);
        } catch (err) {
          console.error("Error converting object to string:", err);
          processedValue = String(value);
        }
      }

      updatedItems[itemIndex] = { ...item, [field]: processedValue };

      console.log(
        `Updated content item ${id}, new data:`,
        updatedItems[itemIndex]
      );
      return updatedItems;
    });
  };

  const handleDeleteContent = async (id) => {
    if (!id) {
      console.error("Cannot delete content with null or undefined id");
      showSnackbar("Invalid content ID", "error");
      return;
    }

    // Set content to delete and open dialog
    setContentToDelete(id);
    setDeleteContentDialogOpen(true);
  };
  
  const confirmDeleteContent = async () => {
    if (!contentToDelete) return;
    
    try {
      console.log(`Deleting content ID: ${contentToDelete}`);
      
      // Store the name of the content being deleted for success message
      const contentToDeleteItem = contentItems.find(c => c.id === contentToDelete);
      const contentName = contentToDeleteItem?.caption || contentToDeleteItem?.type || "Content item";
      setDeletedContentName(contentName);

      // Clear editingContent before removing item from array
      if (editingContent && editingContent.id === contentToDelete) {
        setEditingContent(null);
      }

      // Save content list before deletion to restore if error occurs
      const previousContentItems = [...contentItems];

      // Update contentItems state first for quick UI response
      setContentItems((prevItems) =>
        prevItems.filter((item) => item && item.id !== contentToDelete)
      );

      // If content exists in database, call API to delete
      if (contentToDelete && contentToDelete.length === 24) {
        // MongoDB IDs usually have 24 characters
        try {
          await contentService.deleteContent(contentToDelete);
          console.log(`Content ID: ${contentToDelete} has been deleted from server`);
        } catch (apiError) {
          console.error("Error calling API to delete content:", apiError);

          // Restore previous state if server deletion fails
          setContentItems(previousContentItems);
          throw apiError;
        }
      } else {
        console.log(
          `Content ID: ${contentToDelete} has been deleted from local state (not saved on server)`
        );
      }

      // Close delete dialog and show success dialog
      setDeleteContentDialogOpen(false);
      setDeleteContentSuccessOpen(true);
      
      // Add timer to auto-close the success dialog after 3 seconds
      setTimeout(() => {
        setDeleteContentSuccessOpen(false);
      }, 3000);
      
      // Add success snackbar notification
      showSnackbar("Content deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting content:", error);
      showSnackbar(
        "Error deleting content: " + (error.message || "Unknown"),
        "error"
      );
      // Close dialog and reset content to delete
      setDeleteContentDialogOpen(false);
    } finally {
      setContentToDelete(null);
    }
  };

  const handleSaveContent = async (id, directContent) => {
    try {
      const item = contentItems.find((item) => item.id === id);
      if (!item) {
        console.error("Content item not found with id:", id);
        return;
      }

      // Use directContent if provided, otherwise use item.data
      const contentToSave = directContent || item.data;

      console.log("Saving content with data:", contentToSave);

      // Check for empty content
      if (
        !contentToSave ||
        contentToSave.trim() === "" ||
        contentToSave.trim() === "<p></p>" ||
        contentToSave.trim() === "<p><br></p>"
      ) {
        console.log("Empty content, cannot save:", contentToSave);
        showSnackbar("Please enter content before saving", "warning");
        return;
      }

      showSnackbar("Saving content...", "info");

      // Prepare content data
      const contentData = {
        type: item.type,
        data: contentToSave,
        caption: item.caption || "",
      };

      let response;

      // If content already exists in database, update it
      if (id.length === 24) {
        // MongoDB IDs usually have 24 characters
        console.log("Updating existing content with ID:", id);
        response = await contentService.updateContent(id, contentData);
      } else {
        // This is new content, create it
        const newContentData = {
          ...contentData,
          lesson: lessonId,
        };

        console.log("Creating new content:", newContentData);
        response = await contentService.createContent(newContentData);
        console.log("New content creation result:", response);
      }

      // Add savedId variable to track saved ID
      let savedId = id;

      // Update ID from response if needed
      if (response?.data?.data?._id && id.length !== 24) {
        savedId = response.data.data._id;
        console.log(
          `Content has been saved to DB with ID: ${savedId} (Old ID: ${id})`
        );
      }

      // Update state for all content items
      setContentItems((prev) => {
        return prev.map((i) => {
          // If this is the item to update
          if (i.id === id) {
            return {
              ...i,
              id: savedId, // Update ID if it's new content
              data: contentToSave, // Ensure data is updated
              isEditing: false,
              isDefaultContent: false,
              isNewlySaved: true, // Mark as saved
            };
          }
          return i;
        });
      });

      // Close editor if editing this item
      if (editingContent && editingContent.id === id) {
        setEditingContent(null);
      }

      showSnackbar("Content saved successfully!", "success");
    } catch (error) {
      console.error("Error saving content:", error);
      showSnackbar(
        `Error saving content: ${error.message || "Unknown error"}`,
        "error"
      );
    }
  };

  const handleEditContent = (item) => {
    if (!item || !item.id) {
      console.error("Cannot edit invalid content");
      showSnackbar("Invalid content", "error");
      return;
    }

    setContentItems((prev) =>
      prev.map((content) =>
        content.id === item.id ? { ...content, isEditing: true } : content
      )
    );
    setEditingContent(item);
  };

  // **** Define handleCancelEdit before renderContentEditorSection ****
  const handleCancelEdit = () => {
    if (editingContent) {
      if (editingContent.id.toString().startsWith("new-")) {
        // Nếu là nội dung mới, xóa khỏi danh sách
        setContentItems((prev) =>
          prev.filter((item) => item.id !== editingContent.id)
        );
      } else {
        // Tìm lại nội dung gốc từ API
        fetchContentData(editingContent.id);
      }

      setEditingContent(null);

      if (errors.editingContent) {
        setErrors((prev) => ({ ...prev, editingContent: null }));
      }

      showSnackbar("Edit canceled.", "info");
    }
  };

  // Thêm hàm fetchContentData để lấy dữ liệu mới nhất từ server
  const fetchContentData = async (contentId) => {
    try {
      // Fetch lại dữ liệu nội dung từ API
      const response = await contentService.getContentById(contentId);
      if (response && response.data) {
        const updatedContent = response.data;

        // Cập nhật lại state với dữ liệu mới từ server
        setContentItems((prev) =>
          prev.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  caption: updatedContent.caption || "",
                  data: updatedContent.data || "",
                  isEditing: false,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error fetching content data:", error);
      // Nếu không thể lấy dữ liệu từ server, fetch lại toàn bộ lesson
      fetchLessonData();
    }
  };

  const handleAddContent = (type) => {
    const newItem = createNewContentItem(type);

    // Add new item to state
    setContentItems((prevItems) => [...prevItems, newItem]);

    // Automatically open content accordion panel
    setExpanded("panel2");

    // Set up new item for editing
    setEditingContent(newItem);

    // Display notification
    showSnackbar(
      `Added new ${type === "Reading" ? "reading" : type === "Video" ? "video" : "image"} content`,
      "info"
    );
  };

  const createNewContentItem = (type) => {
    const timestamp = Date.now().toString();
    let initialData = "";

    if (type === "Reading") {
      initialData = "<p></p>";
    } else if (type === "Video") {
      initialData = "";
    } else if (type === "Image") {
      initialData = "";
    }

    return {
      id: `new-${timestamp}`,
      type: type,
      data: initialData,
      caption: "",
      isEditing: true,
      isDefaultContent: true,
      order: contentItems.length + 1,
    };
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(contentItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContentItems(items);
  };

  const handleSaveLesson = async () => {
    if (validateForm(true)) {
      try {
        setLoading(true);
        // 1. Update the lesson data first
        const data = {
          title: formData.title,
          section: formData.section,
          duration: Number(formData.duration),
          status: formData.status,
        };

        // Add description if present
        if (formData.description) {
          data.description = formData.description;
        }

        console.log("Saving lesson data:", data);
        console.log("Lesson ID:", lessonId);

        if (!lessonId) {
          throw new Error("Missing lesson ID for update");
        }

        const updatedLesson = await lessonService.updateLesson(lessonId, data);
        console.log("Lesson updated successfully:", updatedLesson);

        // Print all current content items for debugging
        console.log(
          "All content items before saving:",
          JSON.stringify(contentItems, null, 2)
        );

        // 2. Categorize content items (new, update, already saved)
        // Find content items with temporary IDs, not previously saved and not empty
        const newContentItems = contentItems.filter((item) => {
          // Check if temporary ID
          const isTemporaryId = item.id.toString().startsWith("new-");
          // Check if content is not empty
          const hasContent =
            item.data &&
            item.data.trim() !== "" &&
            item.data.trim() !== "<p></p>" &&
            item.data.trim() !== "<p><br></p>";
          // Check if not already saved
          const notSavedYet = !item.isNewlySaved;

          console.log(
            `Item ${item.id}: isTemporaryId=${isTemporaryId}, hasContent=${hasContent}, notSavedYet=${notSavedYet}`
          );

          return isTemporaryId && hasContent && notSavedYet;
        });

        console.log("New content items to create:", newContentItems.length);
        if (newContentItems.length > 0) {
          console.log("Details of new content:", newContentItems);
        }

        // Get content items already in database (MongoDB ObjectIDs)
        const existingItems = contentItems.filter(
          (item) => !item.id.toString().startsWith("new-") // Item already has MongoDB ID (saved to DB)
        );

        console.log("Existing content items to update:", existingItems.length);

        // 3. Process new content items (if any)
        if (newContentItems.length > 0) {
          try {
            // Prepare data for createMultipleContents
            const contentsPayload = {
              lessonId: lessonId,
              contents: newContentItems.map((item) => ({
                lesson: lessonId,
                type: item.type,
                data: item.data,
                caption: item.caption || "",
                order: item.order,
              })),
            };

            console.log(
              "Creating multiple new contents:",
              JSON.stringify(contentsPayload, null, 2)
            );
            const newContentsResponse =
              await contentService.createMultipleContents(contentsPayload);
            console.log("New contents created:", newContentsResponse);

            // Update IDs for newly created content
            if (newContentsResponse?.data?.data) {
              const newContents = Array.isArray(newContentsResponse.data.data)
                ? newContentsResponse.data.data
                : [newContentsResponse.data.data];

              // Update state with new IDs from server
              setContentItems((prev) => {
                const updatedItems = [...prev];

                // Process each newly created item on server
                newContents.forEach((serverItem, index) => {
                  if (!serverItem._id) return;

                  // Find corresponding item in local state
                  const localItemIndex = updatedItems.findIndex(
                    (item) =>
                      item.data === newContentItems[index].data &&
                      item.id.toString().startsWith("new-")
                  );

                  if (localItemIndex !== -1) {
                    updatedItems[localItemIndex] = {
                      ...updatedItems[localItemIndex],
                      id: serverItem._id,
                      isNewlySaved: true,
                    };
                  }
                });

                return updatedItems;
              });
            }

            showSnackbar(
              `Successfully created ${newContentItems.length} new content items!`,
              "success"
            );
          } catch (error) {
            console.error("Error creating new contents:", error);
            showSnackbar(
              `Error creating new content: ${error.message || "Unknown error"}`,
              "error"
            );
          }
        }

        // 4. Process existing content items needing updates
        let updatedCount = 0;

        for (const item of existingItems) {
          try {
            const contentData = {
              type: item.type,
              data: item.data,
              caption: item.caption || "",
            };

            // Skip content just saved with handleSaveContent
            // to avoid unnecessary updates
            if (item.isNewlySaved) {
              console.log(
                `Skipping update for content ID ${item.id} (already saved)`
              );
              continue;
            }

            console.log(`Updating content ID: ${item.id}`);
            await contentService.updateContent(item.id, contentData);
            updatedCount++;
          } catch (error) {
            console.error(`Error updating content item ${item.id}:`, error);
          }
        }

        setLoading(false);
        showSnackbar(
          `Lesson saved successfully! (${newContentItems.length} new content items, ${updatedCount} updated items)`,
          "success"
        );

        // Mark lesson as successfully saved
        setEditingContent(null);

        // Refresh data
        await fetchLessonData();

        // Redirect to lesson details page after a short delay
        setTimeout(() => {
          navigateToLessonDetail();
        }, 1500);
      } catch (error) {
        setLoading(false);
        console.error("Error saving lesson:", error);

        // More details on API error if available
        if (error.response) {
          console.error("API error details:", error.response.data);
        }

        showSnackbar(
          `Error saving lesson: ${error.message || "Unknown error"}`,
          "error"
        );
      }
    }
  };

  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/lessons/${lessonId}`);
  };

  // Function to go back to lesson detail view
  const navigateToLessonDetail = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/lessons/${lessonId}`);
  };

  // Handle close of success dialogs with navigation if needed
  const handleCloseContentSuccessDialog = () => {
    setDeleteContentSuccessOpen(false);
  };

  // *** Define renderContentEditorSection after handlers ***
  const renderContentEditorSection = () => (
    <Accordion
      expanded={expanded === "panel2"}
      onChange={handleAccordionChange("panel2")}
      sx={{
        boxShadow: "none",
        "&:before": { display: "none" },
        bgcolor: "transparent",
      }}
      defaultExpanded
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, ml: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Lesson Content
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, ml: 2, mr: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add new content
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TextFieldsIcon />}
              onClick={() => handleAddContent("Reading")}
              disabled={!!editingContent}
            >
              Add Reading
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MovieIcon />}
              onClick={() => handleAddContent("Video")}
              disabled={!!editingContent}
            >
              Add Video
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ImageIcon />}
              onClick={() => handleAddContent("Image")}
              disabled={!!editingContent}
            >
              Add Image
            </Button>
          </Box>
          {editingContent && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", mt: 1 }}
            >
              Save or cancel the current edit to add new content.
            </Typography>
          )}
        </Box>
        {editingContent && (
          <Box sx={{ my: 2 }}>
            <ContentItemEditor
              item={editingContent}
              onContentChange={handleContentChange}
              onSave={handleSaveContent}
              onCancelEdit={handleCancelEdit}
              showSnackbar={showSnackbar}
              ref={contentEditorRef}
            />
          </Box>
        )}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ mt: editingContent ? 3 : 1 }}
        >
          Content items ({contentItems.length})
        </Typography>
        {errors.contentItems && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {errors.contentItems}
          </Alert>
        )}
        {errors.editingContent && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {errors.editingContent}
          </Alert>
        )}
        {contentItems.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="contentItems"
              isDropDisabled={!!editingContent}
            >
              {(provided, snapshot) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    minHeight: "60px",
                    border: snapshot.isDraggingOver
                      ? "2px dashed #1976d2"
                      : "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 1,
                    bgcolor: snapshot.isDraggingOver
                      ? "#e3f2fd"
                      : "transparent",
                    opacity: editingContent ? 0.6 : 1,
                    pointerEvents: editingContent ? "none" : "auto",
                  }}
                >
                  {contentItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id.toString()}
                      index={index}
                      isDragDisabled={!!editingContent}
                    >
                      {(providedDraggable) => (
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                        >
                          <ContentItem
                            item={item}
                            provided={providedDraggable}
                            onEdit={handleEditContent}
                            onDelete={handleDeleteContent}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: "italic" }}
          >
            No content yet. Please use the &apos;Add...&apos; buttons.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );

  // --- Main Render ---
  if (loading && contentItems.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageTitle title={`Edit Lesson: ${formData.title || "..."}`} />
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate("/teacher/courses")}
            sx={{ color: "#666", textDecoration: "none" }}
          >
            Courses
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/teacher/course/${courseId}`)}
            sx={{ color: "#666", textDecoration: "none" }}
          >
            {courseTitle || "Course"}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() =>
              navigate(`/teacher/course/${courseId}/module/${moduleId}`)
            }
            sx={{ color: "#666", textDecoration: "none" }}
          >
            {moduleTitle || "Module"}
          </Link>
          <Typography color="text.primary">
            Edit: {formData.title || "Lesson"}
          </Typography>
        </Breadcrumbs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "block", alignItems: "center", mb: 4 }}>
          <BackButton
            text={lessonTitle || "Lesson Management"}
            onClick={handleCancel}
            sx={{ mr: 2, mb: 2 }}
          />
          <Typography variant="h4" fontWeight="bold">
            Edit Lesson
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Lesson Info Card */}
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lesson Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      error={!!errors.title}
                      helperText={errors.title}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Duration (minutes)"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      error={!!errors.duration}
                      helperText={errors.duration}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.section}>
                      <InputLabel
                        fullWidth
                        id="section-label"
                        label="Section"
                      >
                        Section
                      </InputLabel>
                      <Select
                        value={formData.section}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: "section", value: e.target.value },
                          })
                        }
                        name="section"
                      >
                        {sections.map((section) => (
                          <MenuItem key={section._id} value={section._id}>
                            {section.title}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.section && (
                        <FormHelperText>{errors.section}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Lesson Content Card */}
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {renderContentEditorSection()}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{ borderRadius: 2, position: "sticky", top: 20 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveLesson}
                    disabled={loading || !!editingContent}
                    sx={{ mb: 2, py: 1.2 }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  {editingContent && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", textAlign: "center", mb: 1 }}
                    >
                      Save or cancel content edit to enable saving.
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ mb: 2, py: 1.2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Delete Content Dialog */}
        <Dialog
          open={deleteContentDialogOpen}
          onClose={() => setDeleteContentDialogOpen(false)}
          aria-labelledby="delete-content-dialog-title"
          maxWidth="xs"
          fullWidth
        >
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'rgba(244, 67, 54, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                animation: 'scaleIn 0.3s ease-out forwards, pulse 1.5s infinite 0.3s',
                '@keyframes scaleIn': {
                  '0%': {
                    transform: 'scale(0)',
                    opacity: 0
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                },
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(0.95)',
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
                  },
                  '70%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                  },
                  '100%': {
                    transform: 'scale(0.95)',
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                  }
                }
              }}
            >
              <CloseIcon sx={{ color: '#f44336', fontSize: 32 }} />
            </Box>
            
            <Typography variant="h5" id="delete-content-dialog-title" sx={{ mb: 2 }}>
              Are you sure?
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Do you really want to delete this content item? 
              <Box
                component="span"
                sx={{
                  fontWeight: 'bold',
                  display: 'block',
                  mt: 1
                }}
              >
                {contentToDelete && contentItems.find(c => c.id === contentToDelete)?.caption || 
                  contentToDelete && contentItems.find(c => c.id === contentToDelete)?.type || 'Content item'}
              </Box>
              This process cannot be undone.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => setDeleteContentDialogOpen(false)}
                sx={{ 
                  bgcolor: '#d9d9d9', 
                  color: '#555',
                  '&:hover': { bgcolor: '#c9c9c9' },
                  minWidth: 100
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={confirmDeleteContent}
                sx={{ 
                  bgcolor: '#f44336', 
                  '&:hover': { bgcolor: '#d32f2f' },
                  minWidth: 100
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Dialog>
        
        {/* Delete Content Success Dialog */}
        <Dialog
          open={deleteContentSuccessOpen}
          onClose={handleCloseContentSuccessDialog}
          aria-labelledby="delete-content-success-dialog-title"
          maxWidth="xs"
          fullWidth
        >
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'rgba(76, 175, 80, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                animation: 'scaleIn 0.3s ease-out',
                '@keyframes scaleIn': {
                  '0%': {
                    transform: 'scale(0)',
                    opacity: 0
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }}
            >
              <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
            </Box>
            
            <Typography variant="h5" id="delete-content-success-dialog-title" sx={{ mb: 2, color: '#555' }}>
              Success!
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: '#777' }}>
              The content item &quot;{deletedContentName}&quot; has been deleted successfully.
            </Typography>
            
            <Box sx={{ position: 'relative' }}>
              <Button 
                variant="contained" 
                onClick={handleCloseContentSuccessDialog}
                sx={{ 
                  bgcolor: '#4caf50', 
                  '&:hover': { bgcolor: '#388e3c' },
                  minWidth: 100
                }}
              >
                OK
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Snackbar */}
        <CustomSnackbar
          open={snackbarState.open}
          message={snackbarState.message}
          severity={snackbarState.severity}
          onClose={closeSnackbar}
          autoHideDuration={3000}
        />
      </Box>
    </>
  );
};

export default EditLessonPage;
