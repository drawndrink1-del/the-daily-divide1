import { Choice, DivideStats, Vote } from './types';

const buckets = [{ label: '<1s', minMs: 0, maxMs: 1000 }, { label: '1–2s', minMs: 1000, maxMs: 2000 }, { label: '2–5s', minMs: 2000, maxMs: 5000 }, { label: '5–10s', minMs: 5000, maxMs: 10000 }, { label: '10s+', minMs: 10000, maxMs: Infinity }];
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const median = (values: number[]) => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; };

export function calculateStats(votes: Vote[]): DivideStats {
  const total = votes.length;
  const choiceStats = (choice: Choice) => { const selected = votes.filter(vote => vote.choice === choice); return { count: selected.length, percentage: total ? selected.length / total * 100 : 0, averageConfidence: average(selected.map(vote => vote.confidence)), averageSpeedMs: average(selected.map(vote => vote.decisionTimeMs)) }; };
  const choices = { A: choiceStats('A'), B: choiceStats('B') };
  const speedBuckets = buckets.map(bucket => { const count = votes.filter(vote => vote.decisionTimeMs >= bucket.minMs && vote.decisionTimeMs < bucket.maxMs).length; return { ...bucket, count, percentage: total ? count / total * 100 : 0 }; });
  const fastVotes = votes.filter(vote => vote.decisionTimeMs < 1000);
  const fasterA = fastVotes.filter(vote => vote.choice === 'A').length;
  const confidenceLiftPercentage = choices.B.averageConfidence ? (choices.A.averageConfidence - choices.B.averageConfidence) / choices.B.averageConfidence * 100 : 0;
  const maxSpeed = Math.max(...votes.map(vote => vote.decisionTimeMs), 1000);
  const quadrantCounts = { 'Impulsive Certainty': 0, 'Thoughtful Deliberation': 0, 'Quick Doubt': 0, 'Hesitant Certainty': 0 };
  votes.forEach(vote => { const fast = vote.decisionTimeMs < maxSpeed * 0.35; const confident = vote.confidence >= 6; const quadrant = fast && confident ? 'Impulsive Certainty' : !fast && confident ? 'Thoughtful Deliberation' : fast ? 'Quick Doubt' : 'Hesitant Certainty'; quadrantCounts[quadrant] += 1; });
  return { total: votes.length, choices, averageConfidence: average(votes.map(vote => vote.confidence)), medianSpeedMs: median(votes.map(vote => vote.decisionTimeMs)), speedBuckets, fasterThanPercentage: 0, fastestSplitPercentage: fastVotes.length ? fasterA / fastVotes.length * 100 : 0, confidenceLiftPercentage, quadrantCounts };
}

export function percentileRank(votes: Vote[], timeMs: number) { return votes.length ? votes.filter(vote => vote.decisionTimeMs > timeMs).length / votes.length * 100 : 0; }
export function formatDecisionTime(ms: number) { if (ms < 1000) return `${Math.round(ms)}ms`; if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`; return `${(ms / 60000).toFixed(1)}m`; }
