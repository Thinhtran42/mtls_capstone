import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class LessonProgress extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lesson', required: true })
  lesson: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  status: boolean;
  
  @Prop({ type: Date, default: Date.now })
  markAt: Date;
}

export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);