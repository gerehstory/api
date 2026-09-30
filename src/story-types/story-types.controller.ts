import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StoryTypesService } from './story-types.service';
import { CreateStoryTypeDto } from './dto/create-story-type.dto';
import { UpdateStoryTypeDto } from './dto/update-story-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../users/enums/role.enum';

@ApiTags('story-types')
@Controller('story-types')
export class StoryTypesController {
  constructor(private readonly storyTypesService: StoryTypesService) {}

  @Get()
  findAll() {
    return this.storyTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storyTypesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post()
  create(@Body() dto: CreateStoryTypeDto) {
    return this.storyTypesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoryTypeDto,
  ) {
    return this.storyTypesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storyTypesService.remove(id);
  }
}
