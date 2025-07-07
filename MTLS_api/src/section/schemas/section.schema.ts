import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Module } from '../../course/schemas/module.schema';

export type SectionDocument = Section & Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class Section {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Module', required: true })
  module: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['Lesson', 'Quiz', 'Exercise', 'Assignment'] })
  type: string;

  @Prop({ required: true })
  duration: number; // in minutes

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Date, default: Date.now })
  updateAt: Date;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
