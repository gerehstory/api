import { IsNotEmpty, IsString } from 'class-validator';

export class RejectRevisionDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
