import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CompetitionEntry } from './competition-entry.entity';
import { User } from '../../users/entities/user.entity';
import { VoteDecision } from '../enums/vote-decision.enum';

@Entity('first_round_votes')
@Unique(['entry', 'judge'])
export class FirstRoundVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CompetitionEntry, (entry) => entry.votes, {
    onDelete: 'RESTRICT',
  })
  entry: CompetitionEntry;

  @ManyToOne(() => User, { eager: true })
  judge: User;

  @Column({ type: 'simple-enum', enum: VoteDecision })
  decision: VoteDecision;

  @Column({ type: 'text', nullable: true })
  rejectReason: string | null;

  @CreateDateColumn()
  submittedAt: Date;
}
