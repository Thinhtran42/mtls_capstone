import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionService } from './option.service';
import { OptionController } from './option.controller';
import { Option, OptionSchema } from './schemas/option.schema';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
    QuestionModule,
  ],
  controllers: [OptionController],
  providers: [OptionService],
  exports: [OptionService],
})
export class OptionModule {}
