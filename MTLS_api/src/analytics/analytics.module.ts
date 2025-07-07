import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User, UserSchema } from '../user/schema/user.schema';
import { Lesson, LessonSchema } from '../lesson/schemas/lesson.schema';
import { Quiz, QuizSchema } from '../quiz/schemas/quiz.schema';
import { Assignment, AssignmentSchema } from '../assignment/schemas/assignment.schema';
import { DoQuiz, DoQuizSchema } from '../do-quiz/schemas/do-quiz.schema';
import { DoAssignment, DoAssignmentSchema } from '../do-assignment/schemas/do-assignment.schema';
import { LessonProgress, LessonProgressSchema } from '../lesson-progress/schemas/lesson-progress.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { Rating, RatingSchema } from '../rating/schemas/rating.schema';
import { SystemMonitorService } from './system-monitor.service';
import { SystemMonitorController } from './system-monitor.controller';
import { PerformanceInterceptor } from './performance.interceptor';
import { ErrorTrackingFilter } from './error-tracking.filter';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: DoQuiz.name, schema: DoQuizSchema },
      { name: DoAssignment.name, schema: DoAssignmentSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  controllers: [AnalyticsController, SystemMonitorController],
  providers: [
    AnalyticsService,
    SystemMonitorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorTrackingFilter,
    },
  ],
  exports: [AnalyticsService, SystemMonitorService],
})
export class AnalyticsModule {}
