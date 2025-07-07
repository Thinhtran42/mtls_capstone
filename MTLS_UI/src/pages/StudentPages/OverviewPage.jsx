/* eslint-disable react/no-unescaped-entities */
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Rating,
  Dialog,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import siteStats from '../../data/siteStats.json'
import DoneIcon from '@mui/icons-material/Done'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import LogoImg from '../../assets/Logo.svg'
import { courseService } from '../../api'
import { ratingService } from '../../api/services/rating.service'

const OverviewPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const sectionRefs = useRef([]);
  const [scrolled, setScrolled] = useState(false);

  // States for course data and loading
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courseRatings, setCourseRatings] = useState({})

  // States for course expansion and hover
  const [expandedCourseIds, setExpandedCourseIds] = useState([]);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  // State for instructor dialog
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [offeredByDialogOpen, setOfferedByDialogOpen] = useState(false);

  // Initialize sectionRefs with empty array of 6 elements (for 6 tabs)
  useEffect(() => {
    sectionRefs.current = Array(6)
      .fill()
      .map((_, i) => sectionRefs.current[i] || { current: null });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Scroll to the corresponding section
    const section = document.getElementById(`section-${newValue}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add scroll event listener to update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Update scrolled state for navbar styling
      const scrollPosition = window.scrollY;
      if (scrollPosition > 300) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Calculate each section's position to update active tab
      const headerOffset = 64; // height of the sticky tabs when scrolled
      const currentPosition = scrollPosition + headerOffset + 10; // adding some buffer

      // Find the current section based on scroll position
      for (let i = 0; i < 6; i++) {
        const section = document.getElementById(`section-${i}`);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (currentPosition >= sectionTop && currentPosition < sectionBottom) {
          if (tabValue !== i) {
            setTabValue(i);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tabValue]);

  // Add animation keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideDown {
        from {
          max-height: 0;
          opacity: 0;
        }
        to {
          max-height: 1000px;
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAllCourses();
        const coursesData = response?.data || [];

        console.log("Courses data from API:", coursesData);

        // Transform API data to match the required format
        const transformedCourses = coursesData.map(course => ({
          id: course._id || course.id,
          _id: course._id || course.id,
          title: course.title,
          description: course.description,
          duration: calculateDuration(course.modules),
          image: course.image,
          learningObjectives: course.learningObjectives || siteStats.learningStats.learningProjects,
          skills: course.skills || [
            "Music Theory",
            "Composition",
            "Rhythm",
            "Harmony",
          ],
          modules: course.modules || [],
        }));

        setCourses(transformedCourses)

        // Fetch ratings for each course
        transformedCourses.forEach(course => {
          fetchCourseRatings(course.id);
        });
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch ratings for a specific course
  const fetchCourseRatings = async (courseId) => {
    try {
      const response = await ratingService.getCourseRatingStats(courseId);
      setCourseRatings(prev => ({
        ...prev,
        [courseId]: response.data
      }));
    } catch (err) {
      console.error(`Error fetching ratings for course ${courseId}:`, err);
    }
  };

  // Calculate duration helper function
  const calculateDuration = (modules = []) => {
    const totalMinutes = modules.reduce((total, module) => {
      const moduleDuration = module.duration
        ? Object.values(module.duration).reduce(
            (sum, val) => sum + (val || 0),
            0
          )
        : 0;
      return total + moduleDuration;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours > 0 ? `${hours} hours` : ""}${
      hours > 0 && minutes > 0 ? " " : ""
    }${minutes > 0 ? `${minutes} minutes` : ""}`;
  };

  const handleCourseClick = (courseId) => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    if (!token) {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      navigate('/login', {
        state: {
          from: '/student/course/' + courseId,
          message: 'Please login to enroll in this course'
        }
      });
      return;
    }

    // Nếu đã đăng nhập, tiếp tục xử lý
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    // Sử dụng ID thực thay vì index
    navigate(`/student/course/${courseId}`);
  };

  // Use instructor data from siteStats.json
  const { skillsGained } = siteStats.learningStats;
  const { bannerImage } = siteStats;

  // Update the function to toggle course expansion to handle multiple courses
  const toggleCourseExpansion = (courseId, event) => {
    if (event) {
      event.stopPropagation();
    }

    setExpandedCourseIds((prevIds) => {
      if (prevIds.includes(courseId)) {
        return prevIds.filter((id) => id !== courseId);
      } else {
        return [...prevIds, courseId];
      }
    });
  };

  // Update the courses section to use the fetched ratings
  const renderCoursesSection = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }

    if (courses.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No courses available at the moment.
        </Alert>
      );
    }

    return (
      <Box sx={{ mb: 4 }}>
        {courses.map((course, index) => {
          const isExpanded = expandedCourseIds.includes(course.id)
          const isHovered = hoveredCourseId === course.id
          const courseRating = courseRatings[course.id] || { averageRating: 0, totalRatings: 0 }

          return (
            <Box
              key={course.id}
              sx={{
                mb: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "white",
                position: "relative",
              }}
              onMouseEnter={() => setHoveredCourseId(course.id)}
              onMouseLeave={() => setHoveredCourseId(null)}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: isExpanded ? "1px solid #e0e0e0" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    "&:hover": {
                      "& .course-title": {
                        color: "#0F62FE",
                        textDecoration: "underline",
                      },
                    },
                  }}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <Typography
                    className="course-title"
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: "1rem",
                      transition: "color 0.2s, text-decoration 0.2s",
                    }}
                  >
                    {course.title || "[missing title]"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    {/* Luôn hiện số thứ tự khóa học */}
                    <Typography variant="body2" color="text.secondary">
                      Course {index + 1}
                    </Typography>

                    {/* Rating */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        value={courseRating.averageRating}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{ color: "#0F62FE", mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({courseRating.totalRatings} ratings)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {course.description || "[missing description]"}
                  </Typography>
                </Box>

                {/* Luôn hiện nút expand */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: isHovered
                        ? "rgba(15, 98, 254, 0.08)"
                        : "transparent",
                      border: isHovered
                        ? "1px solid rgba(15, 98, 254, 0.2)"
                        : "1px solid transparent",
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.5,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(15, 98, 254, 0.12)",
                      },
                    }}
                    onClick={(e) => toggleCourseExpansion(course.id, e)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#0F62FE",
                        fontWeight: "medium",
                        mr: 1,
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      Course details
                    </Typography>
                    <ExpandMoreIcon
                      sx={{
                        color: "#0F62FE",
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                        fontSize: 20,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Expanded content */}
              {isExpanded && (
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "white",
                    overflow: "hidden",
                    animation: "slideDown 0.3s ease-out forwards",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    What you'll learn
                  </Typography>
                  <Box>
                    {course.learningObjectives &&
                    course.learningObjectives.length > 0 ? (
                      course.learningObjectives.map((objective, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 1.5,
                          }}
                        >
                          <DoneIcon
                            sx={{
                              color: "#0F62FE",
                              mr: 1,
                              mt: 0.5,
                              fontSize: "1.1rem",
                            }}
                          />
                          <Typography variant="body2">{objective}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        [missing learningObjectives]
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 2, mt: 3 }}
                  >
                    Skills you'll gain
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {course.skills && course.skills.length > 0 ? (
                      course.skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          sx={{
                            backgroundColor: "#f1f8ff",
                            color: "#0F62FE",
                            fontWeight: 500,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        [missing skills]
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: "#F5F7FA", color: "#000000", pt: 6, pb: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <img
              src={LogoImg}
              alt="Music Academy Logo"
              style={{ height: 50, width: "auto" }}
            />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  color: "#000000",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Music Theory Learning System
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  if (courses.length > 0) {
                    const firstCourse = courses[0];
                    console.log("Navigating to course:", firstCourse);
                    // Sử dụng _id trực tiếp thay vì id để đảm bảo sử dụng ObjectID
                    const courseId = firstCourse._id || firstCourse.id;
                    handleCourseClick(courseId);
                  }
                }}
                sx={{
                  bgcolor: "#0F62FE",
                  color: "white",
                  "&:hover": { bgcolor: "#0043CE" },
                  fontWeight: "bold",
                  borderRadius: 1,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  marginTop: 17,
                }}
              >
                Go To Course
              </Button>
            </Grid>

            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={bannerImage.src}
                alt={bannerImage.alt}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                  borderRadius: 2,
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Course Summary Section*/}
      <Box sx={{ position: "relative", mt: -3, mb: 3, zIndex: 1 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              backgroundColor: "#ffffff",
              py: 3,
              px: { xs: 2, md: 3 },
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                py: 1,
                px: { xs: 1, md: 2 },
                borderRight: { xs: "none", md: "1px solid #e8e8e8" },
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "1.1rem" }}
              >
                {courses.length} course series
              </Typography>
            </Box>

            {/* <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                py: 1,
                px: { xs: 1, md: 2 },
                borderRight: { xs: "none", md: "1px solid #e8e8e8" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "1.1rem" }}
              >
                Beginner level
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recommended experience
              </Typography>
            </Box> */}

            {/* <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                py: 1,
                px: { xs: 1, md: 2 },
                borderRight: { xs: "none", md: "1px solid #e8e8e8" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "1.1rem" }}
              >
                {Math.round(siteStats.courseStats.estimatedHours / 10)} months
              </Typography>
              <Typography variant="body2" color="text.secondary">
                at 10 hours a week
              </Typography>
            </Box> */}

            {/* <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                py: 1,
                px: { xs: 1, md: 2 },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "1.1rem" }}
              >
                Flexible schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn at your own pace
              </Typography>
            </Box> */}
          </Paper>
        </Container>
      </Box>

      {/* Tabs Navigation */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "white",
          position: "sticky",
          top: 55,
          zIndex: 1000,
          boxShadow: scrolled ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
          transition: "box-shadow 0.3s, padding 0.3s",
          py: scrolled ? 0 : 0.5,
        }}
      >
        <Container maxWidth="lg">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="specialization tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                minWidth: 100,
                px: 3,
                py: scrolled ? 1.5 : 2,
                transition: "padding 0.3s",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                backgroundColor: "#0F62FE",
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            {/* <Tab label="About" id="tab-0" aria-controls="tabpanel-0" /> */}
            {/* <Tab label="Outcomes" id="tab-1" aria-controls="tabpanel-1" /> */}
            <Tab label="Courses" id="tab-2" aria-controls="tabpanel-0"/>
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container>
          {/* Main Content */}
          <Grid item xs={12}>
            {/* About Tab */}
            {/* <Box id="section-0" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                About this Professional Certificate
              </Typography>
              <Typography variant="body1" paragraph>
                Prepare for a career in the high-growth field of music theory
                and composition. In this program, you'll learn in-demand skills
                and tools for music analysis, composition, and performance to
                get job-ready in less than 4 months.
              </Typography>
              <Typography variant="body1" paragraph>
                This comprehensive music theory specialization is designed to
                take you from the basics to advanced concepts in music theory.
                Whether you're a beginner or looking to refine your skills,
                these courses will provide you with the knowledge and practice
                needed to understand and apply music theory concepts.
              </Typography>
              <Typography variant="body1" paragraph>
                You'll learn through a combination of video lectures, readings,
                interactive exercises, and practical assignments. By the end of
                this specialization, you'll have a solid foundation in music
                theory that you can apply to composition, performance, or music
                appreciation.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                What you'll learn
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", mb: 3 }}>
                    <DoneIcon sx={{ color: "#0F62FE", mr: 2, mt: 0.5 }} />
                    <Typography variant="body1">
                      Master the music theory fundamentals, frameworks, tools,
                      and technologies to develop job-ready skills valued by
                      employers.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", mb: 3 }}>
                    <DoneIcon sx={{ color: "#0F62FE", mr: 2, mt: 0.5 }} />
                    <Typography variant="body1">
                      Create and analyze musical compositions using advanced
                      harmony, counterpoint, and formal structure concepts.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", mb: 3 }}>
                    <DoneIcon sx={{ color: "#0F62FE", mr: 2, mt: 0.5 }} />
                    <Typography variant="body1">
                      Develop practical skills in music notation, ear training,
                      and sight-reading using industry-standard tools.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", mb: 3 }}>
                    <DoneIcon sx={{ color: "#0F62FE", mr: 2, mt: 0.5 }} />
                    <Typography variant="body1">
                      Apply music theory principles to various genres and
                      styles, preparing for versatile career opportunities in
                      music education and performance.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Skills you'll gain
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
                {skillsGained.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    sx={{
                      backgroundColor: "#f1f8ff",
                      color: "#0F62FE",
                      fontWeight: 500,
                      px: 1,
                      py: 2.5,
                      borderRadius: 1,
                      border: "1px solid #e1f0ff",
                    }}
                  />
                ))}
              </Box>
            </Box> */}

            {/* Courses Tab */}
            <Box id="section-0" sx={{ scrollMarginTop: "64px", mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {courses.length} course series
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={7} lg={8}>
                  {renderCoursesSection()}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog/Modal hiển thị tất cả instructors */}
      <Dialog
        open={instructorDialogOpen}
        onClose={() => setInstructorDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxWidth: 800,
            m: 0,
            p: 0,
          },
        }}
      >
        <Box sx={{ position: "relative", pb: 2 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2, mb: 0, position: "relative" }}>
            <IconButton
              onClick={() => setInstructorDialogOpen(false)}
              aria-label="close"
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "#757575",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              borderTop: "1px solid #e0e0e0",
              mt: 2,
              pt: 2,
              px: 3,
            }}
          >
            <Button
              variant="contained"
              onClick={() => setInstructorDialogOpen(false)}
              sx={{
                bgcolor: "#0F62FE",
                color: "white",
                textTransform: "none",
                borderRadius: 1,
                fontSize: "0.9rem",
                px: 4,
                "&:hover": {
                  bgcolor: "#0043CE",
                },
              }}
            >
              OK
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Dialog/Modal cho Offered by */}
      <Dialog
        open={offeredByDialogOpen}
        onClose={() => setOfferedByDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxWidth: 600,
          },
        }}
      >
        <Box sx={{ position: "relative", pt: 3, pb: 2, px: 3 }}>
          <IconButton
            onClick={() => setOfferedByDialogOpen(false)}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#757575",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Offered by
          </Typography>

          <Box sx={{ display: "flex", mb: 3 }}>
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                p: 2,
                mr: 3,
                borderRadius: 1,
                width: 100,
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                src={LogoImg}
                alt="Music Academy"
                variant="square"
                sx={{ width: 60, height: 60 }}
              />
            </Box>

            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Music Academy
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            At Music Academy, we know how rapidly the music industry evolves and
            recognize the crucial need for musicians and enthusiasts to build
            job-ready, hands-on skills quickly. As a leading music education
            provider, we're committed to helping you thrive in this dynamic
            landscape.
          </Typography>

          <Typography variant="body1" paragraph>
            Through Music Academy's network, our expertly designed training
            programs in music theory, composition, performance, music
            technology, and more, provide the essential skills you need to
            secure your first position, advance your career, or drive musical
            success. Whether you're upskilling yourself or your ensemble, our
            courses, Specializations, and Professional Certificates build the
            technical expertise that ensures you, and your musical projects,
            excel in a competitive world.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setOfferedByDialogOpen(false)}
              sx={{
                bgcolor: "#0F62FE",
                color: "white",
                textTransform: "none",
                px: 3,
                py: 0.5,
                "&:hover": {
                  bgcolor: "#0043CE",
                },
              }}
            >
              OK
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default OverviewPage;
