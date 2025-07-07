import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Module', required: true })
  module: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// Thêm index để tối ưu truy vấn
NoteSchema.index({ student: 1, module: 1 });