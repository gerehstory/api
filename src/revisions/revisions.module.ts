import { Module } from '@nestjs/common';
import { RevisionsService } from './revisions.service';
import { RevisionsController } from './revisions.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revision } from './entities/revision.entity';
import { Work } from '../works/entities/works.entity';
import { Chapter } from './entities/chapter.entity';
import { GenreModule } from '../genre/genre.module';
import { StoryTypesModule } from '../story-types/story-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Revision, Work, Chapter]),
    UsersModule,
    GenreModule,
    StoryTypesModule,
  ],
  controllers: [RevisionsController],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
