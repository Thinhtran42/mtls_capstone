import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoQuizService } from './do-quiz.service';
import { DoQuizController } from './do-quiz.controller';
import { DoQuiz, DoQuizSchema } from './schemas/do-quiz.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { QuizModule } from 'src/quiz/quiz.module';
import { QuestionModule } from 'src/question/question.module';
import { OptionModule } from 'src/option/option.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoQuiz.name, schema: DoQuizSchema }]),
    AuthModule,
    UserModule,
    QuizModule,
    QuestionModule,
    OptionModule,
  ],
  controllers: [DoQuizController],
  providers: [DoQuizService],
  exports: [DoQuizService],
})
export class DoQuizModule {}
