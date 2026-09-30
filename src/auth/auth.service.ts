import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly userService: UsersService,
    private jwt: JwtService,
  ) {}

  async requestOtp(authenticateDto: AuthenticateDto) {
    const user = await this.userService.findOrCreateByPhone(
      authenticateDto.phone,
    );

    const lastOtp = await this.otpRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    if (lastOtp && lastOtp.createdAt > new Date(Date.now() - 60 * 1000)) {
      throw new BadRequestException(
        'Please wait before requesting another OTP',
      );
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otp = this.otpRepository.create({
      user,
      code: otpCode,
      expiresAt,
    });
    await this.otpRepository.save(otp);

    console.log(`OTP for ${authenticateDto.phone}: ${otpCode}`);

    return { message: 'OTP sent' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    // await this.verify(verifyOtpDto);
    const user = await this.userService.findByPhone(verifyOtpDto.phone);

    const token = await this.jwt.signAsync({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    return { token };
  }

  async verify(verifyDto: VerifyOtpDto) {
    const { phone, code } = verifyDto;

    const user = await this.userService.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const latestOtp = await this.otpRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    if (!latestOtp) {
      throw new BadRequestException('No OTP requested for this number');
    }

    if (latestOtp.code !== code) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (latestOtp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    await this.otpRepository.delete(latestOtp.id);

    return true;
  }
}
