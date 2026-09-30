import { Module } from '@nestjs/common';
import { SeedService } from './seeds.service';

@Module({
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}
