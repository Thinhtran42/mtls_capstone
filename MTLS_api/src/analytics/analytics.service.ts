import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../user/schema/user.schema';
import { Lesson } from '../lesson/schemas/lesson.schema';
import { Quiz } from '../quiz/schemas/quiz.schema';
import { Assignment } from '../assignment/schemas/assignment.schema';
import { DoQuiz } from '../do-quiz/schemas/do-quiz.schema';
import { DoAssignment } from '../do-assignment/schemas/do-assignment.schema';
import { LessonProgress } from '../lesson-progress/schemas/lesson-progress.schema';
import { Course } from '../course/schemas/course.schema';
import { Rating } from '../rating/schemas/rating.schema';
import {
  ActivityData,
  CourseCompletion,
  CoursePerformance,
  DashboardOverview,
  LearningTimeAnalytics,
  PopularContent,
  RegistrationTrend,
  StorageData,
  UserDistribution,
  RecentActivityItem,
} from './analytics.interfaces';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(DoQuiz.name) private doQuizModel: Model<DoQuiz>,
    @InjectModel(DoAssignment.name) private doAssignmentModel: Model<DoAssignment>,
    @InjectModel(LessonProgress.name) private lessonProgressModel: Model<LessonProgress>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
  ) {}

  // Lấy thông tin tổng quan cho dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      // Đếm số lượng học viên (role = student)
      const totalStudents = await this.userModel.countDocuments({ role: 'student' });

      // Lấy số lượng học viên trong tháng trước để tính % thay đổi
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const studentsLastMonth = await this.userModel.countDocuments({
        role: 'student',
        createAt: { $lt: lastMonth },
      });

      // Tính phần trăm thay đổi
      const studentChange = studentsLastMonth > 0
        ? ((totalStudents - studentsLastMonth) / studentsLastMonth * 100).toFixed(1)
        : '0.0';

      // Đếm tổng số bài học
      const totalLessons = await this.lessonModel.countDocuments();
      const lessonsLastMonth = await this.lessonModel.countDocuments({
        createAt: { $lt: lastMonth },
      });
      const lessonChange = lessonsLastMonth > 0
        ? ((totalLessons - lessonsLastMonth) / lessonsLastMonth * 100).toFixed(1)
        : '0.0';

      // Đếm tổng số bài tập
      const totalAssignments = await this.assignmentModel.countDocuments();
      const assignmentsLastMonth = await this.assignmentModel.countDocuments({
        createAt: { $lt: lastMonth },
      });
      const assignmentChange = assignmentsLastMonth > 0
        ? ((totalAssignments - assignmentsLastMonth) / assignmentsLastMonth * 100).toFixed(1)
        : '0.0';

      // Đếm số người dùng active (có hoạt động trong 30 ngày qua)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Lấy danh sách các ID người dùng có hoạt động trong 30 ngày qua
      const activeDoQuizUsers = await this.doQuizModel.distinct('student', {
        submittedAt: { $gte: thirtyDaysAgo },
      });

      const activeDoAssignmentUsers = await this.doAssignmentModel.distinct('student', {
        submittedAt: { $gte: thirtyDaysAgo },
      });

      const activeLessonProgressUsers = await this.lessonProgressModel.distinct('student', {
        markAt: { $gte: thirtyDaysAgo },
      });

      // Gộp tất cả ID người dùng active và loại bỏ trùng lặp
      const allActiveUserIds = [
        ...activeDoQuizUsers,
        ...activeDoAssignmentUsers,
        ...activeLessonProgressUsers,
      ];

      const uniqueActiveUserIds = [...new Set(allActiveUserIds)];
      const activeUsers = uniqueActiveUserIds.length;

      // Tính % thay đổi người dùng active so với tháng trước
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Lấy hoạt động từ 30-60 ngày trước
      const previousActiveDoQuizUsers = await this.doQuizModel.distinct('student', {
        submittedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      });

      const previousActiveDoAssignmentUsers = await this.doAssignmentModel.distinct('student', {
        submittedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      });

      const previousActiveLessonProgressUsers = await this.lessonProgressModel.distinct('student', {
        markAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      });

      // Gộp tất cả ID người dùng active và loại bỏ trùng lặp
      const allPreviousActiveUserIds = [
        ...previousActiveDoQuizUsers,
        ...previousActiveDoAssignmentUsers,
        ...previousActiveLessonProgressUsers,
      ];

      const uniquePreviousActiveUserIds = [...new Set(allPreviousActiveUserIds)];
      const previousActiveUsers = uniquePreviousActiveUserIds.length;

      const activeUserChange = previousActiveUsers > 0
        ? ((activeUsers - previousActiveUsers) / previousActiveUsers * 100).toFixed(1)
        : '0.0';

      return {
        totalStudents,
        studentChange,
        totalLessons,
        lessonChange,
        totalAssignments,
        assignmentChange,
        activeUsers,
        activeUserChange,
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }

  // Lấy dữ liệu hoạt động người dùng theo thời gian
  async getUserActivity(timeRange: string): Promise<ActivityData[]> {
    try {
      const startDate = new Date();

      // Xác định phạm vi thời gian
      switch (timeRange) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default to week
      }

      // Lấy dữ liệu hoạt động
      const quizActivity = await this.doQuizModel.find({
        submittedAt: { $gte: startDate },
      }).sort({ submittedAt: 1 });

      const assignmentActivity = await this.doAssignmentModel.find({
        submittedAt: { $gte: startDate },
      }).sort({ submittedAt: 1 });

      const lessonActivity = await this.lessonProgressModel.find({
        markAt: { $gte: startDate },
      }).sort({ markAt: 1 });

      // Nhóm dữ liệu theo ngày
      const activityByDay: Record<string, ActivityData> = {};

      // Xử lý dữ liệu quiz
      quizActivity.forEach((activity) => {
        const activityObj = activity.toObject ? activity.toObject() : activity;
        const date = new Date(activityObj.submittedAt).toISOString().split('T')[0];
        if (!activityByDay[date]) {
          activityByDay[date] = { date, quizzes: 0, lessons: 0, exercises: 0 };
        }
        activityByDay[date].quizzes++;
      });

      // Xử lý dữ liệu bài tập
      assignmentActivity.forEach((activity) => {
        const activityObj = activity.toObject ? activity.toObject() : activity;
        const date = new Date(activityObj.submittedAt).toISOString().split('T')[0];
        if (!activityByDay[date]) {
          activityByDay[date] = { date, quizzes: 0, lessons: 0, exercises: 0 };
        }
        activityByDay[date].exercises++;
      });

      // Xử lý dữ liệu bài học
      lessonActivity.forEach((activity) => {
        const activityObj = activity.toObject ? activity.toObject() : activity;
        // Sử dụng markAt hoặc một giá trị mặc định
        const date = new Date(activityObj.markAt || new Date()).toISOString().split('T')[0];
        if (!activityByDay[date]) {
          activityByDay[date] = { date, quizzes: 0, lessons: 0, exercises: 0 };
        }
        activityByDay[date].lessons++;
      });

      // Chuyển đổi thành mảng và sắp xếp theo ngày
      const result = Object.values(activityByDay).sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      return result;
    } catch (error) {
      console.error('Error in getUserActivity:', error);
      throw error;
    }
  }

  // Lấy phân phối người dùng theo vai trò
  async getUserDistribution(): Promise<UserDistribution[]> {
    try {
      const userCounts = await this.userModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]);

      const result = userCounts.map((item) => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1), // Capitalize role name
        value: item.count,
      }));

      return result;
    } catch (error) {
      console.error('Error in getUserDistribution:', error);
      throw error;
    }
  }

  // Lấy dữ liệu đăng ký người dùng theo tháng
  async getUserRegistrationTrend(): Promise<RegistrationTrend[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const users = await this.userModel.find({
        createAt: { $gte: oneYearAgo },
      }).select('createAt');

      // Nhóm người dùng theo tháng
      const usersByMonth: Record<string, RegistrationTrend> = {};
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      users.forEach((user) => {
        const monthIndex = user.createAt.getMonth();
        const monthName = months[monthIndex];
        const year = user.createAt.getFullYear();
        const key = `${monthName} ${year}`;

        if (!usersByMonth[key]) {
          usersByMonth[key] = { month: monthName, year, count: 0 };
        }

        usersByMonth[key].count++;
      });

      // Chuyển đổi thành mảng và sắp xếp theo thời gian
      const result = Object.values(usersByMonth).sort((a: any, b: any) => {
        const yearDiff = a.year - b.year;
        if (yearDiff !== 0) return yearDiff;
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

      return result;
    } catch (error) {
      console.error('Error in getUserRegistrationTrend:', error);
      throw error;
    }
  }

  // Lấy tỷ lệ hoàn thành khóa học
  async getCourseCompletionRates(): Promise<CourseCompletion[]> {
    try {
      const courses = await this.courseModel.find().select('_id title');
      const result: CourseCompletion[] = [];

      for (const course of courses) {
        // Lấy số lượng học viên đăng ký khóa học
        const totalStudents = await this.userModel.countDocuments({
          courses: course._id,
          role: 'student',
        });

        if (totalStudents === 0) continue; // Bỏ qua khóa học không có học viên

        // Lấy số lượng học viên đã hoàn thành
        // (Giả sử hoàn thành khi tiến độ >= 90%)
        let completedStudents = 0;
        const students = await this.userModel.find({
          courses: course._id,
          role: 'student',
        }).select('_id');

        for (const student of students) {
          // Tính toán tiến độ của học viên cho khóa học này
          const progress = await this.calculateStudentCourseProgress(
            student._id.toString(),
            course._id.toString(),
          );
          if (progress >= 90) {
            completedStudents++;
          }
        }

        const completionRate = totalStudents > 0
          ? Math.round((completedStudents / totalStudents) * 100)
          : 0;

        result.push({
          name: course.title,
          completion: completionRate,
          students: totalStudents,
        });
      }

      return result;
    } catch (error) {
      console.error('Error in getCourseCompletionRates:', error);
      throw error;
    }
  }

  // Phương thức hỗ trợ để tính toán tiến độ của học viên trong một khóa học
  private async calculateStudentCourseProgress(
    studentId: string,
    courseId: string,
  ): Promise<number> {
    try {
      // Lấy tất cả các bài học, bài tập, quiz trong khóa học
      const lessons = await this.lessonModel.find({ course: courseId })
        .select('_id');
      const assignments = await this.assignmentModel.find({ course: courseId })
        .select('_id');
      const quizzes = await this.quizModel.find({ course: courseId })
        .select('_id');

      const totalActivities = lessons.length + assignments.length + quizzes.length;
      if (totalActivities === 0) return 0; // Không có hoạt động nào

      // Đếm số hoạt động đã hoàn thành
      const completedLessons = await this.lessonProgressModel.countDocuments({
        student: studentId,
        lesson: { $in: lessons.map((l) => l._id) },
        status: true,
      });

      const completedAssignments = await this.doAssignmentModel.countDocuments({
        student: studentId,
        assignment: { $in: assignments.map((a) => a._id) },
        status: true,
      });

      const completedQuizzes = await this.doQuizModel.countDocuments({
        student: studentId,
        quiz: { $in: quizzes.map((q) => q._id) },
        status: true,
      });

      const totalCompleted = completedLessons + completedAssignments + completedQuizzes;
      return (totalCompleted / totalActivities) * 100;
    } catch (error) {
      console.error('Error calculating student progress:', error);
      return 0;
    }
  }

  // Lấy dữ liệu sử dụng lưu trữ
  async getStorageUsage(): Promise<StorageData[]> {
    // Giả lập dữ liệu sử dụng lưu trữ (thực tế cần tính toán từ database)
    return [
      { name: 'Lessons', value: 32 },
      { name: 'Assignments', value: 18 },
      { name: 'Media', value: 45 },
      { name: 'System', value: 5 },
    ];
  }

  // Lấy thông tin điểm trung bình và hoàn thành khóa học
  async getCoursePerformanceAnalytics(): Promise<CoursePerformance> {
    try {
      // Lấy điểm trung bình quiz theo khóa học
      const courses = await this.courseModel.find().select('_id title');
      const quizScores = [];
      const assignmentCompletionData = { onTime: 0, late: 0, notSubmitted: 0 };

      for (const course of courses) {
        // Lấy tất cả quiz trong khóa học
        const quizzes = await this.quizModel.find({ course: course._id })
          .select('_id');
        if (quizzes.length === 0) continue;

        // Lấy tất cả kết quả làm quiz
        const quizResults = await this.doQuizModel.find({
          quiz: { $in: quizzes.map((q) => q._id) },
        }).select('score');

        // Tính điểm trung bình
        let totalScore = 0;
        quizResults.forEach((result) => {
          totalScore += result.score || 0;
        });

        const averageScore = quizResults.length > 0
          ? Math.round(totalScore / quizResults.length)
          : 0;

        quizScores.push({
          name: course.title.length > 15
            ? course.title.substring(0, 15) + '...'
            : course.title,
          score: averageScore,
        });

        // Lấy dữ liệu hoàn thành bài tập
        const assignments = await this.assignmentModel.find({ course: course._id })
          .select('_id');
        if (assignments.length > 0) {
          // Lấy tất cả bài nộp
          const submissions = await this.doAssignmentModel.find({
            assignment: { $in: assignments.map((a) => a._id) },
          }).select('submittedAt');

          submissions.forEach((submission) => {
            // Đơn giản hóa logic vì không có trường dueDate
            if (!submission.submittedAt) {
              assignmentCompletionData.notSubmitted++;
            } else {
              // Giả định rằng mọi bài nộp đều đúng hạn
              assignmentCompletionData.onTime++;
            }
          });
        }
      }

      // Tính phần trăm cho dữ liệu hoàn thành bài tập
      const totalSubmissions =
        assignmentCompletionData.onTime +
        assignmentCompletionData.late +
        assignmentCompletionData.notSubmitted;

      const completionRates = totalSubmissions > 0
        ? [
            {
              name: 'Completed On Time',
              value: Math.round((assignmentCompletionData.onTime / totalSubmissions) * 100),
            },
            {
              name: 'Completed Late',
              value: Math.round((assignmentCompletionData.late / totalSubmissions) * 100),
            },
            {
              name: 'Not Submitted',
              value: Math.round((assignmentCompletionData.notSubmitted / totalSubmissions) * 100),
            },
          ]
        : [
            { name: 'Completed On Time', value: 0 },
            { name: 'Completed Late', value: 0 },
            { name: 'Not Submitted', value: 0 },
          ];

      return {
        quizScores,
        completionRates,
      };
    } catch (error) {
      console.error('Error in getCoursePerformanceAnalytics:', error);
      throw error;
    }
  }

  // Lấy nội dung phổ biến
  async getPopularContent(): Promise<PopularContent> {
    try {
      // Lấy bài học phổ biến (dựa trên số lượt xem)
      const topLessons = await this.lessonModel.find()
        .sort({ viewCount: -1 })
        .limit(5)
        .select('title');

      // Lấy quiz phổ biến (dựa trên số lần làm)
      const quizAttempts = await this.doQuizModel.aggregate([
        {
          $group: {
            _id: '$quiz',
            attempts: { $sum: 1 },
            avgScore: { $avg: '$score' },
          },
        },
        { $sort: { attempts: -1 } },
        { $limit: 5 },
      ]);

      const quizIds = quizAttempts.map((item) => item._id);
      const quizzes = await this.quizModel.find({
        _id: { $in: quizIds },
      }).select('title');

      // Map data
      const quizMap = quizzes.reduce((acc, quiz) => {
        acc[quiz._id.toString()] = quiz.title;
        return acc;
      }, {});

      const topQuizzes = quizAttempts.map((item) => ({
        title: quizMap[item._id.toString()] || 'Unknown Quiz',
        attempts: item.attempts,
        avgScore: Math.round(item.avgScore || 0),
      }));

      // Lấy bài tập phổ biến
      const assignmentAttempts = await this.doAssignmentModel.aggregate([
        {
          $group: {
            _id: '$assignment',
            submissions: { $sum: 1 },
            onTimeCount: {
              $sum: {
                $cond: [
                  { $and: [
                    { $ne: ['$submittedAt', null] },
                  ]},
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { submissions: -1 } },
        { $limit: 5 },
      ]);

      const assignmentIds = assignmentAttempts.map((item) => item._id);
      const assignments = await this.assignmentModel.find({
        _id: { $in: assignmentIds },
      }).select('title');

      // Map data
      const assignmentMap = assignments.reduce((acc, assignment) => {
        acc[assignment._id.toString()] = assignment.title;
        return acc;
      }, {});

      const topAssignments = assignmentAttempts.map((item) => ({
        title: assignmentMap[item._id.toString()] || 'Unknown Assignment',
        submissions: item.submissions,
        onTime: item.submissions > 0
          ? `${Math.round((item.onTimeCount / item.submissions) * 100)}%`
          : '0%',
      }));

      return {
        topLessons: topLessons.map((lesson) => ({
          title: lesson.title,
          views: 0,  // Không sử dụng viewCount vì không có trong schema
          rating: 0,  // Không sử dụng rating vì không có trong schema
        })),
        topQuizzes,
        topAssignments,
      };
    } catch (error) {
      console.error('Error in getPopularContent:', error);
      throw error;
    }
  }

  // Lấy phân tích thời gian học tập
  async getLearningTimeAnalytics(): Promise<LearningTimeAnalytics> {
    try {
      // Lấy dữ liệu học tập theo ngày
      // Ở ví dụ này, chúng ta sẽ tạo dữ liệu mẫu
      const dailyData = [
        { day: 'Monday', hours: 1.8, sessions: 3.2 },
        { day: 'Tuesday', hours: 2.1, sessions: 3.7 },
        { day: 'Wednesday', hours: 1.5, sessions: 2.8 },
        { day: 'Thursday', hours: 2.3, sessions: 4.1 },
        { day: 'Friday', hours: 1.7, sessions: 3.0 },
        { day: 'Saturday', hours: 3.2, sessions: 5.4 },
        { day: 'Sunday', hours: 2.8, sessions: 4.8 },
      ];

      // Phân phối thời gian học tập
      const timeDistribution = [
        { time: 'Morning (6AM - 12PM)', percent: 35 },
        { time: 'Afternoon (12PM - 6PM)', percent: 25 },
        { time: 'Evening (6PM - 12AM)', percent: 32 },
        { time: 'Night (12AM - 6AM)', percent: 8 },
      ];

      // Thống kê phiên học tập
      const sessionStats = {
        avgSession: 2.1,
        weeklyAvg: 12.5,
      };

      return {
        dailyData,
        timeDistribution,
        sessionStats,
      };
    } catch (error) {
      console.error('Error in getLearningTimeAnalytics:', error);
      throw error;
    }
  }

  // Lấy dữ liệu hoạt động gần đây của người dùng
  async getRecentActivities(limit: number = 5): Promise<RecentActivityItem[]> {
    try {
      // Lấy dữ liệu hoạt động từ các collection khác nhau
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Hoạt động trong 30 ngày gần đây

      // 1. Lấy hoạt động làm quiz gần đây
      const recentQuizzes = await this.doQuizModel.find({
        submittedAt: { $gte: startDate },
      })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .populate('student', 'fullname avatar')
      .populate('quiz', 'title');

      // 2. Lấy hoạt động làm assignment gần đây
      const recentAssignments = await this.doAssignmentModel.find({
        submittedAt: { $gte: startDate },
      })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .populate('student', 'fullname avatar')
      .populate('assignment', 'title');

      // 3. Lấy tiến độ bài học gần đây
      const recentLessons = await this.lessonProgressModel.find({
        markAt: { $gte: startDate },
      })
      .sort({ markAt: -1 })
      .limit(limit)
      .populate('student', 'fullname avatar')
      .populate('lesson', 'title');

      // Chuyển đổi dữ liệu quiz thành dạng hoạt động
      const quizActivities = recentQuizzes.map((quiz) => {
        const quizData = quiz.toObject();
        // Đảm bảo điểm số quiz được hiển thị với giá trị hợp lệ
        const score = Math.min(Math.max(Math.round(quizData.score || 0), 0), 100);
        return {
          id: quizData._id.toString(),
          user: (quizData.student as any).fullname || 'Unknown User',
          userId: (quizData.student as any)._id.toString(),
          action: `Completed a quiz with score ${score}`,
          time: quizData.submittedAt,
          userAvatar: (quizData.student as any).avatar,
          itemId: (quizData.quiz as any)._id.toString(),
          itemType: 'quiz',
          itemName: (quizData.quiz as any).title,
        };
      });

      // Chuyển đổi dữ liệu assignment thành dạng hoạt động
      const assignmentActivities = recentAssignments.map((assignment) => {
        const assignmentData = assignment.toObject();
        return {
          id: assignmentData._id.toString(),
          user: (assignmentData.student as any).fullname || 'Unknown User',
          userId: (assignmentData.student as any)._id.toString(),
          action: `Submitted an assignment`,
          time: assignmentData.submittedAt,
          userAvatar: (assignmentData.student as any).avatar,
          itemId: (assignmentData.assignment as any)._id.toString(),
          itemType: 'assignment',
          itemName: (assignmentData.assignment as any).title,
        };
      });

      // Chuyển đổi dữ liệu lesson thành dạng hoạt động
      const lessonActivities = recentLessons.map((lesson) => {
        const lessonData = lesson.toObject();
        return {
          id: lessonData._id.toString(),
          user: (lessonData.student as any).fullname || 'Unknown User',
          userId: (lessonData.student as any)._id.toString(),
          action: `Completed a lesson`,
          time: lessonData.markAt,
          userAvatar: (lessonData.student as any).avatar,
          itemId: (lessonData.lesson as any)._id.toString(),
          itemType: 'lesson',
          itemName: (lessonData.lesson as any).title,
        };
      });

      // Gộp tất cả hoạt động và sắp xếp theo thời gian giảm dần
      const allActivities = [
        ...quizActivities,
        ...assignmentActivities,
        ...lessonActivities,
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      // Trả về số lượng hoạt động theo limit
      return allActivities.slice(0, limit);
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      throw error;
    }
  }
}
