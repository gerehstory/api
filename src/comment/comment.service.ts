import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { WorksService } from '../works/works.service';
import { Comment } from './entities/comment.entity';
import { UserPayloadModel } from '../auth/types/user.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private readonly userService: UsersService,
    private readonly worksService: WorksService,
  ) {}

  async create(
    workId: number,
    userPayload: UserPayloadModel,
    createCommentDto: CreateCommentDto,
  ) {
    const user = await this.userService.findOne(userPayload.sub);
    const work = await this.worksService.findOneById(workId);

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      user,
      work,
    });

    return this.commentRepository.save(comment);
  }

  async remove(id: number) {
    const result = await this.commentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException();
    }
    return { message: 'Comment deleted successfully' };
  }
}
