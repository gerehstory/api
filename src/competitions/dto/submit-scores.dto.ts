import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class ScoreLineDto {
  @IsInt()
  criterionId: number;

  @IsNumber()
  score: number;
}

export class SubmitScoresDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScoreLineDto)
  scores: ScoreLineDto[];
}
