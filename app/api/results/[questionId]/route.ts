import { NextResponse } from 'next/server';
import { getQuestionById } from '@/lib/questions';
import { getPublishedQuestionById } from '@/lib/questionDatabase';
import { getVotesForQuestion } from '@/lib/results';

export async function GET(_request: Request, { params }: { params: { questionId: string } }) {
  let question = getQuestionById(params.questionId);
  try { question = await getPublishedQuestionById(params.questionId) ?? question; } catch { /* local Day 1 fallback */ }
    if (!question) return NextResponse.json({ error: 'QUESTION_NOT_FOUND' }, { status: 404 });

  try {
    const votes = await getVotesForQuestion(question.id);
    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Results loading failed:', error instanceof Error ? error.message : 'Unknown error');
      return NextResponse.json({ error: 'RESULTS_UNAVAILABLE' }, { status: 503 });
  }
}
