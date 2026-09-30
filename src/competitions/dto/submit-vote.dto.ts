import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VoteDecision } from '../enums/vote-decision.enum';

export class SubmitVoteDto {
  @IsEnum(VoteDecision)
  decision: VoteDecision;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rejectReason?: string;
}
