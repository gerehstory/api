import { IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}
