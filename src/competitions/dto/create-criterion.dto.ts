import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCriterionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  minScore: number;

  @IsNumber()
  maxScore: number;

  @IsNumber()
  weight: number;

  @IsInt()
  @Min(1)
  sortOrder: number;
}
