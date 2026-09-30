import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from '../works/entities/works.entity';
import { User } from '../users/entities/user.entity';
import { Like } from './entities/like.entity';
import { UsersModule } from '../users/users.module';
import { WorksModule } from '../works/works.module';
import { RevisionsModule } from '../revisions/revisions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    UsersModule,
    RevisionsModule,
    WorksModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
