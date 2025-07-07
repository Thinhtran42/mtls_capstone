import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { SectionModule } from 'src/section/section.module';
import { Question, QuestionSchema } from 'src/question/schemas/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    SectionModule,
  ],

  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule { }
