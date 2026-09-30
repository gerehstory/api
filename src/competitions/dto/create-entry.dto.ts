import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEntryDto {
  @IsInt()
  typeId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
