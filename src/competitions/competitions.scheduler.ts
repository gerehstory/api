import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompetitionsService } from './competitions.service';

@Injectable()
export class CompetitionsScheduler {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  handleDeadlines() {
    return this.competitionsService.closeDueApplications();
  }
}
