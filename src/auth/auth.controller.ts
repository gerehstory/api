import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  requestOtp(@Body() authenticateDto: AuthenticateDto) {
    return this.authService.requestOtp(authenticateDto);
  }

  @Post('verify')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
}
