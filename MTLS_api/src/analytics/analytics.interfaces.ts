export interface DashboardOverview {
  totalStudents: number;
  studentChange: string;
  totalLessons: number;
  lessonChange: string;
  totalAssignments: number;
  assignmentChange: string;
  activeUsers: number;
  activeUserChange: string;
}

export interface ActivityData {
  date: string;
  quizzes: number;
  lessons: number;
  exercises: number;
}

export interface UserDistribution {
  name: string;
  value: number;
}

export interface RegistrationTrend {
  month: string;
  year: number;
  count: number;
}

export interface CourseCompletion {
  name: string;
  completion: number;
  students: number;
}

export interface StorageData {
  name: string;
  value: number;
}

export interface QuizScore {
  name: string;
  score: number;
}

export interface CompletionRate {
  name: string;
  value: number;
}

export interface CoursePerformance {
  quizScores: QuizScore[];
  completionRates: CompletionRate[];
}

export interface LessonPopularity {
  title: string;
  views: number;
  rating: number;
}

export interface QuizPopularity {
  title: string;
  attempts: number;
  avgScore: number;
}

export interface AssignmentPopularity {
  title: string;
  submissions: number;
  onTime: string;
}

export interface PopularContent {
  topLessons: LessonPopularity[];
  topQuizzes: QuizPopularity[];
  topAssignments: AssignmentPopularity[];
}

export interface DailyLearningData {
  day: string;
  hours: number;
  sessions: number;
}

export interface TimeDistribution {
  time: string;
  percent: number;
}

export interface SessionStats {
  avgSession: number;
  weeklyAvg: number;
}

export interface LearningTimeAnalytics {
  dailyData: DailyLearningData[];
  timeDistribution: TimeDistribution[];
  sessionStats: SessionStats;
}

export interface RecentActivityItem {
  id: string;
  user: string;
  userId: string;
  action: string;
  time: Date;
  userAvatar?: string;
  itemId?: string;
  itemType?: string;
  itemName?: string;
}
