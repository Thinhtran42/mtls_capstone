/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  Modal,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { courseService, moduleService, discussionService, discussionReplyService, userService } from '../../api'

// Function to check if an ID is a valid MongoDB ObjectID
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(String(id));
};

// Sample data for discussions
const sampleDiscussions = {
  'module-1': [
    {
      id: 1,
      user: 'Alice Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      title: 'Question about basic rhythm patterns',
      content:
        'Can someone explain the difference between 3/4 and 6/8 time signatures?',
      timestamp: '2024-03-10T10:30:00',
      replies: [
        {
          id: 11,
          user: 'David Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          content:
            '3/4 has three quarter note beats per measure, while 6/8 has six eighth note beats grouped into two.',
          timestamp: '2024-03-10T11:00:00',
        },
      ],
      module: 'Module 1: Music Fundamentals',
    },
    {
      id: 2,
      user: 'Bob Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      title: 'Help with note reading',
      content: `I'm struggling with reading notes on the bass clef. Any tips?`,
      timestamp: '2024-03-09T15:20:00',
      replies: [],
      module: 'Module 1: Music Fundamentals',
    },
  ],
  'module-2': [
    {
      id: 3,
      user: 'Carol Martinez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
      title: 'Chord progression practice',
      content:
        'What are some good exercises for practicing common chord progressions?',
      timestamp: '2024-03-08T09:15:00',
      replies: [
        {
          id: 31,
          user: 'Emma Davis',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
          content: 'Try practicing the I-IV-V-I progression in different keys.',
          timestamp: '2024-03-08T10:00:00',
        },
      ],
      module: 'Module 2: Harmony Basics',
    },
  ],
}

