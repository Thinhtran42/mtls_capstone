// Mock data for assignments
const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    studentId: 1,
    studentName: "Nguyễn Văn A",
    courseId: 1,
    courseName: "Cơ bản về Lý thuyết Âm nhạc",
    moduleId: 1,
    moduleName: "Các khái niệm cơ bản",
    sectionId: 4,
    sectionName: "Assignment: Music Staff",
    submissionTitle: "Bản vẽ khuông nhạc",
    submissionDescription: "Em đã hoàn thành bài tập vẽ khuông nhạc và xác định các nốt",
    submissionDate: "2023-05-15T14:30:00Z",
    fileUrl: "https://example.com/files/assignment1.pdf",
    fileName: "assignment1.pdf",
    fileType: "application/pdf",
    status: "pending", // pending, reviewed
    teacherComment: "",
    score: 0,
    aiScore: 8.5,
    aiFeedback: "Bài làm tốt, chỉ cần chú ý thêm về việc đặt các nốt nhạc chính xác hơn trên khuông nhạc."
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Trần Thị B",
    courseId: 1,
    courseName: "Cơ bản về Lý thuyết Âm nhạc",
    moduleId: 1,
    moduleName: "Các khái niệm cơ bản",
    sectionId: 4,
    sectionName: "Assignment: Music Staff",
    submissionTitle: "Bài tập khuông nhạc",
    submissionDescription: "Em nộp bài tập về khuông nhạc và các nốt trên dòng kẻ",
    submissionDate: "2023-05-16T09:45:00Z",
    fileUrl: "https://example.com/files/assignment2.jpg",
    fileName: "assignment2.jpg",
    fileType: "image/jpeg",
    status: "reviewed",
    teacherComment: "Bài làm tốt, cần chú ý hơn về khoảng cách giữa các nốt.",
    score: 8.5,
    aiScore: 7.5,
    aiFeedback: "Bài làm khá tốt, nhưng cần cải thiện về cách vẽ nốt nhạc và khoảng cách."
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Phạm Văn C",
    courseId: 1,
    courseName: "Cơ bản về Lý thuyết Âm nhạc",
    moduleId: 2,
    moduleName: "Ký hiệu âm nhạc",
    sectionId: 3,
    sectionName: "Assignment: Rhythm Notation",
    submissionTitle: "Bài tập nhịp điệu",
    submissionDescription: "Em nộp bài tập về ký hiệu nhịp điệu và các loại nốt",
    submissionDate: "2023-05-17T11:20:00Z",
    fileUrl: "https://example.com/files/assignment3.pdf",
    fileName: "assignment3.pdf",
    fileType: "application/pdf",
    status: "pending",
    teacherComment: "",
    score: 0,
    aiScore: 9.0,
    aiFeedback: "Bài làm rất tốt, thể hiện sự hiểu biết về các ký hiệu nhịp điệu. Chỉ cần chú ý một chút về việc viết các dấu lặng."
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Lê Thị D",
    courseId: 2,
    courseName: "Piano cơ bản",
    moduleId: 1,
    moduleName: "Làm quen với đàn Piano",
    sectionId: 5,
    sectionName: "Assignment: Basic Piano Scales",
    submissionTitle: "Bài tập thang âm",
    submissionDescription: "Em đã thực hành các thang âm cơ bản trên đàn piano và ghi lại",
    submissionDate: "2023-05-18T15:10:00Z",
    fileUrl: "https://example.com/files/assignment4.mp3",
    fileName: "assignment4.mp3",
    fileType: "audio/mpeg",
    status: "reviewed",
    teacherComment: "Phần thực hành thang âm tốt, nhưng cần chú ý tốc độ đều hơn.",
    score: 8.0,
    aiScore: 7.0,
    aiFeedback: "Thực hiện khá tốt các thang âm, nhưng cần luyện tập thêm để đạt được tốc độ đều và chính xác hơn."
  },
  {
    id: 5,
    studentId: 5,
    studentName: "Hoàng Văn E",
    courseId: 2,
    courseName: "Piano cơ bản",
    moduleId: 2,
    moduleName: "Kỹ thuật cơ bản",
    sectionId: 4,
    sectionName: "Assignment: Basic Piano Exercise",
    submissionTitle: "Bài tập kỹ thuật",
    submissionDescription: "Em đã thực hành các bài tập kỹ thuật cơ bản và ghi lại",
    submissionDate: "2023-05-19T10:30:00Z",
    fileUrl: "https://example.com/files/assignment5.mp4",
    fileName: "assignment5.mp4",
    fileType: "video/mp4",
    status: "pending",
    teacherComment: "",
    score: 0,
    aiScore: 8.5,
    aiFeedback: "Kỹ thuật tốt, tư thế đánh đàn đúng. Cần chú ý thêm về việc sử dụng pedal và legato."
  }
];

