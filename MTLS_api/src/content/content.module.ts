import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Content, ContentSchema } from './schemas/content.schema';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    forwardRef(() => LessonModule),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}