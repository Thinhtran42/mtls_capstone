export const modules = [
  {
    id: 1,
    title: 'Cơ bản',
    content: {
      description:
        'Module này là cơ bản nhất để người mới dễ dàng tiếp cận âm nhạc',
      duration: {
        readings: 5,
        assignments: 1,
      },
      sections: [
        {
          title: 'Welcome',
          type: 'readings',
          duration: 5,
          status: 'complete',
          content: [
            {
              type: 'text',
              data: 'Chào mừng bạn đến với khóa học âm nhạc! Trong khóa học này, bạn sẽ được học từ những kiến thức cơ bản nhất về âm nhạc.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3',
              caption: 'Âm nhạc là một phần không thể thiếu trong cuộc sống',
            },
          ],
        },
        {
          title: 'Nhạc lý',
          type: 'readings',
          duration: 7,
          status: 'complete',
          content: [
            {
              type: 'text',
              data: 'Nhạc lý là nền tảng quan trọng để hiểu về âm nhạc. Bạn sẽ học về các khái niệm cơ bản như nốt nhạc, phách, nhịp.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3',
              caption: 'Khuông nhạc với các nốt nhạc cơ bản',
            },
          ],
        },
        {
          title: 'Quãng',
          type: 'readings',
          duration: 7,
          status: 'complete',
          content: [
            {
              type: 'text',
              data: 'Quãng là khoảng cách giữa hai âm. Học về quãng giúp bạn hiểu được mối quan hệ giữa các nốt nhạc.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?ixlib=rb-4.0.3',
              caption: 'Minh họa các quãng trên đàn piano',
            },
          ],
        },
        {
          title: 'Nốt',
          type: 'readings',
          duration: 4,
          status: 'complete',
          content: [
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?ixlib=rb-4.0.3',
              caption: 'Các loại nốt nhạc',
            },
            {
              type: 'text',
              data: 'Nốt nhạc là đơn vị cơ bản trong âm nhạc. Mỗi nốt có một độ cao và độ dài khác nhau.',
            },
          ],
        },
        {
          title: 'Nhịp',
          type: 'readings',
          duration: 5,
          status: 'complete',
          content: [
            {
              type: 'text',
              data: 'Nhịp là yếu tố quan trọng tạo nên tiết tấu trong âm nhạc. Bạn sẽ học về các loại nhịp phổ biến.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-4.0.3',
              caption: 'Biểu diễn các loại nhịp khác nhau',
            },
          ],
        },
      ],
    },
  },
  {
    id: 2,
    title: 'Trung cấp',
    content: {
      description:
        'Module trung cấp giúp bạn nâng cao kiến thức và kỹ năng âm nhạc của mình',
      duration: {
        readings: 8,
        assignments: 2,
      },
      sections: [
        {
          title: 'Hợp âm cơ bản',
          type: 'readings',
          duration: 6,
          status: 'complete',
          content: [
            {
              type: 'text',
              data: 'Hợp âm là sự kết hợp của ba hoặc nhiều nốt nhạc. Trong phần này, bạn sẽ học về các hợp âm cơ bản.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3',
              caption: 'Minh họa các hợp âm trên đàn guitar',
            },
          ],
        },
        {
          title: 'Điệu thức',
          type: 'readings',
          duration: 8,
          content: [
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3',
              caption: 'Các điệu thức trong âm nhạc',
            },
            {
              type: 'text',
              data: 'Điệu thức là chuỗi các nốt nhạc được sắp xếp theo một quy tắc nhất định, tạo nên màu sắc đặc trưng.',
            },
          ],
        },
        {
          title: 'Tiết tấu nâng cao',
          type: 'readings',
          duration: 7,
          content: [
            {
              type: 'text',
              data: 'Khám phá các dạng tiết tấu phức tạp và cách kết hợp chúng trong âm nhạc.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?ixlib=rb-4.0.3',
              caption: 'Ví dụ về các mẫu tiết tấu phức tạp',
            },
          ],
        },
        {
          title: 'Kỹ thuật biểu diễn',
          type: 'readings',
          duration: 5,
          content: [
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3',
              caption: 'Các kỹ thuật biểu diễn cơ bản',
            },
            {
              type: 'text',
              data: 'Học cách thể hiện cảm xúc thông qua âm nhạc và các kỹ thuật biểu diễn cơ bản.',
            },
          ],
        },
        {
          title: 'Phối hợp nhạc cụ',
          type: 'readings',
          duration: 6,
          content: [
            {
              type: 'text',
              data: 'Tìm hiểu cách kết hợp các nhạc cụ khác nhau để tạo nên một bản nhạc hoàn chỉnh.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3',
              caption: 'Dàn nhạc với nhiều nhạc cụ khác nhau',
            },
          ],
        },
        {
          title: 'Bài tập thực hành',
          type: 'assignment',
          duration: 30,
          content: [
            {
              type: 'text',
              data: 'Thực hành các kỹ năng đã học thông qua các bài tập tổng hợp.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?ixlib=rb-4.0.3',
              caption: 'Bài tập thực hành tổng hợp',
            },
          ],
        },
      ],
    },
  },
  {
    id: 3,
    title: 'Nâng cao',
    content: {
      description:
        'Module nâng cao dành cho những người muốn chuyên sâu về âm nhạc',
      duration: {
        readings: 10,
        assignments: 3,
      },
      sections: [
        {
          title: 'Hòa âm phức tạp',
          type: 'readings',
          duration: 8,
          content: [
            {
              type: 'text',
              data: 'Khám phá các kỹ thuật hòa âm nâng cao và cách áp dụng chúng trong sáng tác.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3',
              caption: 'Ví dụ về hòa âm phức tạp',
            },
          ],
        },
        {
          title: 'Phối khí chuyên nghiệp',
          type: 'readings',
          duration: 10,
          content: [
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3',
              caption: 'Studio phối khí chuyên nghiệp',
            },
            {
              type: 'text',
              data: 'Học cách phối khí chuyên nghiệp cho các thể loại âm nhạc khác nhau.',
            },
          ],
        },
        {
          title: 'Sáng tác',
          type: 'readings',
          duration: 12,
          content: [
            {
              type: 'text',
              data: 'Phát triển kỹ năng sáng tác và tìm hiểu các phương pháp sáng tác hiện đại.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3',
              caption: 'Quá trình sáng tác âm nhạc',
            },
          ],
        },
        {
          title: 'Kỹ thuật biểu diễn nâng cao',
          type: 'readings',
          duration: 8,
          content: [
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3',
              caption: 'Các kỹ thuật biểu diễn nâng cao',
            },
            {
              type: 'text',
              data: 'Nâng cao kỹ năng biểu diễn với các kỹ thuật chuyên sâu và phức tạp.',
            },
          ],
        },
        {
          title: 'Phân tích tác phẩm',
          type: 'readings',
          duration: 7,
          content: [
            {
              type: 'text',
              data: 'Học cách phân tích các tác phẩm âm nhạc từ góc độ chuyên môn.',
            },
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3',
              caption: 'Phân tích bản nhạc cổ điển',
            },
          ],
        },
        {
          title: 'Dự án âm nhạc',
          type: 'assignment',
          duration: 45,
          content: [
            {
              type: 'image',
              data: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-4.0.3',
              caption: 'Dự án âm nhạc cá nhân',
            },
            {
              type: 'text',
              data: 'Thực hiện một dự án âm nhạc hoàn chỉnh từ ý tưởng đến sản phẩm cuối cùng.',
            },
          ],
        },
      ],
    },
  },
]
