import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const existing = await this.genreRepository.findOneBy({
      name: createGenreDto.name,
    });
    if (existing) {
      throw new ConflictException('Genre already exists');
    }
    return this.genreRepository.save(
      this.genreRepository.create(createGenreDto),
    );
  }

  findAll() {
    return this.genreRepository.find();
  }

  async findOne(id: number) {
    const genre = await this.genreRepository.findOneBy({ id });
    if (!genre) {
      throw new NotFoundException();
    }
    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.findOne(id);
    if (updateGenreDto.name) {
      genre.name = updateGenreDto.name;
    }
    return this.genreRepository.save(genre);
  }

  async remove(id: number) {
    const genre = await this.findOne(id);
    await this.genreRepository.remove(genre);
    return { deleted: true };
  }
}
