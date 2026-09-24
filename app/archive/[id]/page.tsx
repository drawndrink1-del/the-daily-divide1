import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Footer } from '@/components/layout/Navigation';
import { Badge } from '@/components/ui/Badge';
import { ResultSplit } from '@/components/stats/ResultSplit';
import { StatCard } from '@/components/stats/StatCard';
import { ConfidenceChart } from '@/components/stats/ConfidenceChart';
import { SpeedChart } from '@/components/stats/SpeedChart';
import { DecisionMap } from '@/components/map/DecisionMap';
import { getCalendarDate, getQuestionById } from '@/lib/questions';
import { getPublishedQuestionById } from '@/lib/questionDatabase';
import { getPublicArchiveQuestions } from '@/lib/publicQuestions';
import { getVotesForQuestion } from '@/lib/results';
import { calculateStats, formatDecisionTime } from '@/lib/statistics';
import { notFound } from 'next/navigation';

export default async function ArchiveDetail({ params }: { params: { id: string } }) { let question = getQuestionById(params.id); try { question = await getPublishedQuestionById(params.id) ?? question; } catch { /* local fallback */ } const archiveQuestions = await getPublicArchiveQuestions(getCalendarDate()); if (!question || !archiveQuestions.some(item => item.id === question.id)) notFound(); const votes = await getVotesForQuestion(question.id); const stats = calculateStats(votes); return <><main><Container className="py-12 sm:py-20"><Link href="/archive" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200"><ArrowLeft className="h-3.5 w-3.5" /> Back to archive</Link><div className="mt-12"><Badge>{question.date.replaceAll('-', '.')} · View only</Badge><h1 className="mt-7 max-w-4xl text-4xl font-medium leading-tight tracking-[-.05em] text-zinc-100 sm:text-6xl">{question.prompt}</h1></div><div className="mt-14"><ResultSplit stats={stats} question={question} /></div><div className="grid gap-3 py-8 sm:grid-cols-3"><StatCard label="CHOICE" value={`${stats.choices.A.percentage.toFixed(1)}%`} detail={`${stats.choices.A.count} chose ${question.optionA.title}`} /><StatCard label="CONFIDENCE" value={`${stats.averageConfidence.toFixed(1)} / 10`} detail="Average across the crowd" accent="indigo" /><StatCard label="MEDIAN SPEED" value={formatDecisionTime(stats.medianSpeedMs)} detail="From first thought to final choice" /></div><div className="grid gap-4 lg:grid-cols-2"><ConfidenceChart stats={stats} question={question} /><SpeedChart stats={stats} /></div><div className="mt-4"><DecisionMap votes={votes} question={question} /></div></Container></main><Footer /></>; }
