import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  async findByPhone(phone: string) {
    const user = await this.userRepository.findOneBy({ phone });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findOrCreateByPhone(phone: string) {
    const existing = await this.userRepository.findOneBy({ phone });
    if (existing) {
      return existing;
    }
    return this.userRepository.save(
      this.userRepository.create({
        phone,
        firstName: '',
        lastName: '',
      }),
    );
  }

  getMe(sub: number) {
    return this.findOne(sub);
  }
}