const CreatePostModal = ({
  open,
  handleClose,
  currentModule,
  handleCreateNewPost,
  modules,
}) => {
  const [content, setContent] = useState('')
  const [selectedModule, setSelectedModule] = useState(currentModule)

  useEffect(() => {
    // Update selectedModule when currentModule changes
    if (currentModule) {
      setSelectedModule(currentModule);
    }
  }, [currentModule]);

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return

    // Prepare data for API
    const newPostData = {
      moduleId: selectedModule,
      content: content.trim(),
    }

    // Call function to create new post
    handleCreateNewPost(newPostData)

    // Reset form
    setContent('')
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='create-post-modal'
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '70%', md: '50%' },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h6'>Create New Post</Typography>
          <IconButton
            onClick={handleClose}
            size='small'
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormControl
            fullWidth
            sx={{ mb: 3 }}
          >
            <InputLabel>Module</InputLabel>
            <Select
              value={selectedModule}
              label='Module'
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              {modules.map((module) => (
                <MenuItem key={module._id} value={module._id}>
                  {module.title || `Module`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label='Content'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 3 }}
            required
            placeholder='Enter your post content...'
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant='outlined'
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              type='submit'
            >
              Post
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}

const DiscussionPage = () => {
  const { courseId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentModule, setCurrentModule] = useState(null)
  const [discussions, setDiscussions] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState({
    id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('fullname') || 'Current User',
  })
  const [userCache, setUserCache] = useState({}); // Cache to store user information

  // Save currentModule to localStorage
  useEffect(() => {
    if (currentModule) {
      localStorage.setItem('currentModule', currentModule);
    }
  }, [currentModule]);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        let selectedCourse = null;

        // Check if courseId is a valid ObjectID
        if (isValidObjectId(courseId)) {
          // If it's an ObjectID, get the course directly by ID
          const courseResponse = await courseService.getCourseById(courseId);
          selectedCourse = courseResponse?.data;
        } else {
          // If not an ObjectID (could be an index), use the old method
          const coursesResponse = await courseService.getAllCourses();
          const courses = coursesResponse?.data || [];
          selectedCourse = courses[parseInt(courseId) - 1];
        }

        if (!selectedCourse) {
          setError('Course not found');
          return;
        }

        setCurrentCourse(selectedCourse);

        // Get modules for the course
        const modulesResponse = await moduleService.getModulesByCourse(selectedCourse._id);
        const moduleData = modulesResponse?.data || [];
        setModules(moduleData);

        // Get module from localStorage or set default module
        const savedModuleId = localStorage.getItem('currentModule');
        let initialModule = null;

        if (savedModuleId && moduleData.some(m => m._id === savedModuleId)) {
          // If there's a saved module and it belongs to the current course
          initialModule = savedModuleId;
        } else if (moduleData.length > 0) {
          // Default to the first module
          initialModule = moduleData[0]._id;
        }

        if (initialModule) {
          setCurrentModule(initialModule);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Unable to load course data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Function to get discussions by module
  const fetchDiscussionsForModule = async (moduleId) => {
    if (!moduleId) return;

    try {
      console.log("Fetching discussions for moduleId:", moduleId);
      const response = await discussionService.getDiscussionsByModule(moduleId);
      console.log("API response:", response); // Log entire response from API

      // Reset discussions array
      let discussionData = [];

      // Get data from response according to actual API structure
      if (response?.data?.discussions && Array.isArray(response.data.discussions)) {
        // API structure: { data: { discussions: [...] } }
        discussionData = response.data.discussions;
        console.log("Found discussions in response.data.discussions", discussionData);
      } else if (response?.data?.data?.discussions && Array.isArray(response.data.data.discussions)) {
        // Different API structure: { data: { data: { discussions: [...] } } }
        discussionData = response.data.data.discussions;
        console.log("Found discussions in response.data.data.discussions", discussionData);
      } else if (Array.isArray(response?.data)) {
        // Simple API structure: { data: [...] }
        discussionData = response.data;
        console.log("Found discussions in response.data array", discussionData);
      }

      console.log("Extracted discussion data:", discussionData);
      console.log("Discussions data length:", discussionData.length);

      // Process discussion data
      let processedDiscussions = [];

      if (discussionData.length > 0) {
        discussionData.forEach(discussion => {
          console.log("Processing discussion:", discussion);

          // Check required fields
          if (!discussion._id) {
            console.error("Discussion missing _id, skipping:", discussion);
            return;
          }

          // Get student information from discussion
          const student = discussion.studentId || {};
          console.log("Student info:", student);

          // Prepare title from content if not available
          let title = discussion.title || '';
          if (!title && discussion.content) {
            // Use first 30 characters as title
            title = discussion.content.length > 30
              ? discussion.content.substring(0, 30) + '...'
              : discussion.content;
          }

          // Create processed discussion object
          const processedDiscussion = {
            id: discussion._id,
            user: student.fullname || 'Anonymous User',
            avatar: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student._id || 'anonymous'}`,
            title: title,
            content: discussion.content || '',
            timestamp: discussion.createdAt || new Date().toISOString(),
            replies: [],
            module: moduleId,
            studentId: student._id,
            rawData: discussion // Store raw data for debugging
          };

          console.log("Processed discussion:", processedDiscussion);
          processedDiscussions.push(processedDiscussion);
        });
      }

      console.log("Final processed discussions:", processedDiscussions);
      console.log("Processed discussions length:", processedDiscussions.length);

      // Ensure using the correct key as string moduleId
      const moduleKey = typeof moduleId === 'object' ? moduleId._id : moduleId;

      // Update discussions state
      setDiscussions(prev => {
        const newDiscussions = { ...prev };
        newDiscussions[moduleKey] = processedDiscussions;
        console.log("Updated discussions state:", newDiscussions);
        return newDiscussions;
      });

      // Get replies for each discussion
      if (processedDiscussions.length > 0) {
        for (const discussion of processedDiscussions) {
          await fetchRepliesForDiscussion(discussion.id, moduleKey);
        }
      }
    } catch (error) {
      console.error(`Error getting discussions for module ${moduleId}:`, error);
      // Set empty array to avoid errors
      const moduleKey = typeof moduleId === 'object' ? moduleId._id : moduleId;
      setDiscussions(prev => ({
        ...prev,
        [moduleKey]: []
      }));
    }
  };

  // Update useEffect to refetch when module changes
  useEffect(() => {
    if (currentModule) {
      console.log("currentModule changed, fetching discussions for:", currentModule);

      // Make sure using the correct moduleId value
      const moduleIdToFetch = typeof currentModule === 'object' ? currentModule._id : currentModule;

      fetchDiscussionsForModule(moduleIdToFetch);
    }
  }, [currentModule]);

  // Add useEffect to control login state
  useEffect(() => {
    // Check user information from localStorage when component mounts
    const userId = localStorage.getItem('userId');
    const fullname = localStorage.getItem('fullname');

    if (userId && fullname) {
      setCurrentUser({
        id: userId,
        name: fullname
      });
      console.log("Loaded user information from localStorage:", { id: userId, name: fullname });
    } else {
      console.warn("User information not found in localStorage");
    }
  }, []);

  // Add useEffect to check discussions state after it changes
  useEffect(() => {
    if (currentModule) {
      const moduleKey = typeof currentModule === 'object' ? currentModule._id : currentModule;
      console.log(`Checking discussions state after update. Current module: ${moduleKey}`);
      console.log(`Available keys in discussions:`, Object.keys(discussions));
      console.log(`Has data for current module: ${Boolean(discussions[moduleKey])}`);

      if (discussions[moduleKey]) {
        console.log(`Number of discussions for module ${moduleKey}:`, discussions[moduleKey].length);
      }
    }
  }, [discussions, currentModule]);

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching for:', searchQuery)
  }

  const handleCreatePost = () => {
    setIsCreateModalOpen(true)
  }

  const handleModuleChange = (event, newValue) => {
    setCurrentModule(newValue)
  }

  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget)
    setSelectedMessage(message)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedMessage(null)
  }

  const handleCreateNewPost = async (postData) => {
    try {
      // Add studentId to postData
      const fullPostData = {
        moduleId: postData.moduleId,
        content: postData.content,
        student: currentUser.id
      };

      // Call API to create new discussion
      const response = await discussionService.createDiscussion(fullPostData);
      console.log("Create discussion response:", response);

      // Get new discussion data from response
      let newDiscussion = null;
      if (response?.data?.discussion) {
        newDiscussion = response.data.discussion;
      } else if (response?.data) {
        newDiscussion = response.data;
      }

      if (newDiscussion) {
        // Update state with new discussion
        setDiscussions((prev) => {
          const moduleId = postData.moduleId;

          // Create title from content if no title exists
          let title = '';
          if (postData.content) {
            // Use first 30 characters of content as title
            title = postData.content.length > 30
              ? postData.content.substring(0, 30) + '...'
              : postData.content;
          }

          // Create new discussion object
          const discussionObj = {
            id: newDiscussion._id,
            user: currentUser.name,
            avatar: localStorage.getItem('avatar') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
            title: title,
            content: newDiscussion.content,
            timestamp: newDiscussion.createdAt,
            replies: [],
            module: moduleId,
            studentId: currentUser.id,
          };

          return {
      ...prev,
            [moduleId]: prev[moduleId] ? [...prev[moduleId], discussionObj] : [discussionObj],
          };
        });

        // Automatically reload discussions to ensure latest data
        fetchDiscussionsForModule(postData.moduleId);
      }
    } catch (error) {
      console.error('Error creating new discussion:', error);
      // Display error message (could add snackbar/alert here)
    }
  }

  const handleDeletePost = async () => {
    if (selectedMessage) {
      try {
        // Call API to delete discussion
        await discussionService.deleteDiscussion(selectedMessage.id);

        // Remove from state
      const moduleKey = Object.keys(discussions).find((key) =>
        discussions[key].some((msg) => msg.id === selectedMessage.id)
        );

      if (moduleKey) {
        setDiscussions((prev) => ({
          ...prev,
          [moduleKey]: prev[moduleKey].filter(
            (msg) => msg.id !== selectedMessage.id
          ),
          }));
        }
      } catch (error) {
        console.error(`Error deleting discussion ID ${selectedMessage.id}:`, error);
        // Display error message (could add snackbar/alert here)
      }
    }
    handleMenuClose();
  }

  const handleReply = async (messageId, replyContent) => {
    try {
      console.log("Sending reply for post ID:", messageId);
      console.log("Reply content:", replyContent);

      // Check input data
      if (!messageId || !replyContent.trim()) {
        console.error("Missing post information or reply content");
        return;
      }

      // Check current user
      if (!currentUser || !currentUser.id) {
        console.error("No current user information");
        alert("Please log in to send a reply");
        return;
      }

      // Create data for reply
      const replyData = {
        discussionId: messageId,
        content: replyContent,
        student: currentUser.id,
      };

      console.log("Reply data being sent:", replyData);

      // Call API to create reply
      const response = await discussionReplyService.createReply(replyData);

      // Log API result
      console.log("Reply creation API result:", response);

      const newReply = response?.data;

      if (newReply) {
        console.log("New reply created:", newReply);

        // Find module and message to add reply to
        const moduleKey = Object.keys(discussions).find((key) =>
          discussions[key].some((msg) => msg.id === messageId)
        );

        if (moduleKey) {
          // Create new reply object with complete data
          const replyObj = {
            id: newReply._id || newReply.id,
            user: currentUser.name || localStorage.getItem('fullname') || 'Current User',
            avatar: localStorage.getItem('avatar') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
            content: replyContent,
            timestamp: newReply.createdAt || new Date().toISOString(),
            studentId: currentUser.id,
          };

          console.log("Reply object to display:", replyObj);

          // Update state
          setDiscussions((prev) => {
            const updatedDiscussions = { ...prev };

            // Find and update post with new reply
            if (updatedDiscussions[moduleKey]) {
              updatedDiscussions[moduleKey] = updatedDiscussions[moduleKey].map((msg) => {
                if (msg.id === messageId) {
                  return {
                    ...msg,
                    replies: [...(msg.replies || []), replyObj],
                  };
                }
                return msg;
              });
            }

            return updatedDiscussions;
          });

          // Reload replies to ensure latest data
          setTimeout(() => {
            fetchRepliesForDiscussion(messageId, moduleKey);
          }, 500);

          console.log(`Added new reply to discussion ${messageId}`);
        } else {
          console.error("Module containing post ID not found:", messageId);
        }
      } else {
        console.error("No new reply data received from API");
      }
    } catch (error) {
      console.error(`Error creating reply for discussion ID ${messageId}:`, error);
      alert("An error occurred while sending your reply. Please try again later.");
    }
  }

  // Update the function to get replies for clarity
  const fetchRepliesForDiscussion = async (discussionId, moduleId) => {
    try {
      console.log(`Getting replies for discussion ${discussionId} of module ${moduleId}`);

      // Check input parameters
      if (!discussionId) {
        console.error("No discussionId to get replies");
        return;
      }

      // Call API to get replies
      const response = await discussionReplyService.getRepliesByDiscussion(discussionId);
      console.log(`Replies API response:`, response);

      // Process data from API - Thoroughly check JSON structure
      let repliesData = [];

      // Check all possible data structures
      if (response?.data?.data?.replies && Array.isArray(response.data.data.replies)) {
        // Structure { data: { data: { replies: [...] } } }
        repliesData = response.data.data.replies;
        console.log(`Found replies in response.data.data.replies:`, repliesData);
      } else if (response?.data?.replies && Array.isArray(response.data.replies)) {
        // Structure { data: { replies: [...] } }
        repliesData = response.data.replies;
        console.log(`Found replies in response.data.replies array:`, repliesData);
      } else if (Array.isArray(response?.data)) {
        // Structure { data: [...] }
        repliesData = response.data;
        console.log(`Found replies in response.data array:`, repliesData);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Structure { data: { data: [...] } }
        repliesData = response.data.data;
        console.log(`Found replies in response.data.data array:`, repliesData);
      } else {
        // Check if it's a reply array
        console.log("Checking reply data structure:", response?.data);

        // Clearly check each property
        for (const key in response?.data) {
          console.log(`Property ${key}:`, response.data[key]);
          if (Array.isArray(response.data[key])) {
            repliesData = response.data[key];
            console.log(`Found reply array in property ${key}:`, repliesData);
            break;
          }
        }
      }

      // Check if no reply data exists
      if (!repliesData || repliesData.length === 0) {
        console.log(`No replies for discussion ${discussionId}`);

        // Update state with empty array if no replies
        const moduleKey = typeof moduleId === 'object' ? moduleId._id : moduleId;

        setDiscussions(prev => {
          const newDiscussions = { ...prev };
          if (newDiscussions[moduleKey]) {
            const discussionIndex = newDiscussions[moduleKey].findIndex(d => d.id === discussionId);
            if (discussionIndex !== -1) {
              newDiscussions[moduleKey][discussionIndex].replies = [];
            }
          }
          return newDiscussions;
        });

        return;
      }

      console.log(`Extracted replies data (${repliesData.length} items):`, repliesData);

      // Process replies data
      let processedReplies = [];

      if (repliesData.length > 0) {
        // Create array of promises to get user information
        const replyPromises = repliesData.map(async (reply) => {
          console.log("Processing reply:", reply);

          // Check required fields - support both _id and id
          const replyId = reply._id || reply.id;
          if (!replyId) {
            console.error("Reply missing ID, skipping:", reply);
            return null;
          }

          // Get user information from API data
          let student = null;

          // Check if reply contains complete student information
          if (reply.studentId && typeof reply.studentId === 'object' && (reply.studentId._id || reply.studentId.id)) {
            student = reply.studentId;
            console.log("Found complete student info in reply.studentId:", student);
          } else if (reply.student && typeof reply.student === 'object' && (reply.student._id || reply.student.id)) {
            student = reply.student;
            console.log("Found complete student info in reply.student:", student);
          } else {
            // If only student ID, get student info from API
            const studentId =
              (reply.studentId && typeof reply.studentId === 'object') ? (reply.studentId._id || reply.studentId.id) :
              (reply.student && typeof reply.student === 'object') ? (reply.student._id || reply.student.id) :
              reply.studentId || reply.student;

            if (studentId && typeof studentId === 'string') {
              console.log(`Fetching student info for ID: ${studentId}`);

              // Check cache before calling API
              if (userCache[studentId]) {
                student = userCache[studentId];
                console.log("Using cached student info:", student);
              } else {
                try {
                  const studentResponse = await userService.getUserById(studentId);
                  console.log("Student API response:", studentResponse);

                  if (studentResponse?.data) {
                    student = studentResponse.data;

                    // Save to cache for reuse
                    setUserCache(prev => ({
                      ...prev,
                      [studentId]: student
                    }));

                    console.log("Fetched student info:", student);
                  }
                } catch (error) {
                  console.error(`Error getting student information ID ${studentId}:`, error);
                }
              }
            } else {
              console.log("No valid studentId found in reply:", reply);
            }
          }

          // Validate timestamp - use possible fields: createdAt, timestamp, updatedAt
          let timestamp = reply.createdAt || reply.timestamp || reply.updatedAt || new Date().toISOString();
          try {
            // Check timestamp validity
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
              console.warn("Invalid timestamp in reply:", timestamp);
              timestamp = new Date().toISOString(); // Use current time if invalid
            }
          } catch (e) {
            console.error("Error validating timestamp:", e);
            timestamp = new Date().toISOString();
          }

          // Use student information to create reply object
          const processedReply = {
            id: replyId,
            user: student?.fullname || 'Anonymous User',
            // Prioritize avatar from API
            avatar: student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?._id || student?.id || 'anonymous-reply'}`,
            content: reply.content || '',
            timestamp: timestamp,
            studentId: student?._id || student?.id || null,
            rawData: reply // Store raw data for debugging
          };

          console.log("Processed reply:", processedReply);
          return processedReply;
        });

        // Wait for all promises to complete
        const results = await Promise.all(replyPromises);
        // Filter out null elements (if any)
        processedReplies = results.filter(r => r !== null);
      }

      console.log(`Final processed replies (${processedReplies.length} items):`, processedReplies);

      // Ensure using correct moduleId key
      const moduleKey = typeof moduleId === 'object' ? moduleId._id : moduleId;

      // Update replies in corresponding discussion
      setDiscussions(prev => {
        console.log("Current discussions state before reply update:", prev);

        // Create copy for update
        const newDiscussions = { ...prev };

        // Check if this module is in state
        if (newDiscussions[moduleKey]) {
          console.log(`Found discussions for module ${moduleKey}, updating replies`);

          // Find discussion to update
          const discussionIndex = newDiscussions[moduleKey].findIndex(d => d.id === discussionId);

          if (discussionIndex !== -1) {
            console.log(`Found discussion at index ${discussionIndex}, updating with ${processedReplies.length} replies`);
            newDiscussions[moduleKey][discussionIndex].replies = processedReplies;
          } else {
            console.log(`Discussion with ID ${discussionId} not found in module ${moduleKey}`);
          }
        } else {
          console.log(`No discussions found for module ${moduleKey}`);
        }

        return newDiscussions;
      });
    } catch (error) {
      console.error(`Error getting replies for discussion ${discussionId}:`, error);
    }
  };

  // Component to display messages and replies
  const MessageCard = ({ message }) => {
    const [reply, setReply] = useState('')
    const [showReplyInput, setShowReplyInput] = useState(false)

    const handleReplySubmit = () => {
      if (reply.trim()) {
        // Call API to create reply
        handleReply(message.id, reply.trim())
        // Reset form
        setReply('')
        // Hide input form
        setShowReplyInput(false)
      }
    }

    // Format timestamp
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Undefined';

      try {
        // Check timestamp validity
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.error("Invalid date:", timestamp);
          return 'Invalid date';
        }

        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error("Error formatting date:", timestamp, e);
        return 'Date formatting error';
      }
    };

    // Function to display reply form
    const toggleReplyInput = () => {
      console.log("Reply button clicked, current state:", showReplyInput);
      setShowReplyInput(prevState => !prevState);
    };

    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          transition: 'box-shadow 0.3s',
          '&:hover': { boxShadow: 3 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={message.avatar}
              alt={message.user}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: '1rem', color: '#333' }}
              >
                {message.user}
              </Typography>
              <Typography
                variant='caption'
                sx={{ color: '#666' }}
              >
                {formatDate(message.timestamp)}
              </Typography>
            </Box>
          </Box>

          <IconButton
            size='small'
            onClick={(e) => handleMenuOpen(e, message)}
          >
            <MoreVertIcon fontSize='small' />
          </IconButton>
        </Box>

        <Typography
          sx={{
            mb: 2,
            color: '#333',
            whiteSpace: 'pre-wrap',
            fontSize: '1rem',
            lineHeight: 1.6
          }}
        >
          {message.content}
        </Typography>

        {message.replies && message.replies.length > 0 && (
          <Box sx={{ mt: 3, pl: 2, borderLeft: '3px solid #e0e0e0' }}>
            <Typography
              variant='subtitle2'
              sx={{ mb: 2, color: '#666' }}
            >
              {message.replies.length}{' '}
              {message.replies.length === 1 ? 'Reply' : 'Replies'}
            </Typography>

            {message.replies.map((reply) => (
              <Box
                key={reply.id}
                sx={{ mb: 2, display: 'flex', gap: 2 }}
              >
                <Avatar
                  src={reply.avatar}
                  alt={reply.user}
                  sx={{ width: 32, height: 32 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography
                      sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                    >
                      {reply.user}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: '#666' }}
                    >
                      {formatDate(reply.timestamp)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', mt: 0.5, lineHeight: 1.5 }}>
                    {reply.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {showReplyInput ? (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size='small'
              placeholder='Write your reply...'
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              multiline
              rows={2}
              variant='outlined'
              autoFocus
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant='contained'
                size='small'
                onClick={handleReplySubmit}
                disabled={!reply.trim()}
                sx={{ minWidth: 'auto' }}
              >
                <SendIcon fontSize='small' />
              </Button>
              <Button
                variant='outlined'
                size='small'
                onClick={toggleReplyInput}
                sx={{ minWidth: 'auto' }}
              >
                <CloseIcon fontSize='small' />
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            size='small'
            onClick={toggleReplyInput}
            sx={{ mt: 1 }}
            startIcon={<SendIcon fontSize='small' />}
          >
            Reply
          </Button>
        )}
      </Paper>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', width: '80vw' }}>
      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography
          variant='h4'
          gutterBottom
          sx={{ fontWeight: 600, color: '#333', mb: 3 }}
        >
          Discussion Forums - {currentCourse?.title || 'Course'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <TextField
            placeholder='Search discussions...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant='outlined'
            size='small'
            sx={{ width: { xs: '100%', sm: '70%', md: '50%' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => setSearchQuery('')}
                  >
                    <CloseIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />

          <Button
            variant='contained'
            onClick={handleCreatePost}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              backgroundColor: '#1976d2',
            }}
          >
            Create Post
          </Button>
        </Box>

        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Button
            variant='contained'
            fullWidth
            onClick={handleCreatePost}
            sx={{ backgroundColor: '#1976d2' }}
          >
            Create Post
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentModule}
            onChange={handleModuleChange}
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              '.MuiTab-root': { textTransform: 'none', fontSize: '0.95rem' },
            }}
          >
            {modules.map((module) => (
              <Tab
                key={module._id}
                label={module.title || 'Module'}
                value={module._id}
              />
            ))}
          </Tabs>
        </Box>

        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentModule && discussions[currentModule] && discussions[currentModule].length > 0 ? (
            // Has data
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Showing {discussions[currentModule].length} posts
              </Typography>
              {discussions[currentModule].map((message) => (
              <MessageCard
                key={message.id}
                message={message}
              />
              ))}
            </>
          ) : (
            // No data
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
              }}
            >
              <Typography
                variant='h6'
                color='text.secondary'
                gutterBottom
              >
                No posts yet
              </Typography>
              <Typography
                color='text.secondary'
                sx={{ mb: 2 }}
              >
                Be the first to start a discussion in this module!
              </Typography>
              <Button
                variant='contained'
                onClick={handleCreatePost}
                sx={{ mt: 2 }}
              >
                Create New Post
              </Button>
            </Box>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDeletePost}>Delete Post</MenuItem>
        </Menu>

        <CreatePostModal
          open={isCreateModalOpen}
          handleClose={() => setIsCreateModalOpen(false)}
          currentModule={currentModule}
          handleCreateNewPost={handleCreateNewPost}
          modules={modules}
        />
      </Container>
    </Box>
  )
}

export default DiscussionPage
