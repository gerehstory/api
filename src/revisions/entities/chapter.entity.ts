import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Revision } from './revision.entity';

@Entity('chapters')
@Unique(['revision', 'position'])
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Revision, (revision) => revision.chapters, {
    onDelete: 'CASCADE',
  })
  revision: Revision;

  @Column()
  position: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;
}
