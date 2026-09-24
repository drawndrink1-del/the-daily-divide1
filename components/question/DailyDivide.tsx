'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, MousePointer2 } from 'lucide-react';
import { formatQuestionDate, getDayNumber } from '@/lib/questions';
import { getStoredVote, getVoterId, storeVote } from '@/lib/storage';
import { formatDecisionTime } from '@/lib/statistics';
import { Choice, Question, StoredVote, Vote } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { ChoiceCard } from './ChoiceCard';
import { ConfidenceScale } from './ConfidenceScale';
import { ResultsDashboard } from '@/components/stats/ResultsDashboard';

export function DailyDivide({ question }: { question: Question | null }) {
  const dayNumber = question ? getDayNumber(question.date) : 0;
  const startedAt = useRef<number | null>(null);
  const [storedVote, setStoredVote] = useState<StoredVote | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [decisionTimeMs, setDecisionTimeMs] = useState(0);
  const [confidence, setConfidence] = useState(7);
  const [revealed, setRevealed] = useState(false);
  const [resultsVotes, setResultsVotes] = useState<Vote[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = performance.now();
    const saved = question ? getStoredVote(question.id) : null;
    if (question && saved?.questionId === question.id && (saved.choice === 'A' || saved.choice === 'B')) {
      setStoredVote(saved);
      setIsLoadingResults(true);
      fetch(`/api/results/${question.id}`)
        .then(async response => {
          if (!response.ok) throw new Error('Results are temporarily unavailable.');
          return response.json() as Promise<{ votes: Vote[] }>;
        })
        .then(data => { setResultsVotes(data.votes); setRevealed(true); })
        .catch(() => setError('Results are temporarily unavailable.'))
        .finally(() => setIsLoadingResults(false));
    }
  }, [question]);

  if (!question) return null;
  if (isLoadingResults) return <main className="relative min-h-[calc(100vh-74px)] overflow-hidden"><Container className="relative py-12 sm:py-20"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-zinc-500">Loading the divide...</p></Container></main>;
  if (revealed && storedVote) return <ResultsDashboard question={question} userVote={storedVote} votes={resultsVotes} />;

  const select = (nextChoice: Choice) => {
    const elapsed = Math.max(1, Math.round(performance.now() - (startedAt.current ?? performance.now())));
    setChoice(nextChoice);
    setDecisionTimeMs(elapsed);
  };

  const reveal = async () => {
    if (!choice) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const voterId = getVoterId();
      if (!voterId) throw new Error('Voting is temporarily unavailable.');
      const response = await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: question.id, choice, confidence, decisionTimeMs, voterId }) });
      const payload = await response.json() as { vote?: StoredVote; error?: string };
        if (!response.ok || !payload.vote) throw new Error(payload.error === 'ALREADY_VOTED' ? 'You have already voted on this Divide.' : payload.error === 'RATE_LIMITED' ? 'Too many attempts. Please wait and try again.' : 'Voting is temporarily unavailable.');
      storeVote(payload.vote);
      const resultsResponse = await fetch(`/api/results/${question.id}`);
      const resultsPayload = await resultsResponse.json() as { votes?: Vote[]; error?: string };
        if (!resultsResponse.ok || !resultsPayload.votes) throw new Error('Results are temporarily unavailable.');
      setStoredVote(payload.vote);
      setResultsVotes(resultsPayload.votes);
      setRevealed(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Voting is temporarily unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <main className="relative min-h-[calc(100vh-74px)] overflow-hidden">
    <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[640px]" />
    <Container className="relative py-12 sm:py-20">
      <div className="flex items-start justify-between gap-4">
        <div><Badge tone="live">DAY {dayNumber} · {formatQuestionDate(question.date).toUpperCase()}</Badge><p className="mt-6 font-mono text-[10px] uppercase tracking-[.22em] text-zinc-600">ONE QUESTION / THREE DIMENSIONS</p></div>
        <div className="hidden items-center gap-2 font-mono text-[10px] text-zinc-600 sm:flex"><Clock3 className="h-3.5 w-3.5" /> {choice ? 'decision time recorded' : 'timer running privately'}</div>
      </div>
      {!choice ? <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-10 max-w-5xl">
        <h1 className="text-4xl font-medium leading-[1.08] tracking-[-.05em] text-zinc-100 sm:text-6xl lg:text-7xl">{question.prompt}</h1>
        <p className="mt-7 max-w-xl text-sm leading-6 text-zinc-500">There is no correct answer. We are measuring the space between your instinct and your certainty.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2"><ChoiceCard option={question.optionA} onSelect={() => select('A')} /><ChoiceCard option={question.optionB} onSelect={() => select('B')} /></div>
        <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-zinc-700"><MousePointer2 className="h-3.5 w-3.5" /> choose quickly or take your time · there&apos;s no wrong way</div>
      </motion.section> : <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 max-w-2xl">
        <p className="font-mono text-[10px] tracking-[.22em] text-amber-300">DECISION RECORDED</p>
        <h1 className="mt-5 text-5xl font-medium tracking-[-.05em] text-zinc-100 sm:text-7xl">Decided in<br /><span className="text-amber-300">{formatDecisionTime(decisionTimeMs)}.</span></h1>
        <p className="mt-6 text-sm leading-6 text-zinc-500">One more dimension. Confidence is not certainty; it&apos;s how your decision feels after the fact.</p>
        {error && <p role="alert" className="mt-8 border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-100">{error}</p>}
        <div className="mt-12"><ConfidenceScale value={confidence} onChange={setConfidence} onSubmit={reveal} disabled={isSubmitting} /></div>
      </motion.section>}
    </Container>
  </main>;
}
