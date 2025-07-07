import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class DoExercise extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exercise', required: true })
  exercise: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  score: number;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Boolean, default: false })
  status: boolean;
}

export const DoExerciseSchema = SchemaFactory.createForClass(DoExercise);
