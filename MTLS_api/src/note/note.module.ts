import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Note, NoteSchema } from './schemas/note.schema';
import { CourseModule } from '../course/course.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    CourseModule,
    AuthModule,
  ],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}