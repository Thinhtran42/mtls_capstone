import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { Exercise, ExerciseSchema } from './schemas/exercise.schema';
import { SectionModule } from 'src/section/section.module';
import { Question, QuestionSchema } from 'src/question/schemas/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    SectionModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule { }
