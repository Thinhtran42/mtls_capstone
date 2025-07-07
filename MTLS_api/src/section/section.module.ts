import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { Section, SectionSchema } from './schemas/section.schema';
import { CourseModule } from '../course/course.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }]),
    forwardRef(() => CourseModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
