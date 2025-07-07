import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  fullname: string;

  @Prop()
  phone: string;

  @Prop({ required: true, enum: ['student', 'teacher', 'admin'], default: 'student' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  avatar: string;

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

  @Prop()
  resetPasswordToken: string;

  // Các trường bảo mật mới để quản lý đăng nhập thất bại
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
