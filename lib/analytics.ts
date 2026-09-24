import { Choice } from './types';

export interface AnalyticsVote {
  choice: Choice;
  confidence: number;
  decisionTimeMs: number;
  createdAt: string;
}

export interface AnalyticsChoiceStats {
  count: number;
  percentage: number;
  averageConfidence: number;
  medianConfidence: number;
}

export interface AnalyticsTimePoint {
  label: string;
  count: number;
}

export interface QuestionAnalytics {
  totalVotes: number;
  choices: { A: AnalyticsChoiceStats; B: AnalyticsChoiceStats };
  confidence: { average: number; median: number; minimum: number; maximum: number; distribution: Array<{ value: number; count: number }> };
  decisionTime: { averageMs: number; medianMs: number; minimumMs: number; maximumMs: number };
  votesOverTime: AnalyticsTimePoint[];
}

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const median = (values: number[]) => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; };

function choiceStats(votes: AnalyticsVote[], choice: Choice): AnalyticsChoiceStats {
  const selected = votes.filter(vote => vote.choice === choice);
  const confidence = selected.map(vote => vote.confidence);
  return { count: selected.length, percentage: votes.length ? selected.length / votes.length * 100 : 0, averageConfidence: average(confidence), medianConfidence: median(confidence) };
}

function timeKey(createdAt: string, useDaily: boolean): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  if (useDaily) return date.toISOString().slice(0, 10);
  return `${date.toISOString().slice(0, 13)}:00`;
}

function buildTimeSeries(votes: AnalyticsVote[]): AnalyticsTimePoint[] {
  if (!votes.length) return [];
  const timestamps = votes.map(vote => new Date(vote.createdAt).getTime()).filter(Number.isFinite);
  const spanDays = timestamps.length ? (Math.max(...timestamps) - Math.min(...timestamps)) / 86400000 : 0;
  const useDaily = spanDays >= 3;
  const counts = new Map<string, number>();
  votes.forEach(vote => { const key = timeKey(vote.createdAt, useDaily); counts.set(key, (counts.get(key) ?? 0) + 1); });
  return Array.from(counts.entries()).sort(([first], [second]) => first.localeCompare(second)).map(([label, count]) => ({ label, count }));
}

export function calculateQuestionAnalytics(votes: AnalyticsVote[]): QuestionAnalytics {
  const confidenceValues = votes.map(vote => vote.confidence);
  const decisionTimes = votes.map(vote => vote.decisionTimeMs);
  const distribution = Array.from({ length: 10 }, (_, index) => index + 1).map(value => ({ value, count: confidenceValues.filter(confidence => confidence === value).length }));
  return {
    totalVotes: votes.length,
    choices: { A: choiceStats(votes, 'A'), B: choiceStats(votes, 'B') },
    confidence: { average: average(confidenceValues), median: median(confidenceValues), minimum: confidenceValues.length ? Math.min(...confidenceValues) : 0, maximum: confidenceValues.length ? Math.max(...confidenceValues) : 0, distribution },
    decisionTime: { averageMs: average(decisionTimes), medianMs: median(decisionTimes), minimumMs: decisionTimes.length ? Math.min(...decisionTimes) : 0, maximumMs: decisionTimes.length ? Math.max(...decisionTimes) : 0 },
    votesOverTime: buildTimeSeries(votes)
  };
}

export function formatAnalyticsTime(milliseconds: number): string {
  if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`;
  const totalSeconds = Math.round(milliseconds / 1000);
  if (totalSeconds < 60) return `${(milliseconds / 1000).toFixed(1)}s`;
  return `${Math.floor(totalSeconds / 60)}m ${String(totalSeconds % 60).padStart(2, '0')}s`;
}
