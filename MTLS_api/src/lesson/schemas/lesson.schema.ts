import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Section } from '../../section/schemas/section.schema';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true })
  section: Section;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  duration: number;

}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
