// Hàm tính tổng duration cho exercises
const calculateExerciseDuration = (exercises) => {
  return exercises.reduce((sum, exercise) => sum + exercise.duration, 0)
}

// Hàm tạo đường dẫn cho VexFlow JSON hoặc video (giả định)
const getVexFlowPath = (moduleId, exerciseNumber) => {
  const folders = {
    1: 'co-ban',
    2: 'trung-cap',
    3: 'nang-cao',
  }
  return `/vexflow/${folders[moduleId]}/${exerciseNumber}.json`
}

const getVideoPath = (moduleId, exerciseNumber) => {
  const folders = {
    1: 'co-ban',
    2: 'trung-cap',
    3: 'nang-cao',
  }
  return `/videos/${folders[moduleId]}/${exerciseNumber}.mp4`
}

export const exercises = [
  // Module 1: Cơ bản
  {
    moduleId: 1,
    title: 'Bài tập Cơ bản',
    content: {
      description: 'Các bài tập cơ bản để thực hành kiến thức âm nhạc cơ bản',
      totalDuration: calculateExerciseDuration([
        {
          title: 'Bài tập khuông nhạc và khóa nhạc',
          type: 'exercise',
          duration: 5,
        },
        {
          title: 'Bài tập quy định và số chỉ nhịp',
          type: 'exercise',
          duration: 5,
        },
        { title: 'Bài tập dấu lặng', type: 'exercise', duration: 5 },
        { title: 'Bài tập dấu nối', type: 'exercise', duration: 5 },
        { title: 'Bài tập nhịp', type: 'exercise', duration: 5 },
      ]),
      sections: [
        // Bài tập cho section 0: Các khuông nhạc, khóa nhạc và dòng sổ cái
        {
          lessonTitle: 'Các khuông nhạc, khóa nhạc và dòng sổ cái',
          type: 'exercise',
          duration: 5,
          status: 'complete',
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Khuông nhạc hiện đại có bao nhiêu dòng?',
                options: ['3', '4', '5', '6'],
                correctAnswer: '5',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question:
                  'Khóa Sol biểu thị nốt G trên dòng thứ hai của khuông nhạc.',
                correctAnswer: true,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ khuông nhạc
              data: {
                vexFlowJsonPath: getVexFlowPath(1, '1'), // Đường dẫn tới file JSON VexFlow
                instruction:
                  'Vẽ nốt G trên dòng thứ hai của khuông nhạc bằng VexFlow.',
                correctAnswer: 'G on second line', // Đáp án đúng (có thể là chuỗi mô tả hoặc JSON cụ thể)
              },
            },
            {
              type: 'multipleChoice',
              data: {
                question: 'Khóa Fa được đặt trên dòng kẻ nào của khuông nhạc?',
                options: ['Dòng thứ 2', 'Dòng thứ 3', 'Dòng thứ 4', 'Dòng thứ 5'],
                correctAnswer: 'Dòng thứ 4',
              },
            },
            {
              type: 'vexFlow',
              data: {
                vexFlowJsonPath: getVexFlowPath(1, '2'),
                instruction: 'Nhận diện các nốt nhạc trên khuông nhạc khóa Sol.',
                correctAnswer: 'G, B, D, F',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Khuông nhạc có 5 dòng kẻ và 4 khoảng trống.',
                correctAnswer: true,
              },
            },
          ],
        },
        // Bài tập cho section 1: Các quy định và số chỉ nhịp
        {
          lessonTitle: 'Các quy định và số chỉ nhịp',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Nhịp 4/4 có bao nhiêu nốt đen trong một ô nhịp?',
                options: ['2', '3', '4', '6'],
                correctAnswer: '4',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Nhịp 6/8 chỉ chứa nốt móc đơn.',
                correctAnswer: true,
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để nghe và trả lời
              data: {
                videoPath: getVideoPath(1, '1'), // Đường dẫn tới file video
                instruction: 'Nghe video và xác định nhịp của đoạn nhạc.',
                correctAnswer: '4/4', // Đáp án đúng (ví dụ: nhịp 4/4)
              },
            },
          ],
        },
        // Bài tập cho section 2: Dấu lặng
        {
          lessonTitle: 'Dấu lặng',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Dấu lặng đen tương ứng với thời lượng của nốt nào?',
                options: ['Nốt trắng', 'Nốt đen', 'Nốt móc đơn', 'Nốt tròn'],
                correctAnswer: 'Nốt đen',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question:
                  'Dấu lặng trọn vẹn kéo dài gấp đôi thời lượng của nốt đen.',
                correctAnswer: false,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ dấu lặng
              data: {
                vexFlowJsonPath: getVexFlowPath(1, '2'),
                instruction: 'Vẽ dấu lặng đen trên khuông nhạc bằng VexFlow.',
                correctAnswer: 'Whole Rest on staff', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 3: Dấu nối
        {
          lessonTitle: 'Dấu nối',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Một nốt đen có chấm tăng thêm bao nhiêu thời lượng?',
                options: ['Nửa', 'Một', 'Một nửa', 'Gấp đôi'],
                correctAnswer: 'Một nửa',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Dấu nối cho phép nốt nhạc vượt qua vạch nhịp.',
                correctAnswer: true,
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để nhận diện dấu nối
              data: {
                videoPath: getVideoPath(1, '3'),
                instruction:
                  'Xem video và xác định vị trí dấu nối trong bản nhạc.',
                correctAnswer: 'Tie between two notes', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 4: Nhịp
        {
          lessonTitle: 'Nhịp',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Nhịp 3/4 có bao nhiêu nốt đen trong một ô nhịp?',
                options: ['2', '3', '4', '6'],
                correctAnswer: '3',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Nhịp 3/2 chỉ chứa nốt trắng.',
                correctAnswer: true,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ nhịp
              data: {
                vexFlowJsonPath: getVexFlowPath(1, '4'),
                instruction: 'Vẽ nhịp 4/4 với 4 nốt đen trên khuông nhạc.',
                correctAnswer: '4 quarter notes in 4/4 time', // Đáp án đúng
              },
            },
          ],
        },
      ],
    },
  },
  // Module 2: Trung cấp
  {
    moduleId: 2,
    title: 'Bài tập Trung cấp',
    content: {
      description: 'Các bài tập trung cấp để nâng cao kỹ năng âm nhạc',
      totalDuration: calculateExerciseDuration([
        {
          title: 'Bài tập nhịp đơn và nhịp phách',
          type: 'exercise',
          duration: 5,
        },
        { title: 'Bài tập âm giai thứ', type: 'exercise', duration: 5 },
        { title: 'Bài tập thang độ', type: 'exercise', duration: 5 },
        { title: 'Bài tập hóa biểu', type: 'exercise', duration: 5 },
        { title: 'Bài tập cách tính hóa biểu', type: 'exercise', duration: 5 },
      ]),
      sections: [
        // Bài tập cho section 0: Nhịp đơn và nhịp phách
        {
          lessonTitle: 'Nhịp đơn và nhịp phách',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Nhịp đơn có thể được chia thành bao nhiêu phần?',
                options: ['2', '3', '4', '6'],
                correctAnswer: '2',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Nhịp phách luôn chứa 4 nốt đen.',
                correctAnswer: false,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ nhịp đơn
              data: {
                vexFlowJsonPath: getVexFlowPath(2, '1'),
                instruction: 'Vẽ nhịp đơn 2/4 với 2 nốt đen trên khuông nhạc.',
                correctAnswer: '2 quarter notes in 2/4 time', // Đáp án đúng
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để nhận diện nhịp phách
              data: {
                videoPath: getVideoPath(2, '1'),
                instruction: 'Nghe video và xác định nhịp phách của đoạn nhạc.',
                correctAnswer: '3/4', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 1: Các âm giai thứ
        {
          lessonTitle: 'Các âm giai thứ',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question:
                  'Âm giai thứ tự nhiên có bao nhiêu nốt khác với âm giai trưởng?',
                options: ['1', '2', '3', '4'],
                correctAnswer: '3',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Âm giai thứ hòa âm có nốt bảy tăng.',
                correctAnswer: true,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ âm giai thứ
              data: {
                vexFlowJsonPath: getVexFlowPath(2, '2'),
                instruction: 'Vẽ thang âm La thứ tự nhiên trên khuông nhạc.',
                correctAnswer: 'A minor natural scale', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 2: Thang độ
        {
          lessonTitle: 'Thang độ',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Thang độ phức tạp thường liên quan đến yếu tố nào?',
                options: ['Nhịp điệu', 'Tiết tấu', 'Hòa âm', 'Cường độ'],
                correctAnswer: 'Tiết tấu',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Thang độ luôn chứa 7 nốt.',
                correctAnswer: false,
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để phân tích thang độ
              data: {
                videoPath: getVideoPath(2, '2'),
                instruction: 'Xem video và xác định thang độ của đoạn nhạc.',
                correctAnswer: 'C major scale', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 3: Hóa biểu
        {
          lessonTitle: 'Hóa biểu',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Hóa biểu chủ yếu dùng để thể hiện điều gì?',
                options: [
                  'Cảm xúc',
                  'Kỹ thuật biểu diễn',
                  'Nhịp điệu',
                  'Hòa âm',
                ],
                correctAnswer: 'Kỹ thuật biểu diễn',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Hóa biểu chỉ áp dụng cho nhạc cụ dây.',
                correctAnswer: false,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ hóa biểu
              data: {
                vexFlowJsonPath: getVexFlowPath(2, '3'),
                instruction:
                  'Vẽ biểu diễn hóa biểu cho nốt Sol trên khuông nhạc.',
                correctAnswer: 'G note with dynamics marking', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 4: Cách tính hóa biểu
        {
          lessonTitle: 'Cách tính hóa biểu',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question:
                  'Cách tính hóa biểu liên quan đến yếu tố nào sau đây?',
                options: ['Nhạc cụ', 'Hòa âm', 'Tiết tấu', 'Cường độ'],
                correctAnswer: 'Nhạc cụ',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Cách tính hóa biểu chỉ áp dụng cho dàn nhạc lớn.',
                correctAnswer: false,
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để phân tích hóa biểu
              data: {
                videoPath: getVideoPath(2, '3'),
                instruction:
                  'Xem video và xác định cách tính hóa biểu cho dàn nhạc.',
                correctAnswer: 'Dynamic marking for orchestra', // Đáp án đúng
              },
            },
          ],
        },
      ],
    },
  },
  // Module 3: Nâng cao
  {
    moduleId: 3,
    title: 'Bài tập Nâng cao',
    content: {
      description: 'Các bài tập nâng cao để chuyên sâu về âm nhạc',
      totalDuration: calculateExerciseDuration([
        { title: 'Bài tập bộ 3 giai âm', type: 'exercise', duration: 5 },
        { title: 'Bài tập phân tích số La Mã', type: 'exercise', duration: 5 },
        {
          title: 'Bài tập sáng tác với âm giai thứ',
          type: 'exercise',
          duration: 5,
        },
        {
          title: 'Bài tập sắp xếp nốt nhạc của hợp âm',
          type: 'exercise',
          duration: 5,
        },
        { title: 'Bài tập hợp âm bảy diatonic', type: 'exercise', duration: 5 },
      ]),
      sections: [
        // Bài tập cho section 0: Bộ 3 giai âm
        {
          lessonTitle: 'Bộ 3 giai âm',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Hợp âm ba C-E-G thuộc loại nào?',
                options: ['Trưởng', 'Thứ', 'Giảm', 'Tăng'],
                correctAnswer: 'Trưởng',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Hợp âm ba B-D-F là hợp âm giảm.',
                correctAnswer: true,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để vẽ hợp âm
              data: {
                vexFlowJsonPath: getVexFlowPath(3, '1'),
                instruction: 'Vẽ hợp âm C-E-G trên khuông nhạc bằng VexFlow.',
                correctAnswer: 'C major chord', // Đáp án đúng
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để phân tích hợp âm
              data: {
                videoPath: getVideoPath(3, '1'),
                instruction: 'Nghe video và xác định hợp âm trong đoạn nhạc.',
                correctAnswer: 'C major chord', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 1: Phân tích số La Mã: Bộ ba
        {
          lessonTitle: 'Phân tích số La Mã: Bộ ba',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question:
                  'Hợp âm trưởng trong thang âm Đô trưởng được biểu thị bằng số La Mã nào?',
                options: ['I', 'ii', 'iii', 'IV'],
                correctAnswer: 'I',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Số La Mã viết thường biểu thị hợp âm thứ.',
                correctAnswer: true,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để phân tích số La Mã
              data: {
                vexFlowJsonPath: getVexFlowPath(3, '2'),
                instruction: 'Vẽ hợp âm I (C-E-G) trên khuông nhạc.',
                correctAnswer: 'C major chord on I', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 2: Sáng tác với âm giai thứ
        {
          lessonTitle: 'Sáng tác với âm giai thứ',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question:
                  'Âm giai thứ hòa âm khác âm giai thứ tự nhiên ở nốt nào?',
                options: ['Nốt 6', 'Nốt 7', 'Nốt 5', 'Nốt 3'],
                correctAnswer: 'Nốt 7',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Âm giai thứ hợp nhất luôn chứa 9 hợp âm.',
                correctAnswer: true,
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để sáng tác âm giai thứ
              data: {
                videoPath: getVideoPath(3, '2'),
                instruction:
                  'Xem video và sáng tác một đoạn nhạc bằng âm giai La thứ hòa âm.',
                correctAnswer: 'A harmonic minor melody', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 3: Cách các nhà soạn thảo nhạc sắp xếp các nốt nhạc của hợp âm
        {
          lessonTitle:
            'Cách các nhà soạn thảo nhạc sắp xếp các nốt nhạc của hợp âm',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Hợp âm ở đảo ngược thứ nhất có nốt thấp nhất là gì?',
                options: ['Nốt gốc', 'Nốt ba', 'Nốt năm', 'Nốt bảy'],
                correctAnswer: 'Nốt ba',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Voicing không ảnh hưởng đến âm thanh của hợp âm.',
                correctAnswer: false,
              },
            },
            {
              type: 'vexFlow', // Bài tập sử dụng VexFlow để sắp xếp hợp âm
              data: {
                vexFlowJsonPath: getVexFlowPath(3, '3'),
                instruction:
                  'Sắp xếp hợp âm Fa trưởng ở đảo ngược thứ nhất trên khuông nhạc.',
                correctAnswer: 'F major chord, A as lowest note', // Đáp án đúng
              },
            },
          ],
        },
        // Bài tập cho section 4: Hợp âm bảy diatonic
        {
          lessonTitle: 'Hợp âm bảy diatonic',
          type: 'exercise',
          duration: 5,
          content: [
            {
              type: 'multipleChoice',
              data: {
                question: 'Hợp âm bảy G-B-D-F thuộc loại nào?',
                options: ['Trưởng', 'Thứ', 'Chủ đạo', 'Giảm'],
                correctAnswer: 'Chủ đạo',
              },
            },
            {
              type: 'trueFalse',
              data: {
                question: 'Hợp âm bảy B-D-F-A là hợp âm giảm một nửa.',
                correctAnswer: true,
              },
            },
            {
              type: 'video', // Bài tập sử dụng video để phân tích hợp âm bảy
              data: {
                videoPath: getVideoPath(3, '3'),
                instruction:
                  'Nghe video và xác định loại hợp âm bảy trong đoạn nhạc.',
                correctAnswer: 'Dominant seventh chord', // Đáp án đúng
              },
            },
          ],
        },
      ],
    },
  },
]
