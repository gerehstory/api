import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusEnum } from './enum/status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Work } from '../works/entities/works.entity';
import { Repository } from 'typeorm';
import { Revision } from './entities/revision.entity';
import { Chapter } from './entities/chapter.entity';
import {
  ChapterInputDto,
  CreateRevisionDto,
} from './dto/create-revision.dto';
import { UpdateRevisionDto } from './dto/update-revision.dto';
import { UsersService } from '../users/users.service';
import { RoleEnum } from '../users/enums/role.enum';
import { UserPayloadModel } from '../auth/types/user.model';
import { GenreService } from '../genre/genre.service';
import { StoryTypesService } from '../story-types/story-types.service';

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
    @InjectRepository(Revision)
    private readonly revisionsRepository: Repository<Revision>,
    @InjectRepository(Chapter)
    private readonly chaptersRepository: Repository<Chapter>,
    private readonly userService: UsersService,
    private readonly genreService: GenreService,
    private readonly storyTypesService: StoryTypesService,
  ) {}

  private mapChapters(chapters: ChapterInputDto[]) {
    return chapters.map((chapter, index) =>
      this.chaptersRepository.create({
        title: chapter.title,
        content: chapter.content,
        position: chapter.position ?? index + 1,
      }),
    );
  }

  private latestRevision(revisions: Revision[]) {
    return [...revisions].sort((a, b) => b.version - a.version)[0];
  }

  async createWork(dto: CreateRevisionDto, userId: number) {
    const user = await this.userService.findOne(userId);
    const type = await this.storyTypesService.findOne(dto.typeId);
    const genres = dto.genres
      ? await Promise.all(dto.genres.map((id) => this.genreService.findOne(id)))
      : [];

    const work = await this.worksRepository.save(
      this.worksRepository.create({
        user,
        type,
        genres,
      }),
    );

    const revision = this.revisionsRepository.create({
      work,
      status: StatusEnum.Draft,
      title: dto.title,
      version: 1,
      createdBy: user,
      chapters: this.mapChapters(dto.chapters),
    });

    return this.revisionsRepository.save(revision);
  }

  async submit(workId: number, userId: number) {
    const revision = await this.revisionsRepository.findOne({
      where: { work: { id: workId } },
      order: { version: 'DESC' },
      relations: {
        work: { user: true },
        createdBy: true,
        chapters: true,
      },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.status !== StatusEnum.Draft) {
      throw new BadRequestException('Revision is not in draft status');
    }

    const user = await this.userService.findOne(userId);
    const isOwner = revision.work.user.id === userId;
    const isAdmin = user.role === RoleEnum.Admin;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to submit this revision',
      );
    }

    revision.status = StatusEnum.Pending;
    revision.createdBy = user;
    return this.revisionsRepository.save(revision);
  }

  async approve(id: number, adminId: number) {
    const revision = await this.revisionsRepository.findOne({
      where: { id },
      relations: { work: true, chapters: true },
    });

    if (!revision) {
      throw new NotFoundException();
    }

    if (revision.status !== StatusEnum.Pending) {
      throw new BadRequestException('Only pending revisions can be approved');
    }

    const admin = await this.userService.findOne(adminId);
    revision.status = StatusEnum.Approved;
    revision.reviewedBy = admin;
    await this.revisionsRepository.save(revision);

    revision.work.publishedRevision = revision;
    await this.worksRepository.save(revision.work);

    return revision;
  }

  async reject(id: number, adminId: number, reason: string) {
    const revision = await this.revisionsRepository.findOne({
      where: { id },
      relations: { work: true },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.status !== StatusEnum.Pending) {
      throw new BadRequestException('Only pending revisions can be rejected');
    }

    const admin = await this.userService.findOne(adminId);
    revision.status = StatusEnum.Rejected;
    revision.reviewedBy = admin;
    revision.reviewMessage = reason;
    return this.revisionsRepository.save(revision);
  }

  async restore(id: number, userId: number) {
    const revision = await this.revisionsRepository.findOne({
      where: { id },
      relations: { work: { user: true }, chapters: true },
    });

    if (!revision) {
      throw new NotFoundException();
    }

    if (revision.status !== StatusEnum.Approved) {
      throw new BadRequestException('Only approved revisions can be restored');
    }

    const user = await this.userService.findOne(userId);
    const isOwner = revision.work.user.id === userId;
    if (user.role !== RoleEnum.Admin && !isOwner) {
      throw new ForbiddenException();
    }

    revision.work.publishedRevision = revision;
    await this.worksRepository.save(revision.work);
    return revision;
  }

  async history(id: number, sub: number) {
    const revision = await this.revisionsRepository.findOne({
      where: { id },
      relations: { work: { user: true, revisions: { chapters: true } } },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    const user = await this.userService.findOne(sub);
    const isOwner = revision.work.user.id === sub;
    const isAdmin = user.role === RoleEnum.Admin;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException();
    }

    return revision.work.revisions.sort((a, b) => b.version - a.version);
  }

  async findOne(id: number) {
    const revision = await this.revisionsRepository.findOne({
      where: { id },
      relations: {
        work: { genres: true, type: true },
        createdBy: true,
        reviewedBy: true,
        chapters: true,
      },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    return revision;
  }

  async update(workId: number, dto: UpdateRevisionDto, userId: number) {
    const work = await this.worksRepository.findOne({
      where: { id: workId },
      relations: {
        user: true,
        publishedRevision: { chapters: true },
        revisions: { chapters: true },
      },
    });

    if (!work) {
      throw new NotFoundException();
    }

    const user = await this.userService.findOne(userId);
    if (user.role !== RoleEnum.Admin && work.user.id !== userId) {
      throw new ForbiddenException();
    }

    const latest = this.latestRevision(work.revisions);
    if (!latest) {
      throw new NotFoundException('Revision not found');
    }

    if (latest.status === StatusEnum.Draft) {
      if (dto.title) latest.title = dto.title;
      if (dto.chapters) {
        await this.chaptersRepository.delete({ revision: { id: latest.id } });
        latest.chapters = this.mapChapters(dto.chapters);
      }
      return this.revisionsRepository.save(latest);
    }

    const source =
      work.publishedRevision ??
      work.revisions
        .filter((r) => r.status === StatusEnum.Approved)
        .sort((a, b) => b.version - a.version)[0] ??
      latest;

    const version = Math.max(...work.revisions.map((r) => r.version)) + 1;
    const chapters = dto.chapters
      ? this.mapChapters(dto.chapters)
      : (source.chapters ?? []).map((chapter) =>
          this.chaptersRepository.create({
            title: chapter.title,
            content: chapter.content,
            position: chapter.position,
          }),
        );

    const draft = this.revisionsRepository.create({
      title: dto.title ?? source.title,
      version,
      status: StatusEnum.Draft,
      createdBy: user,
      work,
      chapters,
    });

    return this.revisionsRepository.save(draft);
  }

  async findMyWorks(user: UserPayloadModel) {
    return this.worksRepository.find({
      where: { user: { id: user.sub } },
      order: { revisions: { version: 'DESC' } },
      relations: {
        type: true,
        genres: true,
        publishedRevision: { chapters: true },
        revisions: { chapters: true },
      },
    });
  }

  async findPending() {
    const works = await this.worksRepository.find({
      relations: {
        revisions: { work: true, createdBy: true, chapters: true },
      },
    });

    return works
      .map((work) => this.latestRevision(work.revisions))
      .filter((revision) => revision?.status === StatusEnum.Pending);
  }
}
