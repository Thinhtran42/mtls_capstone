import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Course } from './course.schema';

export type EnrollmentDocument = Enrollment & Document;

@Schema()
export class Enrollment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ required: true, enum: ['active', 'completed', 'dropped'] })
  status: string;

  @Prop({ default: Date.now })
  enrolledAt: Date;

  @Prop({ type: Object, default: {} })
  progress: {
    percentage: number;
    completedActivities: number;
    totalActivities: number;
    lastAccessedAt: Date;
  };
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
