/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class User {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, enum: ['admin', 'student', 'teacher'], required: true })
  role: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String })
  avatar: string;

  // New fields
  @Prop({ type: String })
  experience: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  specialization: string;

  @Prop({ type: String })
  about: string;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Date, default: Date.now })
  updateAt: Date;

  // Security fields
  @Prop({ type: String })
  resetPasswordToken: string;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date, default: null })
  lastFailedLogin: Date;

  @Prop({ type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ type: Date, default: null })
  lockedUntil: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Đảm bảo email và phone không trùng lặp
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });


