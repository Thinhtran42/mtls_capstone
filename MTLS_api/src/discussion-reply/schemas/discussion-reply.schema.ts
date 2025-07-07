import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class DiscussionReply extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  })
  discussionId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true
  })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const DiscussionReplySchema = SchemaFactory.createForClass(DiscussionReply);