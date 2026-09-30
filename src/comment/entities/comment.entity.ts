import { User } from '../../users/entities/user.entity';
import { Work } from '../../works/entities/works.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Work, (work) => work.comments, { onDelete: 'CASCADE' })
  work: Work;

  @Column()
  content: string;

  @CreateDateColumn()
  postedAt: Date;
}
