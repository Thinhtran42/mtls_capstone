import { useState } from "react";
import { Add as AddIcon, Search as SearchIcon, FilterList as FilterIcon, GridView as GridViewIcon, ViewList as ListViewIcon, Sort as SortIcon } from "@mui/icons-material";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  TextField,
  MenuItem,
  Paper,
  useTheme,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { useNavigate } from "react-router-dom";

export const categories = [
  "Basic Music Theory",
  "Harmony",
  "Rhythm & Tempo",
  "Music Notation",
  "Scales & Modes",
  "Composition",
  "Music Analysis"
];

export const difficulties = [
  "Basic",
  "Intermediate",
  "Advanced"
];

const mockLessons = [
  {
    id: "1",
    title: "Basic Notes and Staff Layout",
    description: "Learn about musical notes, their positions on the staff, and basic note reading.",
    category: "Basic Music Theory",
    difficulty: "Basic",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "45 minutes",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "2",
    title: "Major Scales and Basic Chords",
    description: "Explore the structure of major scales and how to build primary and secondary chords in major keys.",
    category: "Scales & Modes",
    difficulty: "Basic",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "60 minutes",
    createdAt: "2024-03-16",
    updatedAt: "2024-03-16",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "3",
    title: "Basic 4-Part Harmony Writing",
    description: "Learn how to write 4-part harmony following classical rules, avoiding common mistakes in harmonic progression.",
    category: "Harmony",
    difficulty: "Intermediate",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "90 minutes",
    createdAt: "2024-03-17",
    updatedAt: "2024-03-17",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "4",
    title: "Dynamics and Expression Markings",
    description: "Explore dynamic markings (f, p, mf...) and expressive terms in music.",
    category: "Music Notation",
    difficulty: "Basic",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "30 minutes",
    createdAt: "2024-03-18",
    updatedAt: "2024-03-18",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "5",
    title: "Harmonic Analysis of Classical Works",
    description: "Learn how to analyze harmonic structures in classical compositions, focusing on Mozart and Beethoven.",
    category: "Music Analysis",
    difficulty: "Advanced",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "120 minutes",
    createdAt: "2024-03-19",
    updatedAt: "2024-03-19",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "6",
    title: "Swing and Jazz Rhythms",
    description: "Discover the characteristics of swing rhythm, how to play and notate rhythms in jazz music.",
    category: "Rhythm & Tempo",
    difficulty: "Intermediate",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "75 minutes",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-20",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "7",
    title: "Composing Melodies with Pentatonic Scales",
    description: "Learn about pentatonic scales and their application in composing melodies with folk characteristics.",
    category: "Composition",
    difficulty: "Intermediate",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "60 minutes",
    createdAt: "2024-03-21",
    updatedAt: "2024-03-21",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  {
    id: "8",
    title: "Natural, Harmonic and Melodic Minor Scales",
    description: "Compare and distinguish between types of minor scales, how to use them in composition and harmony.",
    category: "Scales & Modes",
    difficulty: "Intermediate",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "90 minutes",
    createdAt: "2024-03-22",
    updatedAt: "2024-03-22",
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Teacher",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  }
];

const sortOptions = [
  { value: 'title', label: 'Alphabetically' },
  { value: 'difficulty', label: 'By Difficulty' },
  { value: 'createdAt', label: 'By Creation Date' },
  { value: 'updatedAt', label: 'By Update Date' }
];

function ManageLessonPage() {
  const theme = useTheme();
  const [lessons, setLessons] = useState(mockLessons);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();

  const removeVietnameseTones = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }

  const getInitials = (text) => {
    return removeVietnameseTones(text)
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toLowerCase();
  };

  const getWords = (text) => {
    return removeVietnameseTones(text).toLowerCase().split(' ');
  };

  const filteredLessons = lessons.filter((lesson) => {
    const searchTermLower = removeVietnameseTones(searchTerm.toLowerCase().trim());
    
    if (searchTermLower === '') {
      const matchesCategory = 
        selectedCategory === "all" || lesson.category === selectedCategory;
      const matchesDifficulty = 
        selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty;
      return matchesCategory && matchesDifficulty;
    }

    const titleInitials = getInitials(lesson.title);
    const titleWords = getWords(lesson.title);
    const searchWords = searchTermLower.split(' ');

    const matchesSearch = searchWords.every(searchWord => 
      titleInitials.includes(searchWord) || 
      titleWords.some(word => word.includes(searchWord))
    );

    const matchesCategory = 
      selectedCategory === "all" || lesson.category === selectedCategory;
    const matchesDifficulty = 
      selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getSortedLessons = (lessons) => {
    return [...lessons].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          const titleA = removeVietnameseTones(a.title.toLowerCase());
          const titleB = removeVietnameseTones(b.title.toLowerCase());
          return sortDirection === 'asc' 
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);

        case 'difficulty':
          const difficultyOrder = {
            'Basic': 1,
            'Intermediate': 2,
            'Advanced': 3
          };
          return sortDirection === 'asc'
            ? difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            : difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];

        case 'createdAt':
          return sortDirection === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);

        case 'updatedAt':
          return sortDirection === 'asc'
            ? new Date(a.updatedAt) - new Date(b.updatedAt)
            : new Date(b.updatedAt) - new Date(a.updatedAt);

        default:
          return 0;
      }
    });
  };

  const sortedAndFilteredLessons = getSortedLessons(filteredLessons);

  const handleLessonClick = (lesson) => {
    navigate(`/admin/manage-lesson/${lesson.id}`);
  };

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f7f9",
          mr: "200px",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              px: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                Manage Lessons
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total lessons: {lessons.length} | Displaying: {filteredLessons.length}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/admin/manage-lesson/create")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                background: theme.palette.primary.main,
                "&:hover": {
                  background: theme.palette.primary.dark,
                },
              }}
            >
              Add New Lesson
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                      "&:hover": {
                        backgroundColor: "#fff",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  label="Difficulty"
                >
                  <MenuItem value="all">All Difficulties</MenuItem>
                  {difficulties.map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                  InputProps={{
                    startAdornment: (
                      <SortIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      onClick={() => {
                        if (sortBy === option.value) {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }
                      }}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({sortDirection === 'asc' ? '↑' : '↓'})
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {sortedAndFilteredLessons.map((lesson) => (
                <Grid item key={lesson.id} xs={12} md={6} lg={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                      cursor: "pointer",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <Box
                      sx={{
                        height: 160,
                        backgroundColor: "grey.100",
                        backgroundImage: `url(${lesson.imageUrl || "/default-lesson-image.jpg"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box 
                      sx={{ 
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={lesson.difficulty}
                          size="small"
                          sx={{
                            mr: 1,
                            backgroundColor: 
                              lesson.difficulty === "Basic" ? "#e3f2fd" :
                              lesson.difficulty === "Intermediate" ? "#fff3e0" : "#fbe9e7",
                            color:
                              lesson.difficulty === "Basic" ? "#1976d2" :
                              lesson.difficulty === "Intermediate" ? "#f57c00" : "#d32f2f",
                          }}
                        />
                        <Chip
                          label={lesson.category}
                          size="small"
                          sx={{ backgroundColor: "#f5f5f5" }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          minHeight: '3em',
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {lesson.title}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          minHeight: '3em',
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          mb: 2,
                        }}
                      >
                        {lesson.description}
                      </Typography>

                      <Box 
                        sx={{ 
                          mt: 'auto',
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={lesson.teacher.avatar}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {lesson.teacher.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.duration}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          display="block"
                        >
                          Updated: {new Date(lesson.updatedAt).toLocaleDateString('en-US')}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0}>
              {sortedAndFilteredLessons.map((lesson) => (
                <Box
                  key={lesson.id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Box
                        sx={{
                          height: 100,
                          borderRadius: 1,
                          backgroundColor: "grey.100",
                          backgroundImage: `url(${lesson.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {lesson.title}
                      </Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                        {lesson.description}
                      </Typography>
                      <Box>
                        <Chip
                          label={lesson.difficulty}
                          size="small"
                          sx={{
                            mr: 1,
                            backgroundColor: 
                              lesson.difficulty === "Basic" ? "#e3f2fd" :
                              lesson.difficulty === "Intermediate" ? "#fff3e0" : "#fbe9e7",
                            color:
                              lesson.difficulty === "Basic" ? "#1976d2" :
                              lesson.difficulty === "Intermediate" ? "#f57c00" : "#d32f2f",
                          }}
                        />
                        <Chip
                          label={lesson.category}
                          size="small"
                          sx={{ backgroundColor: "#f5f5f5" }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
                          <Avatar
                            src={lesson.teacher.avatar}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {lesson.teacher.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {lesson.duration}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Updated: {new Date(lesson.updatedAt).toLocaleDateString('en-US')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>
          )}

          {filteredLessons.length === 0 && (
            <Paper
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                mt: 4,
                borderRadius: 2,
                backgroundColor: "white",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  mb: 2,
                }}
              >
                No lessons found
              </Typography>
              <Typography color="text.secondary">
                Try changing filters or searching with a different keyword
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </AdminLayout>
  );
}

export default ManageLessonPage; 