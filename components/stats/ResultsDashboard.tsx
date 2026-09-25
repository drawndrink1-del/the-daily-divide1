'use client';

import { Share2, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getDayNumber } from '@/lib/questions';
import { calculateStats, formatDecisionTime, percentileRank } from '@/lib/statistics';
import { Question, StoredVote, Vote } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { ResultSplit } from './ResultSplit';
import { StatCard } from './StatCard';
import { ConfidenceChart } from './ConfidenceChart';
import { SpeedChart } from './SpeedChart';
import { Insights } from './Insights';
import { CrowdOverview } from './CrowdOverview';

type AnalysisTab = 'confidence' | 'speed' | 'crowd';

export function ResultsDashboard({ question, userVote, votes }: { question: Question; userVote: StoredVote; votes: Vote[] }) {
  const dayNumber = getDayNumber(question.date);
  const [shared, setShared] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('confidence');
  const stats = useMemo(() => calculateStats(votes), [votes]);
  const faster = percentileRank(votes, userVote.decisionTimeMs);

  const share = async () => { 
    const text = `I chose ${userVote.choice === 'A' ? question.optionA.title : question.optionB.title} in ${formatDecisionTime(userVote.decisionTimeMs)} with ${userVote.confidence}/10 confidence on The Daily Divide. See the crowd split: ${stats.choices.A.percentage.toFixed(1)}% / ${stats.choices.B.percentage.toFixed(1)}%.`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Daily Divide', text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
    } catch { setShared(false); }
  };

  return <main className="relative overflow-hidden pb-24"> 
    <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[540px]" />
    <Container className="relative pt-10 sm:pt-14">
      <div className="flex flex-col justify-between gap-5 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end">
        <div><Badge tone="live">Day {dayNumber} decision complete</Badge><p className="mt-6 max-w-2xl text-3xl font-medium leading-[1.08] tracking-[-.05em] text-zinc-100 sm:text-5xl">The crowd has spoken. <span className="text-zinc-500">Here&apos;s the shape of it.</span></p></div>
        <button onClick={share} className="inline-flex items-center justify-center gap-2 self-start border border-zinc-700 px-4 py-2.5 text-[10px] font-bold tracking-[.12em] text-zinc-300 transition hover:border-amber-300 hover:text-amber-300 sm:self-auto"><Share2 className="h-3.5 w-3.5" /> {shared ? 'COPIED' : 'SHARE MY DECISION'}</button>
      </div>
      <div className="mt-10"><ResultSplit stats={stats} question={question} /></div>
      <div className="grid gap-3 py-8 sm:grid-cols-2"><StatCard label="YOUR PLACEMENT" value={formatDecisionTime(userVote.decisionTimeMs)} detail={`Faster than ${faster.toFixed(0)}% of voters`} /><StatCard label="AVERAGE CONFIDENCE" value={`${stats.averageConfidence.toFixed(1)} / 10`} detail="Across every anonymous decision" accent="indigo" /></div>
      <div className="mb-8 flex items-center gap-3 border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100"><Zap className="h-4 w-4 shrink-0 text-amber-300" /><span>You chose <strong>{userVote.choice === 'A' ? question.optionA.title : question.optionB.title}</strong> with {userVote.confidence}/10 confidence.</span></div>
      <section className="border-y border-zinc-800 py-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] tracking-[.18em] text-zinc-600">EXPLORE THE CROWD</p><p className="mt-2 text-sm text-zinc-300">One view at a time</p></div><div className="flex border-b border-zinc-800">{([['confidence', 'Confidence'], ['speed', 'Speed'], ['crowd', 'Crowd']] as [AnalysisTab, string][]).map(([tab, label]) => <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-3 pb-2 text-xs transition ${activeTab === tab ? 'border-amber-300 text-zinc-100' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}>{label}</button>)}</div></div><div className="mt-6">{activeTab === 'confidence' && <ConfidenceChart stats={stats} question={question} />}{activeTab === 'speed' && <SpeedChart stats={stats} />}{activeTab === 'crowd' && <CrowdOverview stats={stats} question={question} votes={votes} />}</div></section>
      <div className="mt-8"><Insights stats={stats} question={question} /></div><p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[.18em] text-zinc-600">Return tomorrow for the next divide · anonymous results for this Divide</p>
    </Container>
  </main>;
}
