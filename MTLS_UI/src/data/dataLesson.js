// Function to create path for images
const getImagePath = (moduleId, imgNumber) => {
  const folders = {
    1: 'co-ban',
    2: 'trung-cap',
    3: 'nang-cao',
  }
  return `/img/${folders[moduleId]}/${imgNumber}.png`
}

// Function to calculate total duration for module (including readings, quizzes, assignments, exercises)
const calculateModuleDuration = (sections) => {
  const readingsDuration = sections
    .filter((section) => section.type === 'readings')
    .reduce((sum, section) => sum + section.duration, 0)

  const videosDuration = sections
    .filter((section) => section.type === 'video')
    .reduce((sum, section) => sum + section.duration, 0)

  const quizzesDuration = sections
    .filter((section) => section.type === 'quiz')
    .reduce((sum, section) => sum + section.duration, 0)

  const assignmentsDuration = sections
    .filter((section) => section.type === 'assignment')
    .reduce((sum, section) => sum + section.duration, 0)

  const exercisesDuration = sections
    .filter((section) => section.type === 'exercise')
    .reduce((sum, section) => sum + section.duration, 0)

  return {
    readings: readingsDuration,
    videos: videosDuration,
    quizzes: quizzesDuration,
    assignments: assignmentsDuration,
    exercises: exercisesDuration,
  }
}

// Function to create path for VexFlow JSON
const getVexFlowPath = (moduleId, exerciseNumber) => {
  const folders = {
    1: 'co-ban',
    2: 'trung-cap',
    3: 'nang-cao',
  }
  return `/vexflow/${folders[moduleId]}/${exerciseNumber}.json`
}

// Function to create path for videos
const getVideoPath = (moduleId, exerciseNumber) => {
  const folders = {
    1: 'co-ban',
    2: 'trung-cap',
    3: 'nang-cao',
  }
  return `/videos/${folders[moduleId]}/${exerciseNumber}.mp4`
}

