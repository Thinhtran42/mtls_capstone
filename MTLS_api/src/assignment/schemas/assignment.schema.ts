import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Section } from '../../section/schemas/section.schema';

export type AssignmentDocument = HydratedDocument<Assignment>;

// Định nghĩa interface cho DoAssignment để tránh circular dependency
interface DoAssignmentInterface {
  _id: mongoose.Types.ObjectId;
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  teacher?: mongoose.Types.ObjectId;
  score?: number;
  comment?: string;
  submissionUrl?: string;
  submittedAt: Date;
  isGraded: boolean;
}

// Thêm interface để định nghĩa virtual property
export interface AssignmentWithSubmissions extends Assignment {
  submissions?: DoAssignmentInterface[];
  _id: mongoose.Types.ObjectId;
}

@Schema({ timestamps: true })
export class Assignment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  })
  section: Section;

  @Prop({ required: true })
  title: string;

  @Prop()
  questionText: string;

  @Prop()
  description: string;

  @Prop()
  fileUrl: string;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

// Thêm virtual property để lấy danh sách bài nộp
AssignmentSchema.virtual('submissions', {
  ref: 'DoAssignment',
  localField: '_id',
  foreignField: 'assignment',
});

// Đảm bảo virtuals được bao gồm khi chuyển đổi sang JSON
AssignmentSchema.set('toJSON', { virtuals: true });
AssignmentSchema.set('toObject', { virtuals: true });