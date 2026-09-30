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
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { AssignJudgeDto } from './dto/assign-judge.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { SubmitScoresDto } from './dto/submit-scores.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../users/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayloadModel } from '../auth/types/user.model';

@ApiTags('competitions')
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  findAll() {
    return this.competitionsService.findPublic();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post()
  create(
    @Body() dto: CreateCompetitionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.create(dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Get(':id/admin')
  findAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findAdminOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Get(':id/audit')
  findAudit(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findAudit(id);
  }

  @Get(':id/public-entries')
  findPublicEntries(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findPublicEntries(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/entries/me')
  findMyEntry(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.findMyEntry(id, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/judge/entries')
  findJudgeEntries(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.findJudgeEntries(id, user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findPublicOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompetitionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.update(id, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post(':id/publish')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.publish(id, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post(':id/criteria')
  addCriterion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCriterionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.addCriterion(id, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Patch(':id/criteria/:criterionId')
  updateCriterion(
    @Param('id', ParseIntPipe) id: number,
    @Param('criterionId', ParseIntPipe) criterionId: number,
    @Body() dto: UpdateCriterionDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.updateCriterion(
      id,
      criterionId,
      dto,
      user.sub,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Delete(':id/criteria/:criterionId')
  removeCriterion(
    @Param('id', ParseIntPipe) id: number,
    @Param('criterionId', ParseIntPipe) criterionId: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.removeCriterion(id, criterionId, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Post(':id/judges')
  assignJudge(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignJudgeDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.assignJudge(id, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Delete(':id/judges/:userId')
  removeJudge(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.removeJudge(id, userId, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/entries')
  submitEntry(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEntryDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.submitEntry(id, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/entries/:entryId/votes')
  submitVote(
    @Param('id', ParseIntPipe) id: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body() dto: SubmitVoteDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.submitVote(id, entryId, dto, user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/entries/:entryId/scores')
  submitScores(
    @Param('id', ParseIntPipe) id: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body() dto: SubmitScoresDto,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.competitionsService.submitScores(id, entryId, dto, user.sub);
  }
}
