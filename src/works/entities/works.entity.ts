import { Genre } from '../../genre/entities/genre.entity';
import { Like } from '../../like/entities/like.entity';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { StoryType } from '../../story-types/entities/story-type.entity';
import { Revision } from '../../revisions/entities/revision.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('works')
export class Work {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.works, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => StoryType, (type) => type.works, { eager: true })
  type: StoryType;

  @OneToMany(() => Revision, (revision) => revision.work)
  revisions: Revision[];

  @ManyToOne(() => Revision, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'publishedRevisionId' })
  publishedRevision: Revision | null;

  @RelationId((work: Work) => work.publishedRevision)
  publishedRevisionId: number | null;

  @ManyToMany(() => Genre, (genre) => genre.works)
  @JoinTable()
  genres: Genre[];

  @OneToMany(() => Like, (like) => like.work)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.work)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
