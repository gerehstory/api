import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competition } from './entities/competition.entity';
import { CompetitionCriterion } from './entities/competition-criterion.entity';
import { CompetitionJudge } from './entities/competition-judge.entity';
import { CompetitionEntry } from './entities/competition-entry.entity';
import { FirstRoundVote } from './entities/first-round-vote.entity';
import { SecondRoundEvaluation } from './entities/second-round-evaluation.entity';
import { SecondRoundScore } from './entities/second-round-score.entity';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsScoringService } from './competitions-scoring.service';
import { CompetitionsScheduler } from './competitions.scheduler';
import { UsersModule } from '../users/users.module';
import { StoryTypesModule } from '../story-types/story-types.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Competition,
      CompetitionCriterion,
      CompetitionJudge,
      CompetitionEntry,
      FirstRoundVote,
      SecondRoundEvaluation,
      SecondRoundScore,
    ]),
    UsersModule,
    StoryTypesModule,
    AuditModule,
  ],
  controllers: [CompetitionsController],
  providers: [
    CompetitionsService,
    CompetitionsScoringService,
    CompetitionsScheduler,
  ],
  exports: [CompetitionsService, CompetitionsScoringService],
})
export class CompetitionsModule {}
