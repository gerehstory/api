import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Competition } from '../../competitions/entities/competition.entity';
import { AuditAction } from '../enums/audit-action.enum';

@Entity('audit_logs')
@Index(['competition', 'createdAt'])
@Index(['entityType', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  actor: User | null;

  @ManyToOne(() => Competition, { nullable: true, onDelete: 'SET NULL' })
  competition: Competition | null;

  @Column({ type: 'varchar' })
  action: AuditAction | string;

  @Column()
  entityType: string;

  @Column({ type: 'integer', nullable: true })
  entityId: number | null;

  @Column({ type: 'simple-json', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
