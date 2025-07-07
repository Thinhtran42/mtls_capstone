/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<HydratedDocument<User>>,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly settingsService: SettingsService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async signup(signUpDto: SignUpDto) {
    const {
      email,
      password,
      fullname,
      phoneNumber,
      role,
      avatar,
      experience,
      address,
      specialization,
      about
    } = signUpDto;

    // Kiểm tra email đã tồn tại
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Lấy các cài đặt bảo mật
    const securitySettings = await this.settingsService.getSecuritySettings();

    // Kiểm tra độ dài mật khẩu
    if (password.length < securitySettings.passwordMinLength) {
      throw new BadRequestException(`Password must be at least ${securitySettings.passwordMinLength} characters`);
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = new this.userModel({
      email,
      password: hashedPassword,
      fullname,
      phone: phoneNumber,
      role: role || 'student', // Nếu không có role, mặc định là 'student'
      isActive: true,
      avatar: avatar || `https://avatar.iran.liara.run/public/boy`,
      experience,
      address,
      specialization,
      about,
      createAt: new Date(),
      updateAt: new Date(),
    });

    await user.save();

    // Tạo JWT token tương tự như khi login
    const payload = { sub: user._id, role: user.role };

    return {
      message: 'User registered successfully',
      access_token: this.jwtService.sign(payload),
      // Nếu muốn trả về thêm thông tin user (không bao gồm password)
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email }).exec();

    // Lấy cài đặt bảo mật
    const securitySettings = await this.settingsService.getSecuritySettings();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra nếu tài khoản bị vô hiệu hóa
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is disabled');
    }

    // Kiểm tra nếu tài khoản bị khóa
    if (user.isLocked) {
      throw new UnauthorizedException('Your account is temporarily locked, please reset your password to continue accessing the website');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Tăng số lần đăng nhập thất bại
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();

      // Kiểm tra nếu đạt ngưỡng đăng nhập thất bại
      if (user.failedLoginAttempts >= securitySettings.loginAttempts) {
        user.isLocked = true;
        await user.save();
        throw new UnauthorizedException('Your account is temporarily locked, please reset your password to continue accessing the website');
      }

      await user.save();
      throw new UnauthorizedException('Wrong email or password');
    }

    // Đăng nhập thành công, reset số lần đăng nhập thất bại
    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    await user.save();

    // Lấy timeout phiên từ cài đặt
    const expiresIn = `${securitySettings.sessionTimeout}m`;

    // Đảm bảo sub chứa ID người dùng dưới dạng string
    const payload = {
      sub: user._id.toString(),
      role: user.role
    };

    console.log('Creating token with payload:', payload);

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  async googleLogin(idToken: string) {
    try {
      console.log('Received idToken:', idToken);

      // Lấy cài đặt bảo mật
      const securitySettings = await this.settingsService.getSecuritySettings();

      // Sử dụng FirebaseService để verify token
      const decodedToken = await this.firebaseService.verifyToken(idToken);
      console.log('Decoded Firebase token:', decodedToken);

      // Lấy thông tin user từ decoded token
      const { email, name, picture } = decodedToken;
      console.log('Extracted user info:', { email, name, picture });

      // Kiểm tra user trong database
      let user = await this.userModel.findOne({ email }).exec();
      console.log('Existing user in database:', user);

      // Kiểm tra nếu tài khoản bị vô hiệu hóa
      if (user && !user.isActive) {
        throw new UnauthorizedException('Your account is disabled');
      }

      // Kiểm tra nếu tài khoản bị khóa
      if (user && user.isLocked) {
        throw new UnauthorizedException('Your account is temporarily locked, please reset your password to continue accessing the website');
      }

      if (!user) {
        console.log('Creating new user with email:', email);
        // Nếu user chưa tồn tại, tạo user mới
        user = new this.userModel({
          email,
          fullname: name,
          avatar: picture,
          role: 'student',
          isActive: true,
          createAt: new Date(),
          updateAt: new Date(),
          password: await bcrypt.hash(Math.random().toString(36), 10),
        });
        await user.save();
        console.log('New user created:', user);
      }

      // Đăng nhập thành công, reset số lần đăng nhập thất bại
      user.failedLoginAttempts = 0;
      user.lastFailedLogin = null;
      await user.save();

      // Lấy timeout phiên từ cài đặt
      const expiresIn = `${securitySettings.sessionTimeout}m`;

      // Tạo JWT token như login bình thường
      const payload = { sub: user._id, role: user.role };
      console.log('Creating JWT with payload:', payload);

      const result = {
        access_token: this.jwtService.sign(payload, { expiresIn }),
        user: {
          _id: user._id,
          email: user.email,
          fullname: user.fullname,
          avatar: user.avatar,
        },
      };
      console.log('Final response:', result);

      return result;
    } catch (error) {
      console.error('Error in googleLogin:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Tạo token reset password
    const resetToken = this.jwtService.sign({ email }, { expiresIn: '15m' });

    // Lưu token vào user
    user.resetPasswordToken = resetToken;
    await user.save();

    // Gửi email
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Reset Password',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    });

    return {
      message: 'Reset password instructions sent to email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Lấy cài đặt bảo mật
    const securitySettings = await this.settingsService.getSecuritySettings();

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < securitySettings.passwordMinLength) {
      throw new BadRequestException(`Password must be at least ${securitySettings.passwordMinLength} characters`);
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel
        .findOne({
          email: payload.email,
          resetPasswordToken: token,
        })
        .exec();

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      // Cập nhật mật khẩu mới
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = null;

      // Mở khóa tài khoản nếu bị khóa trước đó
      user.isLocked = false;
      user.failedLoginAttempts = 0;
      user.lastFailedLogin = null;

      await user.save();

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
