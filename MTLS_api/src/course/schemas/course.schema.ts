import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import mongoose from 'mongoose';
import { CourseLevel } from '../dto/course-level.enum';

export type CourseDocument = Course & Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  about: string;

  @Prop({
    type: String,
    enum: CourseLevel,
    default: CourseLevel.BASIC,
  })
  level: CourseLevel;

  @Prop({ type: [String], required: false })
  learningObjectives: string[];

  @Prop({ type: [String], required: false })
  skills: string[];

  @Prop({ required: true })
  image: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  teacher: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Module',
    required: false,
  })
  module: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Date, default: Date.now })
  updateAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
