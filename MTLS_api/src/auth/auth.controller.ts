import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'Tài khoản đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({
    status: 401,
    description: 'Thông tin đăng nhập không chính xác',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-google-token')
  @ApiOperation({ summary: 'Xác thực token Google và đăng nhập' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: {
          type: 'string',
          description: 'Firebase ID Token',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ' })
  async verifyGoogleToken(@Body('idToken') idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @Post('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Body() body) {
    return this.authService.googleLogin(body);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu khôi phục mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Email khôi phục đã được gửi' })
  @ApiResponse({ status: 404, description: 'Email không tồn tại' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log(forgotPasswordDto);
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được đặt lại' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc hết hạn' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
