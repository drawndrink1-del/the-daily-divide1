'use client';

import { DivideStats, Question, Vote } from '@/lib/types';
import { formatDecisionTime } from '@/lib/statistics';

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function CrowdOverview({ stats, question, votes }: { stats: DivideStats; question: Question; votes: Vote[] }) {
  const confidenceValues = votes.map(vote => vote.confidence);
  const decisionTimes = votes.map(vote => vote.decisionTimeMs);
  const averageDecisionTime = average(decisionTimes);
  const medianConfidence = median(confidenceValues);
  const confidenceDifference = Math.abs(stats.choices.A.averageConfidence - stats.choices.B.averageConfidence);
  const hasMeaningfulComparison = stats.total >= 4;
  const insight = !hasMeaningfulComparison
    ? 'Not enough votes for a meaningful comparison yet.'
    : confidenceDifference < 0.5
      ? 'Both sides reported similar confidence.'
      : `${stats.choices.A.averageConfidence > stats.choices.B.averageConfidence ? question.optionA.title : question.optionB.title} voters were more confident.`;

  return <section aria-labelledby="crowd-heading" className="border border-zinc-800 bg-zinc-900/20 p-5 sm:p-6">
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">HOW THE CROWD DECIDED</p>
        <h2 id="crowd-heading" className="mt-2 text-sm text-zinc-300">A compact view of the real responses</h2>
      </div>
      <p className="font-mono text-[10px] text-zinc-600">{stats.total.toLocaleString()} {stats.total === 1 ? 'DECISION' : 'DECISIONS'}</p>
    </div>

    {stats.total === 0 ? <p className="mt-8 border-t border-zinc-800 pt-6 text-sm text-zinc-500">No decisions recorded yet. More decisions will make this view more interesting.</p> : <div className="mt-8 space-y-8">
      <div>
        <div className="flex items-end justify-between gap-4">
          <p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">CHOICE SPLIT</p>
          <p className="font-mono text-[10px] text-zinc-600">{stats.total.toLocaleString()} TOTAL</p>
        </div>
        <div className="mt-4 flex items-end justify-between gap-4 font-mono text-xs">
          <span className="min-w-0 truncate text-amber-300">{question.optionA.title} <strong className="ml-2 text-zinc-100">{stats.choices.A.percentage.toFixed(1)}%</strong></span>
          <span className="min-w-0 truncate text-right text-indigo-300"><strong className="mr-2 text-zinc-100">{stats.choices.B.percentage.toFixed(1)}%</strong> {question.optionB.title}</span>
        </div>
        <div className="mt-3 flex h-3 overflow-hidden bg-indigo-400/70" aria-label={`Choice split: ${stats.choices.A.percentage.toFixed(1)} percent ${question.optionA.title}, ${stats.choices.B.percentage.toFixed(1)} percent ${question.optionB.title}`}>
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${stats.choices.A.percentage}%` }} />
        </div>
      </div>

      <div className="grid gap-8 border-t border-zinc-800 pt-8 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">CONFIDENCE</p>
          <p className="mt-3 text-[2.5rem] font-medium leading-none tracking-[-.05em] text-zinc-100">{stats.averageConfidence.toFixed(1)} <span className="text-base text-zinc-600">/ 10</span></p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[.12em] text-zinc-600">AVERAGE CONFIDENCE</p>
          <div className="mt-5 h-2 bg-zinc-800"><div className="h-full bg-indigo-400" style={{ width: `${stats.averageConfidence / 10 * 100}%` }} /></div>
          <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[.12em] text-zinc-600"><span>Low</span><span>High</span></div>
          <p className="mt-3 text-xs text-zinc-500">Median {medianConfidence.toFixed(1)} / 10</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">DECISION TIME</p>
          <p className="mt-3 text-[2.5rem] font-medium leading-none tracking-[-.05em] text-zinc-100">{formatDecisionTime(stats.medianSpeedMs)}</p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[.12em] text-zinc-600">MEDIAN DECISION TIME</p>
          <p className="mt-5 text-xs text-zinc-500">Average {formatDecisionTime(averageDecisionTime)}</p>
        </div>
      </div>

      <p className="border-t border-zinc-800 pt-6 text-sm text-zinc-400">{insight}</p>
    </div>}
  </section>;
}
