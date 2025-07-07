/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SectionModule } from './section/section.module';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizModule } from './quiz/quiz.module';
import { QuestionModule } from './question/question.module';
import { OptionModule } from './option/option.module';
import { SubmitAnswerModule } from './submit-answer/submit-answer.module';
import { DoQuizModule } from './do-quiz/do-quiz.module';
import { ExerciseModule } from './exercise/exercise.module';
import { DoExerciseModule } from './do-exercise/do-exercise.module';
import { JwtModule } from '@nestjs/jwt';
import { ContentModule } from './content/content.module';
import { AssignmentModule } from './assignment/assignment.module';
import { DoAssignmentModule } from './do-assignment/do-assignment.module';
import { FirebaseModule } from './firebase/firebase.module';
import { RatingModule } from './rating/rating.module';
import { DiscussionModule } from './discussion/discussion.module';
import { DiscussionReplyModule } from './discussion-reply/discussion-reply.module';
import { NoteModule } from './note/note.module';
import { LessonProgressModule } from './lesson-progress/lesson-progress.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 10 }] }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
      auth: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
      },
    }),
    AuthModule,
    UserModule,
    CourseModule,
    SectionModule,
    LessonModule,
    QuizModule,
    QuestionModule,
    OptionModule,
    SubmitAnswerModule,
    DoQuizModule,
    ExerciseModule,
    DoExerciseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    ContentModule,
    AssignmentModule,
    DoAssignmentModule,
    FirebaseModule,
    RatingModule,
    DiscussionModule,
    DiscussionReplyModule,
    NoteModule,
    LessonProgressModule,
    AnalyticsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
