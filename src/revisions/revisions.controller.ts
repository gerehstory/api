import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RevisionsService } from './revisions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RejectRevisionDto } from './dto/reject-revision.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserPayloadModel } from '../auth/types/user.model';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../users/enums/role.enum';

@ApiTags('revisions')
@Controller('revisions')
export class RevisionsController {
  constructor(private readonly revisionsService: RevisionsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Get('pending')
  findPending() {
    return this.revisionsService.findPending();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.revisionsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.approve(id, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectRevisionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.reject(id, user.sub, dto.reason);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/history')
  history(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.history(id, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/restore')
  restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.revisionsService.restore(id, user.sub);
  }
}
