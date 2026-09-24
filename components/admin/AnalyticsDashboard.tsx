'use client';

import { useEffect, useState } from 'react';
import { useAdminToken } from './AdminShell';
import { AdminNav } from './AdminNav';
import { formatAnalyticsTime, QuestionAnalytics } from '@/lib/analytics';

interface AnalyticsQuestion { id: string; date: string; prompt: string; published: boolean; }
interface AnalyticsResponse { question: { id: string; date: string; prompt: string; option_a_title: string; option_b_title: string }; analytics: QuestionAnalytics; }

export function AnalyticsDashboard() {
  const token = useAdminToken();
  const [questions, setQuestions] = useState<AnalyticsQuestion[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState<AnalyticsResponse | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setQuestions(data.questions); if (data.questions[0]) setSelectedId(data.questions[0].id); }).catch(() => setError('Unable to load analytics questions.')).finally(() => setLoadingQuestions(false));
  }, [token]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingAnalytics(true); setError(null);
    fetch(`/api/admin/analytics/${selectedId}`, { headers: { Authorization: `Bearer ${token}` } }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data); }).catch(() => setError('Unable to load analytics for this question.')).finally(() => setLoadingAnalytics(false));
  }, [selectedId, token]);

  return <main className="min-h-screen px-5 py-14 sm:py-20"><div className="mx-auto max-w-6xl"><AdminNav /><div className="flex flex-col justify-between gap-5 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] tracking-[.18em] text-amber-300">PRIVATE ADMIN</p><h1 className="mt-4 text-4xl font-medium text-zinc-100">Analytics &amp; Insights</h1></div><label className="text-sm text-zinc-500">Question<select value={selectedId} disabled={loadingQuestions || !questions.length} onChange={event => setSelectedId(event.target.value)} className="mt-2 block min-w-72 border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-200 outline-none focus:border-amber-300"><option value="">{loadingQuestions ? 'Loading questions...' : 'No published questions'}</option>{questions.map(question => <option key={question.id} value={question.id}>{question.date} · {question.prompt}</option>)}</select></label></div>{error && <p role="alert" className="mt-8 border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-100">{error}</p>}{loadingAnalytics && <p className="mt-8 font-mono text-[10px] uppercase tracking-[.18em] text-zinc-500">Loading analytics...</p>}{!loadingAnalytics && !result && !error && <p className="mt-8 border border-zinc-800 bg-zinc-900/20 px-5 py-8 text-sm text-zinc-400">No published questions yet.</p>}{result && !loadingAnalytics && <AnalyticsContent result={result} />}</div></main>;
}

function AnalyticsContent({ result }: { result: AnalyticsResponse }) {
  const { analytics, question } = result;
  const metricCards = [['TOTAL VOTES', analytics.totalVotes.toLocaleString()], ['A / B SPLIT', `${analytics.choices.A.percentage.toFixed(1)}% / ${analytics.choices.B.percentage.toFixed(1)}%`], ['AVG CONFIDENCE', `${analytics.confidence.average.toFixed(1)} / 10`], ['MEDIAN CONFIDENCE', `${analytics.confidence.median.toFixed(1)} / 10`], ['AVG DECISION TIME', formatAnalyticsTime(analytics.decisionTime.averageMs)], ['MEDIAN DECISION TIME', formatAnalyticsTime(analytics.decisionTime.medianMs)]];
  return <><div className="mt-8 border border-zinc-800 bg-zinc-900/20 p-5"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">SELECTED DIVIDE</p><h2 className="mt-3 text-xl text-zinc-200">{question.prompt}</h2><p className="mt-2 font-mono text-[10px] text-zinc-500">{question.date} · {question.id}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{metricCards.map(([label, value]) => <div key={label} className="border border-zinc-800 bg-zinc-900/30 p-5"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">{label}</p><p className="mt-4 font-mono text-2xl text-amber-300">{value}</p></div>)}</div><div className="mt-4 grid gap-4 lg:grid-cols-2"><ConfidenceBreakdown analytics={analytics} question={question} /><ConfidenceDistribution analytics={analytics} /></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><TimeBreakdown analytics={analytics} /><VotesOverTime points={analytics.votesOverTime} /></div></>;
}

function ConfidenceBreakdown({ analytics, question }: { analytics: QuestionAnalytics; question: AnalyticsResponse['question'] }) { return <section className="border border-zinc-800 bg-zinc-900/30 p-5"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">CONFIDENCE BY CHOICE</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><ChoiceConfidence label={question.option_a_title} stats={analytics.choices.A} color="text-amber-300" /><ChoiceConfidence label={question.option_b_title} stats={analytics.choices.B} color="text-indigo-300" /></div></section>; }
function ChoiceConfidence({ label, stats, color }: { label: string; stats: QuestionAnalytics['choices']['A']; color: string }) { return <div className="border-t border-zinc-800 pt-4"><p className={`font-mono text-xs ${color}`}>{label}</p><p className="mt-3 text-sm text-zinc-400">{stats.count} votes</p><p className="mt-1 text-xs text-zinc-500">Average {stats.averageConfidence.toFixed(1)} · Median {stats.medianConfidence.toFixed(1)}</p></div>; }
function ConfidenceDistribution({ analytics }: { analytics: QuestionAnalytics }) { const max = Math.max(...analytics.confidence.distribution.map(item => item.count), 1); return <section className="border border-zinc-800 bg-zinc-900/30 p-5"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">CONFIDENCE DISTRIBUTION</p><div className="mt-6 flex h-36 items-end gap-1 border-b border-zinc-800">{analytics.confidence.distribution.map(item => <div key={item.value} className="group flex h-full flex-1 flex-col justify-end"><div className="relative w-full bg-amber-400/70" style={{ height: `${item.count / max * 100}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-zinc-500">{item.count || ''}</span></div><span className="mt-3 text-center font-mono text-[9px] text-zinc-600">{item.value}</span></div>)}</div>{!analytics.totalVotes && <p className="mt-4 text-sm text-zinc-500">No votes yet.</p>}</section>; }
function TimeBreakdown({ analytics }: { analytics: QuestionAnalytics }) { return <section className="border border-zinc-800 bg-zinc-900/30 p-5"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">DECISION TIME RANGE</p><div className="mt-6 grid grid-cols-2 gap-4 text-sm text-zinc-400"><p>Minimum<br /><strong className="font-mono text-zinc-200">{formatAnalyticsTime(analytics.decisionTime.minimumMs)}</strong></p><p>Maximum<br /><strong className="font-mono text-zinc-200">{formatAnalyticsTime(analytics.decisionTime.maximumMs)}</strong></p></div><p className="mt-5 text-xs leading-5 text-zinc-600">Decision time is observed in the browser and is not a secure measurement.</p>{!analytics.totalVotes && <p className="mt-4 text-sm text-zinc-500">No votes yet.</p>}</section>; }
function VotesOverTime({ points }: { points: QuestionAnalytics['votesOverTime'] }) { const max = Math.max(...points.map(point => point.count), 1); return <section className="border border-zinc-800 bg-zinc-900/30 p-5"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">VOTES OVER TIME</p>{points.length ? <div className="mt-6 flex min-h-36 items-end gap-2 border-b border-zinc-800">{points.map(point => <div key={point.label} className="group flex h-36 flex-1 flex-col justify-end"><div className="relative w-full bg-indigo-400/80" style={{ height: `${point.count / max * 100}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-zinc-500">{point.count}</span></div><span className="mt-3 truncate text-center font-mono text-[9px] text-zinc-600">{point.label}</span></div>)}</div> : <p className="mt-6 text-sm text-zinc-500">No votes yet.</p>}</section>; }
