import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { RoleEnum } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { WorksService } from '../works/works.service';
import { UserPayloadModel } from '../auth/types/user.model';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    private readonly userService: UsersService,
    private readonly workService: WorksService,
  ) {}

  async createLike(workId: number, userPayload: UserPayloadModel) {
    const user = await this.userService.findOne(userPayload.sub);
    const work = await this.workService.findOneById(workId);

    const like = this.likesRepository.create({
      user,
      work,
    });

    return this.likesRepository.save(like);
  }

  async deleteLike(id: number, userPayload: UserPayloadModel) {
    const like = await this.likesRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!like) {
      throw new NotFoundException();
    }

    const user = await this.userService.findOne(userPayload.sub);
    const isAdmin = user.role === RoleEnum.Admin;
    const isOwner = like.user.id === userPayload.sub;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException();
    }

    return this.likesRepository.delete({ id });
  }
}
