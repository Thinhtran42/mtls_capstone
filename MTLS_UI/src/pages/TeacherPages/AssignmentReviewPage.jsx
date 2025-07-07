// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Tooltip,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  PendingActions,
  Person,
  Download,
  Visibility,
  Save,
  FilterList,
  Search,
  CloudDownload,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { doAssignmentService } from "../../api/services/assignment.service";
import PageTitle from "../../components/common/PageTitle";
import axios from "axios";
import { API_CONFIG } from "../../api/config";
import PropTypes from "prop-types";

const AssignmentReviewPage = () => {
  // State for statistics
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
  });

  // State for submission management
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [teacherComment, setTeacherComment] = useState("");
  const [score, setScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assignments data
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching assignments data...");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Sử dụng cấu hình API chung từ config.js
      const axiosInstance = axios.create({
        baseURL: API_CONFIG.baseURL,
        headers: {
          ...API_CONFIG.headers,
          Authorization: `Bearer ${token}`,
        },
        timeout: API_CONFIG.timeout,
      });

      // Danh sách endpoints ưu tiên
      const endpoints = [
        "/do-assignments",
        "/submissions",
      ];

      let submissions = [];
      let foundData = false;

      // Thử từng endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);

          const response = await axiosInstance.get(endpoint);

          // Kiểm tra dữ liệu
          if (response.data) {
            if (Array.isArray(response.data) && response.data.length > 0) {
              console.log(`${endpoint} returned ${response.data.length} items`);
              submissions = response.data;
              foundData = true;
              break;
            } else if (
              response.data.data &&
              Array.isArray(response.data.data) &&
              response.data.data.length > 0
            ) {
              console.log(
                `${endpoint} returned ${response.data.data.length} items in data property`
              );
              submissions = response.data.data;
              foundData = true;
              break;
            }
          }
        } catch (err) {
          console.log(`Error calling ${endpoint}:`, err.message);
        }
      }

      // Thử sử dụng service trực tiếp nếu các endpoints trên không thành công
      if (!foundData) {
        try {
          console.log("Trying to use service directly");
          const submissionsResponse =
            await doAssignmentService.getAllSubmissions();

          if (submissionsResponse && submissionsResponse.data) {
            if (
              Array.isArray(submissionsResponse.data) &&
              submissionsResponse.data.length > 0
            ) {
              submissions = submissionsResponse.data;
              foundData = true;
            } else if (
              submissionsResponse.data.data &&
              Array.isArray(submissionsResponse.data.data) &&
              submissionsResponse.data.data.length > 0
            ) {
              submissions = submissionsResponse.data.data;
              foundData = true;
            }
          }
        } catch (serviceError) {
          console.error("Error using service:", serviceError);
        }
      }

      // Tạo dữ liệu mẫu nếu không tìm thấy dữ liệu thật trong môi trường development
      if (!foundData && import.meta.env.DEV) {
        console.log("Using sample data for development environment");

        // Tạo dữ liệu mẫu
        submissions = [
          {
            _id: "sample1",
            student: {
              _id: "student1",
              fullname: "John Doe",
              email: "john@example.com",
            },
            assignment: {
              title: "Assignment 1",
              description: "This is a sample assignment",
            },
            submissionDate: new Date().toISOString(),
            isGraded: true,
            score: 8,
            teacherComment: "Good work!",
          },
          {
            _id: "sample2",
            student: {
              _id: "student2",
              fullname: "Jane Smith",
              email: "jane@example.com",
            },
            assignment: {
              title: "Assignment 2",
              description: "Another sample assignment",
            },
            submissionDate: new Date().toISOString(),
            isGraded: false,
          },
        ];

        foundData = true;
      }

      // Xử lý dữ liệu
      if (foundData) {
        // Format và update state
        const formattedAssignments = submissions.map((submission) => {
          // Lấy thông tin học sinh
          const studentName = submission.student?.fullname;

          // Lấy thông tin assignment
          const submissionTitle = submission.title || "Assignment";
          const submissionDescription = submission.description || "";

          // Lấy thông tin khóa học"
          const courseName =
            submission.assignment?.section?.module?.course?.title || "Course";

          // Lấy thông tin module
          const moduleName =
            submission.assignment?.section?.module?.title || "Module";

          // Lấy thông tin assignment
          const assignmentName = submission.assignment?.title || "Assignment";

          //Lấy thông tin question
          const questionText =
            submission.assignment?.questionText || "Question";

          // Xác định trạng thái chấm điểm
          const isGraded = submission.isGraded === true;
          const score =
            submission.score !== undefined
              ? submission.score
              : submission.teacherScore !== undefined
                ? submission.teacherScore
                : 0;

          // Nhận xét của giáo viên
          const teacherComment =
            submission.teacherComment || submission.comment || "";

          // Ngày nộp bài
          const submissionDate =
            submission.submittedAt ||
            submission.createdAt ||
            submission.updatedAt ||
            new Date().toISOString();

          // Thông tin file đính kèm
          // Improve file information extraction
          let fileUrl = "";
          let fileName = "";
          let fileType = "application/octet-stream";

          // Extract file information using more robust approach
          if (submission.submissionUrl) {
            fileUrl = submission.submissionUrl;
            fileName =
              submission.fileName ||
              getFileNameFromUrl(submission.submissionUrl);
          } else if (submission.fileUrl) {
            fileUrl = submission.fileUrl;
            fileName =
              submission.fileName || getFileNameFromUrl(submission.fileUrl);
          } else if (submission.file) {
            if (typeof submission.file === "object") {
              fileUrl = submission.file.url || "";
              fileName =
                submission.file.name ||
                submission.file.originalname ||
                getFileNameFromUrl(fileUrl);
              fileType =
                submission.file.type ||
                submission.file.mimetype ||
                "application/octet-stream";
            } else if (typeof submission.file === "string") {
              fileUrl = submission.file;
              fileName = getFileNameFromUrl(submission.file);
            }
          }

          // Ensure fileName is always set
          if (!fileName && fileUrl) {
            fileName = getFileNameFromUrl(fileUrl);
          }

          return {
            id: submission._id || submission.id,
            studentId: submission.student?._id || submission.student?.id,
            studentName,
            courseName,
            moduleName,
            assignmentName,
            questionText,
            submissionTitle,
            submissionDescription,
            submissionDate,
            fileUrl,
            fileName,
            fileType,
            isGraded,
            teacherComment,
            score,
            status: isGraded ? "graded" : "pending",
          };
        });

        console.log(
          `Processed ${formattedAssignments.length} valid assignments`
        );

        // Sắp xếp bài nộp theo thời gian mới nhất
        formattedAssignments.sort((a, b) => {
          const dateA = new Date(a.submissionDate);
          const dateB = new Date(b.submissionDate);
          return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
        });

        // Update state
        setAssignments(formattedAssignments);
        setFilteredAssignments(formattedAssignments);

        // Update statistics
        const gradedCount = formattedAssignments.filter(
          (a) => a.isGraded
        ).length;
        setStats({
          total: formattedAssignments.length,
          reviewed: gradedCount,
          pending: formattedAssignments.length - gradedCount,
        });

        // Cache stats for quicker loading next time
        try {
          localStorage.setItem(
            "assignmentStats",
            JSON.stringify({
              total: formattedAssignments.length,
              reviewed: gradedCount,
              pending: formattedAssignments.length - gradedCount,
            })
          );
        } catch (cacheError) {
          console.error("Error caching statistics:", cacheError);
        }
      } else {
        // No data found
        console.log("No assignment data found");
        setAssignments([]);
        setFilteredAssignments([]);
        setStats({
          total: 0,
          reviewed: 0,
          pending: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError(
        "Failed to load assignments. Please check network connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Filter assignments based on search and filters
  useEffect(() => {
    let filtered = [...assignments];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (assignment) =>
          (assignment.studentName?.toLowerCase() || "").includes(term) ||
          (assignment.submissionTitle?.toLowerCase() || "").includes(term) ||
          (assignment.courseName?.toLowerCase() || "").includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "reviewed" || statusFilter === "graded") {
        filtered = filtered.filter(
          (assignment) => assignment.isGraded === true
        );
      } else if (statusFilter === "pending" || statusFilter === "ungraded") {
        filtered = filtered.filter(
          (assignment) => assignment.isGraded !== true
        );
      }
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, statusFilter]);

  // Handle opening the review dialog
  const handleOpenReview = (assignment) => {
    setSelectedAssignment(assignment);
    setScore(assignment.isGraded ? assignment.score : 0);
    setTeacherComment(assignment.teacherComment || "");
    setReviewOpen(true);
    setSaveSuccess(false);
  };

  // Handle closing the review dialog
  const handleCloseReview = () => {
    setReviewOpen(false);
    setSelectedAssignment(null);
    setTeacherComment("");
    setScore(0);
    setSaveSuccess(false);
  };

  // Improved file name extraction function
  const getFileNameFromUrl = (url) => {
    if (!url) return "attachment";

    try {
      // Handle S3 URLs which often have complex structures
      const urlObj = new URL(url);

      // Try to get the file name from the URL path
      let fileName = urlObj.pathname.split("/").pop();

      // Remove query parameters if present
      fileName = fileName.split("?")[0];

      // Check if it's encoded and decode it
      if (fileName.includes("%")) {
        fileName = decodeURIComponent(fileName);
      }

      // If still no valid filename found, use a timestamp-based name
      if (!fileName || fileName === "" || fileName === "/") {
        return `attachment-${new Date().getTime()}`;
      }

      return fileName;
    } catch (error) {
      console.error("Error parsing filename from URL:", error);
      return "attachment";
    }
  };

  // Save assignment review
  const handleSaveReview = async () => {
    try {
      setReviewLoading(true);
      setSaveSuccess(false);

      if (!selectedAssignment?.id) {
        throw new Error("Assignment not found");
      }

      // Validate score
      const validScore = typeof score === "string" ? parseFloat(score) : score;

      if (isNaN(validScore)) {
        throw new Error("Invalid score");
      }

      // Prepare update data
      const updateData = {
        score: validScore,
        teacherComment,
        comment: teacherComment,
        isGraded: true,
      };

      // Submit to API
      await doAssignmentService.updateSubmission(
        selectedAssignment.id,
        updateData
      );

      setSaveSuccess(true);

      // Refresh after short delay
      setTimeout(() => {
        fetchAssignments();
        handleCloseReview();
      }, 1500);
    } catch (error) {
      console.error("Error saving review:", error);
      setError(`Failed to save review: ${error.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (!fileType) return "📎";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("audio")) return "🔊";
    if (fileType.includes("video")) return "🎬";
    return "📎";
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAssignments();
  };

  // Download attachment with improved filename handling
  const downloadAttachment = useCallback(async (url, providedFileName) => {
    try {
      if (!url) {
        console.error("No attachment URL provided");
        return;
      }

      // Show downloading feedback
      setError(null);
      const downloadToast = { id: "download-toast" };
      window.toast?.loading?.(`Downloading file...`, { id: downloadToast.id });

      // Fetch the file
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get file content as blob
      const blob = await response.blob();

      // Get file name - use provided name or extract from URL
      let downloadFileName = providedFileName || getFileNameFromUrl(url);

      // Ensure file has an extension based on MIME type if possible
      if (!downloadFileName.includes(".") && blob.type) {
        const extension = blob.type.split("/")[1];
        if (extension && extension !== "octet-stream") {
          downloadFileName += `.${extension}`;
        }
      }

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadFileName;

      // Append to body, click and cleanup
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);

      // Show success message
      window.toast?.success?.(`Downloaded ${downloadFileName} successfully`, {
        id: downloadToast.id,
      });
    } catch (error) {
      console.error("Error downloading attachment:", error);
      window.toast?.error?.(`Download failed: ${error.message}`, {
        id: "download-toast",
      });
      setError(`Failed to download attachment: ${error.message}`);
    }
  }, []);
  // Open attachment in new tab
  const openAttachmentInNewTab = useCallback((url) => {
    if (!url) {
      console.error("No attachment URL provided");
      return;
    }
    window.open(url, "_blank");
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <PageTitle title="Assignment Management & Evaluation" />

      <Typography variant="h4" sx={{ mb: 4, fontWeight: "medium" }}>
        Assignment Management & Evaluation
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Error message display if any */}
          {error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Try Again
                </Button>
              }
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Total Assignments"
                value={stats.total}
                icon={<Assignment sx={{ color: "primary.main" }} />}
                color="primary"
                subtitle="All submitted assignments"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Ungraded"
                value={stats.pending}
                icon={<PendingActions sx={{ color: "warning.main" }} />}
                color="warning"
                subtitle={
                  stats.total > 0
                    ? `${Math.round((stats.pending / stats.total) * 100)}% of total assignments`
                    : "0% of total assignments"
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Graded"
                value={stats.reviewed}
                icon={<CheckCircle sx={{ color: "success.main" }} />}
                color="success"
                subtitle={
                  stats.total > 0
                    ? `${Math.round((stats.reviewed / stats.total) * 100)}% of total assignments`
                    : "0% of total assignments"
                }
              />
            </Grid>
          </Grid>

          {/* Actions and filters */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5">Assignment List</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search by student name, assignment title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Ungraded</MenuItem>
                    <MenuItem value="reviewed">Graded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={handleClearFilters}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Assignments table */}
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #e0e0e0",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Attachment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Person sx={{ mr: 1, color: "primary.main" }} />
                              {assignment.studentName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={assignment.submissionDescription || ""}
                              arrow
                            >
                              <Typography variant="body2">
                                {assignment.submissionTitle}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{assignment.courseName}</TableCell>
                          <TableCell>
                            {formatDate(assignment.submissionDate)}
                          </TableCell>
                          <TableCell>
                            {assignment.fileUrl ? (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Typography sx={{ mr: 1 }}>
                                  {getFileIcon(assignment.fileType)}
                                </Typography>
                                <Box>
                                  <Tooltip
                                    title={`Download: ${assignment.fileName || "attachment"}`}
                                    arrow
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        downloadAttachment(
                                          assignment.fileUrl,
                                          assignment.fileName
                                        )
                                      }
                                      color="primary"
                                      sx={{ mr: 0.5 }}
                                    >
                                      <CloudDownload fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View in browser" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        openAttachmentInNewTab(
                                          assignment.fileUrl
                                        )
                                      }
                                      color="secondary"
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                No attachment
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                assignment.isGraded ? "Graded" : "Ungraded"
                              }
                              color={
                                assignment.isGraded ? "success" : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {assignment.isGraded ? (
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {assignment.score}/10
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Not graded
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleOpenReview(assignment)}
                              color={
                                assignment.isGraded ? "primary" : "secondary"
                              }
                            >
                              {assignment.isGraded ? "Review" : "Grade"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No assignments found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAssignments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Rows per page:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} of ${count}`
                }
              />
            </TableContainer>
          </Paper>

          {/* Review Dialog */}
          <Dialog
            open={reviewOpen}
            onClose={handleCloseReview}
            maxWidth="md"
            fullWidth
          >
            {selectedAssignment && (
              <>
                <DialogTitle>
                  <Typography variant="h6">
                    Review Assignment: {selectedAssignment.assignmentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Student: {selectedAssignment.studentName} | Course:{" "}
                    {selectedAssignment.courseName} | Module:{" "}
                    {selectedAssignment.moduleName}
                  </Typography>
                </DialogTitle>
                <DialogContent dividers>
                  <Grid container spacing={3}>
                    {/* Assignment details */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Question: {selectedAssignment.questionText}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                          Submission Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Title:
                          </Typography>
                          <Typography variant="body1">
                            {selectedAssignment.submissionTitle}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Description:
                          </Typography>
                          <Typography variant="body1">
                            {selectedAssignment.submissionDescription ||
                              "No description"}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Submission Time:
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedAssignment.submissionDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Attachment:
                          </Typography>
                          {selectedAssignment.fileUrl ? (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() =>
                                  downloadAttachment(
                                    selectedAssignment.fileUrl,
                                    selectedAssignment.fileName
                                  )
                                }
                                size="small"
                                color="primary"
                              >
                                {getFileIcon(selectedAssignment.fileType)}{" "}
                                Download
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={() =>
                                  openAttachmentInNewTab(
                                    selectedAssignment.fileUrl
                                  )
                                }
                                size="small"
                                color="secondary"
                              >
                                View in Browser
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No attachment
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Teacher Review */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Person sx={{ mr: 1, fontSize: 20 }} />
                          Teacher Evaluation
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Grade:
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              type="number"
                              value={score}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (
                                  e.target.value === "" ||
                                  (!isNaN(value) && value >= 0 && value <= 10)
                                ) {
                                  setScore(e.target.value === "" ? "" : value);
                                }
                              }}
                              onBlur={() => {
                                if (score === "" || isNaN(score)) {
                                  setScore(0);
                                }
                              }}
                              inputProps={{
                                min: 0,
                                max: 10,
                                step: 0.5,
                                inputMode: "decimal",
                              }}
                              sx={{ width: 100 }}
                              size="small"
                              variant="outlined"
                              label="Score"
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              / 10
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Comments:
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={5}
                            value={teacherComment}
                            onChange={(e) => setTeacherComment(e.target.value)}
                            placeholder="Enter your feedback on this assignment..."
                            variant="outlined"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {saveSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Evaluation saved successfully!
                    </Alert>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseReview} color="inherit">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveReview}
                    color="primary"
                    variant="contained"
                    startIcon={
                      reviewLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Save />
                      )
                    }
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? "Saving..." : "Save Evaluation"}
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </>
      )}
    </Box>
  );
};

// Statistic Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card
    sx={{
      height: "100%",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderRadius: 2,
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box
          sx={{
            backgroundColor: `${color}.100`,
            borderRadius: "50%",
            p: 1,
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h3"
        component="div"
        sx={{ fontWeight: "bold", my: 1, color: `${color}.700` }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Add PropTypes validation for StatCard
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  subtitle: PropTypes.string
};

export default AssignmentReviewPage;
