import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoryTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;
}