/**
 * Service to handle assignment data and operations
 */
class AssignmentService {
  constructor() {
    // Initialize with mock data or fetch from localStorage if available
    const savedAssignments = localStorage.getItem('assignments');
    this.assignments = savedAssignments ? JSON.parse(savedAssignments) : MOCK_ASSIGNMENTS;
  }

  /**
   * Get all assignments
   * @returns {Array} List of all assignments
   */
  getAllAssignments() {
    return this.assignments;
  }

  /**
   * Get assignments by status
   * @param {string} status - 'pending' or 'reviewed'
   * @returns {Array} Filtered assignments
   */
  getAssignmentsByStatus(status) {
    return this.assignments.filter(assignment => assignment.status === status);
  }

  /**
   * Get assignments by course
   * @param {number} courseId - Course ID
   * @returns {Array} Filtered assignments
   */
  getAssignmentsByCourse(courseId) {
    return this.assignments.filter(assignment => assignment.courseId === courseId);
  }

  /**
   * Get assignments by student
   * @param {number} studentId - Student ID
   * @returns {Array} Filtered assignments
   */
  getAssignmentsByStudent(studentId) {
    return this.assignments.filter(assignment => assignment.studentId === studentId);
  }

  /**
   * Get assignment by ID
   * @param {number} id - Assignment ID
   * @returns {Object} Assignment
   */
  getAssignmentById(id) {
    return this.assignments.find(assignment => assignment.id === id);
  }

  /**
   * Save teacher's review for an assignment
   * @param {number} id - Assignment ID
   * @param {Object} reviewData - Review data
   * @returns {Object} Updated assignment
   */
  saveReview(id, reviewData) {
    const index = this.assignments.findIndex(assignment => assignment.id === id);
    if (index === -1) {
      throw new Error('Assignment not found');
    }

    // Update assignment
    this.assignments[index] = {
      ...this.assignments[index],
      teacherComment: reviewData.teacherComment || '',
      score: reviewData.score || 0,
      status: 'reviewed'
    };

    // Save to localStorage
    this._saveToLocalStorage();

    return this.assignments[index];
  }

  /**
   * Get summary statistics for assignments
   * @returns {Object} Statistics
   */
  getStatistics() {
    const total = this.assignments.length;
    const pending = this.assignments.filter(a => a.status === 'pending').length;
    const reviewed = this.assignments.filter(a => a.status === 'reviewed').length;
    
    // Calculate average scores
    const teacherScores = this.assignments
      .filter(a => a.status === 'reviewed')
      .map(a => a.score);
    
    const aiScores = this.assignments.map(a => a.aiScore);
    
    const avgTeacherScore = teacherScores.length > 0 
      ? teacherScores.reduce((sum, score) => sum + score, 0) / teacherScores.length 
      : 0;
    
    const avgAiScore = aiScores.length > 0 
      ? aiScores.reduce((sum, score) => sum + score, 0) / aiScores.length 
      : 0;

    return {
      total,
      pending,
      reviewed,
      avgTeacherScore,
      avgAiScore
    };
  }

  /**
   * Add a new assignment
   * @param {Object} assignment - Assignment object
   * @returns {Object} New assignment
   */
  addAssignment(assignment) {
    const newId = Math.max(...this.assignments.map(a => a.id)) + 1;
    const newAssignment = {
      ...assignment,
      id: newId,
      status: 'pending',
      teacherComment: '',
      score: 0
    };

    this.assignments.push(newAssignment);
    this._saveToLocalStorage();
    return newAssignment;
  }

  /**
   * Delete an assignment
   * @param {number} id - Assignment ID
   * @returns {boolean} Success
   */
  deleteAssignment(id) {
    const initialLength = this.assignments.length;
    this.assignments = this.assignments.filter(assignment => assignment.id !== id);
    
    if (this.assignments.length < initialLength) {
      this._saveToLocalStorage();
      return true;
    }
    return false;
  }

  /**
   * Save assignments to localStorage
   * @private
   */
  _saveToLocalStorage() {
    localStorage.setItem('assignments', JSON.stringify(this.assignments));
  }
}

export default new AssignmentService(); 