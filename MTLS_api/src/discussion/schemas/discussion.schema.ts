import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true, // Tự động thêm createAt và updateAt
})
export class Discussion extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Module',
    required: true,
  })
  moduleId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  // createAt và updateAt sẽ tự động được tạo nhờ timestamps: true
}

export const DiscussionSchema = SchemaFactory.createForClass(Discussion);
