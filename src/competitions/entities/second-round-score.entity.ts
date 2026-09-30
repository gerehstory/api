import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SecondRoundEvaluation } from './second-round-evaluation.entity';
import { CompetitionCriterion } from './competition-criterion.entity';

@Entity('second_round_scores')
@Unique(['evaluation', 'criterion'])
export class SecondRoundScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SecondRoundEvaluation, (evaluation) => evaluation.scores, {
    onDelete: 'CASCADE',
  })
  evaluation: SecondRoundEvaluation;

  @ManyToOne(() => CompetitionCriterion, (criterion) => criterion.scores, {
    onDelete: 'RESTRICT',
  })
  criterion: CompetitionCriterion;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  score: number;
}
