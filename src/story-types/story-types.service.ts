import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoryType } from './entities/story-type.entity';
import { CreateStoryTypeDto } from './dto/create-story-type.dto';
import { UpdateStoryTypeDto } from './dto/update-story-type.dto';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class StoryTypesService {
  constructor(
    @InjectRepository(StoryType)
    private readonly storyTypeRepository: Repository<StoryType>,
  ) {}

  async create(dto: CreateStoryTypeDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.storyTypeRepository.findOne({
      where: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException('Story type already exists');
    }
    return this.storyTypeRepository.save(
      this.storyTypeRepository.create({ name: dto.name, slug }),
    );
  }

  findAll() {
    return this.storyTypeRepository.find();
  }

  async findOne(id: number) {
    const storyType = await this.storyTypeRepository.findOneBy({ id });
    if (!storyType) {
      throw new NotFoundException('Story type not found');
    }
    return storyType;
  }

  async update(id: number, dto: UpdateStoryTypeDto) {
    const storyType = await this.findOne(id);
    if (dto.name) storyType.name = dto.name;
    if (dto.slug || dto.name) {
      storyType.slug = slugify(dto.slug ?? dto.name ?? storyType.slug);
    }
    return this.storyTypeRepository.save(storyType);
  }

  async remove(id: number) {
    const storyType = await this.findOne(id);
    await this.storyTypeRepository.remove(storyType);
    return { deleted: true };
  }
}
