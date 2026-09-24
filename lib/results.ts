import { getSupabaseAdmin } from './supabase/server';
import { Vote } from './types';

export async function getVotesForQuestion(questionId: string): Promise<Vote[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('votes').select('choice, confidence, decision_time_ms').eq('question_id', questionId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((vote, index) => ({
    id: `result-${index}`,
    choice: vote.choice,
    confidence: vote.confidence,
    decisionTimeMs: vote.decision_time_ms,
    createdAt: ''
  }));
}
