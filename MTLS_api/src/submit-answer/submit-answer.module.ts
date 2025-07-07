import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubmitAnswerService } from './submit-answer.service';
import { SubmitAnswerController } from './submit-answer.controller';
import { SubmitAnswer, SubmitAnswerSchema } from './schemas/submit-answer.schema';
import { OptionService } from '../option/option.service';
import { OptionSchema } from 'src/option/schemas/option.schema';
import { Option } from 'src/option/schemas/option.schema';
import { DoQuizService } from 'src/do-quiz/do-quiz.service';
import { DoQuizSchema } from 'src/do-quiz/schemas/do-quiz.schema';
import { DoQuiz } from 'src/do-quiz/schemas/do-quiz.schema';
import { DoExerciseService } from 'src/do-exercise/do-exercise.service';
import { DoExerciseSchema } from 'src/do-exercise/schemas/do-exercise.schema';
import { DoExercise } from 'src/do-exercise/schemas/do-exercise.schema';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { UserModule } from 'src/user/user.module';
import { QuizModule } from 'src/quiz/quiz.module';
import { QuestionModule } from 'src/question/question.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubmitAnswer.name, schema: SubmitAnswerSchema }]),
    MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
    MongooseModule.forFeature([{ name: DoQuiz.name, schema: DoQuizSchema }]),
    MongooseModule.forFeature([{ name: DoExercise.name, schema: DoExerciseSchema }]),
    ExerciseModule,
    QuizModule,
    UserModule,
    QuestionModule
  ],
  controllers: [SubmitAnswerController],
  providers: [SubmitAnswerService, OptionService, DoQuizService, DoExerciseService],
  exports: [SubmitAnswerService, OptionService, DoQuizService, DoExerciseService],
})
export class SubmitAnswerModule {} 