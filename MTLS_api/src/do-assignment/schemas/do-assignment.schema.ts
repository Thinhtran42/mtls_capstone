import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Assignment } from '../../assignment/schemas/assignment.schema';

export type DoAssignmentDocument = HydratedDocument<DoAssignment>;

@Schema({ timestamps: true })
export class DoAssignment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  })
  assignment: Assignment;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  student: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  teacher: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: Number,
    min: 0,
    max: 10,
    default: null,
  })
  score: number;

  @Prop()
  comment: string;

  @Prop({
    type: String,
    default: null,
  })
  submissionUrl: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  submittedAt: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isGraded: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;

  @Prop({
    type: String,
    required: false,
  })
  title: string;

  @Prop({
    type: String,
    required: false,
  })
  description: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  status: boolean;
  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
  })
  course: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: false,
  })
  module: mongoose.Schema.Types.ObjectId;
}

export const DoAssignmentSchema = SchemaFactory.createForClass(DoAssignment);

// Thêm index để tối ưu truy vấn
DoAssignmentSchema.index({ assignment: 1, student: 1 }, { unique: true });
