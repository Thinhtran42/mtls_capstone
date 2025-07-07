import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ required: true, default: 'string' })
  type: string; // 'string', 'number', 'boolean', 'json'

  @Prop()
  description: string;

  @Prop({ default: false })
  isSecret: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

// Pre-save hook to update updatedAt field
SettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
