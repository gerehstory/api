import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from './entities/works.entity';
import { GenreModule } from '../genre/genre.module';
import { UsersModule } from '../users/users.module';
import { RevisionsModule } from '../revisions/revisions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Work]),
    GenreModule,
    UsersModule,
    RevisionsModule,
  ],
  controllers: [WorksController],
  providers: [WorksService],
  exports: [WorksService],
})
export class WorksModule {}
