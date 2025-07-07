import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const LessonContext = createContext();

const mockLessons = [
  {
    id: "1",
    title: "Các nốt nhạc cơ bản và bố cục khuông nhạc",
    description: "Tìm hiểu về các nốt nhạc, vị trí của chúng trên khuông nhạc và cách đọc nốt nhạc cơ bản.",
    category: "Nhạc lý cơ bản",
    difficulty: "Cơ bản",
    imageUrl: "https://product.hstatic.net/200000605423/product/box_dvd_nhac_ly_d02a35fb4fbb4061bcff3a1c35bd0a35_master.png",
    duration: "45 phút",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15",
    content: `
# Bài học về các nốt nhạc cơ bản

## 1. Khuông nhạc
Khuông nhạc gồm 5 dòng kẻ và 4 khoảng trống...

## 2. Các nốt nhạc
- Nốt tròn (whole note)
- Nốt trắng (half note)
- Nốt đen (quarter note)
...

## 3. Vị trí các nốt
Các nốt được đặt trên các dòng kẻ hoặc khoảng trống...
    `,
    requirements: "Không yêu cầu kiến thức âm nhạc trước đó",
    objectives: [
      "Hiểu được cấu tạo của khuông nhạc",
      "Nhận biết được các loại nốt nhạc cơ bản",
      "Đọc được vị trí của các nốt trên khuông nhạc"
    ],
    teacher: {
      id: 2,
      name: "Huỳnh Nhất Thiên Hoàng",
      email: "hoanghnts.e160248@fpt.edu.vn",
      role: "Giáo viên",
      avatar: "https://i.pravatar.cc/150?img=2",
    }
  },
  // ... copy các mockLessons khác từ ManageLesson.jsx
];

export function LessonProvider({ children }) {
  const [lessons, setLessons] = useState(mockLessons);

  const getLessonById = (id) => {
    return lessons.find(lesson => lesson.id === id);
  };

  const createLesson = (newLesson) => {
    setLessons([...lessons, { ...newLesson, id: String(lessons.length + 1) }]);
  };

  const updateLesson = (updatedLesson) => {
    setLessons(lessons.map(lesson => 
      lesson.id === updatedLesson.id ? updatedLesson : lesson
    ));
  };

  const deleteLesson = (id) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  return (
    <LessonContext.Provider value={{ 
      lessons, 
      getLessonById,
      createLesson,
      updateLesson,
      deleteLesson
    }}>
      {children}
    </LessonContext.Provider>
  );
}

LessonProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLessons = () => useContext(LessonContext); 