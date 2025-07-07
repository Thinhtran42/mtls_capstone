import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Question extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: false })
  quiz: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  questionText: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exercise', required: false })
  exercise: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  notation: string;

  @Prop({ required: false, default: 'multipleChoice' })
  questionType: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);