import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChapterInputDto {
  @IsOptional()
  @IsInt()
  position?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateRevisionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  typeId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  genres?: number[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChapterInputDto)
  chapters: ChapterInputDto[];
}
