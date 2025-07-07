import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { SectionModule } from '../section/section.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    forwardRef(() => SectionModule),
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}