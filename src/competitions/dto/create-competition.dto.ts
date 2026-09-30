import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  applicationDeadline: string;

  @IsInt()
  @Min(1)
  firstRoundJudgeCount: number;

  @IsInt()
  @Min(1)
  minAcceptVotes: number;

  @IsNumber()
  cutoffScore: number;

  @IsOptional()
  @IsBoolean()
  allowFirstRoundJudgesInSecondRound?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  allowedTypeIds?: number[];
}
