import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Competition } from './competition.entity';
import { User } from '../../users/entities/user.entity';
import { StoryType } from '../../story-types/entities/story-type.entity';
import { FirstRoundVote } from './first-round-vote.entity';
import { SecondRoundEvaluation } from './second-round-evaluation.entity';

@Entity('competition_entries')
@Unique(['competition', 'author'])
@Index(['competition', 'isPublic'])
export class CompetitionEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Competition, (competition) => competition.entries, {
    onDelete: 'RESTRICT',
  })
  competition: Competition;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @ManyToOne(() => StoryType, { eager: true })
  type: StoryType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime' })
  submittedAt: Date;

  @Column({ default: false })
  advancedToSecondRound: boolean;

  @Column({ default: false })
  isInTieBreak: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  finalScore: number | null;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ default: false })
  isPublic: boolean;

  @OneToMany(() => FirstRoundVote, (vote) => vote.entry)
  votes: FirstRoundVote[];

  @OneToMany(() => SecondRoundEvaluation, (evaluation) => evaluation.entry)
  evaluations: SecondRoundEvaluation[];
}
