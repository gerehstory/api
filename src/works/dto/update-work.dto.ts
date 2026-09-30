import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateWorkDto {
  @IsString()
  @IsNotEmpty()
  // @Min(3)
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  genres: number[];
}
