import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEnum } from '../enums/role.enum';
import { Work } from '../../works/entities/works.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Like } from '../../like/entities/like.entity';
import { Revision } from '../../revisions/entities/revision.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'simple-enum', enum: RoleEnum, default: RoleEnum.User })
  role: RoleEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Work, (work) => work.user)
  works: Work[];

  @OneToMany(() => Revision, (revision) => revision.createdBy)
  revisions: Revision[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
