import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Lesson } from '../../lesson/schemas/lesson.schema';

export type ContentDocument = HydratedDocument<Content>;

export enum ContentType {
  VIDEO = 'Video',
  READING = 'Reading',
  IMAGE = 'Image',
}

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class Content {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true })
  lesson: Lesson;

  @Prop({ required: true, enum: ContentType })
  type: string;

  @Prop({ required: true })
  data: string;

  @Prop({ required: false })
  caption: string;

  @Prop()
  createAt: Date;

  @Prop()
  updateAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const ContentSchema = SchemaFactory.createForClass(Content);