import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Competition } from './entities/competition.entity';
import { CompetitionCriterion } from './entities/competition-criterion.entity';
import { CompetitionJudge } from './entities/competition-judge.entity';
import { CompetitionEntry } from './entities/competition-entry.entity';
import { FirstRoundVote } from './entities/first-round-vote.entity';
import { SecondRoundEvaluation } from './entities/second-round-evaluation.entity';
import { SecondRoundScore } from './entities/second-round-score.entity';
import { CompetitionStatus } from './enums/competition-status.enum';
import { VoteDecision } from './enums/vote-decision.enum';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { AssignJudgeDto } from './dto/assign-judge.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { SubmitScoresDto } from './dto/submit-scores.dto';
import { UsersService } from '../users/users.service';
import { StoryTypesService } from '../story-types/story-types.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { RoleEnum } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { CompetitionsScoringService } from './competitions-scoring.service';

const competitionRelations = {
  createdBy: true,
  allowedTypes: true,
  criteria: true,
  judges: { user: true, assignedBy: true },
  entries: {
    author: true,
    type: true,
    votes: { judge: true },
    evaluations: { judge: true, scores: { criterion: true } },
  },
};

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly competitions: Repository<Competition>,
    @InjectRepository(CompetitionCriterion)
    private readonly criteria: Repository<CompetitionCriterion>,
    @InjectRepository(CompetitionJudge)
    private readonly judges: Repository<CompetitionJudge>,
    @InjectRepository(CompetitionEntry)
    private readonly entries: Repository<CompetitionEntry>,
    @InjectRepository(FirstRoundVote)
    private readonly votes: Repository<FirstRoundVote>,
    @InjectRepository(SecondRoundEvaluation)
    private readonly evaluations: Repository<SecondRoundEvaluation>,
    @InjectRepository(SecondRoundScore)
    private readonly scores: Repository<SecondRoundScore>,
    private readonly usersService: UsersService,
    private readonly storyTypesService: StoryTypesService,
    private readonly audit: AuditService,
    private readonly scoring: CompetitionsScoringService,
  ) {}

  private publicUser(user?: User | null) {
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private async getOrFail(id: number) {
    const competition = await this.competitions.findOne({
      where: { id },
      relations: competitionRelations,
    });
    if (!competition) {
      throw new NotFoundException('Competition not found');
    }
    return competition;
  }

  private assertDraft(competition: Competition) {
    if (
      competition.publishedAt ||
      competition.status !== CompetitionStatus.Draft
    ) {
      throw new BadRequestException(
        'Competition settings cannot be changed after publishing',
      );
    }
  }

  private toPublicCompetition(competition: Competition) {
    const revealFirst = Boolean(competition.firstRoundCompletedAt);
    const revealSecond = Boolean(competition.secondRoundCompletedAt);

    return {
      id: competition.id,
      name: competition.name,
      description: competition.description,
      status: competition.status,
      applicationDeadline: competition.applicationDeadline,
      allowedTypes: competition.allowedTypes,
      allowFirstRoundJudgesInSecondRound:
        competition.allowFirstRoundJudgesInSecondRound,
      publishedAt: competition.publishedAt,
      firstRoundStartedAt: competition.firstRoundStartedAt,
      firstRoundCompletedAt: competition.firstRoundCompletedAt,
      secondRoundStartedAt: competition.secondRoundStartedAt,
      secondRoundCompletedAt: competition.secondRoundCompletedAt,
      completedAt: competition.completedAt,
      judges: (competition.judges ?? [])
        .filter(
          (judge) =>
            (judge.isFirstRound && revealFirst) ||
            (judge.isSecondRound && revealSecond),
        )
        .map((judge) => ({
          user: this.publicUser(judge.user),
          isFirstRound: judge.isFirstRound,
          isSecondRound: judge.isSecondRound,
        })),
    };
  }

  private toPublicEntry(entry: CompetitionEntry) {
    return {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      type: entry.type,
      author: this.publicUser(entry.author),
      submittedAt: entry.submittedAt,
      rank: entry.rank,
    };
  }

  private toAuthorEntry(entry: CompetitionEntry) {
    return {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      type: entry.type,
      submittedAt: entry.submittedAt,
    };
  }

  async create(dto: CreateCompetitionDto, actorId: number) {
    const actor = await this.usersService.findOne(actorId);
    const allowedTypes = dto.allowedTypeIds
      ? await Promise.all(
          dto.allowedTypeIds.map((id) => this.storyTypesService.findOne(id)),
        )
      : [];

    const competition = await this.competitions.save(
      this.competitions.create({
        name: dto.name,
        description: dto.description,
        applicationDeadline: new Date(dto.applicationDeadline),
        firstRoundJudgeCount: dto.firstRoundJudgeCount,
        minAcceptVotes: dto.minAcceptVotes,
        cutoffScore: dto.cutoffScore,
        allowFirstRoundJudgesInSecondRound:
          dto.allowFirstRoundJudgesInSecondRound ?? false,
        createdBy: actor,
        allowedTypes,
        status: CompetitionStatus.Draft,
      }),
    );

    await this.audit.log({
      actor,
      competition,
      action: AuditAction.CompetitionCreated,
      entityType: 'competition',
      entityId: competition.id,
      payload: { name: dto.name },
    });

    return this.getOrFail(competition.id);
  }

  async update(id: number, dto: UpdateCompetitionDto, actorId: number) {
    const competition = await this.getOrFail(id);
    this.assertDraft(competition);
    const actor = await this.usersService.findOne(actorId);

    if (dto.name) competition.name = dto.name;
    if (dto.description) competition.description = dto.description;
    if (dto.applicationDeadline) {
      competition.applicationDeadline = new Date(dto.applicationDeadline);
    }
    if (dto.firstRoundJudgeCount != null) {
      competition.firstRoundJudgeCount = dto.firstRoundJudgeCount;
    }
    if (dto.minAcceptVotes != null) {
      competition.minAcceptVotes = dto.minAcceptVotes;
    }
    if (dto.cutoffScore != null) {
      competition.cutoffScore = dto.cutoffScore;
    }
    if (dto.allowFirstRoundJudgesInSecondRound != null) {
      competition.allowFirstRoundJudgesInSecondRound =
        dto.allowFirstRoundJudgesInSecondRound;
    }
    if (dto.allowedTypeIds) {
      competition.allowedTypes = await Promise.all(
        dto.allowedTypeIds.map((typeId) =>
          this.storyTypesService.findOne(typeId),
        ),
      );
    }

    await this.competitions.save(competition);
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.CompetitionUpdated,
      entityType: 'competition',
      entityId: competition.id,
      payload: dto as unknown as Record<string, unknown>,
    });
    return this.getOrFail(id);
  }

  async addCriterion(id: number, dto: CreateCriterionDto, actorId: number) {
    const competition = await this.getOrFail(id);
    this.assertDraft(competition);
    if (Number(dto.minScore) > Number(dto.maxScore)) {
      throw new BadRequestException('minScore cannot exceed maxScore');
    }
    const actor = await this.usersService.findOne(actorId);
    const criterion = await this.criteria.save(
      this.criteria.create({
        competition,
        name: dto.name,
        minScore: dto.minScore,
        maxScore: dto.maxScore,
        weight: dto.weight,
        sortOrder: dto.sortOrder,
      }),
    );
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.CriterionCreated,
      entityType: 'criterion',
      entityId: criterion.id,
      payload: dto as unknown as Record<string, unknown>,
    });
    return criterion;
  }

  async updateCriterion(
    competitionId: number,
    criterionId: number,
    dto: UpdateCriterionDto,
    actorId: number,
  ) {
    const competition = await this.getOrFail(competitionId);
    this.assertDraft(competition);
    const criterion = await this.criteria.findOne({
      where: { id: criterionId, competition: { id: competitionId } },
    });
    if (!criterion) throw new NotFoundException('Criterion not found');
    Object.assign(criterion, dto);
    if (Number(criterion.minScore) > Number(criterion.maxScore)) {
      throw new BadRequestException('minScore cannot exceed maxScore');
    }
    const actor = await this.usersService.findOne(actorId);
    const saved = await this.criteria.save(criterion);
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.CriterionUpdated,
      entityType: 'criterion',
      entityId: criterion.id,
      payload: dto as unknown as Record<string, unknown>,
    });
    return saved;
  }

  async removeCriterion(
    competitionId: number,
    criterionId: number,
    actorId: number,
  ) {
    const competition = await this.getOrFail(competitionId);
    this.assertDraft(competition);
    const criterion = await this.criteria.findOne({
      where: { id: criterionId, competition: { id: competitionId } },
    });
    if (!criterion) throw new NotFoundException('Criterion not found');
    await this.criteria.remove(criterion);
    const actor = await this.usersService.findOne(actorId);
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.CriterionRemoved,
      entityType: 'criterion',
      entityId: criterionId,
    });
    return { deleted: true };
  }

  async assignJudge(id: number, dto: AssignJudgeDto, actorId: number) {
    const competition = await this.getOrFail(id);
    this.assertDraft(competition);
    const isFirstRound = dto.isFirstRound ?? false;
    const isSecondRound = dto.isSecondRound ?? false;
    if (!isFirstRound && !isSecondRound) {
      throw new BadRequestException(
        'Judge must be assigned to at least one round',
      );
    }
    const user = await this.usersService.findOne(dto.userId);
    if (user.role === RoleEnum.Admin) {
      throw new BadRequestException('Admins cannot be judges');
    }
    const actor = await this.usersService.findOne(actorId);
    const existing = await this.judges.findOne({
      where: { competition: { id }, user: { id: dto.userId } },
    });
    if (existing) {
      existing.isFirstRound = isFirstRound;
      existing.isSecondRound = isSecondRound;
      existing.assignedBy = actor;
      const saved = await this.judges.save(existing);
      await this.audit.log({
        actor,
        competition,
        action: AuditAction.JudgeUpdated,
        entityType: 'judge',
        entityId: saved.id,
        payload: dto as unknown as Record<string, unknown>,
      });
      return saved;
    }
    const judge = await this.judges.save(
      this.judges.create({
        competition,
        user,
        isFirstRound,
        isSecondRound,
        assignedBy: actor,
      }),
    );
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.JudgeAssigned,
      entityType: 'judge',
      entityId: judge.id,
      payload: dto as unknown as Record<string, unknown>,
    });
    return judge;
  }

  async removeJudge(competitionId: number, userId: number, actorId: number) {
    const competition = await this.getOrFail(competitionId);
    this.assertDraft(competition);
    const judge = await this.judges.findOne({
      where: { competition: { id: competitionId }, user: { id: userId } },
    });
    if (!judge) throw new NotFoundException('Judge assignment not found');
    await this.judges.remove(judge);
    const actor = await this.usersService.findOne(actorId);
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.JudgeRemoved,
      entityType: 'judge',
      entityId: judge.id,
      payload: { userId },
    });
    return { deleted: true };
  }

  async publish(id: number, actorId: number) {
    const competition = await this.getOrFail(id);
    this.assertDraft(competition);
    const actor = await this.usersService.findOne(actorId);

    const firstRoundJudges = (competition.judges ?? []).filter(
      (j) => j.isFirstRound,
    );
    const secondRoundJudges = (competition.judges ?? []).filter(
      (j) => j.isSecondRound,
    );
    if (firstRoundJudges.length !== competition.firstRoundJudgeCount) {
      throw new BadRequestException(
        `Expected ${competition.firstRoundJudgeCount} first-round judges`,
      );
    }
    if (!secondRoundJudges.length) {
      throw new BadRequestException(
        'At least one second-round judge is required',
      );
    }
    if (!competition.criteria?.length) {
      throw new BadRequestException(
        'At least one scoring criterion is required',
      );
    }
    if (
      !competition.allowFirstRoundJudgesInSecondRound &&
      competition.judges.some((j) => j.isFirstRound && j.isSecondRound)
    ) {
      throw new BadRequestException(
        'First-round judges cannot also judge the second round',
      );
    }
    if (competition.minAcceptVotes > competition.firstRoundJudgeCount) {
      throw new BadRequestException(
        'minAcceptVotes cannot exceed first-round judge count',
      );
    }

    competition.status = CompetitionStatus.Open;
    competition.publishedAt = new Date();
    await this.competitions.save(competition);
    await this.audit.log({
      actor,
      competition,
      action: AuditAction.CompetitionPublished,
      entityType: 'competition',
      entityId: competition.id,
    });
    return this.getOrFail(id);
  }

  async findPublic() {
    const competitions = await this.competitions.find({
      where: {
        status: In(
          Object.values(CompetitionStatus).filter(
            (s) => s !== CompetitionStatus.Draft,
          ),
        ),
      },
      relations: { allowedTypes: true, judges: { user: true } },
      order: { applicationDeadline: 'DESC' },
    });
    return competitions.map((c) => this.toPublicCompetition(c));
  }

  async findPublicOne(id: number) {
    const competition = await this.getOrFail(id);
    if (competition.status === CompetitionStatus.Draft) {
      throw new NotFoundException('Competition not found');
    }
    return this.toPublicCompetition(competition);
  }

  async findAdminOne(id: number) {
    return this.getOrFail(id);
  }

  findAudit(id: number) {
    return this.audit.findByCompetition(id);
  }

  async findPublicEntries(id: number) {
    const competition = await this.getOrFail(id);
    if (competition.status !== CompetitionStatus.Completed) {
      return [];
    }
    return (competition.entries ?? [])
      .filter((entry) => entry.isPublic)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((entry) => this.toPublicEntry(entry));
  }

  async submitEntry(id: number, dto: CreateEntryDto, authorId: number) {
    const competition = await this.getOrFail(id);
    if (competition.status !== CompetitionStatus.Open) {
      throw new BadRequestException('Competition is not open for submissions');
    }
    if (new Date() >= new Date(competition.applicationDeadline)) {
      throw new BadRequestException('Application deadline has passed');
    }
    if ((competition.judges ?? []).some((j) => j.user.id === authorId)) {
      throw new ForbiddenException(
        'Judges cannot submit to a competition they judge',
      );
    }
    const existing = await this.entries.findOne({
      where: { competition: { id }, author: { id: authorId } },
    });
    if (existing) {
      throw new ConflictException('You already submitted to this competition');
    }
    const type = await this.storyTypesService.findOne(dto.typeId);
    if (
      competition.allowedTypes?.length &&
      !competition.allowedTypes.some((allowed) => allowed.id === type.id)
    ) {
      throw new BadRequestException(
        'This story type is not allowed in this competition',
      );
    }
    const author = await this.usersService.findOne(authorId);
    const entry = await this.entries.save(
      this.entries.create({
        competition,
        author,
        type,
        title: dto.title,
        content: dto.content,
        submittedAt: new Date(),
      }),
    );
    await this.audit.log({
      actor: author,
      competition,
      action: AuditAction.EntrySubmitted,
      entityType: 'entry',
      entityId: entry.id,
      payload: { title: dto.title, typeId: dto.typeId },
    });
    return this.toAuthorEntry(entry);
  }

  async findMyEntry(id: number, authorId: number) {
    await this.getOrFail(id);
    const entry = await this.entries.findOne({
      where: { competition: { id }, author: { id: authorId } },
      relations: { type: true, author: true },
    });
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }
    return this.toAuthorEntry(entry);
  }

  private requireJudge(
    competition: Competition,
    userId: number,
    round: 'first' | 'second',
  ) {
    const assignment = (competition.judges ?? []).find(
      (j) => j.user.id === userId,
    );
    if (!assignment) {
      throw new ForbiddenException('You are not a judge in this competition');
    }
    if (round === 'first' && !assignment.isFirstRound) {
      throw new ForbiddenException('You are not a first-round judge');
    }
    if (round === 'second' && !assignment.isSecondRound) {
      throw new ForbiddenException('You are not a second-round judge');
    }
    return assignment;
  }

  async findJudgeEntries(id: number, judgeId: number) {
    const competition = await this.getOrFail(id);
    const assignment = (competition.judges ?? []).find(
      (j) => j.user.id === judgeId,
    );
    if (!assignment) {
      throw new ForbiddenException('You are not a judge in this competition');
    }

    let entries = competition.entries ?? [];
    if (competition.status === CompetitionStatus.FirstRound) {
      this.requireJudge(competition, judgeId, 'first');
    } else if (competition.status === CompetitionStatus.SecondRound) {
      this.requireJudge(competition, judgeId, 'second');
      entries = entries.filter((e) => e.advancedToSecondRound);
    } else if (competition.status === CompetitionStatus.TieBreak) {
      this.requireJudge(competition, judgeId, 'second');
      entries = entries.filter((e) => e.isInTieBreak);
    } else {
      throw new BadRequestException('Judging is not active');
    }

    return {
      competition: {
        ...this.toPublicCompetition(competition),
        cutoffScore: Number(competition.cutoffScore),
        criteria: (competition.criteria ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          minScore: Number(c.minScore),
          maxScore: Number(c.maxScore),
          weight: Number(c.weight),
          sortOrder: c.sortOrder,
        })),
      },
      entries: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        type: entry.type,
        submittedAt: entry.submittedAt,
        isInTieBreak: entry.isInTieBreak,
      })),
    };
  }

  async submitVote(
    competitionId: number,
    entryId: number,
    dto: SubmitVoteDto,
    judgeId: number,
  ) {
    const competition = await this.getOrFail(competitionId);
    if (competition.status !== CompetitionStatus.FirstRound) {
      throw new BadRequestException('First round is not active');
    }
    this.requireJudge(competition, judgeId, 'first');
    if (dto.decision === VoteDecision.Reject && !dto.rejectReason) {
      throw new BadRequestException('A reject reason is required');
    }
    const entry = await this.entries.findOne({
      where: { id: entryId, competition: { id: competitionId } },
    });
    if (!entry) throw new NotFoundException('Entry not found');

    const existing = await this.votes.findOne({
      where: { entry: { id: entryId }, judge: { id: judgeId } },
    });
    if (existing) {
      throw new ConflictException('You already voted on this entry');
    }

    const judge = await this.usersService.findOne(judgeId);
    const vote = await this.votes.save(
      this.votes.create({
        entry,
        judge,
        decision: dto.decision,
        rejectReason:
          dto.decision === VoteDecision.Reject ? dto.rejectReason : null,
      }),
    );
    await this.audit.log({
      actor: judge,
      competition,
      action: AuditAction.FirstRoundVoteSubmitted,
      entityType: 'vote',
      entityId: vote.id,
      payload: { entryId, decision: dto.decision },
    });

    await this.tryCompleteFirstRound(competitionId);
    return {
      id: vote.id,
      decision: vote.decision,
      submittedAt: vote.submittedAt,
    };
  }

  async submitScores(
    competitionId: number,
    entryId: number,
    dto: SubmitScoresDto,
    judgeId: number,
  ) {
    const competition = await this.getOrFail(competitionId);
    const isTieBreak = competition.status === CompetitionStatus.TieBreak;
    if (competition.status !== CompetitionStatus.SecondRound && !isTieBreak) {
      throw new BadRequestException('Second round is not active');
    }
    this.requireJudge(competition, judgeId, 'second');

    const entry = await this.entries.findOne({
      where: { id: entryId, competition: { id: competitionId } },
    });
    if (!entry) throw new NotFoundException('Entry not found');
    if (!entry.advancedToSecondRound) {
      throw new BadRequestException('Entry did not advance');
    }
    if (isTieBreak && !entry.isInTieBreak) {
      throw new BadRequestException('Entry is not in the tie-break');
    }

    const scoringPass = isTieBreak ? 2 : 1;
    const existing = await this.evaluations.findOne({
      where: { entry: { id: entryId }, judge: { id: judgeId }, scoringPass },
    });
    if (existing) {
      throw new ConflictException('You already scored this entry');
    }

    const criteria = competition.criteria ?? [];
    const submittedIds = new Set(dto.scores.map((s) => s.criterionId));
    if (
      criteria.length !== dto.scores.length ||
      criteria.some((c) => !submittedIds.has(c.id))
    ) {
      throw new BadRequestException('Scores are required for every criterion');
    }

    let weightedTotal: number;
    try {
      weightedTotal = this.scoring.computeWeightedTotal(
        dto.scores,
        criteria.map((c) => ({
          id: c.id,
          weight: Number(c.weight),
          minScore: Number(c.minScore),
          maxScore: Number(c.maxScore),
        })),
      );
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    const judge = await this.usersService.findOne(judgeId);
    const evaluation = this.evaluations.create({
      entry,
      judge,
      scoringPass,
      weightedTotal,
      scores: dto.scores.map((line) =>
        this.scores.create({
          criterion: criteria.find((c) => c.id === line.criterionId),
          score: line.score,
        }),
      ),
    });
    const saved = await this.evaluations.save(evaluation);
    await this.audit.log({
      actor: judge,
      competition,
      action: isTieBreak
        ? AuditAction.TieBreakEvaluationSubmitted
        : AuditAction.SecondRoundEvaluationSubmitted,
      entityType: 'evaluation',
      entityId: saved.id,
      payload: { entryId, scoringPass, weightedTotal },
    });

    if (isTieBreak) {
      await this.tryCompleteTieBreak(competitionId);
    } else {
      await this.tryCompleteSecondRound(competitionId);
    }
    return {
      id: saved.id,
      scoringPass,
      weightedTotal,
      submittedAt: saved.submittedAt,
    };
  }

  async closeApplications(id: number) {
    const competition = await this.getOrFail(id);
    if (competition.status !== CompetitionStatus.Open) {
      return competition;
    }
    if (new Date() < new Date(competition.applicationDeadline)) {
      return competition;
    }
    const entryCount = (competition.entries ?? []).length;
    if (entryCount === 0) {
      competition.status = CompetitionStatus.Cancelled;
      competition.cancelledAt = new Date();
      await this.competitions.save(competition);
      await this.audit.log({
        competition,
        action: AuditAction.CompetitionStatusChanged,
        entityType: 'competition',
        entityId: competition.id,
        payload: { status: CompetitionStatus.Cancelled },
      });
      return competition;
    }
    competition.status = CompetitionStatus.FirstRound;
    competition.firstRoundStartedAt = new Date();
    await this.competitions.save(competition);
    await this.audit.log({
      competition,
      action: AuditAction.CompetitionStatusChanged,
      entityType: 'competition',
      entityId: competition.id,
      payload: { status: CompetitionStatus.FirstRound },
    });
    return competition;
  }

  async closeDueApplications() {
    const open = await this.competitions.find({
      where: { status: CompetitionStatus.Open },
      relations: competitionRelations,
    });
    const due = open.filter(
      (c) => new Date() >= new Date(c.applicationDeadline),
    );
    for (const competition of due) {
      await this.closeApplications(competition.id);
    }
  }

  private async tryCompleteFirstRound(competitionId: number) {
    const competition = await this.getOrFail(competitionId);
    const firstJudges = (competition.judges ?? []).filter(
      (j) => j.isFirstRound,
    );
    const entries = competition.entries ?? [];
    const required = firstJudges.length * entries.length;
    const voteCount = entries.reduce(
      (sum, entry) => sum + (entry.votes?.length ?? 0),
      0,
    );
    if (required === 0 || voteCount < required) {
      return;
    }

    for (const entry of entries) {
      const acceptCount = (entry.votes ?? []).filter(
        (v) => v.decision === VoteDecision.Accept,
      ).length;
      entry.advancedToSecondRound = this.scoring.advances(
        acceptCount,
        competition.minAcceptVotes,
      );
      await this.entries.save(entry);
    }

    competition.firstRoundCompletedAt = new Date();
    const advanced = entries.filter((e) => e.advancedToSecondRound);
    if (!advanced.length) {
      competition.status = CompetitionStatus.NoQualified;
      competition.completedAt = new Date();
    } else {
      competition.status = CompetitionStatus.SecondRound;
      competition.secondRoundStartedAt = new Date();
    }
    await this.competitions.save(competition);
    await this.audit.log({
      competition,
      action: AuditAction.CompetitionStatusChanged,
      entityType: 'competition',
      entityId: competition.id,
      payload: { status: competition.status },
    });
  }

  private entryFinalScore(entry: CompetitionEntry) {
    const byJudge = new Map<
      number,
      { scoringPass: number; weightedTotal: number }[]
    >();
    for (const evaluation of entry.evaluations ?? []) {
      const judgeId = evaluation.judge.id;
      const list = byJudge.get(judgeId) ?? [];
      list.push({
        scoringPass: evaluation.scoringPass,
        weightedTotal: Number(evaluation.weightedTotal),
      });
      byJudge.set(judgeId, list);
    }
    const totals: number[] = [];
    for (const list of byJudge.values()) {
      const latest = list.sort((a, b) => b.scoringPass - a.scoringPass)[0];
      totals.push(latest.weightedTotal);
    }
    if (!totals.length) return null;
    return Number(
      (totals.reduce((sum, value) => sum + value, 0) / totals.length).toFixed(
        4,
      ),
    );
  }

  private entryScoreForPass(entry: CompetitionEntry, scoringPass: number) {
    const evaluations = (entry.evaluations ?? []).filter(
      (evaluation) => evaluation.scoringPass === scoringPass,
    );
    if (!evaluations.length) return null;
    const sum = evaluations.reduce(
      (acc, evaluation) => acc + Number(evaluation.weightedTotal),
      0,
    );
    return Number((sum / evaluations.length).toFixed(4));
  }

  private async applyRanks(
    competition: Competition,
    entries: CompetitionEntry[],
    ranked: { id: number; score: number; rank: number }[],
  ) {
    const cutoff = Number(competition.cutoffScore);
    for (const entry of entries) {
      const result = ranked.find((item) => item.id === entry.id);
      entry.finalScore = result?.score ?? null;
      entry.rank = result?.rank ?? null;
      entry.isPublic = (result?.score ?? 0) >= cutoff;
      await this.entries.save(entry);
    }
    competition.status = CompetitionStatus.Completed;
    competition.completedAt = new Date();
    if (!competition.secondRoundCompletedAt) {
      competition.secondRoundCompletedAt = new Date();
    }
    if (competition.tieBreakStartedAt && !competition.tieBreakCompletedAt) {
      competition.tieBreakCompletedAt = new Date();
    }
    await this.competitions.save(competition);
    await this.audit.log({
      competition,
      action: AuditAction.CompetitionStatusChanged,
      entityType: 'competition',
      entityId: competition.id,
      payload: { status: CompetitionStatus.Completed },
    });
  }

  private async freezeResults(
    competition: Competition,
    entries: CompetitionEntry[],
    allowTieBreak: boolean,
  ) {
    const latestScores = entries.map((entry) => ({
      id: entry.id,
      score: this.entryFinalScore(entry) ?? 0,
    }));
    const latestRanked = this.scoring.rankEntries(latestScores);

    if (allowTieBreak) {
      const ties = this.scoring.tiedGroups(latestRanked);
      if (ties.length) {
        const tiedIds = new Set(ties.flat());
        for (const entry of entries) {
          entry.isInTieBreak = tiedIds.has(entry.id);
          await this.entries.save(entry);
        }
        competition.status = CompetitionStatus.TieBreak;
        competition.secondRoundCompletedAt = new Date();
        competition.tieBreakStartedAt = new Date();
        await this.competitions.save(competition);
        await this.audit.log({
          competition,
          action: AuditAction.CompetitionStatusChanged,
          entityType: 'competition',
          entityId: competition.id,
          payload: { status: CompetitionStatus.TieBreak },
        });
        return;
      }
      await this.applyRanks(competition, entries, latestRanked);
      return;
    }

    const passOneRanked = this.scoring.rankEntries(
      entries.map((entry) => ({
        id: entry.id,
        score: this.entryScoreForPass(entry, 1) ?? 0,
      })),
    );
    const latestById = new Map(
      latestScores.map((item) => [item.id, item.score]),
    );
    const ranked = this.scoring.rerankTiedGroups(passOneRanked, latestById);
    await this.applyRanks(competition, entries, ranked);
  }

  private async tryCompleteSecondRound(competitionId: number) {
    const competition = await this.getOrFail(competitionId);
    const secondJudges = (competition.judges ?? []).filter(
      (j) => j.isSecondRound,
    );
    const advanced = (competition.entries ?? []).filter(
      (e) => e.advancedToSecondRound,
    );
    const required = secondJudges.length * advanced.length;
    const submitted = advanced.reduce(
      (sum, entry) =>
        sum +
        (entry.evaluations ?? []).filter((e) => e.scoringPass === 1).length,
      0,
    );
    if (required === 0 || submitted < required) {
      return;
    }
    await this.freezeResults(competition, advanced, true);
  }

  private async tryCompleteTieBreak(competitionId: number) {
    const competition = await this.getOrFail(competitionId);
    const secondJudges = (competition.judges ?? []).filter(
      (j) => j.isSecondRound,
    );
    const tied = (competition.entries ?? []).filter((e) => e.isInTieBreak);
    const required = secondJudges.length * tied.length;
    const submitted = tied.reduce(
      (sum, entry) =>
        sum +
        (entry.evaluations ?? []).filter((e) => e.scoringPass === 2).length,
      0,
    );
    if (required === 0 || submitted < required) {
      return;
    }
    const advanced = (competition.entries ?? []).filter(
      (e) => e.advancedToSecondRound,
    );
    await this.freezeResults(competition, advanced, false);
  }
}
