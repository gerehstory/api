import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorksModule } from '../works/works.module';
import { UsersModule } from '../users/users.module';
import { RevisionsModule } from '../revisions/revisions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    WorksModule,
    UsersModule,
    RevisionsModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
