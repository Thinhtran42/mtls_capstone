import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      password,
      fullname,
      phone,
      role,
      avatar,
      experience,
      address,
      specialization,
      about,
    } = createUserDto;

    // Check if the email already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      fullname,
      phone,
      role: role || 'student',
      isActive: true,
      avatar,
      experience,
      address,
      specialization,
      about,
      createAt: new Date(),
      updateAt: new Date(),
    });

    return user.save();
  }

  async findAll(): Promise<{ users: User[]; count: number }> {
    const users = await this.userModel.find().exec();

    return {
      users,
      count: users.length,
    };
  }

  async findAllLockedUsers(): Promise<{ users: User[]; count: number }> {
    const users = await this.userModel.find({ isLocked: true }).exec();

    return {
      users,
      count: users.length,
    };
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id, isActive: true }).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Chỉ kiểm tra email nếu có trong dữ liệu cập nhật
    if (updateUserDto.email) {
      const existingEmail = await this.userModel
        .findOne({ email: updateUserDto.email, _id: { $ne: id } })
        .exec();
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Chỉ kiểm tra phone nếu có trong dữ liệu cập nhật
    if (updateUserDto.phone) {
      const existingPhone = await this.userModel
        .findOne({ phone: updateUserDto.phone, _id: { $ne: id } })
        .exec();
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true, runValidators: true })
      .exec();
    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = false;
    return user.save();
  }

  async findAllTeachers(): Promise<{ users: User[]; count: number }> {
    const users = await this.userModel
      .find({ isActive: true, role: 'teacher' })
      .exec();

    return {
      users,
      count: users.length,
    };
  }

  async findAllStudents(): Promise<{ users: User[]; count: number }> {
    const users = await this.userModel.find({ role: 'student' }).exec();

    return {
      users,
      count: users.length,
    };
  }

  async unlockUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isLocked = false;
    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    return user.save();
  }
}
