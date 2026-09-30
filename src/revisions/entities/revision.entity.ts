import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Work } from '../../works/entities/works.entity';
import { User } from '../../users/entities/user.entity';
import { StatusEnum } from '../enum/status.enum';
import { Chapter } from './chapter.entity';

@Entity('revisions')
@Unique(['work', 'version'])
export class Revision {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Work, (work) => work.revisions, { onDelete: 'CASCADE' })
  work: Work;

  @Column()
  title: string;

  @Column({
    type: 'simple-enum',
    enum: StatusEnum,
    default: StatusEnum.Draft,
  })
  status: StatusEnum;

  @Column()
  version: number;

  @ManyToOne(() => User, (user) => user.revisions)
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy?: User | null;

  @Column({ type: 'text', nullable: true })
  reviewMessage?: string | null;

  @OneToMany(() => Chapter, (chapter) => chapter.revision, {
    cascade: true,
  })
  chapters: Chapter[];

  @CreateDateColumn()
  createdAt: Date;
}
