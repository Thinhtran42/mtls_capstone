import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgressController } from './lesson-progress.controller';
import { LessonProgress, LessonProgressSchema } from './schemas/lesson-progress.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonProgress.name, schema: LessonProgressSchema },
    ]),
    AuthModule,
    UserModule,
    LessonModule,
  ],
  controllers: [LessonProgressController],
  providers: [LessonProgressService],
  exports: [LessonProgressService],
})
export class LessonProgressModule {} 