import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RevisionsService } from '../revisions/revisions.service';
import { UpdateRevisionDto } from '../revisions/dto/update-revision.dto';
import { CreateRevisionDto } from '../revisions/dto/create-revision.dto';
import { UserPayloadModel } from '../auth/types/user.model';

@ApiTags('works')
@Controller('works')
export class WorksController {
  constructor(
    private readonly revisionsService: RevisionsService,
    private readonly worksService: WorksService,
  ) {}

  @Get()
  findAll() {
    return this.worksService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyWorks(@CurrentUser() user: UserPayloadModel) {
    return this.revisionsService.findMyWorks(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateRevisionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.createWork(dto, user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.worksService.findOneByIdWithLatestApproved(id);
  }

  @Get(':id/latest')
  findLatest(@Param('id', ParseIntPipe) id: number) {
    return this.worksService.findOneById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRevisionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.update(id, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  submit(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.submit(id, user.sub);
  }
}
