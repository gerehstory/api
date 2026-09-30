import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Competition } from './competition.entity';
import { SecondRoundScore } from './second-round-score.entity';

@Entity('competition_criteria')
@Unique(['competition', 'sortOrder'])
export class CompetitionCriterion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Competition, (competition) => competition.criteria, {
    onDelete: 'CASCADE',
  })
  competition: Competition;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  minScore: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  weight: number;

  @Column({ type: 'int' })
  sortOrder: number;

  @OneToMany(() => SecondRoundScore, (score) => score.criterion)
  scores: SecondRoundScore[];
}
