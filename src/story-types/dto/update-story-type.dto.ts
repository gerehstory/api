import { PartialType } from '@nestjs/swagger';
import { CreateStoryTypeDto } from './create-story-type.dto';

export class UpdateStoryTypeDto extends PartialType(CreateStoryTypeDto) {}
