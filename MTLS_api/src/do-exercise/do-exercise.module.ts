import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoExerciseService } from './do-exercise.service';
import { DoExerciseController } from './do-exercise.controller';
import { DoExercise, DoExerciseSchema } from './schemas/do-exercise.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { QuestionModule } from '../question/question.module';
import { OptionModule } from '../option/option.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoExercise.name, schema: DoExerciseSchema }]),
    AuthModule,
    ExerciseModule,
    UserModule,
    QuestionModule,
    OptionModule,
  ],
  controllers: [DoExerciseController],
  providers: [DoExerciseService],
  exports: [DoExerciseService],
})
export class DoExerciseModule {}
