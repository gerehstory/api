import { User } from '../../users/entities/user.entity';
import { Work } from '../../works/entities/works.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('likes')
@Unique(['user', 'work'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Work, (work) => work.likes, { onDelete: 'CASCADE' })
  work: Work;

  @CreateDateColumn()
  likedAt: Date;
}
