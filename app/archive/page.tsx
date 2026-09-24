import { Footer } from '@/components/layout/Navigation';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { HistoryGrid } from '@/components/archive/HistoryGrid';
import { getDayNumber } from '@/lib/questions';
import { getPublicArchiveQuestions } from '@/lib/publicQuestions';
export default async function ArchivePage() { const archiveQuestions = await getPublicArchiveQuestions(); const dayNumber = getDayNumber(new Date()); return <><main className="min-h-screen"><Container className="py-14 sm:py-20"><Badge>Past decisions</Badge><h1 className="mt-7 max-w-2xl text-5xl font-medium tracking-[-.06em] text-zinc-100 sm:text-7xl">The questions<br /><span className="text-zinc-600">we couldn&apos;t un-ask.</span></h1><p className="mt-7 max-w-xl text-sm leading-6 text-zinc-500">The archive opens after the next divide. Day {dayNumber} starts here.</p><div className="mt-14"><HistoryGrid questions={archiveQuestions} /></div></Container></main><Footer /></>; }
