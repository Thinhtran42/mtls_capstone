import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from './course.schema';
import { Section } from '../../section/schemas/section.schema';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class Module {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Date, default: Date.now })
  updateAt: Date;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Section' })
  sections: MongooseSchema.Types.ObjectId[];
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
