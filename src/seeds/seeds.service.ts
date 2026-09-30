import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Genre } from '../genre/entities/genre.entity';
import { Like } from '../like/entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Work } from '../works/entities/works.entity';
import { Comment } from '../comment/entities/comment.entity';
import { StoryType } from '../story-types/entities/story-type.entity';
import { Revision } from '../revisions/entities/revision.entity';
import { Chapter } from '../revisions/entities/chapter.entity';
import { StatusEnum } from '../revisions/enum/status.enum';
import { RoleEnum } from '../users/enums/role.enum';
import { Competition } from '../competitions/entities/competition.entity';
import { CompetitionCriterion } from '../competitions/entities/competition-criterion.entity';
import { CompetitionJudge } from '../competitions/entities/competition-judge.entity';
import { CompetitionStatus } from '../competitions/enums/competition-status.enum';

@Injectable()
export class SeedService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async run() {
    console.log('Seeding database...');
    await this.dataSource.synchronize(true);

    const userRepo = this.dataSource.getRepository(User);
    const users = await userRepo.save([
      {
        phone: '09900000001',
        firstName: 'Ada',
        lastName: 'Admin',
        role: RoleEnum.Admin,
      },
      {
        phone: '09900000002',
        firstName: 'Nariman',
        lastName: 'Jahanshahi',
        role: RoleEnum.User,
      },
      {
        phone: '09900000003',
        firstName: 'AhmadAli',
        lastName: 'Jahanshahi',
        role: RoleEnum.User,
      },
      {
        phone: '09900000004',
        firstName: 'Jordan',
        lastName: 'Judge',
        role: RoleEnum.User,
      },
      {
        phone: '09900000005',
        firstName: 'Jamie',
        lastName: 'Judge',
        role: RoleEnum.User,
      },
      {
        phone: '09900000006',
        firstName: 'Riley',
        lastName: 'Judge',
        role: RoleEnum.User,
      },
    ]);
    const [admin, authorOne, authorTwo, judgeOne, judgeTwo, judgeThree] = users;

    const typeRepo = this.dataSource.getRepository(StoryType);
    const types = await typeRepo.save([
      { name: 'Short story', slug: 'short-story' },
      { name: 'Kids story', slug: 'kids-story' },
      { name: 'Transcript', slug: 'transcript' },
    ]);

    const genreRepo = this.dataSource.getRepository(Genre);
    const genres = await genreRepo.save([
      { name: 'Fantasy' },
      { name: 'Sci-Fi' },
      { name: 'Horror' },
    ]);

    const workRepo = this.dataSource.getRepository(Work);
    const revisionRepo = this.dataSource.getRepository(Revision);
    const chapterRepo = this.dataSource.getRepository(Chapter);

    const work = await workRepo.save(
      workRepo.create({
        user: authorOne,
        type: types[0],
        genres: [genres[0]],
      }),
    );

    const revision = await revisionRepo.save(
      revisionRepo.create({
        work,
        title: 'Dragon Mountain',
        status: StatusEnum.Approved,
        version: 1,
        createdBy: authorOne,
        reviewedBy: admin,
      }),
    );

    await chapterRepo.save([
      {
        revision,
        position: 1,
        title: 'The Ascent',
        content: 'The mountain woke before the village did.',
      },
      {
        revision,
        position: 2,
        title: 'The Peak',
        content: 'A dragon waited in the snow.',
      },
    ]);

    work.publishedRevision = revision;
    await workRepo.save(work);

    const likeRepo = this.dataSource.getRepository(Like);
    await likeRepo.save({ user: authorTwo, work });

    const commentRepo = this.dataSource.getRepository(Comment);
    await commentRepo.save({
      user: authorTwo,
      work,
      content: 'Amazing story!',
    });

    const competitionRepo = this.dataSource.getRepository(Competition);
    const competition = await competitionRepo.save(
      competitionRepo.create({
        name: 'Spring Short Story Prize',
        description: 'Anonymous two-round judging for original short stories.',
        status: CompetitionStatus.Draft,
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        firstRoundJudgeCount: 3,
        minAcceptVotes: 2,
        cutoffScore: 12,
        allowFirstRoundJudgesInSecondRound: true,
        createdBy: admin,
        allowedTypes: [types[0], types[1]],
      }),
    );

    const criterionRepo = this.dataSource.getRepository(CompetitionCriterion);
    await criterionRepo.save([
      {
        competition,
        name: 'Title',
        minScore: 0,
        maxScore: 2,
        weight: 1,
        sortOrder: 1,
      },
      {
        competition,
        name: 'Ending',
        minScore: 0,
        maxScore: 10,
        weight: 1,
        sortOrder: 2,
      },
    ]);

    const judgeRepo = this.dataSource.getRepository(CompetitionJudge);
    await judgeRepo.save([
      {
        competition,
        user: judgeOne,
        isFirstRound: true,
        isSecondRound: true,
        assignedBy: admin,
      },
      {
        competition,
        user: judgeTwo,
        isFirstRound: true,
        isSecondRound: true,
        assignedBy: admin,
      },
      {
        competition,
        user: judgeThree,
        isFirstRound: true,
        isSecondRound: true,
        assignedBy: admin,
      },
    ]);

    console.log('Database seeding completed.');
  }
}
