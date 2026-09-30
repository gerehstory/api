import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from './enums/audit-action.enum';
import { User } from '../users/entities/user.entity';
import { Competition } from '../competitions/entities/competition.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  log(params: {
    actor?: User | null;
    competition?: Competition | null;
    action: AuditAction | string;
    entityType: string;
    entityId?: number | null;
    payload?: Record<string, unknown> | null;
  }) {
    const row = this.auditRepository.create({
      actor: params.actor ?? null,
      competition: params.competition ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      payload: params.payload ?? null,
    });
    return this.auditRepository.save(row);
  }

  findByCompetition(competitionId: number) {
    return this.auditRepository.find({
      where: { competition: { id: competitionId } },
      relations: { actor: true },
      order: { createdAt: 'DESC' },
    });
  }
}
