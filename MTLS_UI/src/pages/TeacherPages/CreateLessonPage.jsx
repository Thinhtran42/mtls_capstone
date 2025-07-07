import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { lessonService } from "../../api";
import { contentService } from "../../api/services/content.service";
import { sectionService } from "../../api/services/section.service";
import PageTitle from "../../components/common/PageTitle";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  TextFields as TextFieldsIcon,
  Movie as MovieIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  NavigateNext as NavigateNextIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PropTypes from "prop-types";
import { TinyMCEEditor } from "../../components/common/TinyMCEEditor";
import { courseService } from "../../api/services/course.service";
import { moduleService } from "../../api/services/module.service";
import CustomSnackbar from "../../components/common/Snackbar";
import { s3StorageService } from "../../awsS3/s3Storage.service";

// Define helper components outside CreateLessonPage

// --- ContentItemEditor Component ---
const ContentItemEditor = ({
  item,
  onContentChange,
  onSaveLocal,
  onCancelEdit,
}) => {
  const tinyEditorRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!item) return null;

  const handleInputChange = (field, value) => {
    onContentChange(item.id, field, value);
  };

  const triggerSave = () => {
    let content = item.data;
    if (item.type === "Reading" && tinyEditorRef.current) {
      content = tinyEditorRef.current.getContent();
      onContentChange(item.id, "data", content);
    }
    onSaveLocal(item.id);
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
            value={item.caption || ""}
            onChange={(e) => handleInputChange("caption", e.target.value)}
            sx={{ mb: 2 }}
          />
          <TinyMCEEditor
            ref={tinyEditorRef}
            key={item.id}
            initialValue={item.data}
            height={300}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onCancelEdit} sx={{ mr: 1 }}>
              Cancel Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={triggerSave}
            >
              Save Content Locally
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
            value={item.caption || ""}
            onChange={(e) => handleInputChange("caption", e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              fullWidth
              label="Video URL (YouTube, Vimeo, etc.)"
              value={item.data || ""}
              onChange={(e) => handleInputChange("data", e.target.value)}
              placeholder="e.g., https://www.youtube.com/watch?v=..."
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
              {uploading ? "Đang tải..." : "Tải lên"}
              <input
                type="file"
                accept="video/*"
                hidden
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      setUploading(true);
                      setError(null);

                      // Hiển thị thông báo tải lên
                      const maxSize = 500 * 1024 * 1024; // 500MB
                      if (file.size > maxSize) {
                        setError(
                          `File quá lớn (${(file.size / (1024 * 1024)).toFixed(2)}MB). Kích thước tối đa là 500MB.`
                        );
                        setUploading(false);
                        return;
                      }

                      // Lấy thông tin từ localStorage để tạo path trên S3
                      const courseInfo = {
                        courseId:
                          localStorage.getItem("currentCourseId") || "unknown",
                        moduleId:
                          localStorage.getItem("currentModuleId") || "unknown",
                      };

                      const teacherInfo = {
                        id: localStorage.getItem("userId") || "unknown",
                        name:
                          localStorage.getItem("fullname") || "Unknown Teacher",
                      };

                      // Bắt đầu hiển thị trạng thái uploading
                      setShowUploadProgress(true);
                      setUploadProgress(0);

                      try {
                        // Upload lên S3 dùng uploadLessonVideo
                        const uploadResult =
                          await s3StorageService.uploadLessonVideo(
                            file,
                            courseInfo,
                            teacherInfo,
                            // Callback để theo dõi tiến trình upload
                            (progress) => {
                              setUploadProgress(progress);
                            }
                          );

                        if (uploadResult && uploadResult.videoUrl) {
                          // Cập nhật URL từ S3 vào trường data
                          handleInputChange("data", uploadResult.videoUrl);

                          // Thông báo tải lên thành công
                          setUploadSuccess(true);
                          setTimeout(() => {
                            setUploadSuccess(false);
                          }, 3000);

                          // Ẩn progress sau khi hoàn thành
                          setTimeout(() => {
                            setShowUploadProgress(false);
                          }, 1000);
                        } else {
                          throw new Error("Upload failed - no URL returned");
                        }
                      } catch (uploadError) {
                        console.error("S3 upload error:", uploadError);
                        setError(
                          "Lỗi khi tải video lên: " + uploadError.message
                        );
                        setShowUploadProgress(false);
                      }
                    } catch (err) {
                      console.error("Error handling video:", err);
                      setError(
                        "Lỗi khi xử lý video: " +
                          (err.message || "Unknown error")
                      );
                      setShowUploadProgress(false);
                    } finally {
                      setUploading(false);
                    }
                  }
                }}
              />
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {item.data && item.data.startsWith("http") && (
            <Box sx={{ my: 2, textAlign: "center" }}>
              <video
                id={`preview-${item.id}`}
                src={item.data}
                controls
                width="320"
                style={{ maxWidth: "100%", marginTop: "10px" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            </Box>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onCancelEdit} sx={{ mr: 1 }}>
              Cancel Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => onSaveLocal(item.id)}
              disabled={uploading}
            >
              Save Content Locally
            </Button>
          </Box>

          {/* Snackbar cho hiển thị tiến trình upload */}
          <CustomSnackbar
            open={showUploadProgress && !uploadSuccess}
            message={`Đang tải lên: ${uploadProgress}%`}
            severity="info"
            progress={uploadProgress}
            showProgress={true}
            autoHideDuration={null}
          />

          {/* Snackbar thông báo upload thành công */}
          <CustomSnackbar
            open={uploadSuccess}
            message="Tải lên thành công!"
            severity="success"
            autoHideDuration={3000}
            onClose={() => setUploadSuccess(false)}
          />
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
            value={item.caption || ""}
            onChange={(e) => handleInputChange("caption", e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              fullWidth
              label="Image URL"
              value={item.data || ""}
              onChange={(e) => handleInputChange("data", e.target.value)}
              placeholder="e.g., https://example.com/image.jpg"
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
              {uploading ? "Đang tải..." : "Tải lên"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      setUploading(true);
                      setError(null);

                      // Tạm thời hiển thị base64 làm preview trước khi upload thành công
                      const reader = new FileReader();
                      reader.onload = () => {
                        // Hiển thị preview mà không thay đổi item.data
                        const previewImg = document.getElementById(
                          `preview-${item.id}`
                        );
                        if (previewImg) {
                          previewImg.src = reader.result;
                          previewImg.style.display = "block";
                        }
                      };
                      reader.readAsDataURL(file);

                      // Upload lên AWS S3
                      const courseInfo = {
                        courseId:
                          localStorage.getItem("currentCourseId") || "unknown",
                        moduleId:
                          localStorage.getItem("currentModuleId") || "unknown",
                      };

                      const teacherInfo = {
                        id: localStorage.getItem("userId") || "unknown",
                        name:
                          localStorage.getItem("fullname") || "Unknown Teacher",
                      };

                      try {
                        const uploadResult =
                          await s3StorageService.uploadLessonImage(
                            file,
                            courseInfo,
                            teacherInfo
                          );

                        // Cập nhật URL từ S3 vào trường data
                        if (uploadResult && uploadResult.imageUrl) {
                          handleInputChange("data", uploadResult.imageUrl);
                          setError(null);
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
                          handleInputChange("data", base64Image);
                          setError(
                            "Lưu ảnh dưới dạng base64 do lỗi CORS/ETag khi tải lên S3. Ảnh sẽ được nhúng trực tiếp vào nội dung."
                          );
                        } else {
                          throw uploadError; // Rethrow lỗi khác để xử lý bên ngoài
                        }
                      }
                    } catch (err) {
                      console.error("Error handling image:", err);
                      setError(
                        "Lỗi khi tải ảnh lên: " +
                          (err.message || "Unknown error")
                      );
                    } finally {
                      setUploading(false);
                    }
                  }
                }}
              />
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {item.data && (
            <Box sx={{ my: 2, textAlign: "center" }}>
              <img
                id={`preview-${item.id}`}
                src={item.data}
                alt={item.caption || "Preview"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  marginTop: "10px",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            </Box>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onCancelEdit} sx={{ mr: 1 }}>
              Cancel Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => onSaveLocal(item.id)}
              disabled={uploading}
            >
              Save Content Locally
            </Button>
          </Box>
        </Box>
      );
    default:
      return null;
  }
};
ContentItemEditor.propTypes = {
  item: PropTypes.object, // Can be null when not editing
  onContentChange: PropTypes.func.isRequired,
  onSaveLocal: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
};

