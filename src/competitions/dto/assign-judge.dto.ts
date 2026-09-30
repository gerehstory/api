import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class AssignJudgeDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsBoolean()
  isFirstRound?: boolean;

  @IsOptional()
  @IsBoolean()
  isSecondRound?: boolean;
}
