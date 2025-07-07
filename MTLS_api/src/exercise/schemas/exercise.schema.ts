import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Exercise extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Section', required: true })
  section: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  duration: number; // in minutes
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise); 