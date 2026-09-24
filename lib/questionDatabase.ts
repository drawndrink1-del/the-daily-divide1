import { getSupabaseAdmin } from './supabase/server';
import { Question } from './types';

const optionColors = { A: '#f59e0b', B: '#818cf8' } as const;

export interface QuestionRow {
  id: string;
  date: string;
  prompt: string;
  option_a_title: string;
  option_a_detail: string;
  option_b_title: string;
  option_b_detail: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function mapQuestionRow(row: QuestionRow): Question {
  return {
    id: row.id,
    date: row.date,
    prompt: row.prompt,
    optionA: { key: 'A', eyebrow: 'OPTION A', title: row.option_a_title, detail: row.option_a_detail, color: optionColors.A },
    optionB: { key: 'B', eyebrow: 'OPTION B', title: row.option_b_title, detail: row.option_b_detail, color: optionColors.B }
  };
}

export async function getPublishedQuestionForDate(date: string): Promise<Question | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('questions').select('*').eq('date', date).eq('published', true).maybeSingle();
  if (error) throw error;
  return data ? mapQuestionRow(data as QuestionRow) : null;
}

export async function getPublishedQuestionsBefore(date: string): Promise<Question[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('questions').select('*').lt('date', date).eq('published', true).order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => mapQuestionRow(row as QuestionRow));
}

export async function getPublishedQuestionById(id: string): Promise<Question | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('questions').select('*').eq('id', id).eq('published', true).maybeSingle();
  if (error) throw error;
  return data ? mapQuestionRow(data as QuestionRow) : null;
}
