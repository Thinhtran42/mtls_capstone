import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  stars: number;

  @Prop({ required: false })
  comment: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

// Thêm index để đảm bảo mỗi học viên chỉ đánh giá một khóa học một lần
RatingSchema.index({ student: 1, course: 1 }, { unique: true });