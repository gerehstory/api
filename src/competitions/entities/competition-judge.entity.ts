import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Competition } from './competition.entity';
import { User } from '../../users/entities/user.entity';

@Entity('competition_judges')
@Unique(['competition', 'user'])
export class CompetitionJudge {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Competition, (competition) => competition.judges, {
    onDelete: 'CASCADE',
  })
  competition: Competition;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ default: false })
  isFirstRound: boolean;

  @Column({ default: false })
  isSecondRound: boolean;

  @ManyToOne(() => User)
  assignedBy: User;

  @CreateDateColumn()
  assignedAt: Date;
}
