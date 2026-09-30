import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Work } from '../../works/entities/works.entity';

@Entity('story_types')
export class StoryType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Work, (work) => work.type)
  works: Work[];
}