export const courses = [
  // Basic Course
  {
    id: 1,
    title: 'Basic Course',
    image:
      'https://plus.unsplash.com/premium_photo-1723575706805-795c76a6694a?q=80&w=3778&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'This is the most basic course for beginners to easily approach music',
    modules: [
      {
        id: 1,
        title: 'Module 1: Music Staff and Basic Rhythm',
        duration: calculateModuleDuration([
          {
            title: 'Readings: Music Staff, Clefs and Ledger Lines',
            type: 'readings',
            duration: 5,
          },
          {
            title: 'Readings: Time Signatures and Rhythm Rules',
            type: 'readings',
            duration: 7,
          },
          {
            title: 'Video: Introduction to Music Staff and Rhythm',
            type: 'video',
            duration: 10,
          },
          { title: 'Quiz: Music Staff and Clefs', type: 'quiz', duration: 5 },
          {
            title: 'Exercise: Music Staff and Clefs',
            type: 'exercise',
            duration: 5,
          },
          {
            title: 'Exercise: Time Signatures and Rhythm Rules',
            type: 'exercise',
            duration: 5,
          },
          { title: 'Assignment: Music Staff', type: 'assignment', duration: 10 },
        ]),
        sections: [
          {
            title: 'Readings: Music Staff, Clefs and Ledger Lines',
            type: 'readings',
            duration: 5,
            status: 'complete',
            content: [
              {
                type: 'text',
                data: 'The music staff is the foundation for writing musical notes.',
              },
              {
                type: 'text',
                data: 'The modern staff consists of five lines and four spaces.',
              },
              { type: 'image', data: getImagePath(1, '1') },
            ],
          },
          {
            title: 'Readings: Time Signatures and Rhythm Rules',
            type: 'readings',
            duration: 7,
            status: 'complete',
            content: [
              {
                type: 'text',
                data: 'The vertical black bars called bar lines divide the staff into measures.',
              },
              { type: 'image', data: getImagePath(1, '7') },
            ],
          },
          {
            title: 'Video: Introduction to Music Staff and Rhythm',
            type: 'video',
            duration: 10,
            status: 'incomplete',
            content: [
              {
                type: 'video',
                data: `https://www.youtube.com/watch?v=y_6u45oJrjc&ab_channel=MusicNotes81`,
                instruction:
                  'Watch the video to better understand music staff and basic rhythm.',
              },
            ],
          },
          {
            title: 'Quiz: Music Staff and Clefs',
            type: 'quiz',
            duration: 5,
            content: [
              {
                type: 'question',
                data: {
                  question: 'How many lines does a modern music staff have?',
                  options: ['3', '4', '5', '6'],
                  correctAnswer: '5',
                },
              },
              {
                type: 'question',
                data: {
                  question: 'Which note is located between the two dots of the F clef?',
                  options: ['C', 'F', 'G', 'A'],
                  correctAnswer: 'F',
                },
              },
            ],
          },
          {
            title: 'Exercise: Music Staff and Clefs',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'How many lines does a modern music staff have?',
                  options: ['3', '4', '5', '6'],
                  correctAnswer: '5',
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'On which line of the staff is the F clef placed?',
                  options: ['Line 2', 'Line 3', 'Line 4', 'Line 5'],
                  correctAnswer: 'Line 4',
                },
              },
              {
                type: 'trueFalse',
                data: {
                  question: 'A music staff has 5 lines and 4 spaces.',
                  correctAnswer: true,
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(1, '1'),
                  instruction:
                    'Draw a G note on the second line of the staff using VexFlow.',
                  correctAnswer: 'G on second line',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(1, '2'),
                  instruction: 'Identify the notes on the treble clef staff.',
                  correctAnswer: 'G, B, D, F',
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'Which note is on the third line of the treble clef staff?',
                  options: ['Note C', 'Note D', 'Note B', 'Note E'],
                  correctAnswer: 'Note B',
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'Where is the treble clef placed on the staff?',
                  options: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
                  correctAnswer: 'Line 2',
                },
              },
              {
                type: 'trueFalse',
                data: {
                  question: 'The treble clef is also called the G clef.',
                  correctAnswer: true,
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'Which note is at the highest position on the treble clef staff?',
                  options: ['Note F', 'Note A', 'Note C', 'Note E'],
                  correctAnswer: 'Note F',
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'What are the spaces between the lines on a music staff called?',
                  options: ['Gaps', 'Spaces', 'Intervals', 'Voids'],
                  correctAnswer: 'Spaces',
                },
              },
            ],
          },
          {
            title: 'Exercise: Time Signatures and Rhythm Rules',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'What does the top number in a time signature represent?',
                  options: ['The number of beats in a measure', 'The note value that gets one beat', 'The tempo of the piece', 'The number of measures in the piece'],
                  correctAnswer: 'The number of beats in a measure',
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'In 4/4 time, which note value gets one beat?',
                  options: ['Whole note', 'Half note', 'Quarter note', 'Eighth note'],
                  correctAnswer: 'Quarter note',
                },
              },
              {
                type: 'trueFalse',
                data: {
                  question: 'A time signature of 3/4 means there are 3 quarter notes in each measure.',
                  correctAnswer: true,
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(1, '3'),
                  instruction: 'Create a measure in 4/4 time with four quarter notes.',
                  correctAnswer: 'Four quarter notes in 4/4',
                },
              },
              {
                type: 'multipleChoice',
                data: {
                  question: 'What is another name for 4/4 time?',
                  options: ['Common time', 'Cut time', 'Triple time', 'Compound time'],
                  correctAnswer: 'Common time',
                },
              },
            ],
          },
          {
            title: 'Assignment: Music Staff',
            type: 'assignment',
            duration: 10,
            content: [
              {
                type: 'text',
                data: 'Create a complete staff with treble clef and identify all the notes on the lines and spaces.',
              },
              {
                type: 'text',
                data: 'Draw a measure in 4/4 time with a combination of quarter and eighth notes that add up to 4 beats.',
              },
              {
                type: 'submission',
                data: {
                  instruction: 'Upload your completed assignment as a PDF or image file.',
                  submissionType: 'file',
                },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Dots and Augmented Rhythm',
        duration: calculateModuleDuration([
          { title: 'Readings: Dots', type: 'readings', duration: 7 },
          { title: 'Readings: Augmented Rhythm', type: 'readings', duration: 4 },
          { title: 'Readings: Rhythm', type: 'readings', duration: 5 },
          { title: 'Exercise: Dots', type: 'exercise', duration: 5 },
          { title: 'Exercise: Augmented Rhythm', type: 'exercise', duration: 5 },
          { title: 'Exercise: Rhythm', type: 'exercise', duration: 5 },
          {
            title: 'Assignment rhythm and dots',
            type: 'assignment',
            duration: 10,
          },
        ]),
        sections: [
          {
            title: 'Readings: Dots',
            type: 'readings',
            duration: 7,
            status: 'complete',
            content: [
              {
                type: 'text',
                data: 'Dots represent an increase in the duration of a note.',
              },
              { type: 'image', data: getImagePath(1, '11') },
            ],
          },
          {
            title: 'Readings: Augmented Rhythm',
            type: 'readings',
            duration: 4,
            status: 'complete',
            content: [
              {
                type: 'text',
                data: 'Dots and ties are used to change the duration of a note.',
              },
              { type: 'image', data: getImagePath(1, '23') },
            ],
          },
          {
            title: 'Readings: Rhythm',
            type: 'readings',
            duration: 5,
            status: 'complete',
            content: [
              {
                type: 'text',
                data: 'Rhythm is an important element in creating musical rhythm.',
              },
              {
                type: 'image',
                data: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-4.0.3',
                caption: 'Representing different rhythms',
              },
            ],
          },
          {
            title: 'Exercise: Dots',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'Which note is represented by the dot?',
                  options: ['Whole note', 'Half note', 'Quarter note', 'Eighth note'],
                  correctAnswer: 'Half note',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(1, '2'),
                  instruction: 'Draw a dot on the staff using VexFlow.',
                  correctAnswer: 'Whole Rest with dot',
                },
              },
            ],
          },
          {
            title: 'Exercise: Augmented Rhythm',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'How much additional duration does a dotted note get?',
                  options: ['Half', 'One', 'One and a half', 'Double'],
                  correctAnswer: 'One and a half',
                },
              },
              {
                type: 'video',
                data: {
                  videoPath: getVideoPath(1, '3'),
                  instruction:
                    'Watch the video and identify the position of the tie in the music.',
                  correctAnswer: 'Tie between two notes',
                },
              },
            ],
          },
          {
            title: 'Exercise: Rhythm',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'In 3/4 time, how many notes get one beat?',
                  options: ['2', '3', '4', '6'],
                  correctAnswer: '3',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(1, '4'),
                  instruction: 'Create a measure in 4/4 time with four quarter notes.',
                  correctAnswer: 'Four quarter notes in 4/4',
                },
              },
            ],
          },
          {
            title: 'Assignment rhythm and dots',
            type: 'assignment',
            duration: 10,
            content: [
              {
                type: 'submission',
                data: {
                  question:
                    'Write a short piece of music (4 measures) using dots and ties.',
                  submissionInstructions:
                    'Upload your completed assignment as a PDF or image file.',
                  allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
                },
              },
            ],
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Check Rhythm and Dots',
        duration: calculateModuleDuration([
          { title: 'Quiz rhythm and dots', type: 'quiz', duration: 5 },
        ]),
        sections: [
          {
            title: 'Quiz rhythm and dots',
            type: 'quiz',
            duration: 5,
            content: [
              {
                type: 'question',
                data: {
                  question: 'In 4/4 time, how many notes get one beat?',
                  options: ['2', '3', '4', '6'],
                  correctAnswer: '4',
                },
              },
              {
                type: 'question',
                data: {
                  question:
                    'Which note is represented by the dot?',
                  options: ['Whole note', 'Half note', 'Quarter note', 'Eighth note'],
                  correctAnswer: 'Half note',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  // Intermediate Course
  {
    id: 2,
    title: 'Intermediate Course',
    image:
      'https://plus.unsplash.com/premium_photo-1723575706805-795c76a6694a?q=80&w=3778&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'This course helps you improve your music knowledge and skills',
    modules: [
      {
        id: 1,
        title: 'Module 1: Single and Double Bar',
        duration: calculateModuleDuration([
          {
            title: 'Readings: Single and Double Bar',
            type: 'readings',
            duration: 6,
          },
          { title: 'Readings: Major Scales', type: 'readings', duration: 8 },
          {
            title: 'Exercise: Single and Double Bar',
            type: 'exercise',
            duration: 5,
          },
          { title: 'Exercise: Major Scales', type: 'exercise', duration: 5 },
          { title: 'Assignment: Major Scales', type: 'assignment', duration: 10 },
        ]),
        sections: [
          {
            title: 'Readings: Single and Double Bar',
            type: 'readings',
            duration: 6,
            content: [
              {
                type: 'text',
                data: 'Each musical phrase can be classified as a specific rhythmic phrase.',
              },
              { type: 'image', data: getImagePath(2, '1') },
            ],
          },
          {
            title: 'Readings: Major Scales',
            type: 'readings',
            duration: 8,
            content: [
              {
                type: 'text',
                data: 'Major scale is a series of notes arranged in a specific pattern.',
              },
              {
                type: 'image',
                data: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3',
                caption: 'Major scales in music',
              },
            ],
          },
          {
            title: 'Exercise: Single and Double Bar',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'A musical phrase can be divided into how many parts?',
                  options: ['2', '3', '4', '6'],
                  correctAnswer: '2',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(2, '1'),
                  instruction:
                    'Draw a single bar 2/4 with 2 notes on the staff.',
                  correctAnswer: '2 quarter notes in 2/4 time',
                },
              },
            ],
          },
          {
            title: 'Exercise: Major Scales',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'How many notes are different from the natural major scale?',
                  options: ['1', '2', '3', '4'],
                  correctAnswer: '3',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(2, '2'),
                  instruction: 'Draw the natural major scale on the staff.',
                  correctAnswer: 'C major scale',
                },
              },
            ],
          },
          {
            title: 'Assignment: Major Scales',
            type: 'assignment',
            duration: 10,
            content: [
              {
                type: 'submission',
                data: {
                  question:
                    'Write a complete major scale and record it in musical notation.',
                  submissionInstructions:
                    'Upload your completed assignment as a PDF or image file.',
                  allowedFileTypes: [
                    'image/png',
                    'image/jpeg',
                    'application/pdf',
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Key Signature and Tonality',
        duration: calculateModuleDuration([
          { title: 'Readings: Key Signature', type: 'readings', duration: 7 },
          { title: 'Readings: Tonality', type: 'readings', duration: 5 },
          {
            title: 'Readings: Calculating Tonality',
            type: 'readings',
            duration: 6,
          },
          { title: 'Exercise: Key Signature', type: 'exercise', duration: 5 },
          { title: 'Exercise: Tonality', type: 'exercise', duration: 5 },
          {
            title: 'Exercise: Calculating Tonality',
            type: 'exercise',
            duration: 5,
          },
          { title: 'Assignment: Tonality', type: 'assignment', duration: 10 },
        ]),
        sections: [
          {
            title: 'Readings: Key Signature',
            type: 'readings',
            duration: 7,
            content: [
              {
                type: 'text',
                data: 'Discover complex rhythmic patterns and how to combine them in music.',
              },
              {
                type: 'image',
                data: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?ixlib=rb-4.0.3',
                caption: 'Examples of complex rhythmic patterns',
              },
            ],
          },
          {
            title: 'Readings: Tonality',
            type: 'readings',
            duration: 5,
            content: [
              {
                type: 'text',
                data: 'Learn how to express emotions through music and basic performance techniques.',
              },
              {
                type: 'image',
                data: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3',
                caption: 'Basic performance techniques',
              },
            ],
          },
          {
            title: 'Readings: Calculating Tonality',
            type: 'readings',
            duration: 6,
            content: [
              {
                type: 'text',
                data: 'Learn how to combine different musical instruments to create a complete musical piece.',
              },
              {
                type: 'image',
                data: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3',
                caption: 'Orchestra with various musical instruments',
              },
            ],
          },
          {
            title: 'Exercise: Key Signature',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'Complex rhythmic patterns usually relate to which element?',
                  options: ['Tempo', 'Rhythm', 'Harmony', 'Volume'],
                  correctAnswer: 'Rhythm',
                },
              },
              {
                type: 'video',
                data: {
                  videoPath: getVideoPath(2, '2'),
                  instruction: 'Watch the video and identify the key signature of the musical piece.',
                  correctAnswer: 'C major scale',
                },
              },
            ],
          },
          {
            title: 'Exercise: Tonality',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'Tonality is mainly used to express what?',
                  options: [
                    'Emotions',
                    'Performance Techniques',
                    'Tempo',
                    'Harmony',
                  ],
                  correctAnswer: 'Performance Techniques',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(2, '3'),
                  instruction:
                    'Draw a representation of tonality for the Sol note on the staff.',
                  correctAnswer: 'G note with dynamics marking',
                },
              },
            ],
          },
          {
            title: 'Exercise: Calculating Tonality',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'Calculating tonality relates to which element after the musical instrument?',
                  options: ['Musical Instrument', 'Harmony', 'Rhythm', 'Volume'],
                  correctAnswer: 'Musical Instrument',
                },
              },
              {
                type: 'video',
                data: {
                  videoPath: getVideoPath(2, '3'),
                  instruction:
                    'Watch the video and identify how to calculate tonality for the orchestra.',
                  correctAnswer: 'Dynamic marking for orchestra',
                },
              },
            ],
          },
          {
            title: 'Assignment: Tonality',
            type: 'assignment',
            duration: 10,
            content: [
              {
                type: 'submission',
                data: {
                  question:
                    'Record a short piece of music using tonality (dynamic marking).',
                  submissionInstructions:
                    'Upload your completed assignment as a PDF or image file.',
                  allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
                },
              },
            ],
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Check Single and Double Bar',
        duration: calculateModuleDuration([
          { title: 'Quiz single and double bar', type: 'quiz', duration: 5 },
        ]),
        sections: [
          {
            title: 'Quiz single and double bar',
            type: 'quiz',
            duration: 5,
            content: [
              {
                type: 'question',
                data: {
                  question: 'What does a single bar mean?',
                  options: [
                    'A bar with 3 beats',
                    'A bar that can be divided into 2 notes',
                    'A bar with 4 notes',
                    'A bar that cannot be divided',
                  ],
                  correctAnswer: 'A bar that can be divided into 2 notes',
                },
              },
              {
                type: 'question',
                data: {
                  question: 'Tonality relates to what in music?',
                  options: [
                    'Tempo',
                    'Complex rhythm',
                    'Harmony',
                    'Volume',
                  ],
                  correctAnswer: 'Complex rhythm',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  // Advanced Course
  {
    id: 3,
    title: 'Advanced Course',
    image:
      'https://plus.unsplash.com/premium_photo-1723575706805-795c76a6694a?q=80&w=3778&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'This course is for those who want to specialize in music',
    modules: [
      {
        id: 1,
        title: 'Module 1: Three-note Chord',
        duration: calculateModuleDuration([
          { title: 'Readings: Three-note Chord', type: 'readings', duration: 8 },
          {
            title: 'Readings: Roman Numerals Analysis: Three',
            type: 'readings',
            duration: 10,
          },
          { title: 'Exercise: Three-note Chord', type: 'exercise', duration: 5 },
          {
            title: 'Exercise: Roman Numerals Analysis',
            type: 'exercise',
            duration: 5,
          },
          {
            title: 'Assignment: Three-note Chord Analysis',
            type: 'assignment',
            duration: 10,
          },
        ]),
        sections: [
          {
            title: 'Readings: Three-note Chord',
            type: 'readings',
            duration: 8,
            content: [
              {
                type: 'text',
                data: 'Each major and minor scale has seven special three-note chords, called three-note chords.',
              },
              { type: 'image', data: getImagePath(3, '1') },
            ],
          },
          {
            title: 'Readings: Roman Numerals Analysis: Three',
            type: 'readings',
            duration: 10,
            content: [
              {
                type: 'text',
                data: 'When analyzing music, each three-note chord is determined by a Roman numeral.',
              },
              { type: 'image', data: getImagePath(3, '22') },
            ],
          },
          {
            title: 'Exercise: Three-note Chord',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'Which type does the C-E-G chord belong to?',
                  options: ['Major', 'Minor', 'Diminished', 'Augmented'],
                  correctAnswer: 'Major',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(3, '1'),
                  instruction: 'Draw a C-E-G chord on the staff using VexFlow.',
                  correctAnswer: 'C major chord',
                },
              },
            ],
          },
          {
            title: 'Exercise: Roman Numerals Analysis',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'Which major scale in the C major scale is represented by the Roman numeral?',
                  options: ['I', 'ii', 'iii', 'IV'],
                  correctAnswer: 'I',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(3, '2'),
                  instruction: 'Draw a C-E-G chord on the staff.',
                  correctAnswer: 'C major chord on I',
                },
              },
            ],
          },
          {
            title: 'Assignment: Three-note Chord Analysis',
            type: 'assignment',
            duration: 10,
            content: [
              {
                type: 'submission',
                data: {
                  question:
                    'Analyze a short piece of music (4 measures) and identify the three-note chords using Roman numerals.',
                  submissionInstructions:
                    'Upload your completed assignment as a PDF or image file.',
                  allowedFileTypes: [
                    'image/png',
                    'image/jpeg',
                    'application/pdf',
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Composition and Voicing',
        duration: calculateModuleDuration([
          {
            title: 'Readings: Composition with Minor Scale',
            type: 'readings',
            duration: 12,
          },
          {
            title:
              'Readings: How Composers Arrange Notes in Chords',
            type: 'readings',
            duration: 8,
          },
          {
            title: 'Exercise: Composition with Minor Scale',
            type: 'exercise',
            duration: 5,
          },
          {
            title: 'Exercise: Arranging Notes in Chords',
            type: 'exercise',
            duration: 5,
          },
          {
            title: 'Assignment: Composition of a Musical Piece',
            type: 'assignment',
            duration: 15,
          },
        ]),
        sections: [
          {
            title: 'Readings: Composition with Minor Scale',
            type: 'readings',
            duration: 12,
            content: [
              {
                type: 'text',
                data: 'Unlike the major scale, there are three different minor scales.',
              },
              { type: 'image', data: getImagePath(3, '39') },
            ],
          },
          {
            title:
              'Readings: How Composers Arrange Notes in Chords',
            type: 'readings',
            duration: 8,
            content: [
              {
                type: 'text',
                data: 'Composers often arrange the notes of a chord in different ways.',
              },
              { type: 'image', data: getImagePath(3, '47') },
            ],
          },
          {
            title: 'Exercise: Composition with Minor Scale',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'What is different about the natural minor scale from the natural major scale?',
                  options: ['Note 6', 'Note 7', 'Note 5', 'Note 3'],
                  correctAnswer: 'Note 7',
                },
              },
              {
                type: 'video',
                data: {
                  videoPath: getVideoPath(3, '2'),
                  instruction:
                    'Watch the video and compose a musical piece using the natural minor scale.',
                  correctAnswer: 'A harmonic minor melody',
                },
              },
            ],
          },
          {
            title: 'Exercise: Arranging Notes in Chords',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question:
                    'What is the lowest note in the first inversion?',
                  options: ['Root note', 'Third note', 'Fifth note', 'Seventh note'],
                  correctAnswer: 'Third note',
                },
              },
              {
                type: 'vexFlow',
                data: {
                  vexFlowJsonPath: getVexFlowPath(3, '3'),
                  instruction:
                    'Arrange a F major chord in the first inversion on the staff.',
                  correctAnswer: 'F major chord, A as lowest note',
                },
              },
            ],
          },
          {
            title: 'Assignment: Composition of a Musical Piece',
            type: 'assignment',
            duration: 15,
            content: [
              {
                type: 'submission',
                data: {
                  question:
                    'Compose a short piece of music (8 measures) using the natural minor scale and inverted chords.',
                  submissionInstructions:
                    'Upload your completed assignment as a PDF or image file.',
                  allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
                },
              },
            ],
          },
        ],
      },
      {
        id: 3,
        title: 'Seven-note Chord and Check',
        duration: calculateModuleDuration([
          {
            title: 'Readings: Seven-note Chord Diatonic',
            type: 'readings',
            duration: 7,
          },
          { title: 'Quiz: Three-note Chord', type: 'quiz', duration: 5 },
          { title: 'Quiz: Seven-note Chord', type: 'quiz', duration: 5 },
          {
            title: 'Exercise: Seven-note Chord Diatonic',
            type: 'exercise',
            duration: 5,
          },
          { title: 'Assignment: Seven-note Chord', type: 'assignment', duration: 10 },
        ]),
        sections: [
          {
            title: 'Readings: Seven-note Chord Diatonic',
            type: 'readings',
            duration: 7,
            content: [
              {
                type: 'text',
                data: 'Besides the three-note chord, each major and minor scale also has a seven-note chord.',
              },
              { type: 'image', data: getImagePath(3, '54') },
            ],
          },
          {
            title: 'Quiz: Three-note Chord',
            type: 'quiz',
            duration: 5,
            content: [
              {
                type: 'question',
                data: {
                  question: 'Which type does the C-E-G chord belong to?',
                  options: ['Major', 'Minor', 'Diminished', 'Augmented'],
                  correctAnswer: 'Major',
                },
              },
              {
                type: 'question',
                data: {
                  question: 'Which type does the B-D-F chord have?',
                  options: [
                    'Major three-note chord, perfect fifth',
                    'Minor three-note chord, perfect fifth',
                    'Major three-note chord, perfect fifth',
                    'Minor three-note chord, perfect fifth',
                  ],
                  correctAnswer: 'Minor three-note chord, perfect fifth',
                },
              },
            ],
          },
          {
            title: 'Quiz: Seven-note Chord',
            type: 'quiz',
            duration: 5,
            content: [
              {
                type: 'question',
                data: {
                  question: 'Which type does the G-B-D-F chord belong to?',
                  options: [
                    'Seven-note major',
                    'Seven-note minor',
                    'Seven-note dominant',
                    'Seven-note diminished',
                  ],
                  correctAnswer: 'Seven-note dominant',
                },
              },
              {
                type: 'question',
                data: {
                  question: 'Which type does the B-D-F-A belong to?',
                  options: [
                    'Seven-note major',
                    'Seven-note minor',
                    'Seven-note diminished half',
                    'Seven-note augmented',
                  ],
                  correctAnswer: 'Seven-note diminished half',
                },
              },
            ],
          },
          {
            title: 'Exercise: Seven-note Chord Diatonic',
            type: 'exercise',
            duration: 5,
            content: [
              {
                type: 'multipleChoice',
                data: {
                  question: 'Which type does the G-B-D-F belong to?',
                  options: ['Major', 'Minor', 'Dominant', 'Diminished'],
                  correctAnswer: 'Dominant',
                },
              },
              {
                type: 'video',
                data: {
                  videoPath: getVideoPath(3, '3'),
                  instruction:
                    'Watch the video and identify the type of seven-note chord in the musical piece.',
                  correctAnswer: 'Dominant seventh chord',
                },
              },
            ],
          },
          {
            title: 'Assignment: Seven-note Chord',
            type: 'assignment',
            duration: 10,
            content: [
              {
                type: 'submission',
                data: {
                  question:
                    'Write a short piece of music (4 measures) using at least two seven-note chords.',
                  submissionInstructions:
                    'Upload your completed assignment as a PDF or image file.',
                  allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

