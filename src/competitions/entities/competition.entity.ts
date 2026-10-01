import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StoryType } from '../../story-types/entities/story-type.entity';
import { CompetitionStatus } from '../enums/competition-status.enum';
import { CompetitionCriterion } from './competition-criterion.entity';
import { CompetitionJudge } from './competition-judge.entity';
import { CompetitionEntry } from './competition-entry.entity';

@Entity('competitions')
@Index(['status', 'applicationDeadline'])
export class Competition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: CompetitionStatus,
    default: CompetitionStatus.Draft,
  })
  status: CompetitionStatus;

  @Column({ type: 'timestamp' })
  applicationDeadline: Date;

  @Column({ type: 'int' })
  firstRoundJudgeCount: number;

  @Column({ type: 'int' })
  minAcceptVotes: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  cutoffScore: number;

  @Column({ default: false })
  allowFirstRoundJudgesInSecondRound: boolean;

  @ManyToOne(() => User, { eager: true })
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  firstRoundStartedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  firstRoundCompletedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  secondRoundStartedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  secondRoundCompletedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  tieBreakStartedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  tieBreakCompletedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @ManyToMany(() => StoryType)
  @JoinTable({ name: 'competition_allowed_types' })
  allowedTypes: StoryType[];

  @OneToMany(() => CompetitionCriterion, (criterion) => criterion.competition, {
    cascade: true,
  })
  criteria: CompetitionCriterion[];

  @OneToMany(() => CompetitionJudge, (judge) => judge.competition, {
    cascade: true,
  })
  judges: CompetitionJudge[];

  @OneToMany(() => CompetitionEntry, (entry) => entry.competition)
  entries: CompetitionEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
