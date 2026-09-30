import { Injectable } from '@nestjs/common';

export type ScoreInput = { criterionId: number; score: number };
export type CriterionInput = {
  id: number;
  weight: number;
  minScore: number;
  maxScore: number;
};
export type RankedEntry = { id: number; score: number; rank: number };

@Injectable()
export class CompetitionsScoringService {
  computeWeightedTotal(
    scores: ScoreInput[],
    criteria: CriterionInput[],
  ): number {
    let total = 0;
    for (const criterion of criteria) {
      const line = scores.find((s) => s.criterionId === criterion.id);
      if (!line) {
        throw new Error(`Missing score for criterion ${criterion.id}`);
      }
      const score = Number(line.score);
      const min = Number(criterion.minScore);
      const max = Number(criterion.maxScore);
      if (score < min || score > max) {
        throw new Error(
          `Score ${score} is outside range ${min}-${max} for criterion ${criterion.id}`,
        );
      }
      total += score * Number(criterion.weight);
    }
    return Number(total.toFixed(4));
  }

  advances(acceptCount: number, minAcceptVotes: number) {
    return acceptCount >= minAcceptVotes;
  }

  rankEntries(entries: { id: number; score: number }[]): RankedEntry[] {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    const ranked: RankedEntry[] = [];
    let i = 0;
    while (i < sorted.length) {
      const score = sorted[i].score;
      const rank = i + 1;
      let j = i;
      while (j < sorted.length && sorted[j].score === score) {
        ranked.push({ id: sorted[j].id, score, rank });
        j += 1;
      }
      i = j;
    }
    return ranked;
  }

  tiedGroups(ranked: RankedEntry[]): number[][] {
    const byRank = new Map<number, number[]>();
    for (const entry of ranked) {
      const group = byRank.get(entry.rank) ?? [];
      group.push(entry.id);
      byRank.set(entry.rank, group);
    }
    return [...byRank.values()].filter((group) => group.length > 1);
  }

  rerankTiedGroups(
    original: RankedEntry[],
    latestScores: Map<number, number>,
  ): RankedEntry[] {
    const result: RankedEntry[] = [];
    const seen = new Set<number>();
    for (const entry of original) {
      if (seen.has(entry.rank)) continue;
      const group = original.filter((item) => item.rank === entry.rank);
      seen.add(entry.rank);
      if (group.length === 1) {
        result.push({
          id: group[0].id,
          score: latestScores.get(group[0].id) ?? group[0].score,
          rank: entry.rank,
        });
        continue;
      }
      const inner = this.rankEntries(
        group.map((item) => ({
          id: item.id,
          score: latestScores.get(item.id) ?? item.score,
        })),
      );
      for (const ranked of inner) {
        result.push({
          id: ranked.id,
          score: ranked.score,
          rank: ranked.rank + entry.rank - 1,
        });
      }
    }
    return result;
  }

  latestWeightedTotal(
    evaluations: { scoringPass: number; weightedTotal: number }[],
  ): number | null {
    if (!evaluations.length) return null;
    const latestPass = Math.max(...evaluations.map((e) => e.scoringPass));
    const latest = evaluations.filter((e) => e.scoringPass === latestPass);
    const sum = latest.reduce((acc, e) => acc + Number(e.weightedTotal), 0);
    return Number((sum / latest.length).toFixed(4));
  }
}
