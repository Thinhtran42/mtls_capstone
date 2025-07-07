import { LessonProgress, LessonProgressSchema } from './../lesson-progress/schemas/lesson-progress.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import {
  Module as CourseModuleSchema,
  ModuleSchema,
} from './schemas/module.schema';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { User, UserSchema } from '../user/schema/user.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { Section, SectionSchema } from '../section/schemas/section.schema';
import { Quiz, QuizSchema } from '../quiz/schemas/quiz.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../assignment/schemas/assignment.schema';
import { Exercise, ExerciseSchema } from '../exercise/schemas/exercise.schema';
import { DoQuiz, DoQuizSchema } from '../do-quiz/schemas/do-quiz.schema';
import {
  DoAssignment,
  DoAssignmentSchema,
} from '../do-assignment/schemas/do-assignment.schema';
import {
  DoExercise,
  DoExerciseSchema,
} from '../do-exercise/schemas/do-exercise.schema';
import { Lesson, LessonSchema } from '../lesson/schemas/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: CourseModuleSchema.name, schema: ModuleSchema },
      { name: User.name, schema: UserSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Exercise.name, schema: ExerciseSchema },
      { name: DoQuiz.name, schema: DoQuizSchema },
      { name: DoAssignment.name, schema: DoAssignmentSchema },
      { name: DoExercise.name, schema: DoExerciseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
    ]),
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CourseController, EnrollmentController, ModuleController],
  providers: [CourseService, EnrollmentService, ModuleService],
  exports: [ModuleService, CourseService],
})
export class CourseModule {}