// --- ContentItem Component ---
const ContentItem = ({ item, provided, onEdit, onDelete }) => {
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
  const getTitle = () => item.caption || item.type;
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
    // Draggable Props are now applied to the outer div in CreateLessonPage
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
      {/* Drag handle passed via provided */}
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
          title="Edit Content"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(item.id)}
          color="error"
          title="Remove Content"
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

// --- CreateLessonPage Component ---
const CreateLessonPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sectionIdFromQuery = queryParams.get("sectionId");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    section: "",
    duration: 30,
  });

  const [contentItems, setContentItems] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  const [expanded, setExpanded] = useState("panel1");
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [errors, setErrors] = useState({});

  const showSnackbar = (message, severity = "info") => {
    setSnackbarState({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);

        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse?.data) {
          setCourseTitle(courseResponse.data.title);
        }

        const moduleResponse = await moduleService.getModuleById(moduleId);
        if (moduleResponse?.data) {
          setModuleTitle(moduleResponse.data.title);
        }

        const sectionsResponse = await sectionService.getSectionsByModule(moduleId);
        if (sectionsResponse?.data) {
          // Filter for Lesson sections only
          const lessonSections = sectionsResponse.data.filter(section => section.type === 'Lesson');
          setSections(lessonSections);

          const currentSection = formData.section;
          if (sectionIdFromQuery && lessonSections.some((s) => s._id === sectionIdFromQuery)) {
            if (currentSection !== sectionIdFromQuery) {
              setFormData((prev) => ({ ...prev, section: sectionIdFromQuery }));
            }
          } else if (lessonSections.length > 0 && !currentSection) {
            setFormData((prev) => ({
              ...prev,
              section: lessonSections[0]._id,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        showSnackbar("Failed to load initial data.", "error");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId, sectionIdFromQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

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

  const createNewContentItem = (type) => {
    const timestamp = Date.now().toString();
    let initialData = "";
    if (type === "Reading") initialData = "<p>Enter lesson content here...</p>";
    return {
      id: `new-${timestamp}`,
      type: type,
      data: initialData,
      caption: "",
    };
  };

  const handleAddContent = (type) => {
    if (editingContent) {
      const saved = handleSaveLocalContent(editingContent.id);
      if (!saved) {
        showSnackbar(
          "Please resolve issues with the current item before adding a new one.",
          "warning"
        );
        return;
      }
    }
    const newItem = createNewContentItem(type);
    setContentItems((prevItems) => [...prevItems, newItem]);
    setEditingContent(newItem);
    setExpanded("panel2");
    showSnackbar(`Added new ${type}. Now editing.`, "info");
    if (errors.contentItems) {
      setErrors((prev) => ({ ...prev, contentItems: null }));
    }
  };

  const handleContentChange = (id, field, value) => {
    setContentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    if (editingContent && editingContent.id === id) {
      setEditingContent((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveLocalContent = (id) => {
    const itemToSave = contentItems.find((item) => item.id === id);
    if (!itemToSave) return false;

    // Validation
    if (
      itemToSave.type === "Reading" &&
      (!itemToSave.data ||
        itemToSave.data.trim() === "<p><br></p>" ||
        itemToSave.data.trim() === "")
    ) {
      showSnackbar("Reading content cannot be empty.", "warning");
      return false;
    }
    if (
      (itemToSave.type === "Video" || itemToSave.type === "Image") &&
      !itemToSave.data?.trim()
    ) {
      showSnackbar("Video/Image URL cannot be empty.", "warning");
      return false;
    }

    // Item is valid, stop editing it
    setEditingContent(null);
    showSnackbar("Content saved locally.", "success");
    if (errors.editingContent) {
      setErrors((prev) => ({ ...prev, editingContent: null }));
    }
    return true;
  };

  const handleEditContent = (item) => {
    if (editingContent && editingContent.id !== item.id) {
      const saved = handleSaveLocalContent(editingContent.id);
      if (!saved) {
        showSnackbar(
          "Could not switch editor. Please fix the current item first.",
          "warning"
        );
        return;
      }
    }
    // Set the item being edited
    setEditingContent(item);
    setExpanded("panel2");
  };

  const handleCancelEdit = () => {
    if (editingContent) {
      // If it's a newly added item (ID starts with 'new-'), remove it entirely
      if (editingContent.id.toString().startsWith("new-")) {
        setContentItems((prev) =>
          prev.filter((item) => item.id !== editingContent.id)
        );
        showSnackbar("New content addition cancelled.", "info");
      } else {
        // If it was an existing item being edited, just stop editing (changes are not saved)
        // Might need to fetch original data if revert is desired, but simple cancel is okay for now.
        showSnackbar("Edit cancelled.", "info");
      }
      setEditingContent(null);
      if (errors.editingContent) {
        setErrors((prev) => ({ ...prev, editingContent: null }));
      }
    }
  };

  const handleDeleteLocalContent = (id) => {
    if (window.confirm("Are you sure you want to remove this content?")) {
      setContentItems((prevItems) =>
        prevItems.filter((item) => item.id !== id)
      );
      if (editingContent && editingContent.id === id) setEditingContent(null);
      showSnackbar("Content removed.", "info");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (editingContent) {
      showSnackbar(
        "Please save or cancel editing before reordering content.",
        "warning"
      );
      return;
    }
    const items = Array.from(contentItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItemsWithOrder = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setContentItems(updatedItemsWithOrder);
    showSnackbar("Content order updated.", "info");
  };

  const validateForm = (isFinalSave = false) => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.section) newErrors.section = "Section is required";
    if (!formData.duration || formData.duration <= 0)
      newErrors.duration = "Valid duration is required";
    if (contentItems.length === 0)
      newErrors.contentItems = "Lesson must have at least one content item.";

    if (isFinalSave && editingContent) {
      newErrors.editingContent = `Content item '${editingContent.caption || editingContent.type}' is still being edited. Please save or cancel it first.`;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.contentItems) showSnackbar(newErrors.contentItems, "error");
      if (newErrors.editingContent)
        showSnackbar(newErrors.editingContent, "warning");
      return false;
    }
    return true;
  };

  const handleBackNavigate = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleCancel = () => {
    if (contentItems.length > 0 || formData.title || formData.description) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        navigate(`/teacher/course/${courseId}/module/${moduleId}`);
      }
    } else {
      navigate(`/teacher/course/${courseId}/module/${moduleId}`);
    }
  };

  const handleSave = async () => {
    if (editingContent) {
      showSnackbar(
        `Content item '${editingContent.caption || editingContent.type}' is still being edited. Please save or cancel it first.`,
        "warning"
      );
      setErrors((prev) => ({
        ...prev,
        editingContent: "Save or cancel the active content item.",
      }));
      return;
    }

    if (!validateForm(true)) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const orderedContentItems = contentItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
      const lessonPayload = {
        title: formData.title,
        description: formData.description,
        section: formData.section,
        duration: Number(formData.duration),
        module: moduleId,
        status: "published",
      };

      const lessonResponse = await lessonService.createLesson(lessonPayload);
      console.log("Lesson Creation Response:", lessonResponse);

      if (!lessonResponse || !lessonResponse.data || !lessonResponse.data._id) {
        throw new Error(
          lessonResponse.message || "Failed to create lesson or get lesson ID."
        );
      }

      const newLessonId = lessonResponse.data._id;
      showSnackbar("Lesson created successfully! Saving content...", "info");

      if (orderedContentItems.length > 0) {
        try {
          const contentsPayload = {
            lessonId: newLessonId,
            contents: orderedContentItems.map((item) => ({
              lesson: newLessonId,
              type: item.type,
              data: item.data,
              caption: item.caption || "",
            })),
          };

          console.log("Creating multiple contents:", contentsPayload);
          await contentService.createMultipleContents(contentsPayload);

          setSuccess(true);
          showSnackbar(
            "Lesson and all content created successfully!",
            "success"
          );
          setTimeout(() => {
            navigate(`/teacher/course/${courseId}/module/${moduleId}`);
          }, 1500);
        } catch (error) {
          console.error("Error creating contents:", error);
          setError(
            `Lesson created, but failed to save content: ${error.message}`
          );
          showSnackbar(
            "Lesson created, but failed to save content. Please try editing the lesson.",
            "warning"
          );
          setTimeout(() => {
            navigate(
              `/teacher/course/${courseId}/module/${moduleId}/lessons/${newLessonId}/edit`
            );
          }, 2500);
        }
      } else {
        setSuccess(true);
        showSnackbar("Lesson created successfully!", "success");
        setTimeout(() => {
          navigate(`/teacher/course/${courseId}/module/${moduleId}`);
        }, 1500);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in handleSave:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create lesson.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
      setLoading(false);
    }
  };

  const renderContentEditorSection = () => (
    <Accordion
      expanded={expanded === "panel2"}
      onChange={handleAccordionChange("panel2")}
      sx={{
        boxShadow: "none",
        "&:before": { display: "none" },
        bgcolor: "transparent",
        mt: 2,
      }}
      defaultExpanded
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ px: 0, mb: 0, ml: 2 }}
      >
        <Typography variant="h6" fontWeight="bold">
          Lesson Content
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, ml: 2 }}>
        <Box sx={{ mb: 2, mt: -1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Content
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
        </Box>

        {editingContent && (
          <Box sx={{ my: 2 }}>
            <ContentItemEditor
              item={editingContent}
              onContentChange={handleContentChange}
              onSaveLocal={handleSaveLocalContent}
              onCancelEdit={handleCancelEdit}
            />
          </Box>
        )}

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ mt: editingContent ? 3 : 1 }}
        >
          Content Items ({contentItems.length} total)
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
                            onDelete={handleDeleteLocalContent}
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
            No content added yet. Click 'Add...' buttons above.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );

  if (initialLoading) {
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
      <PageTitle title="Create New Lesson" />
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
            {courseTitle}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() =>
              navigate(`/teacher/course/${courseId}/module/${moduleId}`)
            }
            sx={{ color: "#666", textDecoration: "none" }}
          >
            {moduleTitle}
          </Link>
          <Typography color="text.primary">Create Lesson</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "block", alignItems: "center", mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackNavigate}
              sx={{
                color: "#0F62FE",
                borderColor: "#0F62FE",
                "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
                textTransform: "none",
              }}
            >
              {moduleTitle}
            </Button>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            Create New Lesson
          </Typography>
        </Box>

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 3 }}>
            {error || "Lesson created successfully! Redirecting..."}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
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
                      <InputLabel id="section-label">Section</InputLabel>
                      <Select
                        labelId="section-label"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        label="Section"
                      >
                        {sections.length > 0 ? (
                          sections.map((section) => (
                            <MenuItem key={section._id} value={section._id}>
                              {section.title}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No lesson sections available
                          </MenuItem>
                        )}
                      </Select>
                      {errors.section && (
                        <FormHelperText>{errors.section}</FormHelperText>
                      )}
                      {sections.length === 0 && (
                        <FormHelperText>
                          You need to create a Lesson type section first
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {renderContentEditorSection()}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{ mb: 4, borderRadius: 2, position: "sticky", top: 20 }}
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
                    onClick={handleSave}
                    disabled={loading || !!editingContent}
                    sx={{ mb: 2, py: 1.2 }}
                  >
                    {loading ? "Creating..." : "Create Lesson"}
                  </Button>

                  {editingContent && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", textAlign: "center", mb: 1 }}
                    >
                      Save or cancel content edit to enable lesson creation.
                    </Typography>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ py: 1.2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <CustomSnackbar
        open={snackbarState.open}
        message={snackbarState.message}
        severity={snackbarState.severity}
        onClose={closeSnackbar}
      />
    </>
  );
};

export default CreateLessonPage;
