import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Option extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Question',
    required: true,
  })
  question: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
