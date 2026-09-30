import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryType } from './entities/story-type.entity';
import { StoryTypesService } from './story-types.service';
import { StoryTypesController } from './story-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoryType])],
  controllers: [StoryTypesController],
  providers: [StoryTypesService],
  exports: [StoryTypesService],
})
export class StoryTypesModule {}
