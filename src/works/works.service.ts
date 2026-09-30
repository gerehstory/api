import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Work } from './entities/works.entity';
import { Repository } from 'typeorm';
import { StatusEnum } from '../revisions/enum/status.enum';
import { UserPayloadModel } from '../auth/types/user.model';

const publicRelations = {
  user: true,
  type: true,
  genres: true,
  publishedRevision: { chapters: true },
  likes: { user: true },
  comments: { user: true },
};

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
  ) {}

  async findOneById(id: number) {
    const work = await this.worksRepository.findOne({
      where: { id },
      relations: {
        ...publicRelations,
        revisions: { chapters: true },
      },
      order: { revisions: { version: 'DESC' } },
    });
    if (!work) {
      throw new NotFoundException();
    }
    return work;
  }

  async findOneByIdWithLatestApproved(id: number) {
    const work = await this.worksRepository.findOne({
      where: { id },
      relations: {
        user: true,
        type: true,
        genres: true,
        publishedRevision: { chapters: true },
        revisions: { chapters: true },
        likes: true,
        comments: { user: true },
      },
    });

    if (!work) {
      throw new NotFoundException();
    }

    const published =
      work.publishedRevision ??
      work.revisions
        .filter((r) => r.status === StatusEnum.Approved)
        .sort((a, b) => b.version - a.version)[0];

    if (!published) {
      throw new NotFoundException();
    }

    work.revisions = [published];
    return work;
  }

  findMyWorks(user: UserPayloadModel) {
    return this.worksRepository.find({
      where: { user: { id: user.sub } },
      relations: publicRelations,
    });
  }

  async findAll() {
    const works = await this.worksRepository.find({
      relations: {
        user: true,
        type: true,
        genres: true,
        publishedRevision: { chapters: true },
        revisions: { chapters: true },
      },
    });

    return works
      .map((work) => {
        const published =
          work.publishedRevision ??
          work.revisions
            .filter((r) => r.status === StatusEnum.Approved)
            .sort((a, b) => b.version - a.version)[0];
        return published
          ? { ...work, revisions: [published], publishedRevision: published }
          : null;
      })
      .filter(Boolean);
  }
}
