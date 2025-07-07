import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum SubmitType {
  QUIZ = 'quiz',
  EXERCISE = 'exercise',
}

@Schema({ timestamps: true })
export class SubmitAnswer extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Question',
    required: true,
  })
  question: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Option', required: true })
  option: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DoQuiz', required: false })
  doQuiz: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'DoExercise',
    required: false,
  })
  doExercise: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: SubmitType, required: true })
  submitType: SubmitType;
}

export const SubmitAnswerSchema = SchemaFactory.createForClass(SubmitAnswer);
