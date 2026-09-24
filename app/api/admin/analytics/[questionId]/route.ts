import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { calculateQuestionAnalytics, AnalyticsVote } from '@/lib/analytics';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: { questionId: string } }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    const supabase = getSupabaseAdmin();
    const { data: question, error: questionError } = await supabase.from('questions').select('id, date, prompt, option_a_title, option_b_title, published').eq('id', params.questionId).eq('published', true).maybeSingle();
    if (questionError) throw questionError;
    if (!question) return NextResponse.json({ error: 'QUESTION_NOT_FOUND' }, { status: 404 });

    const { data: votes, error: votesError } = await supabase.from('votes').select('choice, confidence, decision_time_ms, created_at').eq('question_id', params.questionId).order('created_at', { ascending: true });
    if (votesError) throw votesError;
    const analyticsVotes: AnalyticsVote[] = (votes ?? []).map(vote => ({ choice: vote.choice, confidence: vote.confidence, decisionTimeMs: vote.decision_time_ms, createdAt: vote.created_at }));
    return NextResponse.json({ question, analytics: calculateQuestionAnalytics(analyticsVotes) });
  } catch (error) {
    console.error('Admin analytics failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'ANALYTICS_UNAVAILABLE' }, { status: 503 });
  }
}
