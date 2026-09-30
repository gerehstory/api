import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CompetitionEntry } from './competition-entry.entity';
import { User } from '../../users/entities/user.entity';
import { SecondRoundScore } from './second-round-score.entity';

@Entity('second_round_evaluations')
@Unique(['entry', 'judge', 'scoringPass'])
export class SecondRoundEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CompetitionEntry, (entry) => entry.evaluations, {
    onDelete: 'RESTRICT',
  })
  entry: CompetitionEntry;

  @ManyToOne(() => User, { eager: true })
  judge: User;

  @Column({ type: 'int' })
  scoringPass: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  weightedTotal: number;

  @OneToMany(() => SecondRoundScore, (score) => score.evaluation, {
    cascade: true,
  })
  scores: SecondRoundScore[];

  @CreateDateColumn()
  submittedAt: Date;
}
