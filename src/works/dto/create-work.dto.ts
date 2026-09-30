import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWorkDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  // @Min(3)
  title: string;

  @IsString()
  @IsNotEmpty()
  // @Min(3)
  description: string;

  @IsArray()
  @IsOptional()
  genres: number[];
}
