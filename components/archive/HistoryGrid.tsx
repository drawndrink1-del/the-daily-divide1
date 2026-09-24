import { Question } from '@/lib/types';
import { getDayNumber } from '@/lib/questions';
import { ArchiveCard } from './ArchiveCard';
export function HistoryGrid({ questions }: { questions: Question[] }) { const dayNumber = getDayNumber(new Date()); if (!questions.length) return <div className="border border-zinc-800 bg-zinc-900/20 px-5 py-8"><p className="font-mono text-[10px] tracking-[.18em] text-zinc-500">NO PREVIOUS DIVIDES</p><p className="mt-3 text-sm text-zinc-400">Day {dayNumber} starts here.</p></div>; return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{questions.map(question => <ArchiveCard key={question.id} question={question} />)}</div>; }
