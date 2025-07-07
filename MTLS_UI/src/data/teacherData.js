// Dữ liệu giáo viên
export const teacherProfiles = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    specialization: 'Piano, Lý thuyết âm nhạc',
    experience: '5 năm',
    avatar: '',
    bio: 'Giáo viên dạy đàn Piano và Lý thuyết âm nhạc với 5 năm kinh nghiệm giảng dạy. Tốt nghiệp Học viện Âm nhạc Huế. Chuyên sâu về kỹ thuật biểu diễn và phân tích tác phẩm.',
    courses: [
      { id: 101, name: 'Nhập môn Lý thuyết âm nhạc' },
      { id: 102, name: 'Piano cơ bản' },
      { id: 103, name: 'Đọc & ghi nhạc nâng cao' }
    ]
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0987654321',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    specialization: 'Violin, Sáng tác nhạc',
    experience: '8 năm',
    avatar: '',
    bio: 'Giáo viên dạy Violin và Sáng tác nhạc với 8 năm kinh nghiệm. Tốt nghiệp Nhạc viện TPHCM. Từng biểu diễn tại nhiều sân khấu lớn trong và ngoài nước.',
    courses: [
      { id: 201, name: 'Violin cơ bản' },
      { id: 202, name: 'Sáng tác nhạc hiện đại' },
      { id: 203, name: 'Hòa âm phối khí' }
    ]
  }
];

// Dữ liệu thông báo
export const notificationData = [
  {
    id: 1,
    title: 'Bài tập mới',
    content: 'Học sinh Nguyễn Văn Nam đã nộp bài tập Phân tích tác phẩm "Clair de Lune"',
    time: '2 phút trước',
    type: 'info',
    read: false,
    courseId: 101,
    studentId: 501
  },
  {
    id: 2,
    title: 'Cảnh báo',
    content: 'Bài học "Âm giai và điệu thức" sắp đến hạn cần cập nhật',
    time: '1 giờ trước',
    type: 'warning',
    read: false,
    courseId: 101,
    lessonId: 301
  },
  {
    id: 3,
    title: 'Thành công',
    content: 'Đã tạo bài học "Hợp âm 7" thành công',
    time: '2 giờ trước',
    type: 'success',
    read: true,
    courseId: 101,
    lessonId: 302
  },
  {
    id: 4,
    title: 'Thông báo hệ thống',
    content: 'Hệ thống sẽ nâng cấp tính năng sáng tác nhạc vào ngày mai',
    time: '1 ngày trước',
    type: 'info',
    read: true,
    systemNotice: true
  },
  {
    id: 5,
    title: 'Bài tập mới',
    content: 'Học sinh Lê Thị Hương đã nộp bài tập Chơi gam C Major',
    time: '1 ngày trước',
    type: 'info',
    read: true,
    courseId: 102,
    studentId: 502
  },
  {
    id: 6,
    title: 'Cập nhật khóa học',
    content: 'Khóa học "Piano cơ bản" đã được cập nhật nội dung mới',
    time: '2 ngày trước',
    type: 'success',
    read: true,
    courseId: 102
  }
];

// Dữ liệu chi tiết học sinh
export const studentDetails = [
  {
    id: 501,
    name: 'Nguyễn Văn Nam',
    email: 'nguyenvannam@example.com',
    avatar: '',
    enrolledCourses: [101, 102],
    progress: {
      101: 68, // phần trăm hoàn thành khóa học
      102: 42
    }
  },
  {
    id: 502,
    name: 'Lê Thị Hương',
    email: 'lethihuong@example.com',
    avatar: '',
    enrolledCourses: [102, 203],
    progress: {
      102: 75,
      203: 30
    }
  }
];

// Dữ liệu chi tiết bài học
export const lessonDetails = [
  {
    id: 301,
    title: 'Âm giai và điệu thức',
    courseId: 101,
    content: 'Nội dung bài học về âm giai và điệu thức...',
    dueDate: '2023-06-15',
    materials: [
      { name: 'Slide âm giai.pdf', url: '/materials/slide-am-giai.pdf' },
      { name: 'Bảng điệu thức.jpeg', url: '/materials/bang-dieu-thuc.jpeg' }
    ]
  },
  {
    id: 302,
    title: 'Hợp âm 7',
    courseId: 101,
    content: 'Nội dung bài học về hợp âm 7...',
    dueDate: null,
    materials: [
      { name: 'Lý thuyết hợp âm 7.pdf', url: '/materials/ly-thuyet-hop-am-7.pdf' },
      { name: 'Bài tập hợp âm 7.doc', url: '/materials/bai-tap-hop-am-7.doc' }
    ]
  }
]; 